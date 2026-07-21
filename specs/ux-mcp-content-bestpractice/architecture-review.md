# Architecture Review — ESG Hub UX/IA vs Best-Practice Baseline

Date: 2026-07-21 · Spec: `spec.md` · Baseline sources: `references.md` §1

## 1. Baseline summary (cited)

From the gathered encyclopedia/knowledge-base IA guidance (12 sources, references.md §1):

- **B1** Article template: lead summary → TOC → chunked body with descriptive headings → references → see-also/related
- **B2** Hybrid discovery: strong search + stable taxonomy (≤7 top-nav, ≤3 levels) + rich internal linking
- **B3** "Every page is page one": breadcrumbs + local context + related content on every article
- **B4** WCAG 2.1 AA baseline: semantic headings, landmarks, keyboard access, non-color-only cues
- **B5** Source credibility: visible references/citations, curated further reading

## 2. Current-state inventory (from code)

### 2.1 Routes & navigation

| Element | Implementation | Evidence |
|---------|---------------|----------|
| Locale routing | `/en`, `/zh`, `/hi` via next-intl; unprefixed → 307 to `/en` | `src/i18n/routing.ts`, `src/middleware.ts` |
| Article route | catch-all `[...slug]` renders DB pages by permalink | `src/app/[locale]/[...slug]/page.tsx` |
| Primary nav | header nav + "Contents" dropdown with section/pillar category links; search entry | `src/components/Header.tsx:171-250` |
| Landing pages | section/pillar hub pages exist as DB pages (e.g., `/standards/`, `/environmental/`) | DB `page` records |
| Breadcrumbs | on every article | `[...slug]/page.tsx:187` |
| Search | dedicated `/search` page + AI search agent + quick search in header | `src/components/AISearchAgent.tsx` |

### 2.2 Article render pipeline

`getPageByPermalink()` (`src/lib/pages.ts`) → `[...slug]/page.tsx` →
`Breadcrumbs` → `h1` title → **description lead** (`[...slug]/page.tsx:214`) →
`TableOfContents` (from `extractHeadings`, `src/lib/markdown.ts`) →
`MarkdownContent` (remark-gfm + rehype-raw/sanitize) →
`PageToolsSidebar` (related pages + backlinks via `/api/v1/pages/:id/related`, `/backlinks`)

### 2.3 Accessibility

- Skip-link (`Header.tsx:166`), `aria-label` on nav, semantic h1→h2/3 from markdown, locale-aware landmarks
- No skipped heading levels enforced structurally (markdown content-driven)

### 2.4 Data-level discovery

- `related_pages` / `backlinks` fields + DB indexes exist — but **0/354 pages populated** (verified 2026-07-21), so `/api/v1/pages/:id/related` returns empty and the Related Topics block has no data

## 3. Gap table

| # | Baseline | Current | Evidence | Priority |
|---|----------|---------|----------|----------|
| G1 | References on every article (B5) | **54/354 (15%)** have `## References` | DB count 2026-07-21 | **P0 — WS-C pilot** |
| G2 | Working related-content graph (B3) | `related_pages`/`backlinks` empty (0/354) | DB count 2026-07-21 | **P0 — WS-A2** |
| G3 | Proper lead on every article (B1) | 9 pages with `len(description) < 50` | DB query 2026-07-21 | P1 — T-06 |
| G4 | Top-nav ≤7 items (B2) | Primary nav + Contents dropdown groups by pillar/section; within limit | `Header.tsx` | ✅ OK |
| G5 | Breadcrumbs everywhere (B3) | Present on all articles | `[...slug]/page.tsx` | ✅ OK |
| G6 | TOC from real headings (B1/B4) | `extractHeadings` → TableOfContents | `src/lib/markdown.ts` | ✅ OK |
| G7 | WCAG 2.1 AA (B4) | Skip-link, aria labels, semantic structure present; no formal audit | `Header.tsx`, layout | P2 — future a11y audit |
| G8 | Curated further reading (B5) | Not a distinct rendered section; embedded in content variably | content inspection | P1 — folded into WS-C References convention |

## 4. Prioritized refinements (this spec)

1. **P0** Populate cross-reference graph for pilot section (AC-A2 → tasks T-14/15) — enables the existing Related Topics UI
2. **P0** References sections on pilot pages with per-claim source verification (AC-C1/C2 → tasks T-07…T-13)
3. **P1** Leads for 9 thin-description pages (AC-A3 → task T-06)
4. **P1** References/Further-Reading rendering convention (documented in methodology, AC-A3/AC-C1)
5. **P2** Formal accessibility audit (WCAG 2.1 AA) — logged as future work, out of this spec's scope

## 5. Non-goals (explicit)

- No visual redesign (colors, branding, layout geometry) — IA/structure only
- No new route types or nav restructuring — current structure is within baseline limits (G4–G6 are OK)
