import { NextRequest, NextResponse } from "next/server";
import { getPageByPermalink, isDbConfigured } from "@/lib/pages";
import { queryHttp } from "@/lib/surrealdb";
import { formatPermalink } from "@/lib/utils";

interface BacklinkPage {
  id: string;
  title: string;
  permalink: string;
  section: string | null;
}

async function resolvePageId(idOrPermalink: string): Promise<string | null> {
  if (idOrPermalink.startsWith("page:")) {
    return idOrPermalink;
  }

  const page = await getPageByPermalink(formatPermalink(idOrPermalink));
  return page?.id ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    const pageId = await resolvePageId(id);
    if (!pageId) {
      return NextResponse.json({ data: [] }, { status: 404 });
    }

    const backlinks = await queryHttp<BacklinkPage>(
      `SELECT id, title, permalink, section FROM page WHERE $id IN backlinks;`,
      { id: pageId }
    );

    return NextResponse.json({ data: backlinks });
  } catch (error) {
    console.error("[api] Backlinks error:", error);
    return NextResponse.json(
      { error: "Failed to load backlinks" },
      { status: 500 }
    );
  }
}
