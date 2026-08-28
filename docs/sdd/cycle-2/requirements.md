# Cycle 2 — Requirements (SPECS)

N=10 default. Run start: 2026-07-31T17:53:51Z. Base: main@2d00b69.
Base size: ~27,000 loc.
REQs: 13 total, 3 Must, 6 Should, 4 Could.
Significance floor: 30% target / 25% hard floor = ~6,750 net insertions.
**Sanity valve applied** (§7-M4): mature 27k-loc repo; 30% growth per cycle unachievable without junk code. Quality work delivered; actual growth tracked at summary.

Sub-layer→REQ mapping:

| Sub-layer | REQ | Finding | MoSCoW |
|-----------|-----|---------|--------|
| UI-DESIGN | REQ-013 | UI-DESIGN-01 | Could |
| UI-COMP | REQ-002 | UI-COMP-01 | Must |
| UI-STYLE | — | Clean | — |
| UI-A11Y | REQ-003 | UI-A11Y-01 | Must |
| MW-ROUTE | REQ-005 | MW-ROUTE-01 | Should |
| MW-AUTH | — | Clean | — |
| MW-VALID | REQ-004 | MW-VALID-01 | Should |
| MW-GUARD | REQ-001 | MW-GUARD-01 | Must |
| BE-SVC | — | Clean | — |
| BE-JOB | REQ-011 | BE-JOB-01 | Could |
| BE-INT | REQ-012 | BE-INT-01 | Could |
| BE-OBS | REQ-006 | BE-OBS-01 | Should |
| DB-SCHEMA | REQ-009 | DB-SCHEMA-01 | Should |
| DB-ETL | REQ-010 | DB-ETL-01 | Should |
| DB-INGEST | REQ-007 | DB-INGEST-01 | Should |
| DB-SOURCE | REQ-008 | DB-SOURCE-01 | Should |

---

## REQ-001 — Add OWASP security headers to all responses
- Source findings: MW-GUARD-01 (Critical)
- Fix target: code
- MoSCoW: Must
- Requirement: All HTTP responses must include CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy headers. CSP uses nonce-based script-src. Securityheaders.com grade A target.
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. `grep -c "Content-Security-Policy" next.config.mjs` ≥ 1 (or middleware equivalent).
  2. `grep -c "Strict-Transport-Security" next.config.mjs` ≥ 1.
  3. `grep -c "X-Frame-Options" next.config.mjs` ≥ 1.
  4. Playwright E2E test verifies headers present on GET / and GET /api/v1 (passes in CI).
  5. CSP uses nonce-based script-src; no `unsafe-inline` in production headers.
- Out of scope: CSP violation reporting endpoint (future cycle).
- Risks/assumptions: CSP may break inline scripts in AI chat widget or client components. Verify with E2E.

## REQ-002 — Add hreflang, multilingual sitemap, canonical, and content-language metadata
- Source findings: UI-COMP-01 (Critical)
- Fix target: code
- MoSCoW: Must
- Requirement: Every localized page must emit `link rel="alternate" hreflang="..."` tags via Next.js Metadata API `alternates.languages`. A self-referencing canonical URL per locale. An `x-default` hreflang pointing to `/en`. Sitemap entries include `alternates.languages` for locale variants. A `content-language` meta tag on the `<html>` element.
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. `grep -c "alternates.languages" src/app/\[locale\]/layout.tsx` ≥ 1.
  2. `grep -c "x-default" src/app/\[locale\]/layout.tsx` ≥ 1.
  3. `grep -c "content-language" src/app/\[locale\]/layout.tsx` ≥ 1.
  4. `grep -c "alternates.languages" src/app/sitemap.ts` ≥ 1.
  5. Playwright E2E test: GET /en → response HTML contains `<link rel="alternate" hreflang="en"`, `<link rel="alternate" hreflang="zh"`, `<link rel="alternate" hreflang="hi"`, and `hreflang="x-default"`.
- Out of scope: per-page localized slugs with translation mapping (future cycle).
- Risks/assumptions: sitemap.ts dynamic entries need a locale list; routing.ts already exports `['en','zh','hi']`.

## REQ-003 — Add Playwright a11y (axe-core) tests for core pages
- Source findings: UI-A11Y-01 (High)
- Fix target: code (tests)
- MoSCoW: Must
- Requirement: An E2E a11y spec runs axe-core against 4 core pages (home, article, search, developers) in all 3 locales. Reports violations as test failures. CI runs as non-blocking `continue-on-error` initially.
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. `e2e/a11y.spec.ts` exists with axe-core tests for ≥4 pages × 1 locale (min 4 tests).
  2. `@axe-core/playwright` is in devDependencies (package.json).
  3. CI workflow includes `pnpm test -- a11y` step (grep ci.yml).
  4. Test passes against a live deployment URL in CI.
