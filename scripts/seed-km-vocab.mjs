#!/usr/bin/env node

import { getDbEnv } from "./lib/db-env.mjs";

const env = getDbEnv();
const BASE = `${env.endpoint}/sql`;

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

const VOCABS = {
  topic: [
    "environmental", "social", "governance", "standards", "sdg",
    "frameworks", "finance", "hk-apac", "emerging-topics",
    "learning", "ratings", "regulations",
  ],
  industry: [
    "financial-services", "energy", "manufacturing", "real-estate",
    "technology", "agriculture", "healthcare", "transportation",
  ],
  framework: [
    "gri", "issb", "esrs", "tcfd", "sasb", "cdp", "tnfd",
    "ungc", "sdgs", "pri", "iirc", "csrd", "sfdr",
    "eu-taxonomy", "sec-climate", "hkex-esg",
  ],
  jurisdiction: [
    "eu", "us", "hk", "cn", "jp", "sg", "uk", "global", "in",
  ],
  stakeholder: [
    "investor", "regulator", "company", "ngo", "academic", "public",
  ],
  content_type: [
    "standard_text", "regulation", "framework", "guidance",
    "report", "article", "glossary_term", "entity_profile",
  ],
};

function buildAssertClause() {
  const clauses = [];
  for (const [key, values] of Object.entries(VOCABS)) {
    const list = values.map((v) => `'${v}'`).join(", ");
    clauses.push(`($value.${key} == NONE OR $value.${key} INSIDE [${list}])`);
  }
  return clauses.join(" AND ");
}

const ASSERT_CLAUSE = buildAssertClause();

async function main() {
  console.log("Seeding KM controlled vocabularies...\n");

  const tables = ["term", "framework", "industry", "entity"];
  let added = 0;

  for (const table of tables) {
    const stmt = `DEFINE FIELD facets ON ${table} TYPE object ASSERT ${ASSERT_CLAUSE};`;
    try {
      await q(stmt);
      added++;
      const keys = Object.keys(VOCABS).join(", ");
      console.log(`  ✓ ${table}.facets  —  ASSERT (${keys})`);
    } catch (err) {
      console.error(`  ✗ ${table} — ${err.message}`);
    }
  }

  console.log(`\nSummary: ${added}/${tables.length} tables had vocab constraints applied`);

  const keyCount = Object.keys(VOCABS).length;
  const valCount = Object.values(VOCABS).reduce((s, a) => s + a.length, 0);
  console.log(`  ${keyCount} vocab keys, ${valCount} total allowed values`);
}

main().catch((err) => {
  console.error("seed-km-vocab failed:", err.message);
  process.exit(1);
});
