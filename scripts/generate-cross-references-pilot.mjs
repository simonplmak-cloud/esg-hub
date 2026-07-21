/**
 * Scoped cross-reference generator for a single section
 * (specs/ux-mcp-content-bestpractice, plan §A2 — AC-A2).
 *
 *   node scripts/generate-cross-references-pilot.mjs [--section standards] [--apply]
 *
 * Scoring per page pair: keyword-set Jaccard (weight 3) + title-token Jaccard
 * (weight 2) + same-pillar bonus (1). Top 5 above MIN_SCORE become related_pages.
 * Dry-run by default; --apply writes with backup.
 */

import { getDbEnv } from "./lib/db-env.mjs";
import fs from "node:fs";

const env = getDbEnv();
const args = process.argv.slice(2);
const sectionIdx = args.indexOf("--section");
const SECTION = sectionIdx > -1 ? args[sectionIdx + 1] : "standards";
const APPLY = args.includes("--apply");
const TOP_N = 5;
const MIN_SCORE = 0.08;

async function q(body) {
  const res = await fetch(`${env.endpoint}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      "surreal-ns": env.namespace,
      "surreal-db": env.database,
      Authorization: "Basic " + Buffer.from(`${env.username}:${env.password}`).toString("base64"),
    },
    body,
  });
  if (!res.ok) throw new Error(`SurrealDB error ${res.status}: ${await res.text()}`);
  return (await res.json())[0]?.result;
}
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const STOP = new Set(["the", "and", "for", "with", "esg", "standards", "standard", "reporting", "guide", "overview", "eu", "of", "a", "an", "in", "on", "to"]);
const tokens = (s) =>
  new Set(
    (s || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2 && !STOP.has(t))
  );
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
};

const pages = await q(
  `SELECT id, permalink, title, pillar, keywords, related_pages FROM page WHERE section = '${esc(SECTION)}' ORDER BY permalink;`
);
console.log(`section '${SECTION}': ${pages.length} pages`);

const byPermalink = new Map(pages.map((p) => [p.permalink, p.id]));

const enriched = pages.map((p) => ({
  ...p,
  kwSet: tokens(p.keywords),
  titleSet: tokens(p.title),
}));

const assignments = new Map(); // permalink -> [{pl, score}]
for (const a of enriched) {
  const scored = [];
  for (const b of enriched) {
    if (a.permalink === b.permalink) continue;
    const score =
      3 * jaccard(a.kwSet, b.kwSet) +
      2 * jaccard(a.titleSet, b.titleSet) +
      (a.pillar && a.pillar === b.pillar ? 0.1 : 0);
    if (score >= MIN_SCORE) scored.push({ pl: b.permalink, title: b.title, score });
  }
  scored.sort((x, y) => y.score - x.score);
  assignments.set(a.permalink, scored.slice(0, TOP_N));
}

// backlinks: reverse map of accepted assignments
const backlinks = new Map(enriched.map((p) => [p.permalink, []]));
for (const [src, rels] of assignments) {
  for (const r of rels) backlinks.get(r.pl)?.push(src);
}

console.log("\n--- Assignments (dry-run review) ---");
for (const p of enriched) {
  const rels = assignments.get(p.permalink);
  console.log(`\n${p.permalink}  [${p.title}]`);
  rels.forEach((r) => console.log(`   ${r.score.toFixed(2)}  ${r.pl}`));
}

const stats = { pages: 0, withRels: 0, totalLinks: 0 };
for (const p of enriched) {
  stats.pages++;
  const rels = assignments.get(p.permalink);
  if (rels.length) {
    stats.withRels++;
    stats.totalLinks += rels.length;
  }
}
console.log(`\nsummary: ${stats.withRels}/${stats.pages} pages get related_pages; ${stats.totalLinks} links total`);

if (!APPLY) {
  console.log("\n(dry-run — pass --apply to write)");
  process.exit(0);
}

// backup + write
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const backup = await q(
  `SELECT permalink, related_pages, backlinks FROM page WHERE section = '${esc(SECTION)}';`
);
fs.writeFileSync(
  new URL(`../specs/ux-mcp-content-bestpractice/backup-crossref-${ts}.json`, import.meta.url),
  JSON.stringify(backup, null, 1)
);

for (const p of enriched) {
  const relIds = assignments.get(p.permalink).map((r) => `'${esc(byPermalink.get(r.pl))}'`);
  const blIds = (backlinks.get(p.permalink) || []).map((r) => `'${esc(byPermalink.get(r))}'`);
  await q(
    `UPDATE page SET related_pages = [${relIds.join(", ")}], backlinks = [${blIds.join(", ")}] WHERE permalink = '${esc(p.permalink)}';`
  );
}

const verify = await q(
  `SELECT count() FROM page WHERE section = '${esc(SECTION)}' AND array::len(related_pages) > 0 GROUP ALL;`
);
console.log(`✅ applied. pages with related_pages > 0: ${verify?.[0]?.count}/${stats.pages}`);
