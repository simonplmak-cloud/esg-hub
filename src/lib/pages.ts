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
 * Get a page by its permalink
 */
export async function getPageByPermalink(
  permalink: string
): Promise<Page | null> {
  // Normalize: ensure leading and trailing slashes
  let normalized = permalink;
  if (!normalized.startsWith("/")) normalized = "/" + normalized;
  if (!normalized.endsWith("/")) normalized += "/";

  const escaped = normalized.replace(/'/g, "\\'");
  const results = await queryHttp<Page>(
    `SELECT * FROM page WHERE permalink = '${escaped}' LIMIT 1;`
  );

  return results.length > 0 ? results[0] : null;
}

/**
 * Get all pages in a section
 */
export async function getPagesBySection(section: string): Promise<Page[]> {
  const escaped = section.replace(/'/g, "\\'");
  return queryHttp<Page>(
    `SELECT * FROM page WHERE section = '${escaped}' ORDER BY title ASC;`
  );
}

/**
 * Get all pages (for sitemap generation)
 */
export async function getAllPages(): Promise<Page[]> {
  return queryHttp<Page>(
    `SELECT id, slug, title, permalink, section, subsection, pillar, parent, redirect_to, updated_at FROM page ORDER BY section ASC, title ASC;`
  );
}

/**
 * Search pages by query
 */
export async function searchPages(query: string): Promise<Page[]> {
  const escaped = query.replace(/'/g, "\\'");
  return queryHttp<Page>(
    `SELECT *, search::score(0) + search::score(1) AS relevance FROM page WHERE title @0@ '${escaped}' OR content @1@ '${escaped}' ORDER BY relevance DESC LIMIT 50;`
  );
}

/**
 * Get child pages of a parent section
 */
export async function getChildPages(
  section: string,
  subsection?: string
): Promise<Page[]> {
  const sectionEscaped = section.replace(/'/g, "\\'");
  if (subsection) {
    const subEscaped = subsection.replace(/'/g, "\\'");
    return queryHttp<Page>(
      `SELECT * FROM page WHERE section = '${sectionEscaped}' AND subsection = '${subEscaped}' AND slug != '${subEscaped}' ORDER BY title ASC;`
    );
  }
  return queryHttp<Page>(
    `SELECT * FROM page WHERE section = '${sectionEscaped}' AND subsection IS NONE ORDER BY title ASC;`
  );
}
