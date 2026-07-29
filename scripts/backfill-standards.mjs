#!/usr/bin/env node
import { getDbEnv } from "./lib/db-env.mjs";

const env = getDbEnv();
const BASE = `${env.endpoint}/sql`;
const APPLY = process.argv.includes("--apply");

const esc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");

async function q(body) {
  const res = await fetch(BASE, {
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
  if (!res.ok) throw new Error(`DB error ${res.status}`);
  return (await res.json())[0]?.result;
}

async function main() {
  console.log(`[backfill-standards] ${APPLY ? "APPLY" : "DRY-RUN"}\n`);

  const pages = await q(`SELECT id, title, description, permalink, section, pillar FROM page WHERE section = 'standards' ORDER BY title;`);
  const pageList = Array.isArray(pages) ? pages : [];
  console.log(`Found ${pageList.length} standards pages\n`);

  const existing = await q(`SELECT permalink FROM framework;`);
  const exists = new Set((existing || []).map(f => f.permalink));
  console.log(`Existing: ${exists.size}\n`);

  let created = 0, skipped = 0;
  for (const page of pageList) {
    if (!page.permalink || exists.has(page.permalink)) { skipped++; continue; }
    if (!APPLY) { created++; continue; }

    const sql = `CREATE framework CONTENT {
      name: '${esc(page.title)}',
      description: '${esc(page.description || "")}',
      permalink: '${esc(page.permalink)}',
      facets: { section: '${esc(page.section || "standards")}', pillar: '${esc(page.pillar || "Standards")}' },
      created_at: time::now()
    } RETURN id;`;

    try {
      const result = await q(sql);
      const fwId = Array.isArray(result) ? result[0]?.id : result?.id;
      if (fwId) { created++; console.log(`  ✓ ${page.title}`); }
      else { console.error(`  ✗ ${page.title}: no id`); }
    } catch (err) { console.error(`  ✗ ${page.title}: ${err.message.split('\n')[0]}`); }
  }

  if (!APPLY) console.log(`\nDry-run: ${created} would be created, ${skipped} skipped`);
  else console.log(`\nCreated: ${created}, Skipped: ${skipped}`);

  const count = await q(`SELECT count() FROM framework GROUP ALL;`);
  console.log(`Total frameworks: ${count?.[0]?.count || 0}`);
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
