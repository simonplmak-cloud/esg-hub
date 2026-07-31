# Cycle 1 — Requirements (SPECS)

N=10 default. Run start: 2026-07-31T03:34:22Z. Base: main@2d00b69.
Base size: ~26,693 lines (src 11,622 + scripts 13,247 + workflows 833 + mcp-server 991).
Significance floor: 30% target / 25% hard floor ≈ 6,700 net insertions. Sanity valve (§7-M4) applies on this mature repo.

REQs: 5 total, 3 Must, 2 Should.

---

## REQ-001 — Honor query params on GET /api/v1/terms and /api/v1/frameworks
- Source findings: E2E-01 (Critical)
- Fix target: code
- MoSCoW: Must
- Requirement: GET /api/v1/terms and GET /api/v1/frameworks must honor limit/offset/q on every request; remove `export const dynamic = "force-static"` + `revalidate = 3600`; serve a short Cache-Control header instead.
- Spec edit: none (AGENTS.md API convention already implies dynamic routes)
- Acceptance criteria (binary, numbered):
  1. Unit test `src/lib/__tests__/params.test.ts` covers limit/offset/q parsing (clamp + sanitize) for terms and frameworks — passes in CI.
  2. Unit test asserts neither route file exports `force-static` or `revalidate` (static source grep in vitest) — passes in CI.
  3. E2E spec `e2e/api-params.spec.ts` asserts live GET /api/v1/terms?limit=2 returns ≤2 items and ?q= returns filtered subset — runs in CI against preview + prod deployments.
  4. `grep -c "force-static\|revalidate" src/app/api/v1/terms/route.ts src/app/api/v1/frameworks/route.ts` == 0.
- Out of scope: other cached routes (none currently use force-static — verified by grep during audit).
- Risks/assumptions: removing revalidate may increase DB hits; mitigated by Cache-Control public, max-age=60.

## REQ-002 — Make eval-search benchmark honest
- Source findings: GAP-01 (Critical), GAP-02 (High)
- Fix target: code
- MoSCoW: Must
- Requirement: `pnpm eval-search` must resolve `page:<slug>` labels to real record IDs via a permalink lookup at load time, extract the correct result field per mode (`results` for hybrid, `data` for BM25), and report a true nDCG@10. `pnpm eval-search` and `pnpm eval-pipeline` must exist in package.json; CI eval-search step runs the real command.
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. Unit test `src/lib/__tests__/eval-resolver.test.ts` maps a slug label → real record id using a permalink fixture — passes in CI.
  2. Unit test asserts hybrid mode reads `body.results` and bm25 mode reads `body.data` — passes in CI.
  3. `package.json` scripts contains both `eval-search` and `eval-pipeline` (grep).
  4. In Codespaces: `pnpm eval-search` completes with nDCG@10 ≥ 0.6 and prints per-query scores (evidence attached to PR).
- Out of scope: adding new eval queries (30-label set stays).
- Risks/assumptions: label→ID resolution needs a live DB; resolver uses /api/v1/pages lookup with the eval's own API base.

## REQ-003 — Filter junk keyword tokens in term seeding; add read-only term-quality audit
- Source findings: DS-01 (Critical)
- Fix target: code
- MoSCoW: Must
- Requirement: `scripts/seed-km-terms.mjs` must reject junk keyword tokens (pure-digit tokens, tokens starting with a non-alphanumeric char, empty/underscore-only) so future seeding cannot create entries like `(Carbon`; add read-only `scripts/audit-term-quality.mjs` that lists suspicious terms (placeholder-only definitions, junk-pattern names) for human review.
- Spec edit: none
- Acceptance criteria (binary, numbered):
  1. Unit test `src/lib/__tests__/term-quality.test.ts` for the token filter: rejects `(Carbon`, `1.5C`-style leading-symbol, bare `14001`, `_`; accepts `Climate Change` — passes in CI.
  2. Unit test for the suspicious-term classifier (placeholder definition pattern) — passes in CI.
  3. `scripts/audit-term-quality.mjs` is read-only (no CREATE/UPDATE/DELETE writes; verified by grep in the script).
  4. Existing DB junk is NOT modified by this cycle (I3 rail: no data ops) — deferred to Human-Decision Register.
- Out of scope: actually cleaning the live term table (data op — deferred to human per I3).
- Risks/assumptions: filter is additive; valid terms like "1.5°C" are intentionally excluded from seeding (they can be added manually by editors).

## REQ-004 — Preflight IAM write-check for KM pipelines
- Source findings: DEP-01 (High)
- Fix target: code + docs
- MoSCoW: Should
- Requirement: `scripts/km-ingestion.mjs` and `scripts/km-rd-loop.mjs` must run a read-only preflight IAM check (e.g. `INFO FOR DB` / `SELECT` on a known table) before any write path; on permission failure they must exit non-zero with a message naming the required credential, instead of failing mid-write. AGENTS.md documents the admin-credential requirement for these pipelines.
- Spec edit: AGENTS.md "KM-specific scripts" section — add note that km-ingestion/rd-loop require an Editor-role DB user, not Viewer root.
- Acceptance criteria (binary, numbered):
  1. Unit test for preflight function: returns FAIL on a mocked permission-denied response and PASS otherwise — passes in CI.
  2. Both scripts call the preflight before the first write (grep for invocation order).
  3. AGENTS.md contains the admin-credential note (grep).
- Out of scope: provisioning the actual admin secret in GitHub Secrets (credential/config change → Human-Decision Register).
- Risks/assumptions: preflight is a read; uses existing SURREAL_* env.

## REQ-005 — Correct documented stack/version drift
- Source findings: E2E-02 (Low)
- Fix target: docs
- MoSCoW: Should
- Requirement: README.md tech-stack line must say Next.js 16 (currently "Next.js 15"); AGENTS.md eval-command references must match the (now real) package.json scripts.
- Spec edit: README.md:37 stack line + AGENTS.md eval-search/eval-pipeline lines
- Acceptance criteria (binary, numbered):
  1. `grep -rn "Next.js 15" README.md` returns nothing.
  2. `grep -n "Next.js 16" README.md` matches the stack line.
  3. AGENTS.md eval commands match package.json scripts (grep both).
- Out of scope: other doc drift found later → next cycle backlog.
- Risks/assumptions: none.
