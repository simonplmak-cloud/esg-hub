# Tasks — ESG Hub KM Transformation, Phase 1

Status: Approved (Gate 3 — 2026-07-24)
Version: 0.1
Last updated: 2026-07-24

## Legend

- **ID**: `WS-NN` (workstream + sequential number)
- **Pri**: MUST | SHOULD (from spec ACs)
- **Depends**: task IDs that must complete first
- **Verify**: how to confirm the task is done

---

## WS-A: KM Data Model

### A01 — Create idempotent schema migration script
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/setup-km-schema.mjs` (new) |
| Depends | — |
| ACs | AC-A1 |

**What:** One script that runs `DEFINE TABLE IF NOT EXISTS` for all 7 tables + 5 RELATION types per spec WS-A SurrealQL. `DEFINE FIELD IF NOT EXISTS last_verified ON page TYPE option<datetime>`. `DEFINE INDEX IF NOT EXISTS` for all FULLTEXT, HNSW, and UNIQUE indexes. 2 `DEFINE EVENT IF NOT EXISTS` triggers. 4 `DEFINE FUNCTION IF NOT EXISTS` scoring functions. Outputs summary: "created: X, already-exists: Y".

**Verify:** Run script twice against live SurrealDB. Second run outputs "already-exists" for all items. `pnpm verify:db` passes (after A01).

---

### A02 — Extend CI schema verification
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/verify-db-schema.mjs` (modify) |
| Depends | A01 |
| ACs | AC-A1, AC-A2 |

**What:** Add checks to existing `verify-db-schema.mjs`: all 7 KM tables exist, all 5 RELATION types exist with FROM/TO constraints, all FULLTEXT indexes, all HNSW 384d indexes, all UNIQUE `(in, out)` indexes, `page.last_verified` field exists.

**Verify:** Run `pnpm verify:db`. Passes against live DB after A01 migration applied. Fails with meaningful message if any schema item missing.

---

### A03 — Seed controlled vocabularies
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/seed-km-vocab.mjs` (new) |
| Depends | A01 |
| ACs | AC-A2 |

**What:** Insert facet vocabulary enum values into SurrealDB field assertions for all content-bearing tables. Seed data from spec AP-5: 12 topics, 8 industries, 16 frameworks, 9 jurisdictions, 6 stakeholders, 6 content_types. Uses `ALTER TABLE ... DEFINE FIELD facets ON TABLE ... TYPE object` with ASSERT constraints.

**Verify:** Attempt to insert a record with an invalid facet value → SurrealDB rejects with assertion error. Insert with valid values → succeeds.

---

### A04 — Seed source registry table
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/seed-km-sources.mjs` (new) |
| Depends | A01 |
| ACs | AC-A1 |

**What:** Backfill `source` table from `SELECT DISTINCT domain FROM external_resource` (46 domains). UPSERT each with manually assigned `institution_weight`, `publisher_reputation`, `recency_bonus`. Add 5 API sources: OpenAlex, OECD SDMX, UN SDG, EUR-Lex, Open-Meteo. Set `fetch_schedule`, `fetch_method`, `is_active`.

**Verify:** `SELECT count(*) FROM source` returns ≥ 51 rows. `SELECT * FROM source WHERE is_active = true AND fetch_method IN ['api', 'scrape']` returns ≥ 10 active sources.

---

### A05 — Backfill standards pages to framework records
| Field | Value |
|-------|-------|
| Pri | SHOULD |
| Files | `scripts/backfill-standards.mjs` (new) |
| Depends | A01, A03, A04 |
| ACs | AC-A3 |

**What:** Query all pages in `section = 'standards'` (33 pages). For each: CREATE `framework` record with title, description, permalink, facets. Keyword-extract terms from page content via controlled vocabulary matching → `RELATE framework:xxx->defines->term:yyy`. Dry-run first, show counts.

**Verify:** `SELECT *, ->defines->term FROM framework` returns non-empty traversals for ≥ 20 frameworks.

---

