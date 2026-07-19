# Log Review — Development Environment Automation

Baseline sweep: 2026-07-19 · Reviewer: opencode (with user-provided tokens)
Purpose: record of environment state before/after each change per spec `spec.md` (AC-A12).

## Legend

- 🔴 broken/failing · 🟡 warning/misaligned · 🟢 verified clean · ⚪ not yet examined

## Baseline (2026-07-19)

### GitHub Actions

| Item | State | Evidence |
|------|-------|----------|
| `Deploy to Vercel` — last 6 runs (2026-07-19) | 🔴 all failed | Runs 29677821061 (2m32s), 29677495493 (36s), 29676967406 (41s), 29676767997 (9s), 29675677866 (27s), 29674763034 (7s). Latest: `check` job ✅, `deploy` job failed at "Wait for deployment to be ready" |
| Last green run | 2026-03-01 (run 22539797324, 7m27s) | `gh run list` |
| `Deploy Preview to Vercel` | ⚪ no recent runs (no PRs) | — |
| Branch protection on `main` | 🔴 none | protection API 404 "Branch not protected" |
| Secrets inventory | 🟢 9/9 present | SURREAL_ENDPOINT, SURREAL_USERNAME, SURREAL_PASSWORD, SURREAL_NAMESPACE, SURREAL_DATABASE, TOOL_PACKAGES_PAT, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN |
| Dependabot alerts / auto-fixes | 🔴 alerts 404 (disabled); auto-fixes `{"enabled":false}` | API |
| Security analysis (secret scanning/CodeQL) | 🔴 not configured; `security_and_analysis` empty | API |
| gh CLI / git auth | 🔴 authenticated as `humanity4ai` → repo 404s | `gh auth status`; `git ls-remote` "Repository not found" |

### Vercel (project `esg-hub`, team_WdRBvuyKYcVGwtSk1T9dIoaY)

| Item | State | Evidence |
|------|-------|----------|
| Last 6 production deployments | 🔴 ERROR | errorCode `ENOENT`, errorMessage `Command "pnpm install" exited with 254`, errorStep `buildStep` (e.g. dpl_9YAHCXVk5q4PDNtdXasWJf4T3rxr) |
| 1 deployment | 🟡 BLOCKED | esg-hq9ojwib8 (2026-07-19) |
| Last READY production | 2026-03-01 | esg-20wzoostj / esg-4q2nez2r2 / esg-rqpyrz8th |
| Root cause | `pnpm-lock.yaml` added in c9bffd4 → Vercel uses pnpm → `file:../tool_package` missing on builder → install ENOENT. npm (used at dc21ae1, package-lock.json present) tolerated it | lockfile history |
| `nodeVersion` | 🟡 24.x — violates `engines: >=18 <24` | project API |
| `ssoProtection` | 🟡 `all_except_custom_domains` — preview E2E would hit SSO | project API |
| `passwordProtection` / `trustedIps` | 🟢 none | project API |
| installCommand/buildCommand/output/rootDir/packageManager | all default (null) | project API |
| Prod alias `esg-hub.ascent.partners` | 🟢 200 | curl |
| Old domain `esg-hub-six.vercel.app` | 🔴 404 (dead) | curl root + /api/v1 |

### SurrealDB Cloud

| Item | State | Evidence |
|------|-------|----------|
| Health (namespace `esg_hub`) | 🟢 354 pages, 29 sections, no dup permalinks, no missing required fields, indexes on section/slug/related_pages/backlinks exist | `SURREAL_NAMESPACE=esg_hub node scripts/verify-db-schema.mjs` |
| UNIQUE index on `page.permalink` | 🟡 missing — duplicates possible | verify:db recommendations |
| Shell `SURREAL_NAMESPACE` | 🔴 `valuation` (foreign project) — scripts read env → target wrong DB; verify reported "0 pages" until overridden | direct run |
| `verify-db-schema.mjs:13` | 🔴 hardcoded password fallback committed | file read |

### Local machine / repo

| Item | State | Evidence |
|------|-------|----------|
| `../tool_package` sibling (file: deps) | 🟢 present (`packages/utils`, `packages/validation`) | ls |
| Dead-domain references | 🔴 4 files: `src/app/robots.ts:12`, `src/app/videos/page.tsx:13,18`, `src/lib/constants.ts:7`, `mcp-server/README.md` | grep |
| Prod API smoke `esg-hub.ascent.partners/api/v1` | 🟢 200 | curl |
| Local E2E | 🟡 unsupported — machine too slow, Playwright times out | user statement |
| `.vercel/project.json` | 🟢 linked (prj_7iHf6JTFeLxJXpTrx08Oiv8u6Wy0) | file read |

### MCP servers (`~/.config/opencode/opencode.json`)

| Server | State | Note |
|--------|-------|------|
| context7 | 🟢 enabled | |
| github | 🔴 enabled but token = `humanity4ai` (GH_TOKEN) → no esg-hub access | rewire to `SIMONPLMAK_CLOUD_PAT` |
| playwright | 🟢 enabled | |
| perplexity | 🟢 enabled, verified live (search returned results 2026-07-19) | |
| esg-hub (local) | 🟢 enabled, verified live (354 pages via prod API) | code default URL correct; README wrong (F11) |
| gh_grep | 🟢 enabled | |
| postgres | 🟢 enabled (DATABASE_URL set) | not yet exercised |
| n8n | 🟢 enabled (N8N_API_KEY set) | not yet exercised |
| humanity4ai | 🟢 enabled (`/mnt/c/git_repo/project_human` exists) | not yet exercised |
| clerk | 🟢 enabled | not yet exercised |
| brave-search | 🟡 disabled; BRAVE_API_KEY set | enable per spec |
| google-search | 🟡 disabled; GOOGLE_API_KEY + GOOGLE_SEARCH_ENGINE_ID set | enable per spec |
| browserless | 🔴 disabled; token set but service down (localhost:3000 → curl 000) | repair then enable |
| google-workspace | ⚪ disabled pending OAuth (out of scope) | |
| ms-365 | ⚪ disabled pending OAuth (out of scope) | |
| vercel | 🔴 absent | add per spec (token verified 2026-07-19) |

## Resolution Log

| Finding | Resolution | Verified by | Date |
|---------|-----------|-------------|------|
| _pending implementation_ | | | |
