# ESG Hub → The Professional's ESG Knowledge Hub — Human + AI

Status: Approved (Gate 1 — 2026-07-24)
Version: 0.5 (all constraints solved: percentile re-rank, deterministic pre-verification, evidence-based claim confidence, stratified R&D loop, golden embedding gate)
Last updated: 2026-07-24

## Overview

Position the ESG Hub between **Wikipedia** (general-public encyclopedia) and the **Bloomberg Terminal** (paid financial-professional platform): a free, professionally reliable ESG knowledge management (KM) system serving the daily workflows of ESG practitioners — analysts, reporting managers, compliance officers, investors — and available to both humans and AI agents. Built as a graph-modeled, hybrid-retrieval, continuously self-enriching knowledge base on SurrealDB 3.2, with a mandatory **automatic content-enhancement engine** that improves the KB on an ongoing schedule. All compute runs on GitHub Actions — never the local machine.

## UX Principle: Practical Workflows, Not Bells

Perplexity + Brave research (2026-07-24, citing Bloomberg ESG Terminal docs, professional ESG platform comparisons, and ESG practitioner workflow guides — see `references.md`) identified **what ESG professionals actually do day-to-day** vs what Wikipedia provides:

| Practitioner need | Wikipedia response | What a professional hub needs |
|-------------------|-------------------|-------------------------------|
| "What's the GRI standard for emissions?" | An article explaining GRI 305 | A lookup returning the standard's **text** + **crosswalk to ISSB S2** + **which companies/jurisdictions apply it** |
| "What do I need to report under CSRD for my industry?" | An article on CSRD | A **jurisdiction x industry x framework matrix** returning the specific disclosure fields |
| "Is this claim in our report defensible?" | An article (may or may not have citations) | A **source-traced fact**: claim -> primary document -> verified date |
| "How does Company A compare to peers on Scope 3?" | No answer (not company-level) | A **structured fact-card** with the metric, the source, and peer benchmarks |
| "What changed in the EU Taxonomy this year?" | A general update article | A **diff-ready, structured update** linked to the previous revision + the amending regulation |

**Design rule:** every feature must serve a reproducible practitioner workflow (look-up -> compare -> verify -> comply -> report). Avoid speculative "AI-powered" additions that don't map to these workflows.

Input specs considered: `km_doc_tmp/ESG KM System Architecture on SurrealDB 3.x.md` and `km_doc_tmp/esg-hub-km-opencode-spec.md`.

## Research Baseline

**KM architecture (km_doc_tmp, SurrealDB 3.x verified live)**: single multi-model store (documents + graph + vectors + FTS + file pointers); typed graph edges as full documents; hybrid retrieval via `search::rrf()`; 24x7 ingestion with dedup/versioning; record-level permissions.

**Instance capabilities verified 2026-07-24**: SurrealDB **3.2.1**; `search::rrf()` works (200 OK); FTS `@` match operator works; existing indexes: BM25 FTS (`esg_analyzer`), HNSW 384d on `page.embedding` and `external_resource.embedding`.

**IA/UX + MCP baselines** (from `specs/ux-mcp-content-bestpractice/references.md`): encyclopedia article template, taxonomy+search hybrid nav, MCP tool design (annotations, pagination, error envelopes).

**Practitioner UX research** (2026-07-24, perplexity_ask + brave_web_search): ESG professionals need decision-grade, comparable, auditable data tied to portfolios/issuers/regulations — not general background reading. Bloomberg Terminal for ESG provides universal ESG profiles with scores, peer comparison, regulatory mapping, portfolio analytics, source-document drilldown, news signals, screening, report generation, workflow memory, and API export. Wikipedia provides definitions but zero professional-layer features. The ESG Hub's position: **free, professionally reliable reference hub** covering the standards/frameworks/regulations dimension with structured data and source trails — analogous to MDN for web developers.

**LLM pipeline best practices for KM content processing** (2026-07-24, perplexity_ask): state-of-the-art is **ontology-constrained extraction + multi-phase validation**, not unconstrained prompting. Key patterns: (1) two-tier model routing — cheap model for routine classification/entity typing, strong model only for ambiguous cases; (2) structured JSON outputs with schema validation post-extraction; (3) evidence-backed provenance — every extracted fact points to source span; (4) four-layer pipeline: extract -> normalize -> verify -> publish; (5) cost optimization for daily cron: batch scheduling, prompt prefix caching, output shaping to minimize tokens, semantic caching for repeated context; (6) human-in-the-loop only for high-impact mappings and glossary publication. Practical cost target: ~$0.50-2/day for a daily 100-source pipeline when using cheap routing + caching.

**Credible programmatic ESG data sources** (2026-07-24, perplexity_ask): feasible daily-fetch stack — OpenAlex (free, JSON, 100K daily, no-auth for low volume, already partially integrated in the app via `OpenAlexResearch.tsx`); OECD SDMX (free, JSON, 20 DL/hr for statistics); UN SDG API (free, JSON, 60 req/hr unauth); EUR-Lex (official EU law API, JSON; may need third-party wrapper); Open-Meteo (free, no-auth, 10K daily for climate data). IFRS/GRI/EFRAG have **no confirmed public APIs** — these must be ingested via the existing curated-domain approach (46 domains, external_resource table) plus periodic manual/semi-automated fetch of standard-setter publications. Corporate disclosure APIs (CDP, S&P, Bloomberg) are commercial, not free — out of scope for a free hub.

## Current State (2026-07-24, verified)

| Area | Exists | Gap to target |
|------|--------|---------------|
| Content | 354 pages (all References-verified), 244 external resources, cross-ref graph (1,663 links) | No glossary `term` layer, no `framework`/`industry`/`entity` model, no perspective facets |
| Search | BM25 (`/api/v1/search`), HNSW (`/api/semantic-search`), embed endpoint (bge-small, 384d), RAG (`/api/ai-search`) | No `search::rrf` fusion, no ESG-specific re-ranking |
| MCP | v1.1.0, 5 read-only tools (annotations, pagination, error envelope) | No write tools, no taxonomy/ingestion tools |
| Auto-enhancement | **nothing** | **The mandatory build** — no ingestion, no continuous enrichment |
| Agent skills | none in repo | No `.opencode/skills/` |
| Compute | GH Actions (deploy/test/nightly) — **all compute must run on GitHub, not local** | Pipeline must be cron-native, not a local 24x7 server |

---

## Full Roadmap (5 Phases)

```
Phase 1          Phase 2          Phase 3          Phase 4          Phase 5
KM Foundation    Structured       Professional     AI-Native        Open Ecosystem
                 Knowledge Layer  Workflow UX      Operations
                                                                ┌─────────────────┐
                                                ┌─────────────┐ │ • Fed APIs      │
                                ┌─────────────┐ │ • Reg change │ │ • DOI/version   │
                ┌─────────────┐ │ • Frontend   │ │   detection  │ │ • Skills mkt    │
Schema ────────>│ • Crosswalks │ │   facets     │ │ • Agent      │ │ • Community     │
+ Search        │ • Reg matrix │>│ • Entity     │>│   research   │>│   contributions │
+ Pipeline      │ • Structured │ │   profiles   │ │ • Video      │ │ • RDF/JSON-LD   │
+ MCP v2        │   glossary   │ │ • Comparison │ │   indexing   │ │                 │
+ Skills        │              │ │ • Review UI  │ │ • Multi-model│ └─────────────────┘
                │              │ │ • Export     │ │   pipeline   │
                └─────────────┘ └─────────────┘ └─────────────┘
```