### A06 — Migrate related_pages arrays to RELATION edges
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/migrate-crossrefs-to-edges.mjs` (new) |
| Depends | A01 |
| ACs | AC-A1 |

**What:** For each page with `related_pages` array (1,663 links): iterate → `RELATE page:xxx->related_to->page:yyy SET relationship_type = 'cross_reference', score = 0.5`. UNIQUE index prevents duplicates. Dry-run first: count edges-to-create, sample 10. Arrays remain on `page` records (AP-1).

**Verify:** `SELECT count(*) FROM related_to` ≥ 1,500. `SELECT count(*) FROM page WHERE related_pages IS NOT NULL` unchanged (arrays preserved).

---

## WS-B: Search + Write Endpoints

### B01 — Implement Stage 1 RRF fusion + Stage 2 percentile re-rank
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `src/lib/search/hybrid.ts` (new), `src/lib/search/types.ts` (new), `src/app/api/v1/search/route.ts` (modify) |
| Depends | A01, A04 |
| ACs | AC-B1 |

**What:** Add `mode` query param to existing search route. Mode=keyword: existing path unchanged. Mode=hybrid: Stage 1: `queryHttpAll()` runs BM25 + HNSW in one round-trip → `search::rrf(k=60)` → merged rank list. Stage 2: percentile-rank `text`, `framework_match` (Jaccard with controlled vocabulary), `topic_match` (cosine similarity). Authority and freshness used directly. Weight 0.40/0.20/0.15/0.15/0.10. Response: `{ results, pagination, mode: "hybrid" }`. Write Vitest unit test (`hybrid.test.ts`) with known-rank inputs and expected RRF scores.

**Verify:** `GET /api/v1/search?mode=hybrid&q=climate+change` returns ranked results. `mode=keyword&q=climate+change` returns same results as before (backwards compat). Vitest: `npx vitest run src/lib/__tests__/hybrid.test.ts` passes.

---

### B02 — Implement write REST endpoints
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `src/app/api/v1/terms/route.ts` (new), `src/app/api/v1/frameworks/route.ts` (new), `src/app/api/v1/pages/[id]/facets/route.ts` (new), `src/lib/auth/write-token.ts` (new), `src/lib/middleware/rate-limit.ts` (new) |
| Depends | A01 |
| ACs | AC-C2 |

**What:** POST /api/v1/terms: validate schema → Bearer token check → INSERT content_enhancement_log (pending) → return proposal_id. GET /api/v1/terms: list with limit/offset/q, force-static + revalidate=3600. GET /api/v1/frameworks: same pattern. PATCH /api/v1/pages/[id]/facets: validate vocab → token check → UPDATE page.facets → return record. All routes: `export const runtime = "nodejs"`, OPTIONS handler, structured error envelope, CORS headers. Write-token validation via constant-time comparison with `ESG_HUB_WRITE_TOKEN` env var. Rate limiter: in-memory lru-cache, 50 req/5min/IP.

**Verify:** POST with invalid token → 401. POST with valid token → 200 + proposal_id. PATCH with invalid facet value → 400 + validation error. GET /api/v1/terms returns ISR-cached response (verify Cache-Control headers). Vitest: `rate-limit.test.ts` and `write-token.test.ts` pass.

---

### B03 — Switch AI search RAG to hybrid retrieval
| Field | Value |
|-------|-------|
| Pri | SHOULD |
| Files | `src/app/api/ai-search/route.ts` (modify) |
| Depends | B01 |
| ACs | AC-B2 |

**What:** Replace `mergeAndRank(bm25, vector)` call with import of `hybrid.ts` Stage 1+2 functions (or internal fetch to `/api/v1/search?mode=hybrid`). Same RAG prompt construction, same SSE streaming response. No user-facing change.

**Verify:** POST to `/api/ai-search` with query "scope 3 emissions" → returns source citations + AI-generated answer. Existing AI search behavior preserved (sources before streaming answer).

---

### B04 — Create search evaluation benchmark
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/eval-search.mjs` (new) |
| Depends | B01, A05 |
| ACs | AC-B1 |

**What:** 30 hand-labeled queries covering practitioner workflows: 10 framework lookups ("what is GRI 305"), 10 definition searches ("double materiality"), 5 regulation searches ("CSRD scope 3"), 5 comparison intents ("ESRS vs ISSB"). Labels: top-10 results per query marked relevant/not-relevant. Computes nDCG@10 + MRR. Asserts nDCG@10 ≥ 0.6, MRR ≥ 0.5. Output: per-query scores + aggregate + failing queries.

**Verify:** `node scripts/eval-search.mjs` outputs "PASS" or "FAIL: nDCG=0.42 (threshold 0.60)". 30 labeled queries stored in `specs/esg-hub-km-transformation/eval-queries.json`.

---

