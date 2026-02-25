# AGENTS.md - ESG Hub Coding Guidelines

## Build & Development Commands

```bash
# Development
npm run dev           # Start dev server (port 3000)
npm run build        # Production build
npm run start        # Start production server

# Linting & Type Checking
npm run lint         # ESLint (uses eslint-config-next)
npx tsc --noEmit     # TypeScript type check (strict mode)

# Testing
npm run test          # Run Playwright tests (accessibility + API contract)
npm run test:ci       # Run tests with CI reporter
npx playwright test   # Run Playwright tests directly

# Database
npm run verify:db    # Verify SurrealDB schema (indexes, uniqueness, required fields)
```

## Code Style Guidelines

### TypeScript
- Strict mode enabled (`strict: true`)
- Prefer explicit types over `any` or `unknown`
- Define interfaces for API responses and DB results
- Use path aliases: `@/*` maps to `./src/*`
- Use `type` for unions/primitives, `interface` for objects

### Imports (order: External → Internal → Types)
```typescript
import { useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { queryHttp, sanitize } from "@/lib/surrealdb";
import { keywordSearch } from "@/lib/search";
import type { Metadata } from "next";
```

### Naming Conventions
- **Components**: PascalCase files (`Header.tsx`, `SearchClient.tsx`)
- **Hooks**: camelCase with `use` prefix (`useSearch`)
- **Utils/Libs**: camelCase (`surrealdb.ts`, `search.ts`)
- **Constants**: UPPER_SNAKE_CASE at module level
- **Interfaces**: PascalCase, export if shared (`SearchResult`, `PageResult`)

### Component Structure
```typescript
"use client"; // Only for client components

import { useState } from "react";
import Link from "next/link";

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
- **Client Components**: Add `"use client"` when using:
  - React hooks (useState, useEffect, useCallback)
  - Event handlers (onClick, onSubmit)
  - Browser APIs (localStorage, window)
- Server Components: Use for data fetching, SEO metadata

### Error Handling
```typescript
try {
  const results = await queryHttp<PageResult>(query, vars);
  return NextResponse.json({ data: results });
} catch (err) {
  console.error("[API /v1/search] Error:", err);
  return NextResponse.json(
    { error: "An internal error occurred. Please try again later." },
    { status: 500 }
  );
}
```

### Security - SurrealDB Queries
```typescript
// ✅ Good: Sanitize user input
const escaped = sanitize(userInput);
await queryHttp(`SELECT * FROM page WHERE title @0@ '${escaped}'`);

// ✅ Good: Validate numeric params
const limit = sanitizeInt(params.get("limit"), 20, 1, 50);

// ❌ Bad: String interpolation (injection risk)
await queryHttp(`SELECT * FROM page WHERE title = '${userInput}'`);
```

### API Routes (Next.js App Router)
```typescript
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // or "edge"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const q = params.get("q");
    
    if (!q) {
      return NextResponse.json({ error: "Missing 'q' parameter" }, { status: 400 });
    }
    // ... process
  } catch (err) {
    console.error("[API] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Styling
- Tailwind CSS v4 with CSS custom properties in `globals.css`
- No inline styles preferred (use CSS classes)
- CSS variables: `--color-primary`, `--color-link`, `--font-body`

### Git Workflow
- No commits unless explicitly requested
- Never force push to main
- Keep changes focused and atomic

## Environment Variables

```bash
# Required - SurrealDB
SURREAL_ENDPOINT=https://...
SURREAL_USERNAME=...
SURREAL_PASSWORD=...
SURREAL_NAMESPACE=...
SURREAL_DATABASE=...

# Optional - AI features
OPENROUTER_API_KEY=...
DEEPSEEK_API_KEY=...
```

## Performance
- Use `cache: "no-store"` for dynamic SurrealDB queries
- Use `revalidate` for cached external API responses
- Lazy load heavy components with `dynamic` import
- Use Next.js `<Image>` for optimization

## Internationalization (i18n)

### Supported Locales
- English (`en`) - Default
- Chinese Simplified (`zh`)
- Hindi (`hi`)

### Adding New Translatable Strings
1. Add the key to `messages/en.json` under the appropriate namespace
2. Use in Server Components:
   ```typescript
   import { getTranslations } from "next-intl/server";
   
   const t = await getTranslations({ locale, namespace: "SectionName" });
   return <h1>{t("key")}</h1>;
   ```
3. Use in Client Components:
   ```typescript
   import { useTranslations } from "next-intl";
   
   const t = useTranslations("SectionName");
   return <h1>{t("key")}</h1>;
   ```

### Translation File Structure
```
messages/
├── en.json    # English (base, always complete)
├── zh.json    # Chinese (Simplified)
└── hi.json    # Hindi
```

### Translation Keys Namespace
- `Common` - Shared UI elements (buttons, labels)
- `Navigation` - Header, footer, menu items
- `Pillars` - ESG pillar names
- `Search` - Search UI and results
- `AISearch` - AI search agent UI
- `AIChat` - AI chat widget UI
- `PageTools` - Sidebar tools
- `Pages` - Error pages, 404
- `Home` - Homepage content
- `Contents` - Contents page
- `Videos` - Videos page
- `Books` - Books page
- `Developers` - Developer portal
- `ApiDocs` - API documentation
- `McpDocs` - MCP documentation

### Database Translation Fields
For database content (pages, resources), use locale-specific fields:
- `page.title_zh`, `page.title_hi` - Translated titles
- `page.description_zh`, `page.description_hi` - Translated descriptions
- `page.content_zh`, `page.content_hi` - Translated content

Fetching localized content:
```typescript
const getContent = (page: PageRecord, locale: string) => {
  if (locale === "zh") return page.content_zh || page.content;
  if (locale === "hi") return page.content_hi || page.content;
  return page.content;
};
```

### Locale Routing
- All routes are under `[locale]` parameter: `/en/`, `/zh/`, `/hi/`
- Middleware handles locale detection from URL, cookie, or Accept-Language header
- Root `/` redirects to `/en/`

### Scripts
```bash
# Add translation fields to SurrealDB
node scripts/add-translation-fields.mjs

# Translate database content (requires MINIMAX_API_KEY)
node scripts/translate-db-content.mjs
```
