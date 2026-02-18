import { queryHttp, sanitize } from "./surrealdb";

export interface SearchResult {
  id: string;
  title: string;
  permalink?: string;
  url?: string;
  description?: string;
  section?: string;
  source_domain?: string;
  relevance?: number;
  distance?: number;
  source_type: "page" | "external";
}

/**
 * Full-text keyword search using BM25 ranking.
 * Input is sanitized to prevent SurrealQL injection.
 */
export async function keywordSearch(query: string): Promise<SearchResult[]> {
  // Truncate excessively long queries
  const trimmed = query.slice(0, 500);
  const escaped = sanitize(trimmed);
  
  // Search pages
  const pageResults = await queryHttp<{
    id: string;
    title: string;
    permalink: string;
    description: string | null;
    section: string | null;
    relevance: number;
  }>(
    `SELECT id, title, permalink, description, section, 
      search::score(0) + search::score(1) AS relevance 
    FROM page 
    WHERE title @0@ '${escaped}' OR content @1@ '${escaped}' 
    ORDER BY relevance DESC 
    LIMIT 30;`
  );

  // Search external resources
  const extResults = await queryHttp<{
    id: string;
    title: string;
    url: string;
    source_domain: string;
    relevance: number;
  }>(
    `SELECT id, title, url, source_domain,
      search::score(0) + search::score(1) AS relevance
    FROM external_resource
    WHERE title @0@ '${escaped}' OR content @1@ '${escaped}'
    ORDER BY relevance DESC
    LIMIT 20;`
  );

  const results: SearchResult[] = [];

  for (const r of pageResults) {
    results.push({
      id: r.id,
      title: r.title,
      permalink: r.permalink,
      description: r.description || undefined,
      section: r.section || undefined,
      relevance: r.relevance,
      source_type: "page",
    });
  }

  for (const r of extResults) {
    results.push({
      id: r.id,
      title: r.title,
      url: r.url,
      source_domain: r.source_domain,
      relevance: r.relevance,
      source_type: "external",
    });
  }

  // Sort by relevance descending
  results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  return results.slice(0, 30);
}

/**
 * Semantic vector search using HNSW index.
 * Embedding values are validated before use.
 */
export async function semanticSearch(
  embedding: number[],
  k: number = 15
): Promise<SearchResult[]> {
  // Validate embedding
  if (!Array.isArray(embedding) || embedding.length !== 384) {
    throw new Error("Invalid embedding: expected 384-dimensional array");
  }
  for (let i = 0; i < embedding.length; i++) {
    if (typeof embedding[i] !== "number" || !isFinite(embedding[i])) {
      throw new Error(`Invalid embedding value at index ${i}`);
    }
  }

  // Sanitize k
  const safeK = Math.max(1, Math.min(k, 50));

  const embStr = "[" + embedding.map((v) => v.toFixed(8)).join(",") + "]";
  const results: SearchResult[] = [];

  // Search pages
  try {
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
      WHERE embedding <|${safeK}, 100|> ${embStr}
      ORDER BY distance
      LIMIT ${safeK};`
    );

    for (const r of pageResults) {
      results.push({
        id: r.id,
        title: r.title,
        permalink: r.permalink,
        description: r.description || undefined,
        section: r.section || undefined,
        distance: r.distance,
        source_type: "page",
      });
    }
  } catch (err) {
    console.error("[Search] Page semantic search error:", err);
  }

  // Search external resources
  try {
    const extResults = await queryHttp<{
      id: string;
      title: string;
      url: string;
      source_domain: string;
      distance: number;
    }>(
      `SELECT id, title, url, source_domain,
        vector::distance::knn() AS distance
      FROM external_resource
      WHERE embedding <|${safeK}, 100|> ${embStr}
      ORDER BY distance
      LIMIT ${safeK};`
    );

    for (const r of extResults) {
      results.push({
        id: r.id,
        title: r.title,
        url: r.url,
        source_domain: r.source_domain,
        distance: r.distance,
        source_type: "external",
      });
    }
  } catch (err) {
    console.error("[Search] External semantic search error:", err);
  }

  // Sort by distance ascending (lower = more similar)
  results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  return results.slice(0, safeK);
}
