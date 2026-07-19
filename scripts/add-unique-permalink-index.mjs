/**
 * One-time migration: ensure exactly one UNIQUE index on page.permalink
 * (specs/dev-env-automation/data-model.md — AC-A10)
 *
 * Canonical index: idx_page_permalink (matches setup-schema.mjs).
 * - Creates idx_page_permalink if no unique permalink index exists.
 * - Removes the redundant duplicate `unique_permalink` if present.
 *
 * Run: node scripts/add-unique-permalink-index.mjs
 * Idempotent; safe to re-run.
 * Rollback: none needed (adds/removes only redundant definitions).
 */

import { getDbEnv } from "./lib/db-env.mjs";

const env = getDbEnv();

async function querySurreal(surrealql) {
  const res = await fetch(`${env.endpoint}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      "surreal-ns": env.namespace,
      "surreal-db": env.database,
      Authorization: "Basic " + Buffer.from(`${env.username}:${env.password}`).toString("base64"),
    },
    body: surrealql,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SurrealDB error ${res.status}: ${text}`);
  }
  return res.json();
}

const isUniquePermalink = (def) =>
  typeof def === "string" && /FIELDS\s+permalink\b/i.test(def) && /\bUNIQUE\b/i.test(def);

const existing = await querySurreal("INFO FOR TABLE page;");
const indexes = existing?.[0]?.result?.indexes || {};
const uniqueOnes = Object.entries(indexes).filter(([, def]) => isUniquePermalink(def));

console.log(`Unique permalink indexes found: ${uniqueOnes.map(([k]) => k).join(", ") || "none"}`);

if (uniqueOnes.length === 0) {
  console.log("Creating idx_page_permalink...");
  await querySurreal("DEFINE INDEX IF NOT EXISTS idx_page_permalink ON page FIELDS permalink UNIQUE;");
}

if (indexes.unique_permalink && indexes.idx_page_permalink) {
  console.log("Removing redundant duplicate index: unique_permalink (keeping idx_page_permalink)...");
  await querySurreal("REMOVE INDEX IF EXISTS unique_permalink ON TABLE page;");
}

const after = await querySurreal("INFO FOR TABLE page;");
const afterIndexes = after?.[0]?.result?.indexes || {};
const finalUnique = Object.entries(afterIndexes).filter(([, def]) => isUniquePermalink(def)).map(([k]) => k);

if (finalUnique.length === 1) {
  console.log(`✅ Exactly one unique permalink index: ${finalUnique[0]}`);
} else {
  console.error(`❌ Unexpected state: ${finalUnique.join(", ") || "none"}`);
  process.exit(1);
}