## WS-C: MCP Server v1.2.0

### C01 — Add read tools to MCP server
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `mcp-server/src/index.ts` (modify), `mcp-server/package.json` (modify) |
| Depends | B01, B02 |
| ACs | AC-C1, AC-C3 |

**What:** Register 5 new tools: `search_content` (wraps `GET /api/v1/search?mode=hybrid`), `get_term` (GET /api/v1/terms + graph traverse for related), `get_related` (GET /api/v1/pages/:id/related + GET /api/v1/terms filtered), `list_frameworks` (GET /api/v1/frameworks), `list_industries` (inline enumeration). All carry `readOnlyHint: true`, pagination where applicable, structured error envelope (matching v1.1.0 pattern). Bump package.json version to `1.2.0`. Verify v1.1.0 tools (`search_esg`, `get_esg_page`, `get_esg_metadata`, `list_esg_pages`, `list_esg_resources`) are untouched and still register.

**Verify:** `tools/list` returns 10 tools (5 old + 5 new). `search_content "greenhouse gas"` returns hybrid-ranked results with pagination. Existing v1.1.0 tools return same response shape as before.

---

### C02 — Add write tools to MCP server
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `mcp-server/src/index.ts` (modify), `mcp-server/.env.example` (new) |
| Depends | B02, C01 |
| ACs | AC-C2 |

**What:** Register 2 write tools: `propose_term` (POST /api/v1/terms with Bearer token), `tag_content` (PATCH /api/v1/pages/:id/facets with Bearer token). Annotations: `readOnlyHint: false`, `destructiveHint: false`, `idempotentHint: false`. Token from `ESG_HUB_WRITE_TOKEN` env var (server-owned upstream credential, not client token — MCP spec compliant). Structured error handling: 401/429/400 with error envelope. `.env.example` lists `ESG_HUB_API_BASE` and `ESG_HUB_WRITE_TOKEN` as placeholders.

**Verify:** `propose_term` with missing/invalid token → isError: true, "Write token missing or invalid." With valid token → returns proposal_id. `tag_content` with invalid facet value → validation error. `.env.example` committed to repo (token names only, no values).

---

## WS-D: Agent Skills

### D01 — Create 4 agent skills
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `.opencode/skills/esg-taxonomy-tagging/SKILL.md` (new), `.opencode/skills/esg-relevance-ranking/SKILL.md` (new), `.opencode/skills/esg-glossary-writer/SKILL.md` (new), `.opencode/skills/esg-source-authority-review/SKILL.md` (new), `AGENTS.md` (modify) |
| Depends | C01 |
| ACs | AC-D1, AC-D2 |

**What:** Each skill: `name:` matching directory, `description:` one-liner, purpose, trigger keywords, required MCP tools with usage guidance, I/O JSON Schema, one worked example using real ESG Hub page data (per spec WS-D examples). AGENTS.md update: add `## Agent Skills` section listing all 4 skills.

**Verify:** Skills load in opencode (skill tool invocation returns the skill content). AGENTS.md contains the 4 skill references. Each worked example references real ESG Hub page slugs/IDs.

---

## WS-E: Auto-Enhancement Engine

