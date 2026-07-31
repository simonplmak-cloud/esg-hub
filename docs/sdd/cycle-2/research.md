# Cycle 2 — Research Brief

| Item | Source URL | Maturity | Relevance + why |
|------|-----------|----------|-----------------|
| Next.js i18n SEO hreflang/sitemap | https://eastondev.com/blog/en/posts/dev/20251225-nextjs-i18n-seo/ | Production | hreflang via Metadata API alternates.languages, x-default tag, multilingual sitemap entries. Directly applicable to UI-COMP-01. |
| OWASP REST Security Cheat Sheet (headers) | https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html | Canonical | CSP, HSTS, X-Frame-Options, X-Content-Type-Options checklist. Pattern for MW-GUARD-01 header implementation. |
| Next.js Security Headers Best Practices | https://www.nextgencode.dev/blog/web-security-2025 | Production (2025) | Middleware-based security headers with next.config.mjs `headers()`. CSP with nonces, HSTS preload. For MW-GUARD-01. |
| WCAG 2.2 AA Playwright + axe-core | Per https://github.com/dequelabs/axe-core-npm | Production | axe-core Playwright integration pattern. For UI-A11Y-01 automated a11y testing. |
| SurrealDB hybrid search RRF | https://surrealdb.com/blog/hybrid-search-inside-surrealdb | Production (2026) | search::rrf() fusion pattern confirmation. Already implemented; confirms current approach is correct. |

Budget: 5 queries used (cycle-1 cap 5). DELTA-LIGHT mode: 3 queries targeted. 5 OK for full cycle.
