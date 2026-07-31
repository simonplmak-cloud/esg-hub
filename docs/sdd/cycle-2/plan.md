# Cycle 2 — Plan

## Phase order (linear, no cycles)

Phase 1 — Security Foundation (MW-GUARD)
Phase 2 — SEO + A11y (UI-COMP + UI-A11Y)
Phase 3 — Validation + API Quality (MW-VALID + MW-ROUTE)
Phase 4 — Observability (BE-OBS)
Phase 5 — Database Quality (DB-SCHEMA + DB-INGEST + DB-SOURCE + DB-ETL)
Phase 6 — Integration Hardening (BE-JOB + BE-INT)
Phase 7 — Design Gap Registration (UI-DESIGN)

## Per-phase details

### Phase 1: Security Foundation
- REQs: REQ-001
- Files: `next.config.mjs`, `e2e/security-headers.spec.ts`
- Implementation: Add `headers()` async function in next.config.mjs returning CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. CSP uses nonce-based script-src for production. Write E2E test verifying headers.
- Rollback: Remove `headers()` block from next.config.mjs; redeploy.
- Verification: `pnpm lint` + `npx tsc --noEmit` + `pnpm test` (E2E security-headers.spec.ts) in CI.

### Phase 2: SEO + A11y
- REQs: REQ-002, REQ-003
- Files: `src/app/[locale]/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `e2e/hreflang.spec.ts`, `e2e/a11y.spec.ts`, `package.json`
- Implementation: Add alternates.languages to generateMetadata in layout; add content-language meta; update sitemap entries with alternates; install @axe-core/playwright; write a11y E2E spec.
- Rollback: Revert layout/sitemap changes; npm uninstall @axe-core/playwright.
- Verification: `pnpm lint` + `npx tsc --noEmit` + `pnpm test` (E2E) in CI.

### Phase 3: Validation + API Quality
- REQs: REQ-004, REQ-005
- Files: `src/lib/validators/search.ts`, `src/lib/validators/terms.ts`, `src/lib/validators/facets.ts`, `src/app/api/v1/search/route.ts`, `src/app/api/v1/terms/route.ts`, `src/app/api/v1/pages/[id]/facets/route.ts`, `public/api/v1/openapi.json`, `src/app/api/v1/route.ts`, `package.json`
- Implementation: Create Zod schemas; refactor routes to use safeParse; generate OpenAPI spec; add openapi link to API root.
- Rollback: Revert routes to manual validation; delete validator files and openapi.json.
- Verification: `pnpm lint` + `npx tsc --noEmit` + `pnpm test` (unit + E2E) in CI.

### Phase 4: Observability
- REQs: REQ-006
- Files: `src/lib/logger.ts`, `src/app/api/v1/search/route.ts`, `src/app/api/v1/terms/route.ts`, `src/app/api/v1/pages/route.ts`, `src/app/api/v1/pages/[id]/route.ts`, `src/app/api/v1/pages/[id]/facets/route.ts`, `src/app/api/v1/pages/[id]/related/route.ts`, `src/app/api/v1/pages/[id]/backlinks/route.ts`, `src/app/api/v1/resources/route.ts`, `src/app/api/v1/frameworks/route.ts`, `src/app/api/v1/meta/route.ts`, `src/app/api/v1/route.ts`, `src/lib/surrealdb.ts`, `src/lib/__tests__/logger.test.ts`
- Implementation: Create structured logger; replace console.error in all API routes + surrealdb.ts; redact sensitive fields in surrealdb.ts error logging.
- Rollback: Revert logger; restore console.error calls.
- Verification: `pnpm lint` + `npx tsc --noEmit` + `pnpm test` (unit + E2E) in CI.

### Phase 5: Database Quality
- REQs: REQ-007, REQ-008, REQ-009, REQ-010
- Files: `scripts/audit-ingest-coverage.mjs`, `scripts/lib/source-registry.json`, `scripts/verify-db-schema.mjs`, `src/lib/__tests__/pipeline-normalize.test.ts`, `AGENTS.md`
- Implementation: Write audit-ingest-coverage script; create source-registry.json; enhance verify-db-schema with drift check; write pipeline transform unit tests.
- Rollback: Remove scripts; revert verify-db-schema.mjs; delete test file.
- Verification: `npx tsc --noEmit` + `pnpm test` (vitest unit tests) in CI. verify:db runs in CI.

### Phase 6: Integration Hardening
- REQs: REQ-011, REQ-012
- Files: `docs/km-pipeline.md` (or `AGENTS.md`), `src/lib/http-client.ts`, `src/app/api/ai-search/route.ts`, `src/app/api/ai-chat/route.ts`
- Implementation: Document pipeline idempotency; create http-client with timeout/retry; wire into AI routes.
- Rollback: Remove http-client.ts; revert AI routes to direct fetch.
- Verification: `pnpm lint` + `npx tsc --noEmit` + `pnpm test` (unit tests) in CI.

### Phase 7: Design Gap Registration
- REQs: REQ-013
- Files: `docs/sdd/cycle-2/constitution.md`, `AGENTS.md`
- Implementation: Document PENDING-FIGMA status; add Figma setup instructions to AGENTS.md.
- Rollback: Revert doc changes.
- Verification: `pnpm lint` + `npx tsc --noEmit` — no code changes.