### E01 — Build shared pipeline libraries
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/lib/pipeline-fetcher.mjs` (new), `scripts/lib/pipeline-normalizer.mjs` (new), `scripts/lib/pipeline-llm.mjs` (new), `scripts/lib/pipeline-embedder.mjs` (new) |
| Depends | A01 |
| ACs | AC-E1 |

**What:**
- **Fetcher**: HTTP fetch with retry (3 attempts, capped exponential backoff with random jitter), per-domain rate limiting, checksum computation (SHA-256), ETag/Last-Modified tracking for conditional requests. Honor robots.txt (RFC 9309). Timeout: connect=10s, read=30s. Response size limit: 10MB. Canonical-URL deduplication.
- **Normalizer**: cheerio for static HTML → DOM tree. Mozilla Readability for article-text candidates (used as one view only; source-specific selectors preserve tables, lists, footnotes, annexes, and numbered definitions that Readability would strip — critical for regulatory documents). Playwright fallback (opt-in per source via is_js_rendered flag on source table). Unicode NFC + whitespace normalization. **Critical: source_span offsets computed on the same canonical normalized text stream, not on raw HTML — retain a raw↔canonical offset map so extracted spans are always verifiable.** JSON/XML direct parse.
- **LLM**: DeepSeek-chat extract call with response_format=json_object, temperature 0.1. DeepSeek-reasoner verify call. Prompt templates with controlled vocabulary injection. Schema validation on response. Check `finish_reason` — treat "length" (truncation) as retry with increased max_tokens. Retry logic (1 retry on 429 with 30s backoff, 1 retry on malformed/truncated JSON, quarantine with log entry on persistent failure).
- **Embedder**: fastembed-js initialization with BAAI/bge-small-en-v1.5. Batch embed function. Golden vector gate: embed a stratified 100-page corpus + 30 labeled queries via both browser and server pipeline. Verify: cosine>0.999, top-10 overlap>95%, labeled nDCG@10 within 0.02, AND per-slice (page type, length, language) retrieval metrics within threshold. Minimum 5 queries per slice. Report confidence intervals. Dual-write both indexes during migration; atomic alias switch; old index retained for rollback until post-cutover monitoring confirms stability. Store model_revision_hash + onnx_version + preprocessing_hash with each vector.

**Verify:** Each module importable from `scripts/km-ingestion.mjs`. Fetcher: returns text content for a known URL. Normalizer: strips HTML tags, extracts main content. LLM: returns valid JSON matching schema from a test prompt. Embedder: golden vector gate passes before first production use.

---

### E02 — Build ingestion pipeline script
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/km-ingestion.mjs` (new), `.github/workflows/km-ingestion.yml` (new) |
| Depends | E01, B02, A02, A04 |
| ACs | AC-E1, AC-E4, AC-E5 |

**What:** Pipeline driver per WS-E design. ACQUIRE: GH concurrency + SurrealDB atomic lease with fencing token (CREATE lease with unique owner_id + fencing_token; atomic conditional takeover on expiry; protected writes include fencing_token in WHERE to prevent stale writes after takeover per Kleppmann 2016). ENQUEUE: load sources from source table. FETCH: pipeline-fetcher per source. LLM: extract → normalize (with deterministic pre-verification) → verify (if confidence<0.8) → propose (POST /api/v1/terms + SurrealDB insert for external_resource + fastembed-js embed). REPORT: update scrape_job. Cron: `17 6,18 * * *`, timeout 240min, secrets as env vars. workflow_dispatch fallback.

**Verify:** Run `workflow_dispatch` against 1-2 test sources. Verify `scrape_job` record exists with status=done, `completed_at` populated. Verify `content_enhancement_log` has pending proposals linked to the job. Verify `external_resource` has new records from API sources.

---

### E03 — Build R&D loop script
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/km-rd-loop.mjs` (new), `.github/workflows/km-rd-loop.yml` (new) |
| Depends | E01, B02, A06 |
| ACs | AC-E2, AC-E4, AC-E5 |

**What:** R&D driver per WS-E design. ACQUIRE: same pattern. SELECT: pages stratified by content type (standards: 30d, other: 60d), oldest first. VERIFY: link freshness (HEAD → follow 3xx redirects → on 200: record final URL; on 405/501: fall back to range GET bytes=0-0; distinguish 401/403/429 from dead links; honor Retry-After; soft-404 via bounded body sample + normalized text similarity, not just hash). Claim re-check (Perplexity direct API with response_format=json_schema containing verdict enum + citations; freeze preset config for reproducible runs; independently verify citation URLs are accessible). Cross-ref consistency (RELATION edges). Claim-level tracking (content_enhancement_log with target_table="claim"). PROPOSE: POST/PATCH to REST endpoints. Cron: `13 4 * * *`, timeout 120min.

**Verify:** Run `workflow_dispatch` against 1-2 known pages. Verify link check results in content_enhancement_log. Verify claim verification produces verdict+snapshot entries. Verify `page.last_verified` updated.

---

### E04 — Build review approval CLI
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/review-enhancements.mjs` (new) |
| Depends | E02, E03, B02 |
| ACs | AC-E3 |

**What:** CLI with --list/--show/--approve/--reject commands per plan.md E-3. Approve: dry-run by default (shows diff, asks y/N), --force skips. Applies diff to target record (direct SurrealDB UPDATE or REST PATCH). Updates content_enhancement_log status + reviewer + reviewed_at. Calls revalidatePath('/api/v1/terms'). Reject: immediate, updates status + notes.

**Verify:** `--list` shows pending proposals. `--approve <id>` (with y confirmation) applies diff to target record, log updated to approved. `--reject <id> --note "reason"` updates log to rejected. `--list --status approved` shows the approved entry.

