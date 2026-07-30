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
  console.log(`[seed-terms] ${APPLY ? "APPLY" : "DRY-RUN"}\n`);

  const pages = await q(`SELECT id, title, keywords, section, pillar FROM page WHERE keywords IS NOT NONE;`);
  const pageList = Array.isArray(pages) ? pages : [];
  console.log(`Found ${pageList.length} pages with keywords\n`);

  const keywordSet = new Set();
  for (const p of pageList) {
    const raw = p.keywords;
    if (!raw) continue;
    const parts = typeof raw === "string" ? raw.split(/[,;]+/) : Array.isArray(raw) ? raw : [];
    for (const k of parts) {
      const term = String(k).trim();
      if (term.length > 2 && term.length < 80) keywordSet.add(term);
    }
  }

  const keywords = [...keywordSet].sort();
  console.log(`Unique keywords extracted: ${keywords.length}\n`);

  const existing = await q(`SELECT name FROM term;`);
  const existingNames = new Set((existing || []).map(t => t.name.toLowerCase()));
  const newTerms = keywords.filter(k => !existingNames.has(k.toLowerCase()));
  console.log(`New terms to create: ${newTerms.length}\n`);

  if (!APPLY) {
    console.log("Sample terms:");
    for (const t of newTerms.slice(0, 20)) console.log(`  - ${t}`);
    console.log(`\n(dry-run — pass --apply to write ${newTerms.length} terms)`);
    return;
  }

  let created = 0;
  for (const term of newTerms) {
    try {
      const result = await q(`CREATE term CONTENT {
        name: '${esc(term)}',
        definition: '${esc(term)} — ESG Hub glossary term',
        permalink: 'glossary/${esc(term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}',
        facets: { content_type: 'glossary_term' },
        created_at: time::now()
      } RETURN id;`);
      if (result?.[0]?.id) { created++; }
      else if (Array.isArray(result)) {
        for (const r of result) { if (r?.id) { created++; break; } }
      }
    } catch (err) {
      if (!err.message.includes("already exists") && !err.message.includes("unique")) {
        console.error(`  ✗ ${term}: ${err.message.split('\n')[0]}`);
      }
    }
  }
  console.log(`\nCreated: ${created} terms`);

  const count = await q(`SELECT count() FROM term GROUP ALL;`);
  console.log(`Total terms: ${count?.[0]?.count || 0}`);
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
