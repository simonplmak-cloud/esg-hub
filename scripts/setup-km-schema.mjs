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

const SQL = [

  // ---- Content tables ----

  `DEFINE TABLE IF NOT EXISTS term SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS name ON term TYPE string`,
  `DEFINE FIELD IF NOT EXISTS definition ON term TYPE string`,
  `DEFINE FIELD IF NOT EXISTS permalink ON term TYPE string`,
  `DEFINE FIELD IF NOT EXISTS facets ON term TYPE object FLEXIBLE`,
  `DEFINE FIELD IF NOT EXISTS embedding ON term TYPE option<array<float>>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON term TYPE datetime DEFAULT time::now() READONLY`,
  `DEFINE FIELD IF NOT EXISTS updated_at ON term TYPE datetime DEFAULT time::now()`,

  `DEFINE TABLE IF NOT EXISTS framework SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS name ON framework TYPE string`,
  `DEFINE FIELD IF NOT EXISTS description ON framework TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS permalink ON framework TYPE string`,
  `DEFINE FIELD IF NOT EXISTS facets ON framework TYPE object FLEXIBLE`,
  `DEFINE FIELD IF NOT EXISTS embedding ON framework TYPE option<array<float>>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON framework TYPE datetime DEFAULT time::now() READONLY`,
  `DEFINE FIELD IF NOT EXISTS updated_at ON framework TYPE datetime DEFAULT time::now()`,

  `DEFINE TABLE IF NOT EXISTS industry SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS name ON industry TYPE string`,
  `DEFINE FIELD IF NOT EXISTS permalink ON industry TYPE string`,
  `DEFINE FIELD IF NOT EXISTS facets ON industry TYPE object FLEXIBLE`,
  `DEFINE FIELD IF NOT EXISTS embedding ON industry TYPE option<array<float>>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON industry TYPE datetime DEFAULT time::now() READONLY`,
  `DEFINE FIELD IF NOT EXISTS updated_at ON industry TYPE datetime DEFAULT time::now()`,

  `DEFINE TABLE IF NOT EXISTS entity SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS name ON entity TYPE string`,
  `DEFINE FIELD IF NOT EXISTS entity_type ON entity TYPE string`,
  `DEFINE FIELD IF NOT EXISTS permalink ON entity TYPE string`,
  `DEFINE FIELD IF NOT EXISTS facets ON entity TYPE object FLEXIBLE`,
  `DEFINE FIELD IF NOT EXISTS embedding ON entity TYPE option<array<float>>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON entity TYPE datetime DEFAULT time::now() READONLY`,
  `DEFINE FIELD IF NOT EXISTS updated_at ON entity TYPE datetime DEFAULT time::now()`,

  // ---- Pipeline tables ----

  `DEFINE TABLE IF NOT EXISTS source`,
  `DEFINE FIELD IF NOT EXISTS name ON source TYPE string`,
  `DEFINE FIELD IF NOT EXISTS domain ON source TYPE string`,
  `DEFINE FIELD IF NOT EXISTS source_type ON source TYPE string`,
  `DEFINE FIELD IF NOT EXISTS base_url ON source TYPE string`,
  `DEFINE FIELD IF NOT EXISTS api_endpoint ON source TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS api_auth ON source TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS institution_weight ON source TYPE float DEFAULT 0.5`,
  `DEFINE FIELD IF NOT EXISTS publisher_reputation ON source TYPE float DEFAULT 0.5`,
  `DEFINE FIELD IF NOT EXISTS recency_bonus ON source TYPE float DEFAULT 0.5`,
  `DEFINE FIELD IF NOT EXISTS formula_version ON source TYPE int DEFAULT 1`,
  `DEFINE FIELD IF NOT EXISTS authority_score ON source TYPE float DEFAULT 0.5`,
  `DEFINE FIELD IF NOT EXISTS fetch_schedule ON source TYPE string`,
  `DEFINE FIELD IF NOT EXISTS fetch_method ON source TYPE string`,
  `DEFINE FIELD IF NOT EXISTS is_active ON source TYPE bool DEFAULT true`,
  `DEFINE FIELD IF NOT EXISTS last_fetched_at ON source TYPE option<datetime>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON source TYPE datetime DEFAULT time::now() READONLY`,
  `DEFINE FIELD IF NOT EXISTS updated_at ON source TYPE datetime DEFAULT time::now()`,

  `DEFINE TABLE IF NOT EXISTS scrape_job`,
  `DEFINE FIELD IF NOT EXISTS source_url ON scrape_job TYPE string`,
  `DEFINE FIELD IF NOT EXISTS source_domain ON scrape_job TYPE string`,
  `DEFINE FIELD IF NOT EXISTS status ON scrape_job TYPE string DEFAULT "queued"`,
  `DEFINE FIELD IF NOT EXISTS checksum ON scrape_job TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS raw_content ON scrape_job TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS normalized_content ON scrape_job TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS proposals_generated ON scrape_job TYPE option<array<record>>`,
  `DEFINE FIELD IF NOT EXISTS pipeline_version ON scrape_job TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON scrape_job TYPE datetime DEFAULT time::now() READONLY`,
  `DEFINE FIELD IF NOT EXISTS completed_at ON scrape_job TYPE option<datetime>`,

  `DEFINE TABLE IF NOT EXISTS content_enhancement_log`,
  `DEFINE FIELD IF NOT EXISTS job_id ON content_enhancement_log TYPE option<record<scrape_job>>`,
  `DEFINE FIELD IF NOT EXISTS status ON content_enhancement_log TYPE string DEFAULT "pending"`,
  `DEFINE FIELD IF NOT EXISTS target_table ON content_enhancement_log TYPE string`,
  `DEFINE FIELD IF NOT EXISTS target_id ON content_enhancement_log TYPE option<record>`,
  `DEFINE FIELD IF NOT EXISTS proposed_changes ON content_enhancement_log TYPE object`,
  `DEFINE FIELD IF NOT EXISTS source_urls ON content_enhancement_log TYPE option<array<string>>`,
  `DEFINE FIELD IF NOT EXISTS authority_score ON content_enhancement_log TYPE option<float>`,
  `DEFINE FIELD IF NOT EXISTS reviewer ON content_enhancement_log TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS reviewed_at ON content_enhancement_log TYPE option<datetime>`,
  `DEFINE FIELD IF NOT EXISTS review_notes ON content_enhancement_log TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON content_enhancement_log TYPE datetime DEFAULT time::now() READONLY`,

  // ---- RELATION tables ----

  `DEFINE TABLE IF NOT EXISTS related_to TYPE RELATION FROM page TO page SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS relationship_type ON related_to TYPE string`,
  `DEFINE FIELD IF NOT EXISTS score ON related_to TYPE option<float>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON related_to TYPE datetime DEFAULT time::now() READONLY`,

  `DEFINE TABLE IF NOT EXISTS defines TYPE RELATION FROM framework TO term SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS confidence ON defines TYPE float DEFAULT 0.5`,
  `DEFINE FIELD IF NOT EXISTS evidence_url ON defines TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON defines TYPE datetime DEFAULT time::now() READONLY`,

  `DEFINE TABLE IF NOT EXISTS cites TYPE RELATION IN page|term|framework OUT external_resource|page SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS context ON cites TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS source_span ON cites TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON cites TYPE datetime DEFAULT time::now() READONLY`,

  `DEFINE TABLE IF NOT EXISTS regulates TYPE RELATION FROM framework TO industry SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS jurisdiction ON regulates TYPE string`,
  `DEFINE FIELD IF NOT EXISTS effective_date ON regulates TYPE option<datetime>`,
  `DEFINE FIELD IF NOT EXISTS obligation_type ON regulates TYPE string`,
  `DEFINE FIELD IF NOT EXISTS created_at ON regulates TYPE datetime DEFAULT time::now() READONLY`,

  `DEFINE TABLE IF NOT EXISTS applies_to TYPE RELATION IN term|framework OUT industry|entity SCHEMAFULL`,
  `DEFINE FIELD IF NOT EXISTS scope ON applies_to TYPE option<string>`,
  `DEFINE FIELD IF NOT EXISTS created_at ON applies_to TYPE datetime DEFAULT time::now() READONLY`,

  // ---- Additive column to page ----
  `DEFINE FIELD IF NOT EXISTS last_verified ON page TYPE option<datetime>`,
];

