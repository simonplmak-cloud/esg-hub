import { NextRequest, NextResponse } from "next/server";
import { getPageByPermalink, isDbConfigured, DB_ERROR } from "@/lib/pages";
import { queryHttp } from "@/lib/surrealdb";
import { formatPermalink } from "@/lib/utils";

export const runtime = "nodejs";

interface RelatedPage {
  id: string;
  title: string;
  permalink: string;
  section: string | null;
}

function validatePageId(id: string): { valid: boolean; error?: string } {
  if (!id || typeof id !== "string") {
    return { valid: false, error: "Page identifier is required" };
  }
  if (id.length > 500) {
    return { valid: false, error: "Page identifier too long" };
  }
  // Only allow alphanumeric, hyphens, underscores, slashes
  if (!/^[\w\-\/]+$/.test(id)) {
    return { valid: false, error: "Invalid page identifier format" };
  }
  return { valid: true };
}

function validateLimit(limitParam: string | null): { valid: boolean; value?: number; error?: string } {
  if (!limitParam) {
    return { valid: true, value: 15 };
  }
  const limit = Number(limitParam);
  if (Number.isNaN(limit)) {
    return { valid: false, error: "Limit must be a number" };
  }
  if (limit < 1) {
    return { valid: false, error: "Limit must be at least 1" };
  }
  if (limit > 50) {
    return { valid: false, error: "Limit cannot exceed 50" };
  }
  return { valid: true, value: Math.floor(limit) };
}

async function resolvePageId(idOrPermalink: string): Promise<string | null> {
  if (idOrPermalink.startsWith("page:")) {
    return idOrPermalink;
  }
  const page = await getPageByPermalink(formatPermalink(idOrPermalink));
  if (!page || page === DB_ERROR) return null;
  return page.id;
}


const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    
    // Validate id parameter
    const idValidation = validatePageId(id);
    if (!idValidation.valid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    // Validate limit parameter
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limitValidation = validateLimit(limitParam);
    if (!limitValidation.valid) {
      return NextResponse.json({ error: limitValidation.error }, { status: 400 });
    }
    const limit = limitValidation.value!;

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
