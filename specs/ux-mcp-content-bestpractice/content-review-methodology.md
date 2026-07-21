# Content Review Methodology — ESG Hub Articles

Repeatable per-page review procedure (WS-C, AC-C3). Designed for the `standards` pilot (33 pages); reusable for all remaining sections in future batches.

## Per-page procedure (6 steps)

### 1. Extract

Fetch the page record (`title`, `permalink`, `content`) via `/sql` (use `scripts/lib/db-env.mjs` for credentials). Write a pre-mutation backup to `specs/ux-mcp-content-bestpractice/backup/<permalink-slug>.md`.

### 2. Claim inventory

List the page's key factual claims (max ~8): definitions, issuing/governing bodies, dates & versions, requirement statements, market figures. Each claim gets an ID (`P<page>-C<n>`).

### 3. Verify against primary sources

Research each claim using MCP tools (perplexity_ask / perplexity_search for synthesis, brave_web_search for URL checks), **primary sources only**:

| Standard body | Domain |
|---------------|--------|
| GRI | globalreporting.org |
| IFRS/ISSB | ifrs.org |
| EFRAG/ESRS/CSRD | efrag.org, eur-lex.europa.eu, finance.ec.europa.eu |
| ISO | iso.org |
| TCFD (archived) | fsb-tcfd.org |
| TNFD | tnfd.global |
| GHG Protocol | ghgprotocol.org |
| SBTi | sciencebasedtargets.org |
| PCAF | carbonaccountingfinancials.com |
| CDP | cdp.net |
| SASB | sasb.org (now ifrs.org — ISSB consolidated SASB) |
| PRI | unpri.org |
| SFDR/EU Taxonomy/EU ETS/Fit for 55 | eur-lex.europa.eu, climate.ec.europa.eu |
| OECD | oecd.org |
| ILO | ilo.org |
| UN Global Compact / UNGPs | unglobalcompact.org, ohchr.org |
| GRESB | gresb.com |
| SBTN | sciencebasedtargetsnetwork.org |

Verdict per claim: `confirmed` / `corrected` (with old → new text) / `flagged` (uncertain — note for maintainer).

### 4. Correct

Apply corrections minimally — claim text only; never restructure the article, never touch translated fields (`*_zh`, `*_hi`), never change `title`/`permalink`.

### 5. References section

Append (or complete) a `## References` section at the end of the article body, in this locked format:

```markdown
## References

- [Publisher — *Document Title*](URL) — one-line note on what it supports
```

Rules: primary sources first; every URL verified live (HTTP 200, or documented bot-block 403/415/429/202) at write time; preserve existing live links; never invent citations.

### 6. Log

Append a per-page entry to `specs/ux-mcp-content-bestpractice/accuracy-log.md`:

```markdown
## <permalink> — <title> (YYYY-MM-DD)

| Claim | Verdict | Source |
|-------|---------|--------|
| <claim summary> | confirmed/corrected/flagged | <publisher, doc, URL> |

References added: <n> (URLs verified: <status>)
Notes: <anything flagged>
```

## Tooling

`scripts/review-pilot-content.mjs`:
- `--fetch <permalink>` — backup + dump current content to `specs/.../work/<slug>.md`
- `--apply <permalink> --file <path>` — validate (must contain `## References`; every URL in it live-checked) → UPDATE → re-verify
- `--status` — pilot progress (which pages have `## References`)
- `--dry-run` (default for `--apply`) — print the exact diff without writing; pass `--apply --write` to mutate

## Batch discipline

Sub-batches of ~7 pages. After each batch: spot-render one page on prod and confirm the References section displays. Backups before every mutation. zh/hi translations are a documented follow-up (auto-translate flow), not part of the review.