---

### E05 — Build pipeline evaluation script
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/eval-pipeline.mjs` (new) |
| Depends | E04 |
| ACs | AC-E5 |

**What:** Load content_enhancement_log entries with status approved/rejected. Group by job_id → pair extractor confidence with human outcomes. Compute ECE + Brier score + field-level precision/recall/F1 + approval rate. Slice by source_type, model_version, extraction_field. Rolling 30-day windows with minimum sample count: ≥10 per window per slice (output "insufficient data" below threshold). Report confidence intervals. Alert if ECE > 0.15 OR any field F1 drops >0.05 below baseline — only when sample threshold met.

**Verify:** Run with ≥10 approved+rejected entries → outputs ECE score + field-level metrics + PASS/FAIL status. With <10 entries: outputs "insufficient data."

---

### E06 — Build manual lock release script
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `scripts/release-km-lock.mjs` (new) |
| Depends | E02 |
| ACs | AC-E1 (pipeline reliability) |

**What:** CLI script for exceptional lock recovery. Checks if lease exists and is expired. If owner matches current run ID OR lease is expired → DELETE. If lease is live and owned by another run → refuses (requires --force). Audit-logs every release to stdout.

**Verify:** Create a test lease with expired timestamp → script releases it. Create a test lease with future timestamp and different owner → script refuses. --force overrides.

---

## Integration

### I01 — CI wiring
| Field | Value |
|-------|-------|
| Pri | MUST |
| Files | `.github/workflows/ci.yml` (modify), `.github/workflows/nightly.yml` (modify), `package.json` (modify) |
| Depends | A02, B04, E05 |
| ACs | All |

**What:**
- `ci.yml`: add `eval-search` job (non-blocking, runs `pnpm eval-search`), add `verify:db` job (already exists, now covers KM tables via A02)
- `nightly.yml`: add `eval-pipeline` job (non-blocking, runs `pnpm eval-pipeline`)
- `package.json`: add scripts `eval-search`, `eval-pipeline`, `seed-km-vocab`, `seed-km-sources`, `backfill-standards`, `migrate-crossrefs`, `review-enhancements`, `release-km-lock`

**Verify:** `pnpm eval-search` runs in CI. `pnpm verify:db` covers KM tables. `pnpm eval-pipeline` runs in nightly.

---

## Task Dependency Graph

```
A01 ──► A02 A03 A04 A06
 │
 ├─ A02 ──► I01
 ├─ A03 ──► A05
 ├─ A04 ──► A05 B01 E01
 ├─ A06 ──► E03
 │
 ├─ B01 ──► B03 B04 C01
 │
 ├─ B02 ──► C01 C02 E02 E03 E04
 │         │
 │         ├─ C01 ──► C02 D01
 │         ├─ C02
 │         ├─ D01 ──► I01 (skills in AGENTS.md)
 │         │
 │         ├─ E01 ──► E02 E03
 │         ├─ E02 ──► E04 E06
 │         ├─ E03 ──► E04
 │         ├─ E04 ──► E05
 │         └─ E05 ──► I01
 │
 └─ B04 ──► I01
```

**Parallelizable pairs:**
- A03 + A04 + A06 (all depend on A01 only)
- B01 + B02 (both depend on A01, independent of each other)
- E02 + E03 (both depend on E01 + B02, independent of each other)
- C01 + E01 (both depend on B01+B02, independent of each other)
- D01 + E04 (D01 depends on C01, E04 depends on E02+E03 — not directly parallel but independent chains)

---

## Completion Gates

| Gate | Tasks required | What it verifies |
|------|---------------|-----------------|
| **Search works** | A01, A04, B01, B04 | Hybrid search returns ranked results with nDCG≥0.6 |
| **API complete** | A01, A03, B02 | Write+read endpoints functional, auth enforced, ISR caching |
| **MCP ships** | B01, B02, C01, C02, D01 | 12 tools total (5 old + 7 new), skills load, write tools gated |
| **Pipeline runs** | A01, A02, A04, E01, E02, E03 | Ingestion + R&D workflows produce proposals in review queue |
| **Human gate** | E02, E03, E04 | Admin can list, approve, reject proposals with audit trail |
| **CI gates** | A02, B04, E05, I01 | verify:db, eval-search, eval-pipeline all run in CI |
