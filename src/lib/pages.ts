import { queryHttp } from "./surrealdb";

export interface Page {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  keywords: string | null;
  pillar: string | null;
  parent: string | null;
  permalink: string;
  layout: string;
  content: string;
  redirect_to: string | null;
  section: string | null;
  subsection: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Check if database is configured
 */
function isDbConfigured(): boolean {
  const hasEndpoint = !!process.env.SURREAL_ENDPOINT;
  const hasUsername = !!process.env.SURREAL_USERNAME;
  const hasPassword = !!process.env.SURREAL_PASSWORD;
  const hasNamespace = !!process.env.SURREAL_NAMESPACE;
  const hasDatabase = !!process.env.SURREAL_DATABASE;
  
  const configured = hasEndpoint && hasUsername && hasPassword && hasNamespace && hasDatabase;
  
  if (!configured) {
    console.log("[pages] DB config check:", {
      endpoint: hasEndpoint,
      username: hasUsername,
      password: hasPassword,
      namespace: hasNamespace,
      database: hasDatabase
    });
  }
  
  return configured;
}

/**
 * Get a page by its permalink
 */
export async function getPageByPermalink(
  permalink: string
): Promise<Page | null> {
  // Return null gracefully if database is not configured
  if (!isDbConfigured()) {
    console.log("[pages] Database not configured, returning null for:", permalink);
    return null;
  }

  // Normalize: ensure leading and trailing slashes
  let normalized = permalink;
  if (!normalized.startsWith("/")) normalized = "/" + normalized;
  if (!normalized.endsWith("/")) normalized += "/";

  try {
    const results = await queryHttp<Page>(
      `SELECT * FROM page WHERE permalink = $permalink LIMIT 1;`,
      { permalink: normalized }
    );

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("[pages] Error fetching page:", error);
    console.error("[pages] Error details:", {
      permalink: normalized,
      endpoint: process.env.SURREAL_ENDPOINT?.substring(0, 30) + "...",
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * Get all pages in a section
 */
export async function getPagesBySection(section: string): Promise<Page[]> {
  if (!isDbConfigured()) {
    console.log("[pages] Database not configured, returning empty array for section:", section);
    return [];
  }

  try {
    return queryHttp<Page>(
      `SELECT * FROM page WHERE section = $section ORDER BY title ASC;`,
      { section }
    );
  } catch (error) {
    console.error("[pages] Error fetching pages by section:", error);
    return [];
  }
}

/**
 * Get all pages (for sitemap generation)
 */
export async function getAllPages(): Promise<Page[]> {
  if (!isDbConfigured()) {
    console.log("[pages] Database not configured, returning empty array for all pages");
    return [];
  }

  try {
    return queryHttp<Page>(
      `SELECT id, slug, title, permalink, section, subsection, pillar, parent, redirect_to, updated_at FROM page ORDER BY section ASC, title ASC;`
    );
  } catch (error) {
    console.error("[pages] Error fetching all pages:", error);
    return [];
  }
}

/**
 * Search pages by query
 */
export async function searchPages(query: string): Promise<Page[]> {
  if (!isDbConfigured()) {
    console.log("[pages] Database not configured, returning empty array for search");
    return [];
  }

  try {
    return queryHttp<Page>(
      `SELECT *, search::score(0) + search::score(1) AS relevance FROM page WHERE title @0@ $query OR content @1@ $query ORDER BY relevance DESC LIMIT 50;`,
      { query }
    );
  } catch (error) {
    console.error("[pages] Error searching pages:", error);
    return [];
  }
}

/**
 * Get child pages of a parent section
 */
export async function getChildPages(
  section: string,
  subsection?: string
): Promise<Page[]> {
  if (!isDbConfigured()) {
    console.log("[pages] Database not configured, returning empty array for child pages");
    return [];
  }

  try {
    if (subsection) {
      return queryHttp<Page>(
        `SELECT * FROM page WHERE section = $section AND subsection = $subsection AND slug != $subsection ORDER BY title ASC;`,
        { section, subsection }
      );
    }
    return queryHttp<Page>(
      `SELECT * FROM page WHERE section = $section AND subsection IS NONE ORDER BY title ASC;`,
      { section }
    );
  } catch (error) {
    console.error("[pages] Error fetching child pages:", error);
    return [];
  }
}
