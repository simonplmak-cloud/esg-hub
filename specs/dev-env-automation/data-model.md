# Data Model — Development Environment Automation

No application data-model changes. The only database change is one index on the existing `page` table (SurrealDB Cloud, namespace `esg_hub`, database from env). All statements are **SurrealQL** (verified against the SurrealDB docs).

## Index: `idx_page_permalink` (canonical)

```surrealql
DEFINE INDEX IF NOT EXISTS idx_page_permalink ON page FIELDS permalink UNIQUE;
```

- **Entity:** `page` (existing)
- **Field:** `permalink` (string, required, verified unique in practice — 0 duplicates on 354 pages, see log-review.md baseline F9)
- **Implementation note (2026-07-19):** the unique index **already existed** as `idx_page_permalink` (from `setup-schema.mjs:64`); the F9 "missing" warning was a false positive — `verify-db-schema.mjs` parsed `INFO FOR TABLE` index entries as objects (`idx.type`/`idx.fields`) while SurrealDB returns SurrealQL definition **strings**. Detection fixed in the same change. A redundant duplicate `unique_permalink` (same field) was removed; exactly one unique index remains.
- **Migration script:** `scripts/add-unique-permalink-index.mjs` — idempotent ensure-and-dedupe; creates `idx_page_permalink` iff no unique permalink index exists, removes the `unique_permalink` duplicate iff present.
- **Rollback:** `REMOVE INDEX IF EXISTS idx_page_permalink ON TABLE page;`
- **Verification:** `pnpm verify:db` reports zero warnings (AC-A10) ✓ 2026-07-19

Note: the repo's scripts POST SurrealQL text to SurrealDB's `/sql` HTTP endpoint — the endpoint is named "sql", the query language is SurrealQL.

No schema changes to `resource`, no new tables, no field additions.
