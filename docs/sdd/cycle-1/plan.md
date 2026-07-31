# Cycle 1 — Plan (PLAN)

## Phases (linear, no dependency cycles)
- **P1** (REQ-001) — Fix terms/frameworks route caching + params. Rollback: revert route.ts changes (2 files, no schema impact). Verify: `npx vitest run` (unit), E2E via CI/deploy.
- **P2** (REQ-002) — Honest eval-search: resolver + mode-aware extraction + package.json scripts + CI wiring. Rollback: revert 4 files (eval-search.mjs, resolver, package.json, ci.yml). Verify: `npx vitest run`; Codespaces `pnpm eval-search` (nDCG≥0.6); `pnpm lint`.
- **P3** (REQ-003) — Term-quality filter + read-only audit script. Rollback: revert seed-km-terms.mjs + audit script + tests. Verify: `npx vitest run`.
- **P4** (REQ-004) — Pipeline IAM preflight + AGENTS.md credential note. Rollback: revert preflight module + script call sites + AGENTS.md. Verify: `npx vitest run`; grep invocation order.
- **P5** (REQ-005) — README/AGENTS docs drift. Rollback: revert doc lines. Verify: grep checks.

## Affected files (validated to exist)
- REQ-001: src/app/api/v1/terms/route.ts, src/app/api/v1/frameworks/route.ts, src/lib/__tests__/params.test.ts (new), e2e/api-params.spec.ts (new)
- REQ-002: scripts/eval-search.mjs, src/lib/eval/label-resolver.ts (new), src/lib/__tests__/eval-resolver.test.ts (new), package.json, .github/workflows/ci.yml
- REQ-003: scripts/seed-km-terms.mjs, scripts/audit-term-quality.mjs (new), src/lib/__tests__/term-quality.test.ts (new)
- REQ-004: src/lib/db/preflight-iam.ts (new), scripts/km-ingestion.mjs, scripts/km-rd-loop.mjs, AGENTS.md, src/lib/__tests__/preflight-iam.test.ts (new)
- REQ-005: README.md, AGENTS.md

## Migration / back-compat
- No schema changes, no data operations. All code paths additive; eval-search behavior corrected in place (only its own CLI output).
- CI: eval-search step becomes meaningful (continue-on-error stays per repo policy; nightly eval-pipeline now resolvable).

## Rollback per phase
Listed per phase above — every phase is file-scoped, no cross-phase coupling except AGENTS.md edits in P4/P5 (non-conflicting lines).

## Verification gates (repo commands; CI/Codespaces only, never local)
- `npx vitest run` — unit (43 existing + new suites)
- `pnpm lint` / `npx tsc --noEmit` — static
- `pnpm eval-search` — Codespaces, nDCG@10 ≥ 0.6 (REQ-002)
- `pnpm test` — Playwright E2E in CI (api-params.spec.ts on preview + prod)

---

# GATE 2 transcript (folded; cycle ≤5 REQs)
| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 1 | Every REQ appears in ≥1 phase | YES | REQ-001→P1, REQ-002→P2, REQ-003→P3, REQ-004→P4, REQ-005→P5 |
| 2 | Every phase has ≥1 REQ | YES | 5 phases, 5 REQs, 0 orphans |
| 3 | Every named file exists | YES | terms/frameworks routes read during audit; package.json, ci.yml, seed-km-terms.mjs, km-ingestion.mjs, km-rd-loop.mjs, README.md, AGENTS.md all read; new files are creations |
| 4 | Every phase has rollback + verification using repo commands | YES | see per-phase lines; commands quoted from AGENTS.md |
| 5 | Linear order, no dependency cycles | YES | P1→P5 sequential; REQ-002 depends only on route behavior, not REQ-001 |
Verdict: PASS (attempt 1)
