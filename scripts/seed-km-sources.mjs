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

function esc(str) {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function capitalizeDomain(domain) {
  return domain
    .split(".")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function upsertSource(params) {
  const { name, domain, source_type, base_url, api_endpoint, institution_weight, publisher_reputation, recency_bonus, fetch_method, is_active, fetch_schedule } = params;

  const existing = await q(
    `SELECT id FROM source WHERE domain = '${esc(domain)}' LIMIT 1;`
  );

  if (existing && existing.length > 0) {
    await q(
      `UPDATE source SET `
      + `name = '${esc(name)}', `
      + `source_type = '${esc(source_type)}', `
      + `base_url = '${esc(base_url)}', `
      + (api_endpoint ? `api_endpoint = '${esc(api_endpoint)}', ` : ``)
      + `institution_weight = ${institution_weight}, `
      + `publisher_reputation = ${publisher_reputation}, `
      + `recency_bonus = ${recency_bonus}, `
      + `fetch_method = '${esc(fetch_method)}', `
      + `is_active = ${is_active}, `
      + `fetch_schedule = '${esc(fetch_schedule)}' `
      + `WHERE domain = '${esc(domain)}';`
    );
    return "updated";
  } else {
    await q(
      `CREATE source SET `
      + `name = '${esc(name)}', `
      + `domain = '${esc(domain)}', `
      + `source_type = '${esc(source_type)}', `
      + `base_url = '${esc(base_url)}', `
      + (api_endpoint ? `api_endpoint = '${esc(api_endpoint)}', ` : ``)
      + `institution_weight = ${institution_weight}, `
      + `publisher_reputation = ${publisher_reputation}, `
      + `recency_bonus = ${recency_bonus}, `
      + `fetch_method = '${esc(fetch_method)}', `
      + `is_active = ${is_active}, `
      + `fetch_schedule = '${esc(fetch_schedule)}';`
    );
    return "created";
  }
}

async function main() {
  console.log("Backfilling source table from external_resource domains...\n");

  await q("DEFINE INDEX IF NOT EXISTS idx_source_domain ON source FIELDS domain UNIQUE;");

  const domains = await q("SELECT DISTINCT domain FROM external_resource WHERE domain != NONE;");

  console.log(`Found ${domains.length} distinct domains in external_resource\n`);

  let created = 0;
  let updated = 0;

  for (const row of domains) {
    const domain = row.domain;
    const name = capitalizeDomain(domain);
    const result = await upsertSource({
      name,
      domain,
      source_type: "other",
      base_url: `https://${domain}`,
      institution_weight: 0.5,
      publisher_reputation: 0.5,
      recency_bonus: 0.5,
      fetch_method: "scrape",
      is_active: true,
      fetch_schedule: "0 6,18 * * *",
    });
    if (result === "created") created++;
    else updated++;
  }

  console.log(`External-resource domains: ${created} created, ${updated} updated\n`);

  const API_SOURCES = [
    {
      name: "OpenAlex",
      domain: "api.openalex.org",
      source_type: "academic",
      base_url: "https://api.openalex.org",
      api_endpoint: "https://api.openalex.org/works",
      institution_weight: 0.7,
      publisher_reputation: 0.5,
      recency_bonus: 0.5,
      fetch_method: "api",
      is_active: true,
      fetch_schedule: "0 6,18 * * *",
    },
    {
      name: "OECD SDMX",
      domain: "stats.oecd.org",
      source_type: "intergov",
      base_url: "https://stats.oecd.org",
      api_endpoint: null,
      institution_weight: 0.9,
      publisher_reputation: 0.5,
      recency_bonus: 0.5,
      fetch_method: "api",
      is_active: true,
      fetch_schedule: "0 6,18 * * *",
    },
    {
      name: "UN SDG",
      domain: "unstats.un.org",
      source_type: "intergov",
      base_url: "https://unstats.un.org",
      api_endpoint: "https://unstats.un.org/sdgapi",
      institution_weight: 0.9,
      publisher_reputation: 0.5,
      recency_bonus: 0.5,
      fetch_method: "api",
      is_active: true,
      fetch_schedule: "0 6,18 * * *",
    },
    {
      name: "EUR-Lex",
      domain: "eur-lex.europa.eu",
      source_type: "regulator",
      base_url: "https://eur-lex.europa.eu",
      api_endpoint: null,
      institution_weight: 0.85,
      publisher_reputation: 0.5,
      recency_bonus: 0.5,
      fetch_method: "api",
      is_active: true,
      fetch_schedule: "0 6,18 * * *",
    },
    {
      name: "Open-Meteo",
      domain: "open-meteo.com",
      source_type: "academic",
      base_url: "https://open-meteo.com",
      api_endpoint: "https://api.open-meteo.com",
      institution_weight: 0.7,
      publisher_reputation: 0.5,
      recency_bonus: 0.5,
      fetch_method: "api",
      is_active: true,
      fetch_schedule: "0 6,18 * * *",
    },
  ];

  let apiCreated = 0;
  let apiUpdated = 0;

  for (const src of API_SOURCES) {
    const result = await upsertSource(src);
    if (result === "created") apiCreated++;
    else apiUpdated++;
    console.log(`  ${result === "created" ? "+" : "~"} ${src.name}  (${src.domain})`);
  }

  const totalCreated = created + apiCreated;
  const totalUpdated = updated + apiUpdated;
  console.log(`\nTotal: ${totalCreated} sources created, ${totalUpdated} updated`);
}

main().catch((err) => {
  console.error("seed-km-sources failed:", err.message);
  process.exit(1);
});
