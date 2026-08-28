# Cycle 1 — Audit Report (full-stack, 2026-07-31)

## E2E-01 [Critical] — GET /api/v1/terms & /api/v1/frameworks ignore query params
- Evidence: src/app/api/v1/terms/route.ts:4-5 (`force-static`+`revalidate=3600`), frameworks/route.ts:4-5.
- Live proof: `GET /api/v1/terms?limit=2` returned 20 items; `?q=Acidification` returned full 587 list.
- Root cause: force-static + revalidate caches the GET handler; `request.nextUrl.searchParams` reads are evaluated once per cache entry. context7 Next.js docs confirm force-static = cached.
- Fix pattern: remove force-static/revalidate; serve dynamic + Cache-Control header (like pages/route.ts:10 does).

## DS-01 [Critical] — term table polluted with 587 junk entries
- Evidence: live `GET /api/v1/terms` → `(Carbon`, `1.5C`, `14001`, `2030 targets` with definitions like `"(Carbon — ESG Hub glossary term"`.
- Root cause: scripts/seed-km-terms.mjs:64 writes placeholder definition from raw page `keywords`; junk fragments (`(Carbon`, bare numbers) come from content-derived keywords (fix-keywords/load content).
- Note: no data ops in this loop — fix the CODE (filter junk at extraction), register human DB cleanup.

## GAP-01 [Critical] — eval-search labels can never match real record IDs
- Evidence: specs/.../eval-queries.json labels `page:climate-change`; live IDs are `page:20zz0z0bjewxrohgzzjb`. scripts/eval-search.mjs:62-68 `normalizeId` does exact match only.
- Impact: every query scores nDCG=0 → the "nDCG@10 ≥ 0.6" gate (AGENTS.md) is illusory.
- Fix pattern: resolve labels via permalink → record ID lookup at load time.

## GAP-02 [High] — eval-search returns `body.data` but hybrid returns `body.results`
- Evidence: scripts/eval-search.mjs:55 `return body.data || []`; hybrid route returns `results` (src/app/api/v1/search/route.ts:303).
- Also: `pnpm eval-search` / `pnpm eval-pipeline` NOT in package.json scripts, yet ci.yml:96 runs `pnpm eval-search` (continue-on-error swallows) and nightly.yml:127 runs `pnpm eval-pipeline`; AGENTS.md documents both.
- Fix pattern: mode-aware extraction + add scripts to package.json + wire CI correctly.

## DEP-01 [High] — ingestion/RD pipelines use Viewer-only DB credentials for writes
- Evidence: .github/workflows/km-ingestion.yml:38 + km-rd-loop.yml:38 pass `secrets.SURREAL_USERNAME`. AGENTS.md: `root` (shell seeding GitHub secrets) is Viewer-only. scripts/km-ingestion.mjs:76-186 does DEFINE TABLE/CREATE lease/CREATE content_enhancement_log directly via SQL → would fail at runtime with IAM permission errors.
- Fix pattern: preflight IAM write-check + dedicated admin secret (register provisioning); OR route writes through REST write API.

## E2E-02 [Low] — docs drift: README says "Next.js 15"
- Evidence: README.md:37 "Next.js 15 (App Router, React 19)"; package.json next=16.2.12.
- Fix pattern: P6 docs — bump to 16 in the same PR as code.

## DEP-02 [Info] — 7 open Dependabot PRs (github-actions + mcp-server npm)
- Evidence: PRs #13,14,16,17,18,19,42,43,44. Some Vercel builds on dependabot branches already ERROR.
- Disposition: human merges; not in this cycle's scope.
