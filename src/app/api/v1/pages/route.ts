import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
const logger = createLogger("api/v1/v1");

export const runtime = "nodejs";
import { queryHttp, sanitize, sanitizeInt, isAlphanumericDash } from "@/lib/surrealdb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/v1/pages
 * 
 * Query Parameters:
 *   - section: Filter by section (e.g., "environmental", "social", "governance")
 *   - pillar: Filter by pillar (e.g., "Environmental", "Social", "Governance")
 *   - q: Search within page titles
 *   - limit: Number of results (default 20, max 100)
 *   - offset: Pagination offset (default 0)
 *   - fields: Comma-separated list of fields to return
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const section = params.get("section");
    const pillar = params.get("pillar");
    const q = params.get("q");
    const limit = sanitizeInt(params.get("limit"), 20, 1, 100);
    const offset = sanitizeInt(params.get("offset"), 0, 0, 100000);
    const fieldsParam = params.get("fields");

    const defaultFields = "id, title, permalink, description, section, subsection, pillar, keywords, slug";
    const allowedFields = new Set([
      "id", "title", "permalink", "description", "section", "subsection",
      "pillar", "keywords", "slug", "content", "layout", "parent",
      "sort_order", "created_at", "updated_at", "redirect_to"
    ]);

    let selectFields = defaultFields;
    if (fieldsParam) {
      const requested = fieldsParam.split(",").map(f => f.trim()).filter(f => allowedFields.has(f));
      if (requested.length > 0) {
        selectFields = requested.join(", ");
      }
    }

    // Build conditions with proper sanitization
    const conditions: string[] = [];
    if (section) {
      if (!isAlphanumericDash(section)) {
        return NextResponse.json(
          { error: "Invalid section parameter. Only alphanumeric characters, hyphens, and spaces are allowed." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      conditions.push(`section = '${sanitize(section)}'`);
    }
    if (pillar) {
      if (!isAlphanumericDash(pillar)) {
        return NextResponse.json(
          { error: "Invalid pillar parameter. Only alphanumeric characters, hyphens, and spaces are allowed." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      conditions.push(`pillar = '${sanitize(pillar)}'`);
    }
    if (q) {
      if (q.length > 200) {
        return NextResponse.json(
          { error: "Query parameter 'q' must be 200 characters or fewer." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      conditions.push(`(string::lowercase(title) CONTAINS string::lowercase('${sanitize(q)}'))`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT ${selectFields} FROM page ${where} ORDER BY section ASC, title ASC LIMIT ${limit} START ${offset};`;

    const results = await queryHttp(sql);

    // Get total count
    const countSql = `SELECT count() FROM page ${where} GROUP ALL;`;
    const countResult = await queryHttp<{ count: number }>(countSql);
    const total = countResult.length > 0 ? countResult[0].count : 0;

    return NextResponse.json({
      data: results,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    }, { headers: CORS_HEADERS });
  } catch (err) {
    logger.error("[API /v1/pages] Error:", err);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again later." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
