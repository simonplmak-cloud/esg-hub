# Cycle 2 — Audit Report (delta-stack, 2026-07-31)

Base: main@2d00b69. Full 16-sub-layer sweep against §7.5 benchmarks.

---

## MW-GUARD-01 [Critical] — No security headers on any route

- Evidence: `grep -r "Content-Security-Policy\|Strict-Transport-Security\|X-Frame-Options\|X-Content-Type-Options\|Permissions-Policy" src/ → 0 matches`
- Impact: Missing CSP, HSTS, X-Frame-Options (clickjacking), X-Content-Type-Options (MIME sniffing), Referrer-Policy, Permissions-Policy. Securityheaders.com would score F. OWASP ASVS L2 requires all of these.
- Fix pattern: Add security headers in middleware.ts or next.config.mjs `headers()` function (perplexity research pattern: OWASP REST Security Cheat Sheet, medium.com/rishabhsinghkkr guide).

---

## UI-COMP-01 [Critical] — Missing hreflang/sitemap multilingual SEO

- Evidence: `src/app/[locale]/layout.tsx:19-73` — `generateMetadata` has no `alternates.languages` object (hreflang). `src/app/sitemap.ts:44-52` — dynamic routes lack `alternates.languages` entries. `src/app/robots.ts:12` — sitemap URL is single, not index.
- Impact: Search engines cannot discover zh/hi locale variants. No canonical URL self-reference per locale. No `x-default` hreflang tag. Research confirms (eastondev.com, weglot.com): hreflang + multilingual sitemap are table stakes for i18n SEO.
- Fix pattern: Add `alternates.languages` to generateMetadata (Next.js Metadata API), add `x-default`, add `alternates` to sitemap entries, add `content-language` meta tag.

---

## UI-A11Y-01 [High] — No WCAG audit or automated a11y testing

- Evidence: No playwright a11y specs exist outside `e2e/locale-routing.spec.ts`. No axe-core or lighthouse-a11y integration in CI. `prefers-reduced-motion` in CSS is present but unverified. No keyboard-navigation tests.
- Impact: §7.5 bar: "0 critical/serious axe issues; Lighthouse a11y ≥95; full keyboard path". All unverified.
- Fix pattern: Add Playwright + axe-core a11y tests for core pages (home, article, search, developers); run in CI as info/non-blocking initially.

---

## MW-ROUTE-01 [Medium] — No OpenAPI spec

- Evidence: `GET /api/v1` returns self-documenting JSON but no `openapi.json` or `swagger.yaml`. `src/app/api/v1/route.ts:27-50` lists endpoints manually — not machine-parseable.
- Impact: API consumers cannot generate client SDKs. Contract drift undetectable without a machine-checkable spec.
- Fix pattern: Generate an OpenAPI 3.1 spec (`public/api/v1/openapi.json`) from route definitions; serve at `/api/v1/openapi.json`.

---

## MW-VALID-01 [Medium] — No shared validation schemas; manual validation duplicated

- Evidence: Each API route does manual validation (typeof checks, length checks). No Zod (repo convention per AGENTS.md global rule: "Use Zod for all runtime validation and schema definition"). `search/route.ts`, `terms/route.ts`, `facets/route.ts` each duplicate validation logic.
- Impact: Per the repo convention and AGENTS.md global preference, Zod should be used. Duplicated validation = drift risk.
- Fix pattern: Extract Zod schemas for shared types (SearchParams, TermProposal, FacetUpdate) to `src/lib/validators/`; use `.parse()` or `.safeParse()` in route handlers.

---

## BE-OBS-01 [Medium] — console.error logging; partial endpoint leakage

- Evidence: `src/lib/surrealdb.ts:112` logs partial endpoint: `… endpoint=${env.endpoint.substring(0, 40)}`. `src/lib/surrealdb.ts:120` logs RPC error JSON which may include query text. All API routes use `console.error("[route] Error:", err)` without structured logging.
- Impact: No structured log format (JSON), no correlation IDs, no centralized tracing. SurrealDB endpoint substring is informational but includes secrets-adjacent data.
- Fix pattern: Create a `src/lib/logger.ts` with structured JSON logging (timestamp, level, correlationId, message); replace all `console.error` with it; redact sensitive fields before log emission.

---

## DB-INGEST-01 [Medium] — No content coverage audit against source registry

