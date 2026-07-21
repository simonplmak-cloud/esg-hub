# Tasks — Nightly Health Check Issue-Management Fixes

Status: Draft (Gate 3 pending)
Version: 1.0
Last updated: 2026-07-21
Plan: `plan.md` · Spec: `spec.md`

| # | Task | Size | Verify |
|---|------|------|--------|
| T-01 | Rewrite issue management in `.github/workflows/nightly.yml`: add step ids (`verify_db`, `smoke`), replace the single failure step with Step A (typed HARD/LINKS comments with lychee detail extraction) and Step B (auto-close on clean run), per `contracts/nightly-issue-lifecycle.md` | M | YAML parses; contract review |
| T-02 | PR → merge (CI check green; Copilot auto-review expected) | S | PR green + merged |
| T-03 | Post the verified-fixes resolution summary comment on issue #8 (AC-5 content: YouTube channels fixed, repo public, unccelearn bot-block, manuscdn absent) | S | comment visible on #8 |
| T-04 | `gh workflow run nightly.yml` → watch → expect green run AND issue #8 auto-closed with the clean-run comment | S | **AC-2**: #8 state = closed, closing comment references the run |
| T-05 | `gh workflow run nightly.yml` again → watch → expect green run AND zero issue activity (no new issue, no comment) | S | **AC-3**: `gh issue list --label nightly-alert --state open` empty; no new comments anywhere |
| T-06 | Docs: AGENTS.md Testing section notes the issue lifecycle (open-on-failure, comment-on-repeat, close-on-clean) (AC-7); mark spec Completed with the verification table | S | committed |

Dependencies: T-01 → T-02 → T-03/T-04 → T-05 → T-06. T-03 must precede T-04 (summary posted before auto-close).

## Gate 3 checklist

- [x] Tasks atomic, each with live verification
- [x] Failure-path messaging (AC-1/AC-4) covered by logic review per plan §Verification — real clean-path proof via dispatches
- [x] DAG valid, no cycles
- [x] No task touches check commands, sweep URLs, or accept-list (out of scope)
