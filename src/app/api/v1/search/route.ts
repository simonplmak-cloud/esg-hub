import { NextRequest, NextResponse } from "next/server";
import { keywordSearch } from "@/lib/search";
import { queryHttp } from "@/lib/surrealdb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/v1/search?q=query&limit=20&source=all
 * 
 * Full-text keyword search using BM25 ranking across pages and external resources.
 * 
 * Query Parameters:
 *   - q: Search query (required)
 *   - limit: Max results (default 20, max 50)
 *   - source: "all" | "pages" | "external" (default "all")
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const q = params.get("q");
    const limit = Math.min(parseInt(params.get("limit") || "20"), 50);
    const source = params.get("source") || "all";

    if (!q) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const results = await keywordSearch(q);

    // Filter by source if specified
    let filtered = results;
    if (source === "pages") {
      filtered = results.filter(r => r.source_type === "page");
    } else if (source === "external") {
      filtered = results.filter(r => r.source_type === "external");
    }

    return NextResponse.json({
      query: q,
      mode: "keyword",
      data: filtered.slice(0, limit),
      total: filtered.length,
    }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * POST /api/v1/search
 * 
 * Semantic vector search using pre-computed embedding.
 * 
 * Body:
 *   - embedding: number[] (384-dimensional vector, required)
 *   - k: number (max results, default 10, max 50)
 *   - source: "all" | "pages" | "external" (default "all")
 * 
 * Note: Generate embeddings client-side using the BAAI/bge-small-en-v1.5 model
 * (384 dimensions) via @huggingface/transformers or any compatible library.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { embedding, k = 10, source = "all" } = body;

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json(
        { error: "embedding array is required (384-dimensional float vector)" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (embedding.length !== 384) {
      return NextResponse.json(
        { error: `Expected 384-dimensional embedding, got ${embedding.length}` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const limit = Math.min(k, 50);
    const embStr = "[" + embedding.map((v: number) => v.toFixed(8)).join(",") + "]";
    const results: Array<{
      id: string;
      title: string;
      permalink?: string;
      url?: string;
      description?: string;
      section?: string;
      source_domain?: string;
      distance: number;
      similarity: number;
      source_type: "page" | "external";
    }> = [];

    if (source === "all" || source === "pages") {
      const pageResults = await queryHttp<{
        id: string;
        title: string;
        permalink: string;
        description: string | null;
        section: string | null;
        distance: number;
      }>(
        `SELECT id, title, permalink, description, section,
          vector::distance::knn() AS distance
        FROM page
        WHERE embedding <|${limit}, 100|> ${embStr}
        ORDER BY distance
        LIMIT ${limit};`
      );

      for (const r of pageResults) {
        results.push({
          id: r.id,
          title: r.title,
          permalink: r.permalink,
          description: r.description || undefined,
          section: r.section || undefined,
          distance: r.distance,
          similarity: Math.round((1 - r.distance) * 10000) / 100,
          source_type: "page",
        });
      }
    }

    if (source === "all" || source === "external") {
      const extResults = await queryHttp<{
        id: string;
        title: string;
        url: string;
        source_domain: string;
        distance: number;
      }>(
        `SELECT id, title, url, domain AS source_domain,
          vector::distance::knn() AS distance
        FROM external_resource
        WHERE embedding <|${limit}, 100|> ${embStr}
        ORDER BY distance
        LIMIT ${limit};`
      );

      for (const r of extResults) {
        results.push({
          id: r.id,
          title: r.title,
          url: r.url,
          source_domain: r.source_domain,
          distance: r.distance,
          similarity: Math.round((1 - r.distance) * 10000) / 100,
          source_type: "external",
        });
      }
    }

    results.sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      mode: "semantic",
      model: "BAAI/bge-small-en-v1.5",
      dimensions: 384,
      data: results.slice(0, limit),
      total: results.length,
    }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Semantic search API error:", err);
    return NextResponse.json(
      { error: "Semantic search failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
