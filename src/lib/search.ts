import { queryHttp } from "./surrealdb";

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
 * Full-text keyword search using BM25 ranking
 */
export async function keywordSearch(query: string): Promise<SearchResult[]> {
  const escaped = query.replace(/'/g, "\\'");
  
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
 * Semantic vector search using HNSW index
 */
export async function semanticSearch(
  embedding: number[],
  k: number = 15
): Promise<SearchResult[]> {
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
      WHERE embedding <|${k}, 100|> ${embStr}
      ORDER BY distance
      LIMIT ${k};`
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
    console.error("Page semantic search error:", err);
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
      WHERE embedding <|${k}, 100|> ${embStr}
      ORDER BY distance
      LIMIT ${k};`
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
    console.error("External semantic search error:", err);
  }

  // Sort by distance ascending (lower = more similar)
  results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  return results.slice(0, k);
}