- Evidence: 46 source domains (esg-hub MCP metadata), 354 pages, 244 external resources. No automated check verifies that every registered source's content is ingested or that ingested content maps back to a registered source.
- Impact: Per §7.5 DB-INGEST bar: "provenance (source URL per record); dedupe; batch + rollback; read-back verified; re-run creates 0 duplicates." Unverified.
- Fix pattern: Write a read-only audit script (`scripts/audit-ingest-coverage.mjs`) that cross-references source table ↔ term/external_resource/page tables, reports orphans, missing sources, duplicate counts.

---

## DB-SOURCE-01 [Low] — Source registry cadence not documented per-source

- Evidence: 46 source domains registered. No per-source refresh cadence, license notes, or access method documented in a structured registry file.
- Impact: §7.5 DB-SOURCE bar: "every source registered, cited, sample-validated." Partially met — sources are registered but cadence/license undocumented.
- Fix pattern: Add `scripts/lib/source-registry.json` with per-source metadata (URL, name, license, crawl_cadence, last_validated, access_method); reference in pipeline scripts.

---

## DB-SCHEMA-01 [Low] — Schema-vs-docs drift unverified

- Evidence: `scripts/setup-km-schema.mjs` defines 7 tables + 5 RELATION types. AGENTS.md documents 7 tables. No automated drift check between live DB and the schema definition script.
- Impact: §7.5 DB-SCHEMA bar: "docs-vs-live drift = 0." Unverified.
- Fix pattern: Enhance `pnpm verify:db` to compare live SurrealDB schema (INFO FOR DB) against the `setup-km-schema.mjs` DEFINE statements; report diffs.

---

## DB-ETL-01 [Low] — Pipeline transforms lack unit test coverage

- Evidence: `scripts/lib/pipeline-fetch.mjs`, `pipeline-llm.mjs`, `pipeline-normalize.mjs` exist but have no associated `__tests__/` files.
- Impact: §7.5 DB-ETL bar: "failure-path tests green; re-run safe." Unverified. Transform bugs could corrupt ingested content silently.
- Fix pattern: Add unit tests for normalize/extract transform functions; focus on failure paths and edge cases.

---

## BE-JOB-01 [Low] — Pipeline idempotency not verified

- Evidence: `scripts/km-ingestion.mjs` uses lease-based concurrency (CREATE lease), but re-run idempotency (duplicate detection, safe re-run) is not verified by tests.
- Impact: §7.5 BE-JOB bar: "every job idempotent, retry-safe, schedule documented." Unverified for pipeline scripts.
- Fix pattern: Document the idempotency strategy per pipeline step; add a dry-run mode that asserts idempotency (re-run same input → same output, no side effects).

---

## BE-INT-01 [Low] — AI chat external API calls lack timeout/retry

- Evidence: `src/app/api/ai-search/route.ts` calls DeepSeek API and Brave Search. No explicit timeout, no retry-with-backoff. `src/app/api/ai-chat/route.ts` likely same pattern.
- Impact: §7.5 BE-INT bar: "timeouts/retries+jitter/circuit breaker; 0 unbounded outbound calls." External API calls could hang requests indefinitely.
- Fix pattern: Add AbortController with 30s timeout + 2-retry fallback on the external fetch calls; wrap in a `src/lib/http-client.ts`.

---

## UI-DESIGN-01 [Info] — No Figma design source (I10)

- Evidence: No Figma fileKey references, no design nodes cited in any component. All UI is code-first.
- Impact: I10 invariant: "All UI design lives in Figma." figma MCP write capability unprobed. Gap is acknowledged; PENDING-FIGMA registered.
- Disposition: Register PENDING-FIGMA. UI changes in this cycle defer to code as source-of-truth until Figma write capability is probed at next cycle T0.

---

## UI-STYLE — Clean (sub-layer sweep)

- Checked: 0 hard-coded hex/px values outside CSS tokens (Footer inline styles use `var(--color-*)` references). Responsive breakpoints at 320/480/768/900/1024/1440 covered. Print styles present. `prefers-reduced-motion` present. No unoptimized assets committed. Verified by grep for raw hex in tsx files.
- Evidence: `grep -r "#[0-9a-fA-F]\{6\}\|#[0-9a-fA-F]\{3\}" src/components/ --include="*.tsx"` → 0 matches (all colors via CSS vars or Tailwind).

## MW-AUTH — Clean (sub-layer sweep)

- Write endpoints auth-gated via requireWriteToken (src/lib/auth/write-token.ts). Rate limit on POST terms + PATCH facets. Read endpoints intentionally public. Verified by grep for auth check on each mutating route.

## BE-SVC — Clean (sub-layer sweep)

- Search logic well-factored (keywordSearch, fuseRerankAndRespond). DB access through surrealdb.ts abstraction layer. Domain logic transport-free. Verified by structure review.