### Phase 1: KM Foundation

**Goal:** the KB becomes self-enriching with a structured data layer underneath the existing encyclopedia content. Practitioners can look up standards and trace claims to sources. AI agents can read the KB and propose additions — gated through human approval.

**Delivers:** KM data model (additive to existing schema), hybrid search (BM25 + HNSW via `search::rrf()` with ESG re-ranking), mcp-server v1.2.0 (read tools + gated propose/tag write tools), 4 agent skills, auto-enhancement engine MVP (2 cron workflows: ingestion 2x daily + R&D review daily, human gate).

**Practitioner value right away:** source-traced facts become navigable. The structured glossary begins. Content self-verifies on a schedule.

### Phase 2: Structured Knowledge Layer

**Depends on:** Phase 1 schema stable + pipeline producing proposals for >=2 weeks.

**Goal:** the structured layer beneath the encyclopedia becomes comprehensive — every standard, framework, industry, and jurisdiction has a machine-readable profile. Crosswalks between frameworks are queryable. Regulatory obligations are answerable by jurisdiction x industry.

**Delivers:**
- `framework` and `industry` tables fully populated (backfill from 354 pages + auto-enrichment proposals from Phase 1 pipeline)
- Crosswalk mappings (GRI<->ISSB, ESRS<->TCFD, etc.) as structured RELATION edges with confidence scores and evidence
- Regulatory-requirement matrix: jurisdiction x industry -> disclosure obligations, phased by effective date
- Hybrid search re-rank weight updated to include `jurisdiction_match` (previously placeholder)
- New MCP tools: `list_frameworks`, `list_industries`, `get_crosswalk`, `get_regulatory_matrix`
- New agent skill: `esg-framework-crosswalk`
- Enhanced ingestion pipeline: LLM extracts framework-to-framework mappings from regulatory publications

**Practitioner value:** "What do I need to report under CSRD for my industry in Singapore?" — answerable in one structured query with disclosure-level granularity.

### Phase 3: Professional Workflow Layer

**Depends on:** Phase 2 structured data + hybrid search stable in production.

**Goal:** professional workflows become product-grade. Users compare, filter, and export. Basic entity profiles from public data appear. The review queue gets a proper UI.

**Delivers:**
- Frontend facets UI: topic, industry, framework, jurisdiction, stakeholder filters in browse + search results; facets driven by structured perspective fields from Phase 1
- Entity profiles (companies, regulators, NGOs) from public data (OpenAlex corporate affiliations, OECD institutional data, SEC EDGAR filings) — structured profiles, not real-time scores. Enrichment pipeline adds entity extraction to the ingestion workflow.
- Comparison views: framework-to-framework side-by-side (driven by Phase 2 crosswalks), entity-to-entity for publicly disclosed metrics
- Review-queue dashboard: hidden admin page at `/admin/review` — approve/reject pipeline proposals, view audit trail, annotate decisions
- Report-export: practitioner selects jurisdiction + industry -> downloads a structured disclosure-requirement summary (PDF/JSON) driven by the Phase 2 regulatory matrix
- Enhanced RAG: "Ask ESG Hub" provides source-traced answers with framework/reference crosswalk in the response. The `/api/ai-search` route becomes RAG-powered with the hybrid search as its retrieval layer (already partially in scope per Phase 1 AC-B2).

**Practitioner value:** complete workflow — search, compare, verify, comply, export — without leaving the hub or paying a terminal subscription.

### Phase 4: AI-Native Operations

**Depends on:** Stable Phase 3 product + >=3 months of pipeline economics data.

**Goal:** the enhancement engine graduates from batch cron to continuous awareness. Agents autonomously detect regulatory changes and propose KB updates. Video content is indexed and searchable. The pipeline grows a multi-model stage.

**Delivers:**
- Regulatory change detection: GH Actions cron workflow monitors EUR-Lex RSS/API feeds + key regulator publication pages -> detects new/amended legislation -> correlates to existing framework records via Phase 2 crosswalks -> proposes structured KB updates with diffs
- Agent-driven research cycles: OpenCode dispatched on batch research tasks at human direction (e.g., "verify all SFDR PAIs against the latest RTS") -> structured proposals in the review queue. Uses the MCP tools from earlier phases + Brave/Perplexity for source verification.
- Video indexing: transcripts generated via Whisper (GH Actions runner, CPU-only model) -> HNSW 384d indexing on transcript chunks -> SurrealDB 3.x bucket/file pointers for video binary storage. Text queries return timestamped video segments.
- New tables: `video_asset`, `video_transcript_chunk` with HNSW index; `video` relation type linkable to `page` records
- New MCP tool: `search_video` (hybrid over transcripts + metadata)
- New agent skill: `esg-video-curator`
- Multi-model pipeline: the 4-layer LLM pipeline (extract -> normalize -> verify -> publish) adds a second model path — transcript-to-glossary extraction, transcript-to-crosswalk extraction, frame-level embedding generation. The existing DeepSeek path for text remains; a separate prompt chain handles transcript-structured-extraction.

**Practitioner value:** regulatory change no longer catches teams by surprise — the KB flags it. Conference/webinar recordings become queryable knowledge assets. Agents handle batch regulatory research at human direction.

### Phase 5: Open Ecosystem

**Depends on:** Mature Phase 4 system with >=6 months of proven reliability + community interest.

**Goal:** the ESG Hub becomes shared infrastructure. External contributors add knowledge. Federated APIs connect to other ESG tools. The KB carries formal publication metadata.

