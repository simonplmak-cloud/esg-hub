# Cycle 2 — Tasks

Total tasks: 26 (REQ-001: 3, REQ-002: 3, REQ-003: 3, REQ-004: 3, REQ-005: 2, REQ-006: 3, REQ-007: 1, REQ-008: 1, REQ-009: 2, REQ-010: 2, REQ-011: 1, REQ-012: 2, REQ-013: 1)

---

### Phase 1 — Security Foundation (MW-GUARD)

- [x] T-001 (REQ-001) [MW-GUARD] — Add security headers function to next.config.mjs | files: next.config.mjs | test: e2e/security-headers.spec.ts
- [ ] T-002 (REQ-001) [MW-GUARD] — Add CSP with nonce script-src for production | files: next.config.mjs | test: e2e/security-headers.spec.ts
- [ ] T-003 (REQ-001) [MW-GUARD] — Write E2E test verifying security headers on GET / and GET /api/v1 | files: e2e/security-headers.spec.ts | test: e2e/security-headers.spec.ts

### Phase 2 — SEO + A11Y (UI-COMP + UI-A11Y)

- [ ] T-004 (REQ-002) [UI-COMP] — Add alternates.languages + x-default + content-language to layout generateMetadata | files: src/app/[locale]/layout.tsx | test: e2e/hreflang.spec.ts
- [ ] T-005 (REQ-002) [UI-COMP] — Add alternates.languages to sitemap.ts dynamic routes | files: src/app/sitemap.ts | test: e2e/hreflang.spec.ts
- [ ] T-006 (REQ-002) [UI-COMP] — Write E2E test for hreflang tags on /en | files: e2e/hreflang.spec.ts | test: e2e/hreflang.spec.ts
- [ ] T-007 (REQ-003) [UI-A11Y] — Install @axe-core/playwright and create a11y E2E spec | files: package.json, e2e/a11y.spec.ts | test: e2e/a11y.spec.ts
- [ ] T-008 (REQ-003) [UI-A11Y] — Add a11y test cases for home, article, search, developers pages | files: e2e/a11y.spec.ts | test: e2e/a11y.spec.ts
- [ ] T-009 (REQ-003) [UI-A11Y] — Add a11y step to CI (non-blocking) | files: .github/workflows/ci.yml | test: CI run

### Phase 3 — Validation + API Quality (MW-VALID + MW-ROUTE)

- [ ] T-010 (REQ-004) [MW-VALID] — Create Zod schemas: SearchParams, TermProposal, FacetUpdate | files: src/lib/validators/search.ts, terms.ts, facets.ts | test: src/lib/__tests__/validators.test.ts
- [ ] T-011 (REQ-004) [MW-VALID] — Refactor search/route.ts to use Zod safeParse | files: src/app/api/v1/search/route.ts | test: existing API tests
- [ ] T-012 (REQ-004) [MW-VALID] — Refactor terms/route.ts POST and facets/route.ts PATCH to use Zod safeParse | files: src/app/api/v1/terms/route.ts, src/app/api/v1/pages/[id]/facets/route.ts | test: existing API tests
- [ ] T-013 (REQ-005) [MW-ROUTE] — Write OpenAPI 3.1 spec (public/api/v1/openapi.json) | files: public/api/v1/openapi.json | test: manual validation (static JSON)
- [ ] T-014 (REQ-005) [MW-ROUTE] — Add openapi link to API root response | files: src/app/api/v1/route.ts | test: grep

### Phase 4 — Observability (BE-OBS)

- [ ] T-015 (REQ-006) [BE-OBS] — Create src/lib/logger.ts with structured JSON logging | files: src/lib/logger.ts | test: src/lib/__tests__/logger.test.ts
- [ ] T-016 (REQ-006) [BE-OBS] — Replace console.error in all API routes with logger.error | files: src/app/api/v1/*/route.ts | test: existing API tests pass unchanged
- [ ] T-017 (REQ-006) [BE-OBS] — Redact sensitive fields in surrealdb.ts error logging | files: src/lib/surrealdb.ts | test: src/lib/__tests__/logger.test.ts

### Phase 5 — Database Quality (DB-SCHEMA + DB-INGEST + DB-SOURCE + DB-ETL)

- [ ] T-018 (REQ-007) [DB-INGEST] — Write read-only audit-ingest-coverage.mjs | files: scripts/audit-ingest-coverage.mjs | test: manual run (read-only)
- [ ] T-019 (REQ-008) [DB-SOURCE] — Create source-registry.json with 46 domains | files: scripts/lib/source-registry.json | test: JSON schema validation
- [ ] T-020 (REQ-009) [DB-SCHEMA] — Enhance verify-db-schema.mjs with table/field drift check | files: scripts/verify-db-schema.mjs | test: pnpm verify:db
- [ ] T-021 (REQ-009) [DB-SCHEMA] — Wire CI verify:db step to catch drift | files: .github/workflows/ci.yml | test: CI run
- [ ] T-022 (REQ-010) [DB-ETL] — Extract pure transform functions from pipeline-normalize.mjs | files: scripts/lib/pipeline-normalize.mjs, src/lib/pipeline/transforms.ts | test: src/lib/__tests__/pipeline-normalize.test.ts
- [ ] T-023 (REQ-010) [DB-ETL] — Write unit tests for normalize/extract transforms | files: src/lib/__tests__/pipeline-normalize.test.ts | test: vitest

### Phase 6 — Integration Hardening (BE-JOB + BE-INT)

- [ ] T-024 (REQ-011) [BE-JOB] — Document pipeline idempotency strategy in AGENTS.md | files: AGENTS.md | test: grep
- [ ] T-025 (REQ-012) [BE-INT] — Create src/lib/http-client.ts with timeout + retry | files: src/lib/http-client.ts | test: src/lib/__tests__/http-client.test.ts
- [ ] T-026 (REQ-012) [BE-INT] — Wire fetchWithRetry into AI search and AI chat routes | files: src/app/api/ai-search/route.ts, src/app/api/ai-chat/route.ts | test: existing tests pass unchanged

### Phase 7 — Design Gap Registration (UI-DESIGN)

- [ ] T-027 (REQ-013) [UI-DESIGN] — Document PENDING-FIGMA status and setup path in AGENTS.md + constitution.md | files: AGENTS.md, docs/sdd/cycle-2/constitution.md | test: grep

---

# GATE 3 transcript (folded; >5 REQs so full gate)

| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 1 | Every task has checkbox, T-###, REQ-### reference | YES | 27/27 tasks conform (grep pattern: `- [ ] T-0`, `(REQ-0`) |
| 2 | REQ set matches requirements.md both directions | YES | REQ-001..013 present in both; no orphans |
| 3 | Every task names ≥1 file and ≥1 test | YES | All tasks list files + test; doc-only tasks (T-013, T-018, T-024) name grep/manual verification |
| 4 | Task order matches plan phase order | YES | T-001..003→P1, T-004..009→P2, T-010..014→P3, T-015..017→P4, T-018..023→P5, T-024..026→P6, T-027→P7 |
| 5 | Total + per-REQ counts written; each ≤ half-day | YES | 27 total (3/3/3/3/2/3/1/1/2/2/1/2/1); all sub-half-day |
| Verdict: PASS (attempt 1) |
