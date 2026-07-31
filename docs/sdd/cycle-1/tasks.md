# Cycle 1 — Tasks (TASKS)

Total tasks: 14 (REQ-001: 3, REQ-002: 3, REQ-003: 3, REQ-004: 3, REQ-005: 2)

^- [x] T-001 (REQ-001) — Remove force-static/revalidate from terms route; add Cache-Control | files: src/app/api/v1/terms/route.ts | test: src/lib/__tests__/params.test.ts
^- [x] T-002 (REQ-001) — Remove force-static/revalidate from frameworks route; add Cache-Control | files: src/app/api/v1/frameworks/route.ts | test: src/lib/__tests__/params.test.ts
^- [x] T-003 (REQ-001) — Add params unit tests + api-params E2E spec | files: src/lib/__tests__/params.test.ts, e2e/api-params.spec.ts | test: params.test.ts + playwright api-params.spec.ts
^- [x] T-004 (REQ-002) — Add eval label-resolver (slug→permalink→record id) | files: src/lib/eval/label-resolver.ts | test: src/lib/__tests__/eval-resolver.test.ts
^- [x] T-005 (REQ-002) — Mode-aware result extraction in eval-search.mjs (results vs data) | files: scripts/eval-search.mjs | test: src/lib/__tests__/eval-resolver.test.ts
^- [x] T-006 (REQ-002) — Add eval-search + eval-pipeline to package.json; wire ci.yml | files: package.json, .github/workflows/ci.yml | test: n/a (grep + CI run)
^- [x] T-007 (REQ-003) — Add junk-token filter to seed-km-terms.mjs | files: scripts/seed-km-terms.mjs | test: src/lib/__tests__/term-quality.test.ts
^- [x] T-008 (REQ-003) — Write read-only audit-term-quality.mjs | files: scripts/audit-term-quality.mjs | test: src/lib/__tests__/term-quality.test.ts
^- [x] T-009 (REQ-003) — Unit tests for filter + classifier | files: src/lib/__tests__/term-quality.test.ts | test: term-quality.test.ts
^- [x] T-010 (REQ-004) — Preflight IAM check module | files: src/lib/db/preflight-iam.ts | test: src/lib/__tests__/preflight-iam.test.ts
^- [x] T-011 (REQ-004) — Wire preflight into km-ingestion.mjs + km-rd-loop.mjs before first write | files: scripts/km-ingestion.mjs, scripts/km-rd-loop.mjs | test: preflight-iam.test.ts
^- [x] T-012 (REQ-004) — AGENTS.md admin-credential note for pipelines | files: AGENTS.md | test: n/a (grep)
^- [x] T-013 (REQ-005) — README Next.js 16 stack line | files: README.md | test: n/a (grep)
^- [x] T-014 (REQ-005) — AGENTS.md eval-script references match package.json | files: AGENTS.md | test: n/a (grep)

---

# GATE 3 transcript (folded; cycle ≤5 REQs)
| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 1 | Every task has checkbox, T-###, (REQ-###) | YES | 14/14 conform (grep pattern in file above) |
| 2 | REQ-### set matches requirements.md both directions | YES | REQ-001..005 present in both; no orphans |
| 3 | Every task names ≥1 file and ≥1 test | YES | T-006/T-012/T-013/T-014 name grep/CI as verification (documented); all others name test files |
| 4 | Task order matches plan phase order | YES | T-001..003→P1, T-004..006→P2, T-007..009→P3, T-010..012→P4, T-013..014→P5 |
| 5 | Total + per-REQ counts written; each ≤ half-day | YES | 14 total (3/3/3/3/2); all sub-hour edits |
Verdict: PASS (attempt 1)
