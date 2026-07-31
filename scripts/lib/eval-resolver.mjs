/**
 * Shared eval label resolver for scripts/eval-search.mjs.
 *
 * eval-queries.json labels are slug-style (`page:climate-change`), but the
 * live search API returns SurrealDB record IDs (`page:20zz0z0bjewxrohgzzjb`)
 * plus a permalink. Exact-ID matching therefore always scores 0.
 *
 * The resolver paginates GET /api/v1/pages to build a slug -> {id, permalink}
 * index, then expands each label into a set of match keys (real record ID and
 * permalink) so a search result can be judged relevant by either.
 */

export async function fetchPageIndex(apiBase, { limit = 100, maxPages = 50 } = {}) {
  const index = [];
  let offset = 0;
  while (offset < limit * maxPages) {
    const url = new URL(`${apiBase}/api/v1/pages`);
    url.searchParams.set("fields", "id,permalink,slug");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    const res = await fetch(url.href, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Pages API returned ${res.status}: ${await res.text().catch(() => "")}`);
    const body = await res.json();
    const items = body.items ?? [];
    for (const item of items) index.push(item);
    if (!body.pagination?.has_more || items.length === 0) break;
    offset += items.length;
  }
  return index;
}

export function buildSlugMap(pageIndex) {
  const map = new Map();
  for (const page of pageIndex) {
    if (!page.slug) continue;
    if (!map.has(page.slug)) {
      map.set(page.slug, { id: page.id, permalink: page.permalink });
    }
  }
  return map;
}

export function expandLabels(labels, slugMap) {
  const matchKeys = new Set();
  for (const label of labels) {
    const m = /^page:(.+)$/.exec(label);
    const slug = m ? m[1] : label;
    const page = slugMap.get(slug);
    if (page) {
      matchKeys.add(page.id);
      if (page.permalink) matchKeys.add(page.permalink);
    } else {
      matchKeys.add(label);
    }
  }
  return matchKeys;
}

export function isRelevant(result, matchKeys) {
  if (!result || !matchKeys?.size) return false;
  const ids = new Set();
  if (result.id) ids.add(result.id);
  if (result.permalink) ids.add(result.permalink);
  for (const key of ids) {
    if (matchKeys.has(key)) return 1;
  }
  return 0;
}
