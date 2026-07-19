# AGENTS.md - ESG Hub

## Commands

```bash
pnpm dev              # Next.js dev server (port 3000)
pnpm build            # Production build (standalone output; needs SURREAL_* env — sitemap.ts queries DB at build)
pnpm lint             # ESLint flat config (eslint-config-next)
npx tsc --noEmit      # Type check (strict; excludes mcp-server/)
npx vitest run        # Unit tests
npx vitest run src/lib/__tests__/markdown.test.ts  # Single unit test
pnpm test             # Playwright E2E
npx playwright test e2e/locale-routing.spec.ts     # Single E2E test
pnpm verify:db        # Verify SurrealDB schema (needs SURREAL_* env)
```

CI gate order (`.github/workflows/deploy.yml`): lint → tsc → vitest → build. Run all four before pushing; Playwright runs only in CI against the deployed URL.

### Local install prerequisite

`package.json` has `file:../tool_package/packages/{utils,validation}` deps — `pnpm install` fails unless the sibling repo `simonplmak-cloud/tool_packages` exists at `../tool_package` (repo name plural, local path singular). CI checks it out and symlinks it.

### Playwright ports

Local: the config starts its own `next dev -p 3001` webServer (`playwright.config.ts:31`) — E2E never uses the port-3000 dev server. CI: no webServer; tests hit `BASE_URL` (the Vercel deployment). Preview deploys must have Vercel Deployment Protection disabled or E2E fails (see `VERCEL_PROTECTION_FIX.md`).

## Architecture

- Next.js 15 App Router, React 19, `output: "standalone"` (`next.config.mjs:7`), deployed to Vercel via API trigger from GitHub Actions (not Vercel's git integration).
- Whole site is request-time DB rendering: `export const dynamic = "force-dynamic"` in `src/app/[locale]/layout.tsx:11`.
- `src/app/layout.tsx` is a pass-through; the real layout is `src/app/[locale]/layout.tsx`. Root `src/app/page.tsx` only redirects to `/en`.
- `next-intl` prefixes all routes with `/en`, `/zh`, `/hi` (`src/i18n/routing.ts`).
- **Duplicate pages**: `src/app/{books,contents,search,videos}/page.tsx` are non-localized copies of the `[locale]/` counterparts, and both are actively maintained. Edits do not propagate — check/update both.
- Database: SurrealDB Cloud via JSON-RPC over HTTP (`queryHttp()` / `queryHttpAll()` in `src/lib/surrealdb.ts`) — never WebSocket.
- DB namespace is hardcoded to `"esg_hub"` (`surrealdb.ts:20`); the `SURREAL_NAMESPACE` env var is intentionally ignored in app code so another project's shell var can't shadow it. Scripts do read the env var.
- `src/pages/_error.js` is the last Pages Router file — never add pages there.
- Node: `.nvmrc` says 22.x, CI uses 20, engines allow >=18 <24.

### mcp-server/ (separate package)

Standalone MCP server (`@esg-hub/mcp-server`) wrapping the public REST API at `/api/v1`. Not in the pnpm workspace, excluded from root tsconfig and vitest, installed with npm. Its `dist/` is committed to git, but `mcp-server/node_modules/` is NOT gitignored — stage files explicitly; never `git add .`.

### specs/ and constitution.md

`specs/` holds spec-driven-development artifacts (spec/plan/tasks per feature). `constitution.md` formally restates this file's constraints for SDD workflows.

## Environment Variables

Secrets are shell-level (`~/.bashrc`), never in repo files. **Never read `.env*` files.**

| Variable | Notes |
|----------|-------|
| `SURREAL_ENDPOINT` / `SURREAL_USERNAME` / `SURREAL_PASSWORD` / `SURREAL_DATABASE` | SurrealDB Cloud; required for dev, build, `verify:db` |
| `SURREAL_NAMESPACE` | Ignored by app code AND by `scripts/*.mjs` (both hardcode `esg_hub`; scripts override via `ESG_HUB_NS_OVERRIDE` only) |
| `DEEPSEEK_API_KEY` | AI search/chat API routes |
| `SIMONPLMAK_CLOUD_PAT` | GitHub PAT for the `simonplmak-cloud` account (owns this repo); `GH_TOKEN` aliases it |
| `VERCEL_TOKEN` | Vercel API token for deployment/log inspection |

### GitHub identity

This repo belongs to the `simonplmak-cloud` account. gh CLI and git authenticate as `simonplmak-cloud` (PAT in `SIMONPLMAK_CLOUD_PAT`/`GH_TOKEN`; git via repo-local `credential.username` + `~/.git-credentials`). The `humanity4ai` account is secondary — if a command 404s on `simonplmak-cloud/*`, check which token is in use.

## Conventions

- TypeScript strict; path alias `@/*` → `./src/*`; `type` for unions/primitives, `interface` for objects.
- Server Components by default; `"use client"` only for hooks, event handlers, or browser APIs.
- SurrealQL: always pass user input through `sanitize()` / `sanitizeInt()` / `isAlphanumericDash()` (all in `src/lib/surrealdb.ts`) before interpolating. Raw interpolation is a banned pattern.
- API routes: `export const runtime = "nodejs"`, an `OPTIONS` handler returning 204 with CORS headers, and `{ error: "Internal error" }` with status 500 on failure. Pattern: `src/app/api/v1/route.ts`.
- Styling: Tailwind CSS v4 via `@import "tailwindcss"` in `globals.css` (no tailwind.config); design tokens are CSS vars there (`--color-primary`, `--font-body`, ...).

## Testing

- **This machine is too slow for local E2E** — Playwright times out. Run tests on GitHub instead: `gh workflow run test.yml` (inputs: `base_url`, `skip_e2e`), then `gh run watch`. Local `pnpm test` is unsupported here.
- Unit: Vitest in `src/lib/__tests__/`; `vitest.config.ts` excludes `e2e/`, `node_modules/`, `mcp-server/`.
- E2E: Playwright in `e2e/` (currently only `locale-routing.spec.ts`), Chromium only.
- CI runs E2E twice per change: against the PR preview deployment and against production after merge.

## i18n

- Locales `en` (default), `zh`, `hi`; translations in `messages/*.json`; server `getTranslations`, client `useTranslations`.
- DB-level translations live on page records: `title_zh/hi`, `description_zh/hi`, `content_zh/hi`.

## Middleware

`src/middleware.ts`: hosts matching `*.esg.video` get a 308 redirect to `https://esg-hub.ascent.partners/videos` unless the path already starts with `/videos` (vercel.json duplicates this at the edge). Everything else passes to the next-intl locale-prefix middleware.

## Scripts

`scripts/*.mjs` are one-off/manual DB migration and content-maintenance scripts (run with `node`, need `SURREAL_*` env). Only `verify-db-schema.mjs` is wired to a pnpm script. Do not run mutation scripts unless asked.

## Git

- No commits unless explicitly requested; never force-push main.
- `git add .` stages `mcp-server/node_modules/` (not ignored) — stage files explicitly.
