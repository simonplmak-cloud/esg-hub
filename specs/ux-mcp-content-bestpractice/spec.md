# Best-Practice Architecture & Content Program — UX/IA, MCP, Content

Status: Draft (Gate 1 pending)
Version: 0.1
Last updated: 2026-07-21

## Overview

Review the webapp's UI/UX architecture and the MCP server design against researched industry/academic best practices, review the encyclopedia's data content for accuracy and source documentation, and apply bounded refinements — with every content claim traceable to a documented source before deployment.

## Research Baseline (2026-07-21, cited in References)

**IA/UX for public encyclopedias** (Wikipedia/MDN/Britannica patterns): hybrid taxonomy + strong search; article template = lead summary → TOC → chunked body with descriptive headings → references → see-also; breadcrumbs + related-content blocks; ≤7 top-nav items, ≤3 levels deep; WCAG 2.1 AA baseline; "every page is page one" (local context for deep-linked arrivals).

**MCP tool design** (2026 guidance): 5–15 outcome-oriented tools per server; verb-noun service-prefixed names; descriptions stating what/when/returns; Zod-validated inputs; paginated lists with metadata (`has_more`, `next_cursor`); structured error envelopes with remediation hints; tool annotations (`readOnlyHint`, `openWorldHint`, `idempotentHint`).

## Current-State Audit (2026-07-21, DB + code evidence)

| Area | State | Gap vs baseline |
|------|-------|-----------------|
| Article structure | TOC, breadcrumbs, related-topics UI, search all exist | References section on only **54/354 pages (15%)** |
| Cross-reference graph | `related_pages`/`backlinks` fields + indexes exist | **0/354 pages populated** — cross-ref generation never took effect; "Related Topics" discovery is weak |
| Page leads | descriptions present | 9 pages thin (<50 chars) |
| MCP tools | 5 tools, sensible granularity, Zod inputs | No annotations; no pagination metadata; plain-throw errors (no structured envelope); descriptions lack when/returns |
| MCP list outputs | arrays with `LIMIT` in SurrealQL | No `has_more`/`next_cursor` — agents can't page safely |

## User Stories

- As a **visitor**, I want every article to follow a predictable, citable structure with documented sources, so I can trust and verify what I read.
- As an **AI-agent operator**, I want MCP tools with clear annotations, pagination, and structured errors, so agents use them reliably.
- As a **maintainer**, I want a documented, repeatable content-review methodology so quality scales beyond this project.

## Boundaries

**Always do:**
- Cite sources for every best-practice claim and every content accuracy change (MCP research: perplexity/brave; context7 for library docs)
- Verify each integrated source URL is live before writing it into content
- Keep all MCP changes backwards-compatible with the existing 5 tools
- Use the repeatable content-review methodology documented in this spec's folder for the pilot

**Ask first:**
- Any visual redesign (colors, layout, branding) — default scope is IA/structure only
- DB schema changes — default scope is content-level only
- Expanding the content pilot beyond its defined batch

**Never do:**
- Rewrite articles wholesale without per-claim source documentation
- Break existing MCP tool names/signatures
- Add sources that aren't verified live at write time

## Acceptance Criteria

### WS-A: UX/IA architecture

- **AC-A1 [MUST]** `specs/ux-mcp-content-bestpractice/architecture-review.md` documents the current IA/UX against the cited baseline (article template, navigation, accessibility), with a gap table and a prioritized refinement list — every gap traceable to evidence (file/DB query).
- **AC-A2 [MUST]** The cross-reference graph is populated for the pilot section at minimum: `related_pages` non-empty for all pilot pages (via the existing generation scripts or a fixed equivalent), verified by DB query; "Related Topics" renders real links on those pages.
- **AC-A3 [SHOULD]** Article rendering convention documented: where References and Further Reading sections appear in the template, and the 9 thin-description pages get proper leads.

### WS-B: MCP server refinement

- **AC-B1 [MUST]** All 5 tools have annotations (`readOnlyHint: true`; search/list tools `openWorldHint: false`) and enriched descriptions (what/when-to-use/returns) per the cited baseline.
- **AC-B2 [MUST]** `list_esg_pages` and `list_esg_resources` return pagination metadata (`count`, `has_more`, `next_offset`) without breaking the existing response shape (fields added, none removed).
- **AC-B3 [MUST]** Tool errors return a structured envelope `{ error: { code, message, retryable, hint } }` for at least: not-found page, invalid input, upstream API failure.
- **AC-B4 [SHOULD]** `mcp-server` version bumped, README updated with the new behaviors, and each change verified by a live MCP call.

### WS-C: Content accuracy & sources (pilot)

- **AC-C1 [MUST]** Pilot scope = the `standards` section (33 pages). Each pilot page gets a `## References` section in the documented format (publisher — title — verified-live URL), or its existing one completed to that format.
- **AC-C2 [MUST]** For each pilot page, key factual claims (definitions, dates, requirement statements) are verified against primary sources (standard-setters: GRI, IFRS, EFRAG, ISO, TCFD/FSB, TNFD) using MCP research; corrections applied with the source documented; an accuracy log per page committed to the spec folder.
- **AC-C3 [MUST]** A repeatable `content-review-methodology.md` documents the per-page review procedure (claim extraction → primary-source verification → References format → accuracy log) for future batches.
- **AC-C4 [SHOULD]** Every URL written into pilot content verified live (200 or documented bot-block) at write time.

### Deployment & documentation

- **AC-D1 [MUST]** All sources used (best-practice research + per-page verification) documented in `specs/ux-mcp-content-bestpractice/references.md` with full URLs before any deployment.
- **AC-D2 [MUST]** CI green + preview/prod E2E pass after changes; content changes deploy via normal merge (DB content deploys immediately).

## Non-Functional Requirements

- Research-driven: every design decision cites the gathered best-practice sources (References section in spec artifacts)
- Reversible: content backups before mutation (per-page dumps in spec folder)
- Repeatable: methodology usable for the remaining 321 pages in future iterations

## Out of Scope

- Visual redesign, branding, new page types, or new sections
- The other 321 pages beyond the pilot (future batches per methodology)
- zh/hi translation of refined content (existing auto-translate flow handles later)
- SurrealDB's official MCP server evaluation (noted in log-review as future option)
- Schema changes (new fields) — content-level only

## Open Questions

- [RESOLVED] Research baselines gathered (IA/UX + MCP design, cited)
- [RESOLVED] Pilot = `standards` section (33 pages) — highest citation sensitivity
- [OPEN] Cross-reference population: run existing `generate-cross-references*.mjs` (may be stale/broken — verify first) vs write a small scoped generator for the pilot section — decide in plan.md

## References (research sources, full list in references.md at Gate 2)

- IA/UX: careerfoundry IA guide, document360 knowledge-base IA, webstyleguide.com IA chapter, Yale IA principles, justinmind IA/UX guide, Figma IA resource, ux247 IA best practices
- MCP: philschmid MCP best practices, metorial MCP practices, docker MCP best practices, nordicapis MCP development tips, awslabs MCP DESIGN_GUIDELINES, snyk MCP best practices