**Delivers:**
- Public contribution workflows: external experts submit corrections, glossary entries, and crosswalks through a governed contribution pipeline (analogous to Wikipedia's edit model with ESG-grade review). Admin approval flow reuses the Phase 3 review-queue infrastructure.
- Contribution MCP tools: `propose_change` (write tool, submits to review queue with contributor identity), `review_contribution` (admin tool, approve/reject with comment)
- Federation APIs: REST endpoints serving the KB's structured data as interoperable linked data — `application/ld+json` and Turtle (RDF) output on term/framework/entity resources. Driven by the Phase 1+2 schema, reads-only.
- Formal publication metadata: versioned KB snapshots — quarterly `esg_hub_kb_vYYYY.Q` publication with a DOI (via Zenodo or DataCite), release changelog, and a formal taxonomy publication (the ESG Hub Glossary as a citable academic reference)
- Skills marketplace: community-contributed `.opencode/skills/` submissions — governed by skill templates + review. The 4 Phase 1 skills serve as canonical examples.
- New tables: `kb_release`, `contributor`; new RELATION types: `contributed_by`, `published_in_release`

**Practitioner value:** the ESG Hub as ecosystem infrastructure — the definitive, citable, interoperable ESG knowledge graph, maintained by both automated pipelines and a governed community.

---

## Cross-Phase Architecture Principles

These decisions span all 5 phases and must be respected in Phase 1 to avoid rewrites later.

### AP-1: Schema evolution is always additive

Never alter or drop existing tables or columns. New phases add tables, RELATION types, indexes, and columns to existing tables (via `DEFINE FIELD IF NOT EXISTS` — a standard SurrealDB pattern). The `page`, `external_resource`, and `book` tables from the encyclopedia era are permanent; columns may be added to them as needed. Phase 5's `kb_release` table must co-exist with Phase 1's `scrape_job` table. This is enforced by the CI `verify:db` check — it validates that every field present at launch remains present, with compatible types, in every subsequent deployment.

### AP-2: One MCP server, layered tool sets

The existing `mcp-server/` package grows versioned tool sets — not separate packages. Each phase adds a layer:

```
mcp-server v1.1.0  (read: search, list, get page/resource)
mcp-server v1.2.0  (+read: hybrid search, term, related, list frameworks/industries — +write: propose_term, tag_content)  [Phase 1]
mcp-server v1.3.0  (+read: crosswalk, regulatory matrix — +write: propose_crosswalk)                                      [Phase 2]
mcp-server v1.4.0  (+read: search_video, get_entity — +write: propose_change, review_contribution)                        [Phase 4-5]
```

Tool names never change (only add). Response shapes gain fields; existing fields keep their types. Version bumps are minor (additive tools only) per semantic versioning — major versions (v2.0.0) are reserved for breaking changes. The pagination and error envelopes (v1.1.0) remain the standard for all versions. Server semver is separate from the MCP protocol date version (e.g., `2025-11-25`) which is negotiated independently.

### AP-3: Pipeline framework scales with phases

Phase 1: two GH Actions cron workflows driving node scripts + LLM API calls. This is deliberately simple — GitHub's 6-hour runner limit, 20 concurrent job cap, and free-tier minutes are ample for daily batch ingestion at the target scale (hundreds of sources, not millions).

Phase 2+: the framework stays GH Actions cron but adds:
- **Job fan-out:** a controller workflow dispatches parallel `matrix` jobs for independent source groups (OpenAlex batch, OECD batch, domain-scrape batch) -> converge into a merge job
- **State checkpointing:** `scrape_job` records track per-source state so a 6-hour timeout resumes where it left off
- **Model routing table:** a static config map `source_type -> model` (DeepSeek-chat default, DeepSeek-reasoner for Ambiguous cases, whisper for video) — human-updatable, no dynamic router needed

No Celery, Airflow, Redis, or persistent queue server. The "queue" is the `scrape_job` table in SurrealDB, polled by the cron workflow.

### AP-4: Search is one endpoint, modes diverge

`/api/v1/search` is the single entry point for all search. The `mode` parameter selects the pipeline:

- `mode=keyword` (default, current behavior): BM25 only
- `mode=hybrid` (Phase 1): BM25 + HNSW -> rrf -> ESG re-rank
- `mode=video` (Phase 4): same hybrid but scoped to `video_transcript_chunk` index
- `mode=entity` (Phase 3): hybrid scoped to entity profiles
- `mode=regulation` (Phase 2): hybrid scoped to regulatory framework records + jurisdiction field boost

Response shape is always `{ results, pagination, mode }`. New fields (like `framework_match` or `video_timestamp`) appear when relevant; clients ignore unknown fields. This ensures existing consumers of `/api/v1/search` never break.

### AP-5: Perspective facets are the universal filter model

Every content-bearing record carries a `facets` object (defined in Phase 1 schema):

```json
{
  "topic": ["climate-change", "biodiversity"],
  "industry": ["financial-services", "energy"],
  "framework": ["gri", "issb"],
  "jurisdiction": ["eu", "global"],
  "stakeholder": ["investor", "regulator"],
  "content_type": "standard_text"
}
```

Controlled vocabularies are enumerated at the SurrealDB schema level (`DEFINE FIELD ... TYPE string ASSERT $value IN [...]`). Phases 2-5 extend the vocabulary set but never change the object shape. The Phase 3 facet UI reads this object directly. The Phase 4 regulatory-change pipeline matches new legislation to existing records by topic+framework+Jurisdiction intersection.

### AP-6: Review queue is the universal write gate

Every automated write, community contribution, and agent proposal flows through the same `content_enhancement_log` table (Phase 1) with the same status machine: `pending -> approved | rejected`. The Phase 3 admin dashboard is a UI on this table. The Phase 5 community contribution MCP tool writes to the same table with `source: "community"`. There is exactly one publish path; it is always human-gated.

### AP-7: API is versioned at the route prefix

REST routes live under `/api/v1/`. When a breaking change is unavoidable (none anticipated through Phase 5, but reserved), the new version goes to `/api/v2/` and v1 is maintained in parallel for >=6 months. MCP tool names are semantic-versioned in the server manifest but never removed — deprecation warnings in the tool description, removal only on a major version bump.

---

## Phase 1 Technical Design (build target)

### Target Architecture Diagram

```
Layer 1 — Auto-enhancement engine (GH Actions cron, all compute on GitHub)
  scrape_job queue -> fetch/normalize -> dedup(checksum) ->
  skill pipeline (authority review -> taxonomy tagging -> glossary draft) ->
  review queue (human gate) -> publish -> search/RAG refresh
  + R&D loop: scheduled re-verification of existing pages (link freshness,
    claim re-check vs updated primary sources) -> enhancement proposals

Layer 2 — KM data model (SurrealDB 3.2, additive to existing tables)
  term · framework · industry · entity · source · scrape_job ·
  content_enhancement_log + typed edges (defines/cites/regulates/applies_to)
  + perspective facets on all items

Layer 3 — Retrieval
  FULLTEXT (definitions/bodies) + HNSW (embeddings) ->
  search::rrf() fusion -> ESG re-rank (framework/jurisdiction/authority/freshness)

Layer 4 — Access
  Web UI (facets, articles) · REST /api/v1 · MCP tools (read + gated write) ·
  agent skills (.opencode/skills/)
```

### WS-A: KM Data Model

New SurrealDB tables (additive — existing `page`, `external_resource`, `book`, `sitemap_node`, `api_cache` untouched):

```
term              framework         industry          entity
source            scrape_job        content_enhancement_log

RELATION types:
  related_to   (page -> page)          — article cross-references (migrated from arrays)
  defines      (framework -> term)     — framework defines a glossary term
  cites        (page|term|framework -> external_resource|page)  — sourced claim
  regulates    (framework -> industry) — regulatory obligation
  applies_to   (term|framework -> industry|entity) — scope of applicability
```

**Full RELATION table definitions** (SurrealDB 3.2, with FROM/TO constraints, edge metadata, UNIQUE indexes for idempotency):

```surql
-- Page-to-page cross-references (migrated from existing page.related_pages arrays)
DEFINE TABLE related_to TYPE RELATION FROM page TO page SCHEMAFULL;
DEFINE FIELD relationship_type ON related_to TYPE string
    ASSERT $value IN ["cross_reference", "prerequisite", "see_also", "supersedes"];
DEFINE FIELD score ON related_to TYPE float;           -- Jaccard similarity from cross-ref script
DEFINE FIELD created_at ON related_to TYPE datetime DEFAULT time::now() READONLY;
DEFINE INDEX idx_related_to_unique ON related_to FIELDS in, out UNIQUE;

-- Framework defines a glossary term
DEFINE TABLE defines TYPE RELATION FROM framework TO term SCHEMAFULL;
DEFINE FIELD confidence ON defines TYPE float DEFAULT 0.5;
DEFINE FIELD evidence_url ON defines TYPE option<string>;
DEFINE FIELD created_at ON defines TYPE datetime DEFAULT time::now() READONLY;
DEFINE INDEX idx_defines_unique ON defines FIELDS in, out UNIQUE;

-- Sourced claim (page/term/framework cites an external resource or another page)
DEFINE TABLE cites TYPE RELATION IN page|term|framework OUT external_resource|page SCHEMAFULL;
DEFINE FIELD context ON cites TYPE string;             -- what claim is being cited
DEFINE FIELD source_span ON cites TYPE option<string>; -- specific paragraph/line in source
DEFINE FIELD created_at ON cites TYPE datetime DEFAULT time::now() READONLY;
DEFINE INDEX idx_cites_unique ON cites FIELDS in, out, context UNIQUE;

-- Regulatory obligation (framework requires disclosure by industry, scoped to jurisdiction)
DEFINE TABLE regulates TYPE RELATION FROM framework TO industry SCHEMAFULL;
DEFINE FIELD jurisdiction ON regulates TYPE string;    -- "eu", "hk", "global", etc.
DEFINE FIELD effective_date ON regulates TYPE option<datetime>;
DEFINE FIELD obligation_type ON regulates TYPE string
    ASSERT $value IN ["mandatory", "voluntary", "comply_or_explain"];
DEFINE FIELD created_at ON regulates TYPE datetime DEFAULT time::now() READONLY;
DEFINE INDEX idx_regulates_unique ON regulates FIELDS in, out, jurisdiction UNIQUE;

-- Scope of applicability (term/framework applies to an industry or entity type)
DEFINE TABLE applies_to TYPE RELATION IN term|framework OUT industry|entity SCHEMAFULL;
DEFINE FIELD scope ON applies_to TYPE string;          -- "all_sectors", "financial_only", etc.
DEFINE FIELD created_at ON applies_to TYPE datetime DEFAULT time::now() READONLY;
DEFINE INDEX idx_applies_to_unique ON applies_to FIELDS in, out UNIQUE;
```

**Migration note (one-time backfill script):** existing `page.related_pages` and `page.backlinks` arrays (1,663 links from the cross-ref graph) are migrated to `related_to` RELATION edges. Per AP-1, the arrays remain on `page` records for backwards compatibility — existing code (`GET /api/v1/pages/:id/related`, `GET /api/v1/pages/:id/backlinks`) continues to read from arrays. New code (hybrid search, `get_related` MCP tool) reads from edges. Phase 3 can deprecate the arrays when the `/admin/review` dashboard ships.

**Why RELATION edges instead of flat arrays (research-backed):**
- UNIQUE indexes on `(in, out)` make `RELATE` idempotent — the pipeline safely re-runs without creating duplicates
- Edge metadata (`confidence`, `evidence_url`, `source_span`, `jurisdiction`) travels with the edge — no separate join
- Native graph traversal: `SELECT ->defines->term FROM framework:gri` resolves in one query instead of two (array lookup + record fetch)
- Multi-hop paths: `term.{..}->defines->(?)` enables recursive discovery for Phase 2 crosswalks
- Combined graph + FTS: `WHERE definition @0@ 'carbon' AND ->defines->framework.name = 'GRI'` — text search scoped to graph neighborhood
- Combined graph + KNN: vector conditions push into graph traversal, rejecting non-matching nodes during the walk

**Every new content-bearing table** (`term`, `framework`, `industry`, `entity`) carries:
- `facets` object (per AP-5)
- `embedding` field with HNSW 384d index (to participate in hybrid search)
- `created_at`, `updated_at` timestamps
- `permalink` (unique, URL-safe identifier)

The existing `page` table gains one new column via `DEFINE FIELD IF NOT EXISTS` (additive, AP-1):
- `last_verified` datetime — updated by the R&D loop; used for rotation scheduling

FULLTEXT indexes: `term.definition`, `term.name`, `framework.description`, `framework.name`.

`content_enhancement_log` schema: `job_id`, `status` (pending|approved|rejected), `target_table`, `target_id`, `proposed_changes` (JSON diff), `source_urls`, `authority_score`, `reviewer`, `reviewed_at`, `review_notes`.

`scrape_job` schema: `source_url`, `source_domain`, `status` (queued|fetching|processing|done|failed), `checksum`, `raw_content`, `normalized_content`, `proposals_generated` (array of enhancement_log record IDs), `pipeline_version`, `created_at`, `completed_at`.

**Database events** (SurrealDB `DEFINE EVENT` — lightweight in-transaction triggers for audit consistency):

| Event | On table | When | Action |
|-------|----------|------|--------|
| `evt_maintain_proposals` | `content_enhancement_log` | CREATE | Auto-push the new log record's ID into `scrape_job.proposals_generated` array for the linked job |
| `evt_sync_last_verified` | `content_enhancement_log` | UPDATE (`status` → `approved`) | Auto-set `page.last_verified = time::now()` on the target page (avoids stale cache from the pipeline forgetting to update it) |

**Database functions** (SurrealDB `DEFINE FUNCTION` — reusable scoring formulas, called by pipeline scripts + re-rank queries):

```
fn::authority_score($institution_weight: float, $publisher_reputation: float, $recency_bonus: float) -> float {
    RETURN 0.5 * $institution_weight + 0.25 * $publisher_reputation + 0.25 * $recency_bonus;
}

fn::evidence_quality($source_span_exists: bool, $source_type_applicability: float) -> float {
    -- 0.0 if quoted text doesn't exist at source_span offsets (hard fail)
    -- otherwise: how well the source type matches the claim type (regulator for rules = 1.0, media for rules = 0.3)
    RETURN IF $source_span_exists THEN $source_type_applicability ELSE 0.0 END;
}

fn::claim_confidence($authority_score: float, $evidence_quality: float, $corroboration_count: int) -> float {
    -- Bayesian-inspired: prior * evidence, with a small corroboration bonus
    -- Capped at 0.95 (no claim is 100% certain without human approval)
    LET $base = $authority_score * $evidence_quality;
    LET $corroboration_bonus = IF $corroboration_count > 1 THEN 0.1 * ($corroboration_count - 1) ELSE 0.0 END;
    RETURN math::min($base + $corroboration_bonus, 0.95);
}

fn::freshness_decay($updated_at: datetime) -> float {
    LET $age_days = (time::now() - $updated_at) / 86400;
    RETURN math::exp(-1 * (math::ln(2) / 730) * $age_days);  -- 2-year half-life
}
```

`claim_confidence` separates the source's general credibility (`authority_score`) from whether this specific piece of evidence actually supports this specific claim (`evidence_quality`). A highly authoritative source citing irrelevant text produces low confidence. This addresses the core limitation identified in research (Google Knowledge Vault, Knowledge-Based Trust): source authority ≠ claim correctness.

**Embedding generation** — pipeline scripts use `fastembed-js` (MIT, Node.js native, same `BAAI/bge-small-en-v1.5` model, same 384d output) to generate embeddings locally on the GH Actions runner. No HTTP round-trip to the app. Write the 384d vector directly into the record's `embedding` field alongside the content.

**Compatiblity gate:** before committing to `fastembed-js`, generate golden vectors from the existing browser pipeline (Transformers.js) and the new server pipeline on a stratified sample of 100 pages + 30 hand-labeled queries. Verify: (1) cosine similarity >0.999, (2) top-10 search result overlap >95%, (3) labeled nDCG@10 within 0.02 across both implementations, (4) per-slice (page type, length, language) retrieval metrics within threshold. Dual-write both indexes during migration; atomic alias switch; old index retained for rollback. Store `model_revision_hash` + `onnx_version` + `preprocessing_hash` with every generated vector. The browser-side embedding path (SearchClient, AISearchAgent) continues to use the browser model; `fastembed-js` handles the server-side path for the ingestion pipeline and R&D loop.

`source` schema (one row per authoritative source — modeled on Wikidata's reference-node pattern [3][10] with multi-factor authority scoring):
```
  id                  record ID (auto-generated)
  name                string       — canonical name (e.g., "GRI Standards")
  domain              string       — primary domain (e.g., "globalreporting.org")
  source_type         string       — enum: "standard_setter"|"regulator"|"academic"|"ngo"|"intergov"|"media"|"other"
  base_url            string       — root URL for scraping/fetching
  api_endpoint        option<string> — REST API endpoint if available
  api_auth            option<string> — enum: "none"|"api_key"|"oauth" (metadata only, no credentials stored)
  institution_weight  float 0-1    — per source_type: standard_setter=0.9, intergov=0.9, regulator=0.85, academic=0.7, ngo=0.6, media=0.4, other=0.3
  publisher_reputation float 0-1    — manually assigned domain credibility (NOT automated Moz DA — Moz DA predicts search ranking, not factual accuracy; see Google Knowledge-Based Trust, Dong et al., PVLDB 2015 for the distinction)
  recency_bonus       float 0-1    — 1.0 if last_fetched_at within 2 years, decays to 0.5 at 5 years
  formula_version     int           — increment on formula change; enables historical score comparison and recalibration
  authority_score     float 0-1    — composite: 0.5*institution_weight + 0.25*publisher_reputation + 0.25*recency_bonus
  fetch_schedule      string       — cron expression (e.g., "0 6,18 * * *")
  last_fetched_at     datetime
  created_at          datetime
  updated_at          datetime
```
Seed from the existing 46 curated domains (backfill from `external_resource` table) plus the 5 API sources: OpenAlex, OECD SDMX, UN SDG, EUR-Lex, Open-Meteo.

### WS-B: Hybrid Retrieval + Write Endpoints

#### B-1: Hybrid search

`/api/v1/search?mode=hybrid&q=...` executes two-stage ranking:

**Stage 1 — RRF Fusion** (rank-based, not raw-score mixing — standard best practice per [1][8][9]):
1. BM25 FTS query on `page`, `term`, `framework`, `industry`, `entity` content fields
2. HNSW k-NN on the same record set by embedding similarity (cosine distance)
3. `search::rrf(k=60)` fuses the two rank-ordered result sets:
   ```
   rrf_score(doc) = sum( 1 / (60 + rank_i) ) for i in [BM25, HNSW]
   ```
   This normalizes incompatible lexical and vector score scales before the second stage.

**Stage 2 — ESG Re-Rank** (batch-relative normalized features, all mapped to [0,1] via percentile rank within the result batch to avoid incompatible score distributions):

| Component | Weight | Definition |
|-----------|--------|-----------|
| `text` | 0.40 | Percentile rank of the RRF score within the current result batch |
| `framework_match` | 0.20 | Jaccard similarity: `\|query_tokens ∩ doc.facets.framework\| / \|query_tokens ∪ doc.facets.framework\|`. Only active when query contains known framework names (matched against controlled vocabulary). Percentile-ranked within batch. Weight redistributed to `text` when not applicable. |
| `topic_match` | 0.15 | Cosine similarity between query embedding and doc embedding (reused from HNSW step — no extra compute). Percentile-ranked within batch. |
| `authority` | 0.15 | `doc.source.authority_score` from the `source` table. Default 0.3 if doc has no linked source. Already [0,1] — used directly, not ranked. |
| `freshness` | 0.10 | Exponential decay: `e^(-λ * age_in_days)` where `λ = ln(2) / 730` (2-year half-life, tuned for ESG evergreen content). Already [0,1] — used directly, not ranked. |

**Why percentile ranking:** BM25, cosine similarity, and Jaccard produce scores on different scales (BM25 can be 0-50+, cosine is -1 to 1, Jaccard is 0-1). Fixed weights applied to raw scores produce undefined behavior. Percentile ranking maps all sub-scores to a common [0,1] scale by their position within the result batch, resolving the distribution-incompatibility problem without requiring a trained reranker. Authority and freshness are already [0,1] — they are used directly as calibrated priors.

**Baseline evaluation:** Phase 1 includes a benchmark script (`scripts/eval-search.mjs`) that runs 30 hand-labeled queries against the re-rank, computes nDCG@10 and MRR, and asserts a minimum threshold (nDCG@10 ≥ 0.6). This gates the re-rank on a measurable quality bar, not just "it works."

**Response shape:** `{ results: [...], pagination: { total, offset, limit, has_more }, mode: "hybrid" }` — backwards-compatible with `mode=keyword` (fields added only).

#### B-2: Write REST endpoints

New routes for the MCP write tools and pipeline scripts to call. Follow existing API pattern (`export const runtime = "nodejs"`, OPTIONS handler with CORS, structured error envelope).

| Endpoint | Purpose | Caller |
|----------|---------|--------|
| `POST /api/v1/terms` | Create a glossary term proposal -> inserts into `content_enhancement_log` (status: pending), returns proposal ID | `propose_term` MCP tool, ingestion pipeline |
| `PATCH /api/v1/pages/[id]/facets` | Update the `facets` object on an existing page record. Validates values against controlled vocabulary. Returns updated record. | `tag_content` MCP tool, R&D loop |

**Auth:** both endpoints require `Authorization: Bearer <ESG_HUB_WRITE_TOKEN>` header. Reject with 401 if missing/invalid. This centralizes write auth at the API layer — the MCP server and pipeline scripts pass the same token; none need direct SurrealDB credentials.

**Rate limiting:** write endpoints use an in-memory `lru-cache` rate limiter: max 50 requests per 5 minutes per IP. Read endpoints are unthrottled (they already carry `Cache-Control` headers).

**ISR caching for read endpoints:** new `GET /api/v1/terms` and `GET /api/v1/frameworks` endpoints use `export const dynamic = 'force-static'` + `export const revalidate = 3600` (1-hour time-based ISR). On proposal approval, the review script calls `revalidatePath('/api/v1/terms')` after the DB transaction commits — next request triggers re-render with fresh data. This reduces SurrealDB load for stable glossary data while keeping the existing `force-dynamic` behavior for search endpoints and page content. Note: `revalidateTag(tag, 'max')` is Next.js 16 only; this project is on Next.js 15 (per AGENTS.md), so path-based revalidation is used.

**Design rationale (per research):** the MCP protocol's own design guidance states "servers should be thin, focused, and easy to build — host applications handle complex orchestration." Production MCP servers (Langfuse et al.) reuse existing REST endpoints rather than connecting directly to the database [6]. This approach:
- Keeps the MCP server a thin adapter (consistent with v1.1.0 architecture)
- Centralizes validation, auth, and audit logging at the REST layer
- Gives one write surface for all automated content (pipeline + MCP + future Phase 5 community tools share the same endpoints)
- Keeps SurrealDB credentials in the Next.js app only

The existing `mode=keyword` path is preserved. The RAG retrieval in `/api/ai-search` switches to call `mode=hybrid` internally (replacing its hand-rolled merge).

### WS-C: MCP v1.2.0

Extends `mcp-server/` (not a new package). Version bump to `1.2.0`.

**New read tools:**
- `search_content` — wraps `/api/v1/search?mode=hybrid` with pagination + `readOnlyHint: true`
- `get_term` — fetches a `term` record by ID/slug, includes `related` (outbound `defines` edges to frameworks) and `backlinks` (inbound `defines` from frameworks)
- `get_related` — native graph traversal from any record via RELATION edges. Single SurrealQL query (e.g., `SELECT *, ->defines->term AS defines FROM framework:gri FETCH defines`). Returns connected records grouped by edge type, with edge metadata (`confidence`, `evidence_url`, `jurisdiction`, `scope`). Supports bidirectional traversal (outbound and inbound edges).
- `list_frameworks`, `list_industries` — enumerated controlled vocabularies from the `framework` and `industry` tables

**New gated write tools** (all call the write REST endpoints — no direct DB access, per MCP architecture guidance [6]):
- `propose_term` — submits a glossary term draft via `POST /api/v1/terms`. Returns a proposal ID. Validates input against the term schema. Gated behind `ESG_HUB_WRITE_TOKEN` (passed as `Authorization: Bearer` header to the REST endpoint). Annotations: `readOnlyHint: false`, `destructiveHint: false`.
- `tag_content` — updates the `facets` object via `PATCH /api/v1/pages/:id/facets`. Validates facet values against the controlled vocabulary. Same token gate. Returns the updated record.

**Backwards compatibility:** all v1.1.0 tools (`search_esg`, `get_esg_page`, `get_esg_metadata`, `list_esg_pages`, `list_esg_resources`) preserved with identical signatures.

### WS-D: Agent Skills

Four skills under `.opencode/skills/`, each a directory with a `SKILL.md`:

| Skill | Purpose | Trigger | Key MCP tools used |
|-------|---------|---------|-------------------|
| `esg-taxonomy-tagging` | Classify content across perspective facets (topic/industry/framework/jurisdiction/stakeholder) | User provides ESG content to classify | `search_esg`, `get_esg_metadata`, `list_esg_pages` |
| `esg-relevance-ranking` | Apply the ESG re-rank weights to result sets | User asks to rank or prioritize ESG search results | `search_esg` (hybrid mode) |
| `esg-glossary-writer` | Draft structured term definitions with citations from existing KB content | User asks to define an ESG term formally | `search_esg`, `get_esg_page`, `list_esg_resources` |
| `esg-source-authority-review` | Score source credibility across 5 dimensions (institutional weight, recency, peer-review status, citation count, domain authority) | User asks to evaluate or compare ESG sources | `list_esg_resources`, `get_esg_page` |

Each skill SKILL.md includes: purpose, trigger conditions, required MCP tools with usage guidance, input/output JSON schemas, and one worked example with real ESG Hub page data.

### WS-E: Auto-Enhancement Engine

#### Ingestion Pipeline (cron: 2x daily, odd-minute to avoid hour-start congestion, e.g. 06:17 + 18:17 UTC)

```
.github/workflows/km-ingestion.yml (schedule trigger + workflow_dispatch fallback)
  |
  ├─ 0. ACQUIRE: Defense-in-depth overlap prevention:
  |     - **Primary:** GitHub Actions `concurrency: { group: "km-ingestion", cancel-in-progress: false }` serializes runs.
  |     - **Secondary:** SurrealDB lease with fencing token: `CREATE lease:km_ingestion SET owner_id = $RUN_ID, fencing_token = rand::uuid(), expires_at = time::now() + 4h`. Creation fails if the record ID already exists. On failure, atomic conditional takeover via `UPDATE ... SET owner_id = $NEW_ID, fencing_token = ... WHERE expires_at < time::now()`. All protected writes (graph updates, status changes) include fencing_token in WHERE — if another runner took over, writes are rejected. Heartbeat renews via `UPDATE ... SET expires_at = ... WHERE owner_id = $RUN_ID AND fencing_token = $TOKEN`. Cleanup: `DELETE ... WHERE owner_id = $RUN_ID`.
  |     Timeout: 4 hours (explicit, not GH Actions default 6h).
  |
  v
scripts/km-ingestion.mjs
  |
  ├─ 1. ENQUEUE: load source list (seed: 46 curated domains + API endpoints)
  |     -> upsert scrape_job records (status: queued)
  |
  ├─ 2. FETCH: for each queued job ->
  |     a. HTTP fetch (fetch API, no Puppeteer; GH runner network OK for HTML/JSON/XML)
  |     b. checksum(content) -> if exists in scrape_job table, skip (dedup)
  |     c. normalize (HTML -> text via cheerio or equivalent; JSON -> flattened schema)
  |     d. update scrape_job: status=processing, raw_content, normalized_content
  |
  ├─ 3. LLM PIPELINE (4-layer, split model: cheap extract, strong verify):
  |     a. EXTRACT (DeepSeek-chat, response_format=json_object, low temp, structured JSON output):
  |        - Entity typing (is this a standard? regulation? report? article?)
  |        - Taxonomy tags (topic/industry/framework/jurisdiction facet assignment)
  |        - Key claim extraction (claim text + source span pointer)
  |        Schema validation post-extraction -> reject malformed, retry once.
  |        Check `finish_reason` — "length" (truncation) retries with increased
  |        max_tokens. Persistent failure quarantines with log entry.
  |     b. NORMALIZE (rule-based, no LLM):
  |        - Canonical name resolution against existing term/framework tables
  |        - Metric unit standardization
  |        - Date normalization
  |        - **Deterministic pre-verification:** string-match extracted source_span
  |          offsets against the same canonical normalized text stream they were
  |          computed from (retain a raw↔canonical offset map). Unicode NFC
  |          normalization + whitespace normalization. Confirms the quoted text
  |          exists; catches encoding/whitespace variations that break exact matching.
  |          Validate entity types against controlled vocabulary. Flag mismatches
  |          as `pre_verification: "failed"` — these bypass the LLM verify step
  |          and go directly to human review (no point paying for an LLM to
  |          verify a claim whose quoted source text doesn't exist).
  |
  |     c. VERIFY (DeepSeek-reasoner, only when confidence < 0.8 or novel entity):
  |        - Ambiguous taxonomy assignments
  |        - Novel crosswalk proposals
  |        - Contradictory claims (vs existing KB)
  |        Confidence is treated as a routing heuristic (not calibrated probability).
  |        The pipeline logs extractor confidence alongside human review outcomes
  |        to build a calibration dataset. A CI check (`scripts/eval-pipeline.mjs`)
  |        periodically computes Expected Calibration Error (ECE) on the
  |        growing labeled set and alerts when calibration drifts past threshold.
  |     d. PROPOSE (write):
  |        - Glossary definitions -> POST /api/v1/terms -> content_enhancement_log (pending)
  |        - Framework updates -> POST /api/v1/terms (with framework type) -> content_enhancement_log (pending)
  |        - New source references -> external_resource table (auto, with authority score)
  |        - Embedding generation: generate 384d vector locally via `fastembed-js`
  |          (same BGE-small model, no HTTP round-trip), store in the
  |          record's `embedding` field for HNSW participation.
  |
  └─ 4. REPORT: update scrape_job.completed_at, log proposal count
```

**Cost controls** (per AP-3, scaled for Phase 1 volume):
- Prompt prefix caching on repeated schema/system prompts
- Semantic cache: if the same source URL + checksum was processed before, skip LLM entirely (dedup at fetch layer catches this)
- Token budget per source: max 4K input + 2K output for extract, 8K input + 4K output for verify
- Target: ~$0.50-2/day for 100-source batch

#### R&D Enhancement Loop (cron: daily, off-peak, odd-minute e.g. 04:13 UTC)

```
.github/workflows/km-rd-loop.yml (schedule trigger + workflow_dispatch fallback)
  |
  ├─ 0. ACQUIRE: Defense-in-depth (same pattern as ingestion — GH concurrency + DB lease). Timeout: 2 hours.
  |
  v
scripts/km-rd-loop.mjs
  |
  ├─ 1. SELECT: rotate through existing pages, stratified by content type:
  |     - Regulatory/standards pages (high-volatility): every 30 days
  |     - General glossary/reference pages (stable): every 60 days
  |     Selection: oldest last_verified first within each stratum.
  |     Per run: N = ceil(total_pages / target_cycle_days), ~6-12 pages.
  |
  ├─ 2. VERIFY per page:
  |     a. Link freshness: HEAD each external link. On 405/501 response
  |        (some CDNs reject HEAD), fall back to range GET (bytes=0-0).
  |        Dead (4xx/5xx after retry) → propose replacement URL or mark as broken.
  |        Soft-404 detection: compare content hash of HEAD-followed
  |        redirects against known error-page signatures.
  |     b. Spot claim re-check (for pages with high authority_score sources):
  |        Extract 2-3 key claims from page content, verify via Perplexity MCP.
  |        Save retrieved evidence passages as snapshots for reproducibility.
  |        Assign a verdict: supported | refuted | conflicting | insufficient_evidence.
  |        Flag discrepancies with citations for human review.
  |     c. Cross-reference consistency: check that page.RELATION edges
  |        (related_to, defines, cites) are bidirectional and linked pages
  |        still exist. Fix orphaned edges or propose removal.
  |     d. Claim-level tracking: for each verified claim, write a
  |        content_enhancement_log entry with `target_table = "claim"`,
  |        storing the claim text, source_span, verdict, and evidence snapshot.
  |        This enables claim-level verification cadence in Phase 2.
  |
  └─ 3. PROPOSE: write content_enhancement_log entries for each finding.
      Write proposals via POST /api/v1/terms (same endpoint as ingestion).
      Facet/cross-ref fixes via PATCH /api/v1/pages/:id/facets.
      Dead link proposals auto-rate "low effort" (trusted).
      Claim discrepancy proposals carry "high scrutiny" flag.
      Cross-ref inconsistency proposals auto-rate "medium effort".
```

**Human gate workflow** (for both pipelines):

```
1. Admin runs:  node scripts/review-enhancements.mjs --list
   -> shows all pending proposals with job_id, target, diff summary

2. Admin runs:  node scripts/review-enhancements.mjs --approve <proposal_id>
   -> applies the diff to the target record, updates content_enhancement_log.status=approved
   -> calls revalidatePath('/api/v1/terms') for term/framework targets to refresh ISR cache

3. Admin runs:  node scripts/review-enhancements.mjs --reject <proposal_id> --note "Reason"
   -> updates content_enhancement_log.status=rejected with reviewer notes
   -> no content change
```

In Phase 3, this script is replaced by the `/admin/review` dashboard. The DB schema and the approve/reject logic don't change — only the UI surface.

---

## Architectural Implications for Later Phases

These are NOT build targets for Phase 1. They exist here to validate that Phase 1 decisions don't block them.

### Phase 2 readiness check
- [ ] `framework` and `industry` tables exist + are indexed (AC-A1 covers this)
- [ ] `facets` object has `framework` and `jurisdiction` fields (AC-A2 covers this)
- [ ] RELATION type `defines` exists (AC-A1 covers this) — Phase 2 extends it to `crosswalks_to` (framework<->framework) and `mandated_by` (disclosure<->regulation)
- [ ] Pipeline's LLM extract layer can emit framework entity type (schema supports it; Phase 2 adds the extract prompt for crosswalk mapping)

### Phase 3 readiness check
- [ ] `facets` object shape is stable (AP-5) — Phase 3 facet UI reads it directly
- [ ] `entity` table exists + indexed (AC-A1 covers this) — Phase 3 populates it from public data
- [ ] Review queue schema supports `reviewer` + `reviewed_at` (AC-A1 covers this) — Phase 3 builds the dashboard on these fields
- [ ] Hybrid search `mode` parameter exists (AC-B1 covers this) — Phase 3 adds `mode=entity`
- [ ] mcp-server is extension-friendly (AP-2) — Phase 3 adds `get_entity` without breaking existing tools

### Phase 4 readiness check
- [ ] SurrealDB 3.x bucket/file pointer support exists (platform capability, already verified in 3.2.1) — Phase 4 uses it for video binary storage
- [ ] Pipeline runs on GH Actions (AP-3) — Phase 4 adds video transcript cron workflow as an additional job, not a rewrite
- [ ] ESG re-rank weights are configurable (design assumption) — Phase 4 adds transcript-relevance weight
- [ ] `scrape_job` table supports content-type discrimination (the schema has `source_domain` and `source_url` — Phase 4 discriminates HTML vs video-URL by domain)

### Phase 5 readiness check
- [ ] Review queue is the universal write gate (AP-6) — Phase 5 community contributions write to the same `content_enhancement_log` table
- [ ] API versioning prefix exists (AP-7) — Phase 5 federation endpoints live under `/api/v1/` with `Accept: application/ld+json` content negotiation (no version bump needed for read-only linked data)
- [ ] SurfrealDB table structure supports release snapshots — Phase 5 adds `kb_release` table referencing record IDs across all tables; the additive rule (AP-1) permits this

---

## Acceptance Criteria — Phase 1

### WS-A: KM data model (MUST)
- **AC-A1 [MUST]** New tables exist and pass a schema verification script: `term`, `framework`, `industry`, `entity`, `source`, `scrape_job`, `content_enhancement_log`, plus RELATION tables `related_to`, `defines`, `cites`, `regulates`, `applies_to` (SurrealDB 3.2 RELATION type), with FULLTEXT indexes on `term.definition` and HNSW 384d on `term.embedding`, `framework.embedding`, `industry.embedding`, `entity.embedding`. All RELATION tables carry UNIQUE indexes on `(in, out)` for idempotent edge creation.
- **AC-A2 [MUST]** Every new content-bearing record carries a `facets` object per AP-5: topic, industry, framework, jurisdiction, stakeholder_group, content_type. Controlled vocabularies are enumerated in SurrealDB field assertions.
- **AC-A3 [SHOULD]** Backfill: all 33 `standards` section pages mapped to `framework` records with `defines` edges to relevant terms; verification via graph query returning non-empty traversals.

### WS-B: Hybrid retrieval (MUST)
- **AC-B1 [MUST]** `/api/v1/search` supports `mode=hybrid`: BM25 + HNSW combined via `search::rrf(k=60)`, then percentile-ranked ESG re-rank with weights `0.40*text + 0.20*framework_match + 0.15*topic_match + 0.15*authority + 0.10*freshness`. Response shape backwards-compatible (fields added only, pagination envelope preserved). A benchmark script (`scripts/eval-search.mjs`) asserts nDCG@10 ≥ 0.6 on 30 hand-labeled queries.
- **AC-B2 [SHOULD]** `/api/ai-search` RAG retrieval uses `mode=hybrid` internally instead of its current hand-rolled merge, with identical ranking.

### WS-C: MCP v1.2.0 (MUST)
- **AC-C1 [MUST]** Existing `mcp-server/` extended to v1.2.0 with new read tools: `search_content`, `get_term`, `get_related`, `list_frameworks`, `list_industries`. All carry `readOnlyHint: true`, pagination where applicable.
- **AC-C2 [MUST]** Gated write tools: `propose_term`, `tag_content`. Write path: validate input → check `ESG_HUB_WRITE_TOKEN` Bearer token → call REST endpoints (`POST /api/v1/terms`, `PATCH /api/v1/pages/:id/facets`) → returns proposal ID. Annotations: `readOnlyHint: false`, `destructiveHint: false`. The tools never publish directly.
- **AC-C3 [SHOULD]** v1.1.0 tools preserved with identical signatures (tool listing confirms no v1 tools removed, no breaking param changes).

### WS-D: Agent skills (MUST)
- **AC-D1 [MUST]** Four skills under `.opencode/skills/` with valid frontmatter (name matches directory): `esg-taxonomy-tagging`, `esg-relevance-ranking`, `esg-glossary-writer`, `esg-source-authority-review` — each documenting purpose, trigger conditions, required MCP tools with usage guidance, I/O JSON schemas, and one worked example with real ESG Hub page data.
- **AC-D2 [SHOULD]** Skills are referenced from `AGENTS.md` and load successfully (skill tool invocation verified).

### WS-E: Auto-enhancement engine (MUST)
- **AC-E1 [MUST]** Ingestion pipeline: GH Actions cron workflow (2x daily) enqueues authoritative sources -> fetch + normalize -> checksum dedup against `scrape_job` -> LLM pipeline (extract -> normalize -> verify -> propose) -> writes to `content_enhancement_log` linked to `scrape_job` records. Zero auto-publish — all output is pending proposals.
- **AC-E2 [MUST]** R&D enhancement loop: GH Actions cron workflow (daily) re-verifies a rotating subset of existing pages (link freshness, spot claim checks, cross-reference consistency) -> writes enhancement proposals to `content_enhancement_log`. Coverage target: full DB re-verified <= every 60 days.
- **AC-E3 [MUST]** Review approval: `scripts/review-enhancements.mjs` supports `--list`, `--approve <id>`, `--reject <id> --note "..."`. Approval applies the diff to the target record and updates the log. Rejection updates the log; no content change. All actions recorded in `content_enhancement_log` with reviewer identity and timestamp.
- **AC-E4 [SHOULD]** Pipeline compute is 100% on GitHub Actions runners. Every fetched URL re-validated live at write time (matching the content-review methodology's verification gate).
- **AC-E5 [MUST]** Every pipeline run is auditable: `scrape_job` records carry `pipeline_version`, `created_at`, `completed_at`; `content_enhancement_log` records carry `job_id`, `reviewer`, `reviewed_at`, `review_notes`.

---

## Out of Scope for Phase 1

All items in Phases 2-5 (see roadmap above). Specifically NOT in this build:
- Crosswalk mappings, regulatory matrix population, entity profile population
- Frontend facet UI, review-queue web dashboard, comparison views, report export
- Video indexing, regulatory change detection, agent-driven batch research
- Federation APIs (RDF/JSON-LD), DOI publications, community contribution flows
- zh/hi translation of new structures
- Auto-publishing without human review (permanently out unless explicitly re-decided)

---

## Non-Functional Requirements

- **Compute location:** 100% of pipeline/batch/test compute on GitHub Actions runners; local machine is editing + light DB queries only (user directive 2026-07-24)
- **Idempotency:** every pipeline run re-runnable without duplicates (checksum + job-state idempotency in `scrape_job`). Graph edge creation idempotent via UNIQUE indexes on `(in, out)` — `RELATE` safely re-runs without creating duplicate edges.
- **Reversibility:** new tables droppable without touching existing schema; proposals rejectable without content change; v1 API tools preserved across MCP versions; existing array-based cross-refs coexist with new RELATION edges until Phase 3 deprecation.
- **Auditability:** every automated write traceable to a job ID, a source URL, and a pipeline version. Graph edges carry creation timestamps and evidence URLs.
- **Schema longevity:** no field drops, no type changes to existing fields, no removal of existing tables. All evolution is additive (AP-1).
- **Cost ceiling:** LLM pipeline target $0.50-2/day at Phase 1 scale. Phase 4-5 cost model to be evaluated based on Phase 1-2 economics before committing to additional LLM workloads.

---

## Deferred Enhancements (Phase 2-3, research-informed)

These are NOT Phase 1 constraints — they're solved in Phase 1 with the approaches above. These are upgrades that industry research says improve quality further, targeted for later phases when labeled data and production metrics are available.

| Enhancement | Phase 1 solution (in spec now) | Phase 2-3 upgrade |
|-------------|-------------------------------|-------------------|
| **Cross-encoder reranker** | Percentile-ranked RRF fusion + fixed weights + nDCG@10 benchmark gate | Trained cross-encoder (e.g., BAAI/bge-reranker-base) on top-50 candidates, replacing Stage 2 weights |
| **Calibrated confidence** | Deterministic pre-verification (source_span matching) gates LLM verify; ECE tracked in CI | Field-level isotonic regression on human-labeled outcomes; confidence used as a calibrated probability |
| **Claim-level provenance** | `claim_confidence = authority_score × evidence_quality × corroboration` computed at extraction; evidence snapshots in content_enhancement_log | `assertion` table separating source-level evidence from canonical fused facts; W3C PROV-O mappings |
| **Event-driven verification** | Stratified page rotation (30-day / 60-day) + claim-level tracking via content_enhancement_log | Source ETag/Last-Modified triggers; regulation publication feeds; retraction detection |

---

## Open Questions

- [RESOLVED] SurrealDB 3.x features available (3.2.1 verified: rrf, FTS, RELATION tables)
- [RESOLVED] Compute plane = GitHub Actions (user directive); all compute off local
- [RESOLVED] MCP = extend existing `mcp-server` package (one deployable, 4-phase evolution)
- [RESOLVED] Review-queue UX for Phase 1: admin script (`scripts/review-enhancements.mjs`). More utility-driven than a UI — zero frontend overhead, scriptable for bulk ops, runs anywhere (local/CI/codespace), replaced by Phase 3 dashboard later.
- [RESOLVED] Enhancement R&D research tool: Perplexity MCP (perplexity_ask + perplexity_research) for claim verification and source re-check in the R&D loop.
- [RESOLVED] LLM model routing: split model — DeepSeek-chat (cheap) for extract/normalize, DeepSeek-reasoner (strong) for verify step on low-confidence extractions.
- [RESOLVED] Hybrid search scope: all 4 content-bearing tables (term/framework/industry/entity) from day 1. Tables exist sparsely populated; API surface is stable from launch. No rework when later phases populate industry/entity.
