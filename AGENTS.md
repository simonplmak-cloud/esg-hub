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
```bash
SURREAL_ENDPOINT, SURREAL_USERNAME, SURREAL_PASSWORD
SURREAL_NAMESPACE, SURREAL_DATABASE
DEEPSEEK_API_KEY
```

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
