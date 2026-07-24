#!/usr/bin/env node

import { getDbEnv } from "./lib/db-env.mjs";

const env = getDbEnv();
const BASE = `${env.endpoint}/sql`;
const APPLY = process.argv.includes("--write");

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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SurrealDB error ${res.status}: ${text}`);
  }
  return (await res.json())[0]?.result;
}

const RESULT_MODE = APPLY ? "APPLY" : "DRY-RUN";

async function main() {
  console.log(`Migrating cross-references from page.related_pages arrays to related_to edges...`);
  console.log(`Mode: ${RESULT_MODE}\n`);

  const pages = await q(
    `SELECT id, permalink, related_pages FROM page WHERE related_pages IS NOT NULL AND array::len(related_pages) > 0 ORDER BY permalink;`
  );

  if (!pages || pages.length === 0) {
    console.log("No pages have related_pages. Nothing to migrate.");
    process.exit(0);
  }

  console.log(`Found ${pages.length} pages with related_pages arrays.\n`);

  const edges = [];
  for (const page of pages) {
    const relatedIds = page.related_pages;
    for (const targetId of relatedIds) {
      edges.push({ from: page.id, to: targetId });
    }
  }

  const totalEdges = edges.length;
  console.log(`Total edges to create: ${totalEdges}`);

  if (totalEdges > 0) {
    console.log(`\nSample (10 pairs):`);
    const sampleSize = Math.min(10, totalEdges);
    for (let i = 0; i < sampleSize; i++) {
      console.log(`  ${edges[i].from}  →  ${edges[i].to}`);
    }
  }

  if (!APPLY) {
    console.log(`\nDry-run: ${totalEdges} edges would be created`);
    console.log("(pass --write to execute)");
    process.exit(0);
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const edge of edges) {
    try {
      await q(
        `RELATE ${edge.from}->related_to->${edge.to} SET relationship_type = 'cross_reference', score = 0.5;`
      );
      created++;
    } catch (err) {
      if (err.message.includes("Database index") && err.message.includes("already exists")) {
        skipped++;
      } else {
        errors++;
        console.error(`  ✗ ${edge.from} → ${edge.to}: ${err.message}`);
      }
    }
  }

  console.log(`\nApplied: ${created} edges created, ${skipped} skipped (already exist)${errors > 0 ? `, ${errors} errors` : ""}`);
}

main().catch((err) => {
  console.error("migrate-crossrefs-to-edges failed:", err.message);
  process.exit(1);
});
