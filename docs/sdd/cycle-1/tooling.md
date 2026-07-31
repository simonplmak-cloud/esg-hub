# Cycle 1 — Tooling Check (2026-07-31)

| MCP/tool | Status | Notes |
|----------|--------|-------|
| github | ✓ | identity simonplmak-cloud; PRs listed |
| perplexity | ✓ | SurrealDB 3.x research OK |
| context7 | ✓ | Next.js 16 route-handler caching confirmed |
| esg-hub (custom) | ✓ | live metadata OK (354 pages, 244 resources) |
| vercel | ✓ | esg-hub=prj_7iHf6JTFeLxJXpTrx08Oiv8u6Wy0; prod READY |
| playwright | ✓ | /en + /en/search loaded, 0 console errors |
| brave-search | not probed (perplexity+brave overlap) | degrade not needed |
| gh_grep | ✓ | used once, no matches (acceptable) |
| browserless | not needed | — |
| figma | not applicable | no design surface probed |
| surrealdb (MCP) | not configured | — |
| postgres (MCP) | not configured | — |
| memory | ✓ recall/remember | no prior improve records |

Deployment target: https://esg-hub.ascent.partners (production, commit 2d00b69).
E2E: read-only playwright against live site — /en, /en/search, /api/v1/*.