const INDEXES = [
  `DEFINE INDEX IF NOT EXISTS idx_term_permalink ON term FIELDS permalink UNIQUE`,
  `DEFINE INDEX IF NOT EXISTS idx_term_name_ft ON term FIELDS name FULLTEXT ANALYZER esg_analyzer BM25(1.2,0.75) HIGHLIGHTS`,
  `DEFINE INDEX IF NOT EXISTS idx_term_definition_ft ON term FIELDS definition FULLTEXT ANALYZER esg_analyzer BM25(1.2,0.75) HIGHLIGHTS`,
  `DEFINE INDEX IF NOT EXISTS idx_term_embedding_hnsw ON term FIELDS embedding HNSW DIMENSION 384`,

  `DEFINE INDEX IF NOT EXISTS idx_framework_permalink ON framework FIELDS permalink UNIQUE`,
  `DEFINE INDEX IF NOT EXISTS idx_framework_desc_ft ON framework FIELDS description FULLTEXT ANALYZER esg_analyzer BM25(1.2,0.75) HIGHLIGHTS`,
  `DEFINE INDEX IF NOT EXISTS idx_framework_name_ft ON framework FIELDS name FULLTEXT ANALYZER esg_analyzer BM25(1.2,0.75) HIGHLIGHTS`,
  `DEFINE INDEX IF NOT EXISTS idx_framework_embedding_hnsw ON framework FIELDS embedding HNSW DIMENSION 384`,

  `DEFINE INDEX IF NOT EXISTS idx_industry_embedding_hnsw ON industry FIELDS embedding HNSW DIMENSION 384`,
  `DEFINE INDEX IF NOT EXISTS idx_entity_embedding_hnsw ON entity FIELDS embedding HNSW DIMENSION 384`,

  `DEFINE INDEX IF NOT EXISTS idx_related_to_unique ON related_to FIELDS in, out UNIQUE`,
  `DEFINE INDEX IF NOT EXISTS idx_defines_unique ON defines FIELDS in, out UNIQUE`,
  `DEFINE INDEX IF NOT EXISTS idx_cites_unique ON cites FIELDS in, out, context UNIQUE`,
  `DEFINE INDEX IF NOT EXISTS idx_regulates_unique ON regulates FIELDS in, out, jurisdiction UNIQUE`,
  `DEFINE INDEX IF NOT EXISTS idx_applies_to_unique ON applies_to FIELDS in, out UNIQUE`,
];

