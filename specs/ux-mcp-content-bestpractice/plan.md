# Implementation Plan — Best-Practice Architecture & Content Program

Status: Draft (Gate 2 pending)
Version: 1.0
Last updated: 2026-07-21
Spec: `specs/ux-mcp-content-bestpractice/spec.md` · Constitution: `constitution.md`

## WS-A: UX/IA Architecture (AC-A1…A3)

### A1 — Architecture review document

`architecture-review.md` structure: baseline summary (cited) → current-state inventory (routes, nav, components, article render pipeline — from code, not prose) → gap table (baseline row ↔ evidence ↔ priority) → prioritized refinement list. Evidence-linked: every gap cites a file path or DB query result.

### A2 — Cross-reference graph population (pilot)

**Decision: scoped generator for the pilot section** (not the legacy `generate-cross-references*.mjs` — those target all 354 pages with unverified heuristics and are out of pilot scope).

`scripts/generate-cross-references-pilot.mjs` design:
- Input: section name (default `standards`)
- Related-pages scoring per page pair within the section: shared `standards` tags (via the `standards` array field where present), shared `keywords`, same `pillar`, title-token overlap (Jaccard > threshold)
- Output: top-5 `related_pages` (permalinks) per page; `backlinks` derived as the reverse map for pilot pages
- `--dry-run` default (prints assignments); `--apply` writes with a pre-mutation content dump to the spec folder; idempotent (recompute → same result)
- Verification: DB query shows `array::len(related_pages) > 0` for all pilot pages; a spot-checked page renders the Related Topics block with real links

### A3 — Leads + rendering convention

- `architecture-review.md` documents the article-template convention (lead → TOC → body → References → Further Reading → See Also) and how the current renderer maps to it
- The 9 thin-description pages (`string::len(description) < 50`) get proper 1–2 sentence leads written from their content — listed in the accuracy log

## WS-B: MCP Server Refinement (AC-B1…B4)

All changes in `mcp-server/src/index.ts` (+ README, version bump to 1.1.0). Backwards-compatible: no tool removed, no required param added, no response field removed.

| Change | Design |
|--------|--------|
| **B1 annotations + descriptions** | `server.tool(name, { description, annotations: { readOnlyHint: true, openWorldHint: false } }, schema, handler)` per the MCP SDK's annotated signature. Descriptions rewritten to what/when/returns format per baseline (e.g., `search_esg`: "Full-text keyword search across all ESG Hub articles and external resources (BM25). Use when the user asks to find ESG information by topic or keyword. Returns ranked results with title, url, snippet, source type.") |
| **B2 pagination metadata** | `list_esg_pages` / `list_esg_resources` handlers: fetch `limit+1` rows from the REST API, return `{ items, pagination: { count, offset, has_more, next_offset } }` — `items` keeps the current array shape |
| **B3 error envelope** | `toolError(code, message, retryable, hint)` helper returning `{ error: { code, message, retryable, hint } }` as the tool result (isError: true per MCP SDK). Applied to: page-not-found (`get_esg_page`), Zod/API validation failures, upstream REST non-200 (retryable: true for 5xx/timeout, false for 4xx) |
| **B4 docs + version** | README tool table updated with annotations/pagination/errors; `package.json` → 1.1.0; `dist/` rebuilt (`tsc`) and committed |

Live verification per tool: call via a small node MCP client script (or `opencode mcp` once wired) — check annotations surface in tools/list, paginated shape, and one error envelope.

## WS-C: Content Pilot — `standards` Section (AC-C1…C4)

### Per-page methodology (documented in `content-review-methodology.md`)

1. **Extract**: page record (title, permalink, content) via `/sql`
2. **Claim inventory**: list the page's key factual claims (definitions, issuing bodies, dates, requirement statements) — max ~8 per page
3. **Verify**: MCP research (perplexity/brave) against **primary sources only** (gri.org, ifrs.org, efrag.org, iso.org, fsb-tcfd.org, tnfd.global, sec.gov, eur-lex.europa.eu); each claim marked `confirmed` / `corrected` / `flagged`
4. **Correct**: apply corrections minimally (claim text only, never restructuring)
5. **References**: append/complete `## References` section in the locked format
6. **Log**: per-page entry in `accuracy-log.md` (claims checked, verdicts, sources used, URLs verified-live status)

### References section format (locked)

```markdown
## References

- [Publisher — *Document Title*](URL) — one-line note on what it supports
```

Rules: primary sources first; every URL verified live at write time (200 or documented bot-block); existing live links preserved; no invented citations.

### Execution

- `scripts/review-pilot-content.mjs` drives steps 1/5 (fetch, References append, backup, UPDATE) with `--dry-run`; the research/verification steps 2–4 are agent-executed per page (MCP research), with the script applying the documented edits
- Pre-mutation dump per page in `specs/ux-mcp-content-bestpractice/backup/`
- Pages processed in sub-batches with a live check after each (rendered page shows References)

## Deployment & Docs (AC-D1, D2)

- `references.md`: seeded with the two research citation lists; appended with every per-page verification source before merge
- Deploy: MCP + code changes via PR (CI green, preview E2E); DB content changes are immediate on UPDATE (force-dynamic), verified on prod after each sub-batch

## Risks

| # | Risk | Mitigation |
|---|------|------------|
| R1 | Cross-ref scoring produces noisy/irrelevant links | top-5 cap, Jaccard threshold, dry-run human review of pilot assignments before apply |
| R2 | Research APIs rate-limited during 33-page verification | sub-batches (5–8 pages), perplexity/brave alternation, cache notes in accuracy log |
| R3 | MCP annotation API shape differs by SDK version | check SDK type defs in node_modules before writing; fallback: plain fields accepted by the current SDK |
| R4 | Content edits clash with auto-translate flow | pilot edits EN-only; translation scripts rerun is a documented follow-up, not part of this spec |

## Sequencing (for tasks.md)

WS-B (MCP, self-contained) → WS-A1/A3 (review doc, leads) + WS-C pilot (largest, sub-batched) → WS-A2 (cross-ref generator) → deploy + references.md final → validate.
