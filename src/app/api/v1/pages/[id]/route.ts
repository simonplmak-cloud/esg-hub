import { NextRequest, NextResponse } from "next/server";
import { queryHttp } from "@/lib/surrealdb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/v1/pages/:id
 * 
 * Retrieve a single page by its SurrealDB record ID or permalink.
 * 
 * Examples:
 *   /api/v1/pages/page:abc123
 *   /api/v1/pages/environmental/climate-change  (permalink lookup)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fieldsParam = request.nextUrl.searchParams.get("fields");

    const defaultFields = "id, title, permalink, description, section, subsection, pillar, keywords, slug, content, layout, parent, sort_order, created_at, updated_at";
    let selectFields = defaultFields;

    if (fieldsParam) {
      const allowedFields = new Set([
        "id", "title", "permalink", "description", "section", "subsection",
        "pillar", "keywords", "slug", "content", "layout", "parent",
        "sort_order", "created_at", "updated_at", "redirect_to"
      ]);
      const requested = fieldsParam.split(",").map(f => f.trim()).filter(f => allowedFields.has(f));
      if (requested.length > 0) {
        selectFields = requested.join(", ");
      }
    }

    let results;

    // Check if it's a SurrealDB record ID (contains "page:")
    if (id.startsWith("page:") || id.startsWith("page%3A")) {
      const decodedId = decodeURIComponent(id);
      results = await queryHttp(
        `SELECT ${selectFields} FROM ${decodedId};`
      );
    } else {
      // Treat as permalink or slug
      const decoded = decodeURIComponent(id);
      let permalink = decoded;
      if (!permalink.startsWith("/")) permalink = "/" + permalink;
      if (!permalink.endsWith("/")) permalink += "/";

      const escaped = permalink.replace(/'/g, "\\'");
      results = await queryHttp(
        `SELECT ${selectFields} FROM page WHERE permalink = '${escaped}' LIMIT 1;`
      );

      // If not found by permalink, try by slug
      if (!results || results.length === 0) {
        const slugEscaped = decoded.replace(/'/g, "\\'");
        results = await queryHttp(
          `SELECT ${selectFields} FROM page WHERE slug = '${slugEscaped}' LIMIT 1;`
        );
      }
    }

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { data: results[0] },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
