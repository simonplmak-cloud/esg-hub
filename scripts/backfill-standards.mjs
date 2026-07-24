#!/usr/bin/env node

/**
 * One-time backfill: create framework records for standards-section pages.
 *
 *   node scripts/backfill-standards.mjs [--apply]
 *
 * Dry-run by default. With --apply:
 *   1. Query pages WHERE section = 'standards'
 *   2. CREATE framework record per page (name, description, permalink, facets)
 *   3. Extract terms from page.content via keyword matching → RELATE framework->defines->term
 *   4. Verify: SELECT *, ->defines->term FROM framework returns non-empty traversals
 */

import { getDbEnv } from "./lib/db-env.mjs";

const env = getDbEnv();
const SQL_BASE = `${env.endpoint}/sql`;

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function q(body) {
  const res = await fetch(SQL_BASE, {
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
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SurrealDB error ${res.status}: ${text}`);
  }
  return (await res.json())[0]?.result;
}

const esc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");

// ---------------------------------------------------------------------------
// Controlled vocabulary loader
// ---------------------------------------------------------------------------

async function loadTerms() {
  const terms = await q(`SELECT id, name, definition, facets FROM term ORDER BY name ASC;`);
  return Array.isArray(terms) ? terms : [];
}

// ---------------------------------------------------------------------------
// Keyword matching: extract known terms from page content
// ---------------------------------------------------------------------------

function extractKnownTerms(content, termNames) {
  if (!content || !termNames.length) return [];
  const found = new Set();

  // Normalize content for matching
  const norm = content.toLowerCase();

  // Sort by descending length so longer terms match first (avoid "ESG" shadowing "ESG Reporting")
  const sorted = [...termNames].sort((a, b) => b.length - a.length);

  for (const term of sorted) {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(norm)) {
      found.add(term);
    }
  }

  return [...found];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`[backfill-standards] ${APPLY ? "APPLY MODE" : "DRY-RUN"}\n`);

  // 1. Query standards pages
  const pages = await q(`
    SELECT id, title, description, permalink, section, pillar, keywords, facets, content
    FROM page
    WHERE section = 'standards'
    ORDER BY title ASC;
  `);
  console.log(`Found ${pages.length} pages with section='standards'\n`);

  // 2. Load existing frameworks + terms
  const existingFrameworks = await q(`SELECT id, permalink FROM framework;`);
  const frameworkPermalinks = new Set(existingFrameworks.map((f) => f.permalink));
  const terms = await loadTerms();
  const termNames = terms.map((t) => t.name);
  const termByName = new Map(terms.map((t) => [t.name.toLowerCase(), t]));
  console.log(`Loaded ${terms.length} controlled-vocabulary terms\n`);

  // 3. Compute what each page would produce
  const plan = [];
  for (const page of pages) {
    const permalink = page.permalink || "";
    const name = page.title || "";
    const description = page.description || "";
    const facets = {
      section: page.section,
      pillar: page.pillar,
      keywords: page.keywords,
      ...(page.facets || {}),
    };

    // Extract all content fields
    const contentFields = [];
    if (page.content) contentFields.push(page.content);
    if (page.content_en) contentFields.push(page.content_en);
    if (page.content_zh) contentFields.push(page.content_zh);
    if (page.content_hi) contentFields.push(page.content_hi);

    const combinedContent = contentFields.join(" ");
    const matchedTerms = extractKnownTerms(combinedContent, termNames);

    const frameworkExists = frameworkPermalinks.has(permalink);

    plan.push({
      pageId: page.id,
      permalink,
      name,
      description: description?.slice(0, 100) || "",
      facets,
      matchedTerms,
      frameworkExists,
    });
  }

  // 4. Display plan
  let newFrameworks = 0;
  let totalDefines = 0;

  console.log("── Plan ──");
  for (const p of plan) {
    const status = p.frameworkExists ? "[EXISTS] " : "[NEW]    ";
    console.log(`${status} ${p.name}  (${p.permalink})`);
    if (p.matchedTerms.length > 0) {
      console.log(`         defines: ${p.matchedTerms.join(", ")}`);
      totalDefines += p.matchedTerms.length;
    }
    if (!p.frameworkExists) newFrameworks++;
  }

  console.log(`\nSummary:`);
  console.log(`  Pages:               ${pages.length}`);
  console.log(`  New frameworks:      ${newFrameworks}`);
  console.log(`  Already exists:      ${plan.filter((p) => p.frameworkExists).length}`);
  console.log(`  Total defines edges: ${totalDefines}`);

  if (!APPLY) {
    console.log("\n(dry-run — pass --apply to write)");
    return;
  }

  // 5. Apply
  console.log("\n── Applying ──");

  let created = 0;
  let skipped = 0;
  let definesCreated = 0;

  for (const p of plan) {
    if (p.frameworkExists) {
      skipped++;
      console.log(`  SKIP ${p.name} (exists)`);
      continue;
    }

    // CREATE framework
    const facetsStr = JSON.stringify(p.facets).replace(/'/g, "\\'");
    const result = await q(`
      CREATE framework SET
        name = '${esc(p.name)}',
        description = '${esc(p.description)}',
        permalink = '${esc(p.permalink)}',
        facets = ${facetsStr},
        created_at = time::now()
      RETURN id;
    `);
    const frameworkId = Array.isArray(result) ? result[0]?.id : result?.id;
    if (!frameworkId) {
      console.error(`  FAIL ${p.name} — framework creation returned no id`);
      continue;
    }

    console.log(`  CREATE ${p.name} → ${frameworkId}`);
    created++;

    // RELATE framework->defines->term for each matched term
    for (const termName of p.matchedTerms) {
      const term = termByName.get(termName.toLowerCase());
      if (!term) continue;
      try {
        await q(`
          RELATE ${frameworkId}->defines->${term.id} SET
            confidence = 0.6,
            created_at = time::now();
        `);
        definesCreated++;
        console.log(`    → defines "${termName}" (${term.id})`);
      } catch (err) {
        if (err.message.includes("already exists") || err.message.includes("unique")) {
          console.log(`    → defines "${termName}" (already exists)`);
        } else {
          console.error(`    ✗ defines "${termName}" failed: ${err.message}`);
        }
      }
    }
  }

  console.log(`\nApplied:`);
  console.log(`  Frameworks created: ${created}`);
  console.log(`  Frameworks skipped: ${skipped}`);
  console.log(`  Defines edges:      ${definesCreated}`);

  // 6. VERIFY: non-empty traversals
  console.log("\n── Verification ──");
  const traversal = await q(`
    SELECT name, ->defines->term.name AS defined_terms
    FROM framework
    WHERE ->defines IS NOT NONE
    ORDER BY name ASC
    LIMIT 20;
  `);

  if (!traversal || traversal.length === 0) {
    console.warn("  ⚠ No frameworks with ->defines->term traversals found!");
  } else {
    let nonEmptyCount = 0;
    for (const fw of traversal) {
      const terms = fw.defined_terms || [];
      if (terms.length > 0) {
        nonEmptyCount++;
        console.log(`  ${fw.name}: [${terms.join(", ")}]`);
      }
    }
    console.log(`\n  Frameworks with definitions: ${nonEmptyCount}/${traversal.length}`);

    const totalCount = await q(`SELECT count() FROM framework GROUP ALL;`);
    console.log(`  Total frameworks: ${totalCount?.[0]?.count || 0}`);
  }

  console.log("\n✅ Done.");
}

main().catch((err) => {
  console.error(`[backfill-standards] Fatal: ${err.message}`);
  process.exit(1);
});