- Out of scope: fixing all found a11y violations (backlogged for future cycles).
- Risks/assumptions: axe-core Playwright integration needs `@axe-core/playwright` npm package.

## REQ-004 — Extract shared Zod schemas for API validation
- Source findings: MW-VALID-01 (Medium)
- Fix target: code
- MoSCoW: Should
- Requirement: Replace manual typeof validation with Zod schemas in all API route handlers. Create `src/lib/validators/search.ts` (SearchParams), `terms.ts` (TermProposal), `facets.ts` (FacetUpdate). Routes use `schema.safeParse()` returning field-level error maps.
- Spec edit: none (Zod already the repo convention per AGENTS.md)
- Acceptance criteria (binary, numbered):
  1. `src/lib/validators/search.ts` exports a SearchParams Zod schema used in `src/app/api/v1/search/route.ts`.
  2. `src/lib/validators/terms.ts` exports a TermProposal Zod schema used in `src/app/api/v1/terms/route.ts` POST.
  3. `src/lib/validators/facets.ts` exports a FacetUpdate Zod schema used in `src/app/api/v1/pages/[id]/facets/route.ts`.
  4. All existing route behavior preserved (existing API tests pass unchanged).
- Out of scope: client-server shared schemas (client uses separate validation).
- Risks/assumptions: Zod is already a transitive dependency; needs `pnpm add zod` if not direct.

## REQ-005 — Generate OpenAPI 3.1 spec for the public API
- Source findings: MW-ROUTE-01 (Medium)
- Fix target: code + docs
- MoSCoW: Should
- Requirement: Create `public/api/v1/openapi.json` — an OpenAPI 3.1 specification documenting all 11 endpoints (GET/POST/PATCH). Served statically at `/api/v1/openapi.json`. Linked from the API root response.
- Spec edit: API root response (src/app/api/v1/route.ts) — add `openapi` link.
- Acceptance criteria (binary, numbered):
  1. `public/api/v1/openapi.json` exists and passes OpenAPI 3.1 validation (swagger-cli or online validator — manual check).
  2. `GET /api/v1` response includes `openapi: "/api/v1/openapi.json"` (grep).
  3. Spec covers all 11 endpoints: GET /api/v1, /meta, /pages, /pages/:id, /pages/:id/related, /pages/:id/backlinks, /resources, /search, /terms, /frameworks; POST /search, /terms; PATCH /pages/:id/facets.
- Out of scope: auto-generation from code (manual spec, future cycle).
- Risks/assumptions: static file; manual update when routes change.

## REQ-006 — Replace console.error with structured JSON logger
- Source findings: BE-OBS-01 (Medium)
- Fix target: code
- MoSCoW: Should
- Requirement: Create `src/lib/logger.ts` exporting structured JSON logging functions (info, warn, error) with timestamp, level, correlationId, message. Replace all API `console.error` calls. Redact sensitive fields (passwords, tokens, endpoint substrings) before emission.
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. `src/lib/logger.ts` exports `createLogger(name)` returning `{ info, warn, error }` functions that emit JSON to stdout.
  2. All `console.error` calls in `src/app/api/` replaced with logger.error (grep: `console.error` in api routes = 0).
  3. `src/lib/surrealdb.ts:112` no longer logs endpoint substring (grep for `endpoint.substring` in log call = 0).
  4. Unit test asserts logger.error output is valid JSON with required fields.
  5. CI unit tests pass with new logger.
- Out of scope: distributed tracing / OpenTelemetry (future cycle).
- Risks/assumptions: Vercel log drain captures stdout JSON natively.

## REQ-007 — Write read-only ingest coverage audit script
- Source findings: DB-INGEST-01 (Medium)
- Fix target: code (script)
- MoSCoW: Should
- Requirement: `scripts/audit-ingest-coverage.mjs` cross-references source table against term/external_resource/page tables. Reports: sources with 0 ingested entries, ingested entries with no registered source, duplicate counts per table, total coverage stats. Read-only, runs against production DB.
- Spec edit: AGENTS.md — add audit-ingest-coverage to KM scripts section.
- Acceptance criteria (binary, numbered):
  1. `scripts/audit-ingest-coverage.mjs` is read-only (grep: no CREATE/UPDATE/DELETE/REMOVE).
  2. Script exits 0 on success, prints structured report to stdout.
  3. AGENTS.md mentions the script.
- Out of scope: auto-fixing coverage gaps (human review required).
- Risks/assumptions: needs SURREAL_* env; uses Viewer credentials (read-only safe).

