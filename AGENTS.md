# AGENTS.md - ESG Hub

## Build & Dev Commands

```bash
pnpm dev              # Next.js dev server (port 3000)
pnpm build            # Production build (output: standalone)
pnpm start            # Start production server
pnpm lint             # ESLint (eslint-config-next flat config)
npx tsc --noEmit      # TypeScript check (strict mode)

# Testing
pnpm test             # Playwright E2E tests (e2e/ directory)
pnpm test:ci          # Playwright with CI reporter
npx playwright test e2e/locale-routing.spec.ts  # Single E2E test
npx vitest run src/lib/__tests__/markdown.test.ts  # Single unit test

# Database
pnpm verify:db        # Verify SurrealDB schema (scripts/verify-db-schema.mjs)
```

### E2E Test Port Mismatch

Playwright tests use port **3001** (`playwright.config.ts:5`). `pnpm dev` uses the default Next.js port **3000**. The Playwright config spins up its own `npx next dev -p 3001` as a `webServer`, so it works automatically — just be aware the ports differ.

## Architecture

- **Framework**: Next.js 15 App Router (React 19)
- **Routing**: `next-intl` middleware prefixes `/en`, `/zh`, `/hi` on all routes
- **Root layout** (`src/app/layout.tsx`) is a pass-through; the real layout is at `src/app/[locale]/layout.tsx`
- **Pages Router** still present (`src/pages/_error.js`) — do not add new pages there
- **Database**: SurrealDB Cloud via JSON-RPC over HTTP (`queryHttp()` / `queryHttpAll()` in `src/lib/surrealdb.ts`), not WebSocket
- **DB namespace** is hardcoded to `"esg_hub"` in `surrealdb.ts:20` — the env var is intentionally ignored to prevent cross-project shadowing
- **Build output**: `standalone` mode (`next.config.mjs:7`)
- **Deployment**: Vercel

### Key Dependencies

- `next-intl` for i18n (locales: `en`, `zh`, `hi`; default: `en`)
- `surrealdb` SDK v2 for DB connectivity
- `react-markdown` + `remark-gfm` + `rehype-*` for rendering MD content
- `@huggingface/transformers` for client-side ML (excluded from server bundle)
- Local file-linked deps: `@simonplmak-cloud/utils`, `@simonplmak-cloud/validation` (at `../tool_package/packages/`)

## Environment Variables

| Variable | Where | Notes |
|----------|-------|-------|
| `SURREAL_ENDPOINT` | `~/.bashrc` | SurrealDB Cloud URL |
| `SURREAL_USERNAME` | `~/.bashrc` | `root` |
| `SURREAL_PASSWORD` | `~/.bashrc` | secret |
| `SURREAL_DATABASE` | `~/.bashrc` | `main` |
| `SURREAL_NAMESPACE` | — | Hardcoded to `esg_hub` in app code; scripts may read env var |
| `DEEPSEEK_API_KEY` | `~/.bashrc` | For AI search features |
| `GITHUB_TOKEN` | `~/.bashrc` | For gh CLI |
| `NEXT_PUBLIC_BASE_URL` | — | Sitemap generation (unused in dev) |

- **NEVER read `.env*` files** — they are gitignored
- `SURREAL_NAMESPACE` is the only project-specific value; all secrets are shell-level

## Code Conventions

### TypeScript
- Strict mode — prefer explicit types
- Path alias: `@/*` → `./src/*`
- `type` for unions/primitives, `interface` for objects

### Imports (order: external → internal → types)
```typescript
import { useState } from "react";
import Link from "next/link";
import { queryHttp } from "@/lib/surrealdb";
import type { Metadata } from "next";
```

### Components
- **Default**: Server Components (no `"use client"`)
- **Client**: Add `"use client"` when using hooks, event handlers, or browser APIs
- PascalCase for components, camelCase for hooks/utils, UPPER_SNAKE_CASE for constants

### SurrealDB Security
```typescript
// Good: sanitize user input
const escaped = sanitize(userInput);
await queryHttp(`SELECT * FROM page WHERE title @0@ '${escaped}'`);

// Good: validate numeric params
const limit = sanitizeInt(params.get("limit"), 20, 1, 50);

// Bad: raw string interpolation
await queryHttp(`SELECT * FROM page WHERE title = '${userInput}'`);
```

### API Routes
```typescript
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(request: NextRequest) {
  try {
    // ... validation
  } catch (err) {
    console.error("[API] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Styling
- Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`, no `tailwind.config`)
- CSS variables in `globals.css`: `--color-primary`, `--color-link`, `--font-body`
- Prefer CSS classes over inline styles

## Testing

- **E2E**: Playwright (`e2e/`), Chromium only, runs against localhost:3001
- **Unit**: Vitest (`src/lib/__tests__/`), run with `npx vitest run`
- No Vitest config file — uses zero-config mode

## i18n

- Locales: `en` (default), `zh`, `hi`
- Library: `next-intl` (server: `getTranslations`, client: `useTranslations`)
- Translation files: `messages/en.json`, `messages/zh.json`, `messages/hi.json`
- DB translation fields: `page.title_zh`, `page.title_hi`, `page.description_zh`, `page.description_hi`, `page.content_zh`, `page.content_hi`
- Middleware (`src/middleware.ts`) also handles `esg.video` domain → redirects to `/videos`

## Middleware

`src/middleware.ts` runs on all non-API, non-static routes. It:
1. Detects `*.esg.video` hostnames and redirects them to the videos page
2. Passes everything else to `next-intl` middleware for locale prefix routing

## Git Workflow

- No commits unless explicitly requested
- Never force push to main
- Keep changes focused and atomic
