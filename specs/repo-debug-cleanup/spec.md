# Repo Debug & Cleanup — Code Review Findings

Status: Completed (2026-07-20, PR #10)
Version: 1.0
Last updated: 2026-07-20

## Overview

Apply the findings of a focused code review of the esg-hub repository: remove a public debug endpoint, delete drifted dead-code pages, drop a permanently broken script, and bring API routes in line with the constitution's CORS pattern. Baseline verified healthy before changes (vitest 23/23, i18n namespaces complete across en/zh/hi, 2 `any`, zero TODO/ts-ignore).

## Findings (evidence, 2026-07-20)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | **`/api/debug-headers` echoes all request headers publicly** — temporary debug leftover; leaks host/forwarded/any auth headers to anonymous callers | route returns 200 on prod with full header dump (`src/app/api/debug-headers/route.ts`) |
| F2 | **4 root pages are unreachable dead code and have drifted** — `src/app/{books,contents,search,videos}/page.tsx` all 307-redirect to `/en/...` on prod; all 4 differ from their `[locale]` counterparts (322/327, 177/183, 57/68, 306/294 lines). Edits don't propagate (AGENTS.md warning) | curl 307s; line-count diffs |
| F3 | **`scripts/translate-db-content.mjs` cannot run** — TypeScript `interface` in a `.mjs` file; `node --check` fails. Superseded by `auto-translate.mjs` | node --check error at line 27 |
| F4 | **9 API routes lack the constitution-required OPTIONS/CORS handler** — ai-chat, ai-search, debug-headers, embed, keyword-search, quick-search, semantic-search, v1/pages/[id]/backlinks, v1/pages/[id]/related. vercel.json masks response headers but preflight OPTIONS hits no handler | grep for OPTIONS per route |
| F5 | **vercel.json contains a no-op rewrite** (`/api/(.*)` → `/api/$1`) | file read |

## User Stories

- As a **maintainer**, I want no public debug endpoints so that request internals aren't exposed.
- As a **maintainer**, I want dead/duplicated code removed so future edits can't silently target unreachable files.
- As a **developer**, I want every API route to follow the documented OPTIONS/CORS pattern so behavior is predictable.

## Boundaries

**Always do:**
- Verify localized routes (`/en/...`, `/zh/...`, `/hi/...`) behave identically before and after deletions (redirects come from middleware, not the deleted files)
- Keep `src/app/page.tsx` (the `/` → `/en` redirect) — it is NOT one of the dead duplicates
- Run the full CI gate on the PR (lint → tsc → vitest → build) and preview E2E before merging

**Ask first:**
- Any change that alters rendered output of localized pages
- Deleting anything referenced by other code (verify by grep first)

**Never do:**
- Change DB content, schema, or any page rendering logic
- Leave references to deleted files anywhere in the repo

## Acceptance Criteria

- **AC-1 [MUST]** `src/app/api/debug-headers/` is deleted; `/api/debug-headers` returns 404 on the deployed site.
- **AC-2 [MUST]** `src/app/{books,contents,search,videos}/page.tsx` are deleted; unprefixed paths still 307 to their localized versions; a repo-wide grep for imports/references to the deleted files returns zero hits.
- **AC-3 [MUST]** `scripts/translate-db-content.mjs` is deleted (broken beyond use; superseded by `auto-translate.mjs`); no references remain in package.json scripts or docs.
- **AC-4 [MUST]** Every `route.ts` under `src/app/api/` exports an `OPTIONS` handler returning 204 with CORS headers matching the constitution pattern (or the constitution is amended — implementation decision recorded in plan.md).
- **AC-5 [SHOULD]** The no-op rewrite in `vercel.json` is removed; `/api/v1` and the AI routes still return 200 on the deployed site.
- **AC-6 [MUST]** The change PR is green end-to-end: check job (lint, tsc, vitest, build), preview deploy + E2E, and post-merge production deploy + E2E.
- **AC-7 [SHOULD]** `AGENTS.md` is updated: the "duplicate pages — check/update both" warning is removed/replaced with the post-deletion reality.

## Non-Functional Requirements

- Deletions only (plus small OPTIONS-handler additions) — no logic rewrites
- Each deletion verified reference-free before commit
- Deploy via normal PR → merge pipeline (branch protection + Copilot review active)

## Out of Scope

- Error-handling/logging refactors beyond the findings (e.g., `catch { return [] }` graceful fallbacks stay)
- New tests beyond the existing suites (CI gates cover regression)
- `mcp-server/` changes; upstream `project_human` bin.ts fix
- vercel.json function/memory tuning

## Open Questions

- [RESOLVED] Root duplicates are unreachable (307 verified on prod) → safe to delete
- [RESOLVED] translate-db-content.mjs → delete (broken, superseded)
- [OPEN] ~~AC-4 implementation~~ [RESOLVED 2026-07-20] → add constitution-pattern OPTIONS handlers to the 8 routes (user decision)

## Completion Verification (2026-07-20)

| AC | Result |
|----|--------|
| AC-1 | ✅ route deleted (404 on contents API); prod serves the generic not-found page with **zero** header leakage (`allHeaders`/`x-forwarded-host` absent). Note: Next.js returns HTTP 200 + HTML 404-body for ALL unmatched `/api/*` paths in this app (soft-404, verified with a bogus path) — platform-level behavior, logged as a separate observation |
| AC-2 | ✅ 4 pages deleted, zero references; `/videos` → 307 → `/en/videos` preserved on prod |
| AC-3 | ✅ script deleted |
| AC-4 | ✅ OPTIONS handlers added to all 8 routes; 100% coverage audit; live: `OPTIONS /api/ai-search` → 204 |
| AC-5 | ✅ no-op rewrite removed; `/api/v1` → 200 |
| AC-6 | ✅ PR #10: check + preview + production deploy all green; E2E passed |
| AC-7 | ✅ AGENTS.md updated |
| Bonus | Copilot auto-review fired on PR #10 (COMMENTED) |
