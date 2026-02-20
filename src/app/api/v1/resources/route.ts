import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { queryHttp, sanitize, sanitizeInt } from "@/lib/surrealdb";

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
 * GET /api/v1/resources
 * 
 * List external resources (standards, regulations, tools, etc.)
 * 
 * Query Parameters:
 *   - domain: Filter by source domain (e.g., "ghgprotocol.org")
 *   - q: Search within resource titles
 *   - limit: Number of results (default 20, max 100)
 *   - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const domain = params.get("domain");
    const q = params.get("q");
    const limit = sanitizeInt(params.get("limit"), 20, 1, 100);
    const offset = sanitizeInt(params.get("offset"), 0, 0, 100000);

    const selectFields = "id, title, url, domain, description, content, scraped_content";

    const conditions: string[] = [];
    if (domain) {
      // Validate domain format
      if (!/^[a-zA-Z0-9\-_.]+$/.test(domain) || domain.length > 253) {
        return NextResponse.json(
          { error: "Invalid domain parameter format." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      conditions.push(`domain = '${sanitize(domain)}'`);
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
    const sql = `SELECT ${selectFields} FROM external_resource ${where} ORDER BY title ASC LIMIT ${limit} START ${offset};`;

    const results = await queryHttp(sql);

    // Get total count
    const countSql = `SELECT count() FROM external_resource ${where} GROUP ALL;`;
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
    console.error("[API /v1/resources] Error:", err);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again later." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