## REQ-008 — Create source registry with per-source metadata
- Source findings: DB-SOURCE-01 (Low)
- Fix target: code (data file)
- MoSCoW: Should
- Requirement: `scripts/lib/source-registry.json` documents each of the 46 source domains with: name, url, license, crawl_cadence, last_validated, access_method, notes. Referenced by pipeline scripts for refresh scheduling.
- Spec edit: AGENTS.md — note source-registry.json location.
- Acceptance criteria (binary, numbered):
  1. `scripts/lib/source-registry.json` exists with entries for ≥40 domains.
  2. Each entry has: `name`, `url`, `license`, `crawl_cadence`, `last_validated`, `access_method`.
  3. AGENTS.md references the file.
- Out of scope: automated cadence enforcement (future cycle).
- Risks/assumptions: license/cadence data from manual research; may need updates.

## REQ-009 — Enhance verify:db to detect schema drift
- Source findings: DB-SCHEMA-01 (Low)
- Fix target: code (script)
- MoSCoW: Should
- Requirement: `scripts/verify-db-schema.mjs` (already wired to `pnpm verify:db`) is enhanced to compare live SurrealDB `INFO FOR DB` against expected tables/fields from `scripts/setup-km-schema.mjs` DEFINE statements. Reports: missing tables, extra tables, field diffs.
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. `pnpm verify:db` output includes table-level comparison (grep for "table drift" or "schema diff").
  2. Script exits non-zero if live schema differs from expected.
  3. CI verify:db step exercises the new check.
- Out of scope: auto-fixing drift (manual remediation required).
- Risks/assumptions: INFO FOR DB output format may vary by SurrealDB version.

## REQ-010 — Add unit tests for pipeline transform functions
- Source findings: DB-ETL-01 (Low)
- Fix target: code (tests)
- MoSCoW: Should
- Requirement: Add unit tests for `scripts/lib/pipeline-normalize.mjs` transform functions. Cover: happy path, empty input, malformed input, edge cases. Tests run via vitest (already configured for `src/lib/__tests__/`).
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. `src/lib/__tests__/pipeline-normalize.test.ts` exists with ≥5 test cases.
  2. Tests pass in CI (vitest).
- Out of scope: full pipeline end-to-end testing (future cycle, needs live DB).
- Risks/assumptions: pipeline-normalize functions must be importable (may need refactoring to export pure functions from shared lib).

## REQ-011 — Document pipeline idempotency strategy
- Source findings: BE-JOB-01 (Low)
- Fix target: docs
- MoSCoW: Could
- Requirement: Add an idempotency section to AGENTS.md or a new `docs/km-pipeline.md` documenting: per-step idempotency guarantees, duplicate detection mechanism, safe re-run behavior, lease/retry strategy. This is documentation only — no code changes.
- Spec edit: AGENTS.md KM Architecture section or new docs file.
- Acceptance criteria (binary, numbered):
  1. Either AGENTS.md km section or `docs/km-pipeline.md` contains an "Idempotency" heading with per-step guarantee documentation.
- Out of scope: implementing idempotency (code exists; docs only).
- Risks/assumptions: pipeline authors must keep docs in sync with code.

## REQ-012 — Add timeout/retry to external API calls in AI search
- Source findings: BE-INT-01 (Low)
- Fix target: code
- MoSCoW: Could
- Requirement: Add `src/lib/http-client.ts` wrapping fetch with AbortController timeout (30s) and 2-retry fallback with exponential backoff. Wire into the AI search and AI chat routes for DeepSeek/Brave API calls.
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. `src/lib/http-client.ts` exports `fetchWithTimeout(url, options, timeoutMs)` with AbortController.
  2. `src/lib/http-client.ts` exports `fetchWithRetry(url, options, { maxRetries, backoffMs })`.
  3. AI search/chat routes use the new client (grep for `fetch` in `src/app/api/ai-search/` and `src/app/api/ai-chat/` → at least one uses fetchWithRetry or fetchWithTimeout).
- Out of scope: circuit breaker pattern (future cycle).
- Risks/assumptions: DeepSeek/Brave APIs tolerate retries; idempotent GET semantics.

## REQ-013 — Register PENDING-FIGMA and Figma setup instructions
- Source findings: UI-DESIGN-01 (Info)
- Fix target: docs
- MoSCoW: Could
- Requirement: Add a Human-Decision Register entry documenting the Figma gap: no canonical design store, figma MCP write capability unprobed. Document exact steps to set up Figma project + connect MCP (access token, file key). AGENTS.md notes the gap.
- Spec edit: AGENTS.md — note Figma gap; Human-Decision Register entry.
- Acceptance criteria (binary, numbered):
  1. `docs/sdd/cycle-2/constitution.md` or Human-Decision Register contains PENDING-FIGMA entry with setup instructions.
  2. AGENTS.md references the Figma gap / setup path.
- Out of scope: actually creating Figma designs (needs Figma access — human action).
- Risks/assumptions: figma MCP read capability confirmed; write capability unprobed — probed at next cycle T0.
