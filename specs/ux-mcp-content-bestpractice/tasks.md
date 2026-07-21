# Tasks — Best-Practice Architecture & Content Program

Status: Draft (Gate 3 pending)
Version: 1.0
Last updated: 2026-07-21
Plan: `plan.md` · Spec: `spec.md` · References: `references.md`

Conventions: each task has its live verification; `[P]` = parallelizable; S/M/L ≈ <15 / 15–45 / >45 min.

## Phase 1 — WS-B: MCP server refinement

| # | Task | Size | Verify |
|---|------|------|--------|
| T-01 | Annotations + descriptions for all 5 tools per plan §B1 (check SDK type defs in node_modules first for annotation signature) | M | tools/list shows `readOnlyHint: true, openWorldHint: false` on all 5 |
| T-02 | Pagination metadata on `list_esg_pages` + `list_esg_resources` (`limit+1` fetch → `has_more`/`next_offset`; array shape preserved) | S | live call: `limit=2` → `has_more: true, next_offset: 2` |
| T-03 | `toolError()` envelope for not-found / invalid input / upstream failure | M | live call with bogus permalink → `{ error: { code, retryable: false, hint } }` |
| T-04 | version → 1.1.0, README tool table + behaviors, `tsc` rebuild, commit `dist/` | S | live MCP call per changed behavior (B4) |

## Phase 2 — WS-A: architecture review + leads

| # | Task | Size | Verify |
|---|------|------|--------|
| T-05 | `architecture-review.md`: cited baseline summary, current-state inventory from code, evidence-linked gap table, prioritized refinements (A1) | M | doc committed; every gap row has file/query evidence |
| T-06 | Proper leads for the 9 thin-description pages (1–2 sentences from page content; EN-only) (A3) | S | DB query: zero pages with `len(description) < 50` |

## Phase 3 — WS-C: content pilot (`standards`, 33 pages)

| # | Task | Size | Verify |
|---|------|------|--------|
| T-07 | `content-review-methodology.md` (6-step procedure) + `scripts/review-pilot-content.mjs` (fetch/backup/References-append, `--dry-run`) (C3) | M | methodology committed; script dry-run prints plan for 1 page |
| T-08 [P] | Pilot batch 1 (pages 1–7): claim inventory → MCP primary-source verification → corrections → References sections → accuracy log | L | per-page accuracy-log entries; all new URLs live-checked; spot render shows References |
| T-09 [P] | Pilot batch 2 (pages 8–14) | L | same |
| T-10 [P] | Pilot batch 3 (pages 15–21) | L | same |
| T-11 [P] | Pilot batch 4 (pages 22–28) | L | same |
| T-12 [P] | Pilot batch 5 (pages 29–33) | L | same |
| T-13 | Pilot verification sweep: all 33 pages have `## References` in locked format; zero unverified URLs; accuracy log complete (C1/C2/C4) | M | DB query 33/33; log committed |

## Phase 4 — WS-A2 cross-refs + deployment

| # | Task | Size | Verify |
|---|------|------|--------|
| T-14 | `scripts/generate-cross-references-pilot.mjs` (scoring per plan §A2) + dry-run review of assignments | M | dry-run table reviewed, top-5/page, sensible matches |
| T-15 | Cross-ref `--apply` (backup first) + verify `related_pages` non-empty for all 33 pilot pages; Related Topics block renders real links on 2 spot pages (A2) | S | DB query 33/33; live page render check |
| T-16 | `references.md` finalized (all per-page verification sources appended) (D1); PR for code changes → CI green → merge (D2); spec marked Completed | M | references.md committed; deploy green |

Dependencies: T-01→T-04 sequential; T-05/T-06 independent of Phase 1 `[P]`; T-07 before batches; T-13 after all batches; T-14/T-15 after T-13; T-16 last.

## Gate 3 checklist

- [x] Tasks atomic per workstream; pilot sub-batched to keep research quality high
- [x] Every task has live verification (MCP calls, DB queries, render checks)
- [x] DAG valid (MCP independent of content; cross-refs after pilot content settles)
- [x] Mutations gated: dry-runs + backups before every apply
