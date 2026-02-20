import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/v1
 * 
 * API root - returns available endpoints and documentation.
 */
export async function GET() {
  return NextResponse.json({
    name: "ESG Hub API",
    version: "1.0",
    description: "Public API for the Ascent Partners Foundation ESG Knowledge Hub. Access 307 ESG articles and 244 curated external resources covering Environmental, Social, and Governance topics.",
    base_url: "/api/v1",
    endpoints: {
      "GET /api/v1": "This documentation",
      "GET /api/v1/meta": "Database metadata (sections, pillars, domains, stats)",
      "GET /api/v1/pages": "List pages with filtering and pagination",
      "GET /api/v1/pages/:id": "Get a single page by ID, permalink, or slug",
      "GET /api/v1/resources": "List external resources with filtering",
      "GET /api/v1/search?q=query": "Full-text keyword search (BM25)",
      "POST /api/v1/search": "Semantic vector search (requires embedding)",
    },
    examples: {
      list_pages: "/api/v1/pages?section=environmental&limit=10",
      get_page: "/api/v1/pages/environmental/climate-change",
      search: "/api/v1/search?q=carbon emissions&source=pages",
      list_resources: "/api/v1/resources?domain=ghgprotocol.org",
      metadata: "/api/v1/meta",
    },
    semantic_search: {
      model: "BAAI/bge-small-en-v1.5",
      dimensions: 384,
      method: "POST /api/v1/search with { embedding: number[384], k?: number, source?: string }",
      note: "Generate embeddings using the BAAI/bge-small-en-v1.5 model via @huggingface/transformers, fastembed, or any compatible library.",
    },
    cors: "Enabled for all origins",
    rate_limit: "No rate limit currently applied",
  }, { headers: CORS_HEADERS });
}
