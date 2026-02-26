# AGENTS.md - ESG Hub Coding Guidelines

## Build & Development Commands

```bash
# Development
npm run dev           # Start dev server (port 3000)
npm run build         # Production build
npm run start         # Start production server

# Linting & Type Checking
npm run lint          # ESLint (eslint-config-next)
npx tsc --noEmit      # TypeScript strict mode check

# Testing
npm run test          # Run all Playwright tests
npm run test:ci       # Run tests with CI reporter
npx playwright test path/to/test.spec.ts       # Run single test file
npx playwright test --grep "test name"         # Run tests matching pattern

# Database
npm run verify:db     # Verify SurrealDB schema
```

## Code Style

### TypeScript
- Strict mode enabled - prefer explicit types over `any`/`unknown`
- Define interfaces for API responses and DB results
- Path aliases: `@/*` → `./src/*`
- Use `type` for unions/primitives, `interface` for objects

### Imports (order: External → Internal → Types)
```typescript
import { useState } from "react";
import Link from "next/link";
import { queryHttp, sanitize } from "@/lib/surrealdb";
import type { Metadata } from "next";
```

### Naming
- **Components**: PascalCase (`Header.tsx`, `SearchClient.tsx`)
- **Hooks**: camelCase with `use` prefix (`useSearch`)
- **Utils**: camelCase (`surrealdb.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase, export if shared

### Component Structure
```typescript
"use client"; // Only for client components

import { useState } from "react";

interface Props {
  initialValue?: string;
}

export default function ComponentName({ initialValue }: Props) {
  const [value, setValue] = useState(initialValue ?? "");
  // handlers, then render
}
```

### Server vs Client Components
- **Default**: Server Components (no `"use client"`)
- **Client**: Add `"use client"` when using hooks, event handlers, or browser APIs

### Error Handling
```typescript
try {
  const results = await queryHttp<PageResult>(query, vars);
  return NextResponse.json({ data: results });
} catch (err) {
  console.error("[API] Error:", err);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
```

### Security - SurrealDB Queries
```typescript
// Good: Sanitize user input
const escaped = sanitize(userInput);
await queryHttp(`SELECT * FROM page WHERE title @0@ '${escaped}'`);

// Good: Validate numeric params
const limit = sanitizeInt(params.get("limit"), 20, 1, 50);

// Bad: String interpolation (injection risk)
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
    const q = request.nextUrl.searchParams.get("q");
    if (!q) return NextResponse.json({ error: "Missing 'q'" }, { status: 400 });
  } catch (err) {
    console.error("[API] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Styling
- Tailwind CSS v4 with CSS variables in `globals.css`
- Use CSS classes over inline styles
- Variables: `--color-primary`, `--color-link`, `--font-body`

## Environment Variables

All environment variables must be set at the **global/shell level** - NOT in project-level `.env` files.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SURREAL_ENDPOINT` | SurrealDB connection URL | `https://xxx.surreal.cloud` |
| `SURREAL_USERNAME` | Database username | `root` |
| `SURREAL_PASSWORD` | Database password | (secret) |
| `SURREAL_NAMESPACE` | Database namespace | `esg_hub` |
| `SURREAL_DATABASE` | Database name | `main` |
| `DEEPSEEK_API_KEY` | DeepSeek API key for AI features | (secret) |
| `OPENROUTER_API_KEY` | OpenRouter API key (optional) | (secret) |
| `GITHUB_TOKEN` | GitHub personal access token | (secret) |

### Setup

1. Set variables in shell profile (`~/.bashrc`, `~/.zshrc`, or similar):
```bash
export SURREAL_ENDPOINT="https://..."
export SURREAL_USERNAME="root"
export SURREAL_PASSWORD="your_password"
export SURREAL_NAMESPACE="esg_hub"
export SURREAL_DATABASE="main"
export DEEPSEEK_API_KEY="your_key"
export GITHUB_TOKEN="ghp_xxx"
```

2. For GitHub CLI, authenticate once:
```bash
echo "$GITHUB_TOKEN" | gh auth login --scopes repo --with-token
```

3. Verify setup:
```bash
gh auth status           # GitHub CLI
npm run verify:db       # Database connection
```

### Vercel Deployment

Set variables in Vercel dashboard: **Project Settings → Environment Variables**

### Important
- **NEVER create `.env` files in the project** - all vars are global/shell level
- `.env*` is already in `.gitignore` to prevent accidental commits
- Store secrets in password manager for disaster recovery

## Performance
- Use `cache: "no-store"` for dynamic queries
- Use `revalidate` for cached responses
- Lazy load heavy components with `dynamic` import

## Internationalization (i18n)

### Supported Locales
- English (`en`) - Default
- Chinese Simplified (`zh`)
- Hindi (`hi`)

### Usage
```typescript
// Server Components
import { getTranslations } from "next-intl/server";
const t = await getTranslations({ locale, namespace: "Section" });

// Client Components
import { useTranslations } from "next-intl";
const t = useTranslations("Section");
```

### Translation Files
```
messages/
├── en.json    # English (base)
├── zh.json    # Chinese
└── hi.json    # Hindi
```

### Database Translation Fields
- `page.title_zh`, `page.title_hi`
- `page.description_zh`, `page.description_hi`
- `page.content_zh`, `page.content_hi`

## Git Workflow
- No commits unless explicitly requested
- Never force push to main
- Keep changes focused and atomic
