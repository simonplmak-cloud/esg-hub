import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

import { queryHttp } from "@/lib/surrealdb";
import { parseListParams } from "@/lib/list-params";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const CACHE_HEADERS = {
  ...CORS_HEADERS,
  "Cache-Control": "public, max-age=60",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/v1/frameworks
 *
 * List frameworks with pagination.
 * Query params:
 *   - limit (default 20, max 100)
 *   - offset (default 0)
 *   - q (optional, substring match on name)
 */
export async function GET(request: NextRequest) {
  try {
    const { limit, offset, q } = parseListParams(request.nextUrl.searchParams);

    const conditions: string[] = [];
    if (q) {
      if (q.length > 200) {
        return NextResponse.json(
          { error: "Query parameter 'q' must be 200 characters or fewer" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      conditions.push(`string::lowercase(name) CONTAINS string::lowercase('${q}')`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `SELECT id, name, abbreviation, description, facets, website, section, pillar, source_url, created_at, updated_at FROM framework ${where} ORDER BY name ASC LIMIT ${limit} START ${offset};`;
    const results = await queryHttp(sql);

    const countSql = `SELECT count() FROM framework ${where} GROUP ALL;`;
    const countResult = await queryHttp<{ count: number }>(countSql);
    const total = countResult.length > 0 ? countResult[0].count : 0;

    return NextResponse.json(
      {
        items: results,
        pagination: {
          total,
          offset,
          limit,
          has_more: offset + limit < total,
        },
      },
      { headers: CACHE_HEADERS }
    );
  } catch (err) {
    console.error("[API /v1/frameworks GET] Error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