const EVENTS = [
  `DEFINE EVENT IF NOT EXISTS evt_maintain_proposals ON content_enhancement_log WHEN $event = "CREATE" THEN {
    IF $after.job_id IS NOT NULL {
      UPDATE $after.job_id SET proposals_generated = array::union(proposals_generated ?? [], [$after.id]);
    };
  }`,

  `DEFINE EVENT IF NOT EXISTS evt_sync_last_verified ON content_enhancement_log WHEN $event = "UPDATE" THEN {
    IF $after.status = "approved" AND $before.status != "approved" AND $after.target_table = "page" AND $after.target_id IS NOT NULL {
      UPDATE $after.target_id SET last_verified = time::now();
    };
  }`,
];

const FUNCTIONS = [
  `DEFINE FUNCTION IF NOT EXISTS fn::authority_score($institution_weight: float, $publisher_reputation: float, $recency_bonus: float) -> float {
    RETURN 0.5 * $institution_weight + 0.25 * $publisher_reputation + 0.25 * $recency_bonus;
  }`,

  `DEFINE FUNCTION IF NOT EXISTS fn::evidence_quality($source_span_exists: bool, $source_type_applicability: float) -> float {
    RETURN IF $source_span_exists THEN $source_type_applicability ELSE 0.0 END;
  }`,

  `DEFINE FUNCTION IF NOT EXISTS fn::claim_confidence($authority_score: float, $evidence_quality: float, $corroboration_count: int) -> float {
    LET $base = $authority_score * $evidence_quality;
    LET $corroboration_bonus = IF $corroboration_count > 1 THEN 0.1 * ($corroboration_count - 1) ELSE 0.0 END;
    RETURN math::min($base + $corroboration_bonus, 0.95);
  }`,

  `DEFINE FUNCTION IF NOT EXISTS fn::freshness_decay($age_days: float) -> float {
    -- Pre-computed: lambda = ln(2)/730 ≈ 0.0009496 (2-year half-life)
    -- App code computes: exp(-0.0009496 * age_days) and passes result
    -- Stored as DB function for consistency; actual computation in pipeline scripts
    RETURN $age_days;
  }`,
];

async function main() {
  let created = 0;
  let existed = 0;

  console.log("Setting up KM schema...\n");

  for (const stmt of SQL) {
    try {
      await q(stmt);
      created++;
      const match = stmt.match(/DEFINE (?:TABLE|FIELD) (?:IF NOT EXISTS )?(\w+)/);
      console.log(`  ✓ ${match?.[1] ?? "object"}`);
    } catch (err) {
      if (err.message.includes("already exists")) {
        existed++;
      } else {
        console.error(`  ✗ ${stmt.slice(0, 80)}...\n    ${err.message}`);
      }
    }
  }

  console.log(`\nTables/fields: ${created} created, ${existed} already-exists\n`);
  created = 0; existed = 0;

  for (const idx of INDEXES) {
    try {
      await q(idx);
      created++;
    } catch (err) {
      if (err.message.includes("already exists")) existed++;
      else console.error(`  ✗ Index error: ${err.message}`);
    }
  }
  console.log(`Indexes: ${created} created, ${existed} already-exists\n`);

  created = 0; existed = 0;
  for (const evt of EVENTS) {
    try { await q(evt); created++; }
    catch (err) {
      if (err.message.includes("already exists")) existed++;
      else console.error(`  ✗ Event error: ${err.message}`);
    }
  }
  console.log(`Events: ${created} created, ${existed} already-exists\n`);

  created = 0; existed = 0;
  for (const fn of FUNCTIONS) {
    try { await q(fn); created++; }
    catch (err) {
      if (err.message.includes("already exists")) existed++;
      else console.error(`  ✗ Function error: ${err.message}`);
    }
  }
  console.log(`Functions: ${created} created, ${existed} already-exists`);
}

main().catch((err) => {
  console.error("Schema setup failed:", err.message);
  process.exit(1);
});
