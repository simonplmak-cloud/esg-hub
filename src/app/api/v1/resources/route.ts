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
    const limit = Math.min(parseInt(params.get("limit") || "20"), 100);
    const offset = parseInt(params.get("offset") || "0");

    const selectFields = "id, title, url, domain, description, content, scraped_content";

    const conditions: string[] = [];
    if (domain) {
      conditions.push(`domain = '${domain.replace(/'/g, "\\'")}'`);
    }
    if (q) {
      const escaped = q.replace(/'/g, "\\'");
      conditions.push(`(string::lowercase(title) CONTAINS string::lowercase('${escaped}'))`);
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
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
