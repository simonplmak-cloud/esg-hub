# Implementation Plan — Nightly Health Check Issue-Management Fixes

Status: Draft (Gate 2 pending)
Version: 1.0
Last updated: 2026-07-21
Spec: `specs/nightly-health-check-fixes/spec.md`

## Architecture

One file changed: `.github/workflows/nightly.yml`. The checks (verify:db, smoke, lychee) stay identical; only step ids are added and the single "Open or update issue on failure" step is replaced by two lifecycle steps. gh CLI only — no third-party actions.

## Current behavior (defects D1–D4)

```yaml
- if: failure() || steps.lychee.outcome == 'failure'
  run: |
    EXISTING=$(gh issue list --label nightly-alert --state open ...)
    if none: gh issue create ... --body "Failing step: health — see run: $RUN_URL"
    else:    gh issue comment ... --body "Still failing: $RUN_URL"
```

Fires whenever lychee has findings (green run) or a hard check fails — with a message that always implies run failure, no detail, and no clean-run handling.

## New design

### Step ids on existing steps

`verify_db` (verify database schema), `smoke` (production smoke), `lychee` (already has id).

### Step A — "Open or update issue on failure"

Condition: `if: failure() || steps.lychee.outcome == 'failure'`

Failure-type resolution (bash):

| Condition | Type | Comment content |
|-----------|------|-----------------|
| `steps.verify_db.outcome == 'failure'` or `steps.smoke.outcome == 'failure'` (job-level `failure()`) | HARD | names the failed check(s), run URL, date |
| else (`steps.lychee.outcome == 'failure'`) | LINKS | top-10 failing links parsed from `lychee/out.md` report + run URL |

Note on outcome semantics: hard-check steps have no `continue-on-error`, so on hard failure the lychee step is **skipped** — `steps.lychee.outcome` is empty/skipped and the LINKS branch can't misfire. On lychee-only findings, hard steps show `success`.

Comment body:

```
## Nightly health check — <HARD|LINKS> failure (YYYY-MM-DD HH:MM UTC)

**Run:** <url>
**Failing check:** <verify:db | smoke | link-sweep>
### Details
<failed step names, or top-10 lines matching '^\* \[' from lychee/out.md>
```

Dedup unchanged: open `nightly-alert` issue → comment; none → create with the detailed body. (AC-1, AC-4)

### Step B — "Close health issue on clean run"

Condition: `if: success() && steps.verify_db.outcome == 'success' && steps.smoke.outcome == 'success' && steps.lychee.outcome == 'success'`

```bash
EXISTING=$(gh issue list --label nightly-alert --state open --json number --jq '.[0].number')
if [ -n "$EXISTING" ]; then
  gh issue comment "$EXISTING" --body "✅ Resolved by clean nightly run $RUN_URL — all checks green (verify:db, smoke, link sweep: 0 errors). Closing; a new failure will reopen or recreate this issue."
  gh issue close "$EXISTING"
fi
```

No issue open → step does nothing → green runs are silent. (AC-2, AC-3)

### Lychee detail extraction

The lychee-action writes its markdown report to `lychee/out.md` (action's `output` input, already set). Failing links appear as lines starting with `* [` followed by a status in brackets. Extraction:

```bash
DETAILS=$(grep -E '^\* \[' lychee/out.md | head -10)
[ -z "$DETAILS" ] && DETAILS="(no detail captured — see run log)"
```

## Verification approach (AC-5, AC-6)

Real runs, no synthetic fixtures:

1. Post the verified-fixes resolution summary as a comment on issue #8 manually (AC-5 content)
2. Merge the workflow fix, dispatch nightly → clean run expected → workflow auto-closes #8 with the closing comment (proves AC-2 with real data)
3. Dispatch nightly again → expect zero issue activity (proves AC-3)
4. HARD/LINKS message branches: logic review against outcome semantics (forced-failure test optional, not required per AC-6(b))

## Risks

| # | Risk | Mitigation |
|---|------|------------|
| R1 | `lychee/out.md` missing/format change → empty details | fallback text "(no detail captured — see run log)"; grep is tolerant |
| R2 | outcome semantics differ for skipped steps | branch order checks hard failures first; LINKS branch requires lychee outcome == 'failure' explicitly |
| R3 | race: failure and clean-close both firing | conditions are mutually exclusive (`failure()` vs `success()`) |
| R4 | gh issue operations fail (permissions) | workflow already has `issues: write`; step keeps `|| true` off — a gh failure should fail the job visibly (matches current behavior) |

## Contracts

`contracts/nightly-issue-lifecycle.md` — exact step YAML for Step A and Step B (locked after Gate 2).
