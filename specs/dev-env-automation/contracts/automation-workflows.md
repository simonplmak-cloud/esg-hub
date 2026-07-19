# Contract: Automation Workflows

Locks the shape of new/added automation YAML. All new workflows use pnpm, Node 20, and the tool_packages checkout + symlink preamble where `pnpm install` runs.

## 1. `.github/workflows/test.yml` (new — AC-B1)

```yaml
name: Test on Demand
on:
  workflow_dispatch:
    inputs:
      base_url:
        description: "Base URL for E2E tests"
        default: "https://esg-hub.ascent.partners"
      skip_e2e:
        type: boolean
        description: "Skip Playwright E2E"
        default: false
jobs:
  check:    # identical gate steps to deploy.yml check job: checkout → tool_packages+symlink → pnpm → node20 → install → lint → tsc --noEmit → vitest run
  e2e:
    needs: check
    if: ${{ !inputs.skip_e2e }}
    steps: [checkout, tool_packages+symlink, pnpm, node20, install, playwright install chromium, pnpm test]
    env: { BASE_URL: ${{ inputs.base_url }}, CI: "true" }
    # + playwright-report artifact upload (if: always())
    # + Notify n8n on failure (§4)
```

## 2. `.github/workflows/nightly.yml` (new — AC-F1, AC-F2)

```yaml
name: Nightly Health Check
on:
  schedule: [{ cron: "17 18 * * *" }]   # ~02:17 HKT
  workflow_dispatch: {}                  # manual trigger for verification
jobs:
  health:
    steps:
      # 1. checkout (for scripts/) — no tool_packages needed (scripts have no deps)
      # 2. node scripts/verify-db-schema.mjs   env: SURREAL_* secrets (namespace forced esg_hub via D5 helper)
      # 3. smoke: curl -sf https://esg-hub.ascent.partners/en  &&  curl -sf https://esg-hub.ascent.partners/api/v1
      # 4. lychee broken-link check on: /en, /en/videos, /en/books, /api/v1
      #    args: --retry 2 --timeout 20 --accept 200,204,301,302,307,308,429 --no-progress
      # 5. On failure (if: failure()):
      #    gh issue list --label nightly-alert --state open →
      #      none: gh issue create --label nightly-alert --title "Nightly health check failed <date>" --body <run link + failing step>
      #      exists: gh issue comment <id> --body "Still failing: <run link>"
      #    env: GH_TOKEN=${{ secrets.GITHUB_TOKEN }}
      # 6. Notify n8n on failure (§4)
```

## 3. PR-title lint (new — AC-E2), file `.github/workflows/pr-title.yml`

```yaml
name: PR Title Lint
on:
  pull_request:
    types: [opened, edited, reopened, synchronize]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "${{ github.event.pull_request.title }}" | grep -E '^(feat|fix|ci|chore|docs|refactor|test|perf)(\(.+\))?: .+' \
            || { echo "::error::PR title must match conventional commits (feat|fix|ci|chore|docs|refactor|test|perf)"; exit 1; }
```

(No third-party action; pure bash.)

## 4. Notify n8n on failure (reusable step — AC-G1, AC-GE1)

Appended to `deploy.yml` (deploy job), `test.yml` (e2e job), `nightly.yml` (health job):

```yaml
- name: Notify n8n on failure
  if: failure()
  continue-on-error: true
  env:
    N8N_WEBHOOK_URL: ${{ secrets.N8N_WEBHOOK_URL }}
  run: |
    curl -sf -X POST "$N8N_WEBHOOK_URL" -H 'Content-Type: application/json' \
      -d '{"workflow":"${{ github.workflow }}","conclusion":"failure","run":"${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}","repo":"${{ github.repository }}","ref":"${{ github.ref_name }}"}' || true
```

Invariant: the notify step can never fail its job (`continue-on-error: true` + `|| true`).
