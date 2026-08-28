import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
const logger = createLogger("api/v1/pages");
import { queryHttp, sanitize } from "@/lib/surrealdb";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
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

    // Validate id length to prevent abuse
    if (!id || id.length > 500) {
      return NextResponse.json(
        { error: "Invalid page identifier" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

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
      // Validate record ID format: page:<alphanumeric>
      if (!/^page:[a-zA-Z0-9_]+$/.test(decodedId)) {
        return NextResponse.json(
          { error: "Invalid record ID format" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      results = await queryHttp(
        `SELECT ${selectFields} FROM ${decodedId};`
      );
    } else {
      // Treat as permalink or slug
      const decoded = decodeURIComponent(id);
      // Validate: only allow alphanumeric, hyphens, slashes, underscores
      if (!/^[a-zA-Z0-9\-_/. ]+$/.test(decoded)) {
        return NextResponse.json(
          { error: "Invalid page identifier format" },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      let permalink = decoded;
      if (!permalink.startsWith("/")) permalink = "/" + permalink;
      if (!permalink.endsWith("/")) permalink += "/";

      results = await queryHttp(
        `SELECT ${selectFields} FROM page WHERE permalink = '${sanitize(permalink)}' LIMIT 1;`
      );

      // If not found by permalink, try by slug
      if (!results || results.length === 0) {
        results = await queryHttp(
          `SELECT ${selectFields} FROM page WHERE slug = '${sanitize(decoded)}' LIMIT 1;`
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
    logger.error("[API /v1/pages/:id] Error:", err);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again later." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
