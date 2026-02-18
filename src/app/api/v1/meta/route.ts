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
 * GET /api/v1/meta
 * 
 * Returns database metadata: sections, pillars, domains, and record counts.
 */
export async function GET(request: NextRequest) {
  try {
    // Get sections with counts
    const sections = await queryHttp<{ section: string; count: number }>(
      `SELECT section, count() AS count FROM page WHERE section IS NOT NONE GROUP BY section ORDER BY count DESC;`
    );

    // Get pillars with counts
    const pillars = await queryHttp<{ pillar: string; count: number }>(
      `SELECT pillar, count() AS count FROM page WHERE pillar IS NOT NONE GROUP BY pillar ORDER BY count DESC;`
    );

    // Get domains with counts
    const domains = await queryHttp<{ domain: string; count: number }>(
      `SELECT domain, count() AS count FROM external_resource GROUP BY domain ORDER BY count DESC;`
    );

    // Get total counts
    const pageCounts = await queryHttp<{ count: number }>(
      `SELECT count() AS count FROM page GROUP ALL;`
    );
    const resourceCounts = await queryHttp<{ count: number }>(
      `SELECT count() AS count FROM external_resource GROUP ALL;`
    );

    return NextResponse.json({
      stats: {
        total_pages: pageCounts[0]?.count || 0,
        total_resources: resourceCounts[0]?.count || 0,
        total_sections: sections.length,
        total_pillars: pillars.length,
        total_domains: domains.length,
      },
      sections: sections.map(s => ({ name: s.section, page_count: s.count })),
      pillars: pillars.map(p => ({ name: p.pillar, page_count: p.count })),
      domains: domains.map(d => ({ name: d.domain, resource_count: d.count })),
      embedding_model: "BAAI/bge-small-en-v1.5",
      embedding_dimensions: 384,
    }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Meta API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
