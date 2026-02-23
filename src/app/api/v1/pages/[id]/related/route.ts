import { NextRequest, NextResponse } from "next/server";
import { getPageByPermalink, isDbConfigured } from "@/lib/pages";
import { queryHttp } from "@/lib/surrealdb";
import { formatPermalink } from "@/lib/utils";

interface RelatedPage {
  id: string;
  title: string;
  permalink: string;
  section: string | null;
}

async function resolvePageId(idOrPermalink: string): Promise<string | null> {
  // If it looks like a SurrealDB record id, return as-is
  if (idOrPermalink.startsWith("page:")) {
    return idOrPermalink;
  }

  // Otherwise treat as permalink
  const page = await getPageByPermalink(formatPermalink(idOrPermalink));
  return page?.id ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 15;

  try {
    const { id } = await params;
    const pageId = await resolvePageId(id);
    if (!pageId) {
      return NextResponse.json({ data: [] }, { status: 404 });
    }

    const relatedResult = await queryHttp<{ related_pages?: string[] }>(
      `SELECT related_pages FROM page WHERE id = $id LIMIT 1;`,
      { id: pageId }
    );

    const relatedIds = relatedResult?.[0]?.related_pages ?? [];
    if (!relatedIds.length) {
      return NextResponse.json({ data: [] });
    }

    const relatedPages = await queryHttp<RelatedPage>(
      `SELECT id, title, permalink, section FROM page WHERE id IN $ids LIMIT ${limit};`,
      { ids: relatedIds }
    );

    return NextResponse.json({ data: relatedPages });
  } catch (error) {
    console.error("[api] Related pages error:", error);
    return NextResponse.json(
      { error: "Failed to load related content" },
      { status: 500 }
    );
  }
}
