# Contract: Nightly Issue Lifecycle Steps

Locks the YAML for the two replacement steps in `.github/workflows/nightly.yml` (Gate 2). Existing check steps are unchanged except gaining `id:` fields (`verify_db`, `smoke`; `lychee` already has one).

## Step A — Open or update issue on failure

```yaml
      - name: Open or update issue on failure
        if: failure() || steps.lychee.outcome == 'failure'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
          NOW: $(date)
        run: |
          DATE=$(date -u +"%Y-%m-%d %H:%M")
          if [ "${{ steps.verify_db.outcome }}" = "failure" ] || [ "${{ steps.smoke.outcome }}" = "failure" ]; then
            TYPE="HARD"
            FAILED=""
            [ "${{ steps.verify_db.outcome }}" = "failure" ] && FAILED="verify:db"
            [ "${{ steps.smoke.outcome }}" = "failure" ] && FAILED="$FAILED smoke"
            DETAILS="Failing check(s):$FAILED"
          else
            TYPE="LINKS"
            DETAILS=$(grep -E '^\* \[' lychee/out.md 2>/dev/null | head -10)
            [ -z "$DETAILS" ] && DETAILS="(no detail captured — see run log)"
          fi
          BODY=$(printf '## Nightly health check — %s failure (%s UTC)\n\n**Run:** %s\n\n### Details\n%s' "$TYPE" "$DATE" "$RUN_URL" "$DETAILS")
          EXISTING=$(gh issue list --repo ${{ github.repository }} --label nightly-alert --state open --json number --jq '.[0].number')
          if [ -z "$EXISTING" ]; then
            gh issue create --repo ${{ github.repository }} --label nightly-alert \
              --title "Nightly health check: $TYPE failure ($DATE UTC)" --body "$BODY"
          else
            gh issue comment --repo ${{ github.repository }} "$EXISTING" --body "$BODY"
          fi
```

## Step B — Close health issue on clean run

```yaml
      - name: Close health issue on clean run
        if: success() && steps.verify_db.outcome == 'success' && steps.smoke.outcome == 'success' && steps.lychee.outcome == 'success'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: |
          EXISTING=$(gh issue list --repo ${{ github.repository }} --label nightly-alert --state open --json number --jq '.[0].number')
          if [ -n "$EXISTING" ]; then
            gh issue comment --repo ${{ github.repository }} "$EXISTING" \
              --body "✅ Resolved by clean nightly run $RUN_URL — all checks green (verify:db, smoke, link sweep: 0 errors). Closing; a new failure will reopen or recreate this issue."
            gh issue close --repo ${{ github.repository }} "$EXISTING"
          fi
```

## Invariants

- Conditions mutually exclusive: Step A on `failure()`/lychee-failure, Step B on full `success()`
- Step B is a no-op when no `nightly-alert` issue is open → green runs stay silent (AC-3)
- No changes to check commands, sweep URLs, accept-list, schedule, or permissions (`issues: write` already present)
