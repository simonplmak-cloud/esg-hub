import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

import { queryHttp } from "@/lib/surrealdb";
import { requireWriteToken } from "@/lib/auth/write-token";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import { FacetUpdateSchema } from "@/lib/validators/facets";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const VALID_TOPICS = new Set([
  "environmental", "social", "governance", "standards", "sdg",
  "frameworks", "finance", "hk-apac", "emerging-topics",
  "learning", "ratings", "regulations",
]);

const VALID_INDUSTRIES = new Set([
  "financial-services", "energy", "manufacturing", "real-estate",
  "technology", "agriculture", "healthcare", "transportation",
]);

const VALID_FRAMEWORKS = new Set([
  "gri", "issb", "esrs", "tcfd", "sasb", "cdp", "tnfd",
  "ungc", "sdgs", "pri", "iirc", "csrd", "sfdr",
  "eu-taxonomy", "sec-climate", "hkex-esg",
]);

const VALID_JURISDICTIONS = new Set([
  "eu", "us", "hk", "cn", "jp", "sg", "uk", "global", "in",
]);

const VALID_STAKEHOLDERS = new Set([
  "investor", "regulator", "company", "ngo", "academic", "public",
]);

const VALID_CONTENT_TYPES = new Set([
  "standard_text", "regulation", "framework", "guidance",
  "report", "article", "glossary_term", "entity_profile",
]);

const ALLOWED_FACET_KEYS = new Set([
  "topic", "industry", "framework", "jurisdiction", "stakeholder", "content_type",
]);

const VOCAB_MAP: Record<string, Set<string>> = {
  topic: VALID_TOPICS,
  industry: VALID_INDUSTRIES,
  framework: VALID_FRAMEWORKS,
  jurisdiction: VALID_JURISDICTIONS,
  stakeholder: VALID_STAKEHOLDERS,
  content_type: VALID_CONTENT_TYPES,
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * PATCH /api/v1/pages/:id/facets
 *
 * Update facets on an existing page.
 * Body: { facets: { topic?: string[], industry?: string[], framework?: string[],
 *                    jurisdiction?: string[], stakeholder?: string[],
 *                    content_type?: string } }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id || id.length > 500) {
      return NextResponse.json(
        { error: "Invalid page identifier" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const pageId = decodeURIComponent(id);
    if (!/^page:[a-zA-Z0-9_]+$/.test(pageId)) {
      return NextResponse.json(
        { error: "Invalid record ID format. Expected 'page:<id>'" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();
    const validated = FacetUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { facets } = validated.data;

    const results = await queryHttp(
      `UPDATE ${pageId} MERGE { facets: $facets, updated_at: time::now() } RETURN id, title, permalink, description, section, subsection, pillar, keywords, slug, facets, created_at, updated_at;`,
      { facets }
    );

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
    console.error("[API /v1/pages/:id/facets PATCH] Error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
