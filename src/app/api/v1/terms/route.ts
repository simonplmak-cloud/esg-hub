import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 3600;

import { queryHttp, sanitize, sanitizeInt } from "@/lib/surrealdb";
import { requireWriteToken } from "@/lib/auth/write-token";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import { TermProposalSchema } from "@/lib/validators/terms";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/v1/terms
 *
 * Create a glossary term proposal.
 * Body: { name: string, definition: string, facets?: object, source_urls?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { rateLimited } = checkRateLimit(request);
    if (rateLimited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    const unauth = requireWriteToken(request);
    if (unauth) {
      return unauth;
    }

    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();
    const validated = TermProposalSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { name, definition, facets, source_urls } = validated.data;

    const safeName = sanitize(name.trim());
    const safeDefinition = sanitize(definition.trim());
    const safeSourceUrls = source_urls ? source_urls.map((u: string) => sanitize(u.trim())) : [];

    const results = await queryHttp<{ id: string; status: string }>(
      `CREATE content_enhancement_log CONTENT {
        status: "pending",
        target_table: "term",
        proposed_changes: $proposed_changes,
        source_urls: $source_urls,
        created_at: time::now()
      } RETURN id, status;`,
      {
        proposed_changes: { name: safeName, definition: safeDefinition, facets },
        source_urls: safeSourceUrls,
      }
    );

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "Failed to create proposal" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { proposal_id: results[0].id, status: results[0].status },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("[API /v1/terms POST] Error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * GET /api/v1/terms
 *
 * List terms with pagination.
 * Query params:
 *   - limit (default 20, max 100)
 *   - offset (default 0)
 *   - q (optional, substring match on name)
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const limit = sanitizeInt(params.get("limit"), 20, 1, 100);
    const offset = sanitizeInt(params.get("offset"), 0, 0, 100000);
    const q = params.get("q");

    const conditions: string[] = [];
    if (q) {
      if (q.length > 200) {
        return NextResponse.json(
          { error: "Query parameter 'q' must be 200 characters or fewer" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      conditions.push(`string::lowercase(name) CONTAINS string::lowercase('${sanitize(q)}')`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `SELECT id, name, definition, facets, aliases, source_urls, section, pillar, created_at, updated_at FROM term ${where} ORDER BY name ASC LIMIT ${limit} START ${offset};`;
    const results = await queryHttp(sql);

    const countSql = `SELECT count() FROM term ${where} GROUP ALL;`;
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
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("[API /v1/terms GET] Error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
