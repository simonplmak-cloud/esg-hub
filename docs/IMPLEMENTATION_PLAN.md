# ESG Hub v2 Implementation Plan

**Project**: Full-Stack Knowledge Platform Upgrade  
**Repository**: github.com/simonplmak-cloud/esg-hub  
**Owner**: Simon Mak / Ascent Partners Foundation  
**Date**: February 14, 2026

---

## Executive Summary

Transform ESG Hub from a static Jekyll site into an AI-powered knowledge platform with three integrated layers:

1. **Jekyll Frontend** - Enhanced with Pagefind search, D3.js knowledge graph, sidebar navigation
2. **SurrealDB Backend** - Multi-model database with graph relationships, vector embeddings
3. **API + MCP** - FastAPI REST API + MCP server for programmatic access

---

## Current State Analysis

### Repository Structure
- **Total Pages**: 131 markdown files
- **Quality Pages** (≥1500 bytes): 26 (20%)
- **Stub Pages** (<1500 bytes): 105 (80%)

### Files by Section

| Section | Files | Total Size | Avg Size | Status |
|:--------|------:|-----------:|---------:|:-------|
| Environmental | 12 | 66,517 bytes | 5,543 bytes | ✅ High Quality |
| Social | 49 | 84,329 bytes | 1,721 bytes | ⚠️ Mixed Quality |
| Governance | 35 | 50,091 bytes | 1,431 bytes | ⚠️ Mostly Stubs |
| Standards | 12 | 7,067 bytes | 589 bytes | 🔴 All Stubs |
| HK/APAC | 8 | 4,756 bytes | 594 bytes | 🔴 All Stubs |
| Learning | 5 | 2,841 bytes | 568 bytes | 🔴 All Stubs |
| SDG | 1 | 548 bytes | 548 bytes | 🔴 All Stubs |
| Core | 9 | 53,492 bytes | 5,944 bytes | ✅ High Quality |

### Content Quality Benchmark
- **Gold Standard**: `environmental/climate-change.md` (4,641 bytes)
- **Target**: All pages should match this depth and structure

### Critical Gaps Identified

1. **Content Depth**: 105 stub pages need expansion (80% of site)
2. **Navigation**: No sidebar, breadcrumbs, or mega-menu
3. **Search**: No search functionality
4. **Data Layer**: No database, all content is static
5. **API**: No programmatic access
6. **Automation**: No data pipeline for updates
7. **Visualizations**: No knowledge graph, PB status dashboard, or charts

---

## Target Architecture

### Layer 1: Jekyll Frontend (GitHub Pages)

**Enhancements**:
- ✅ Pagefind search with faceted filtering
- ✅ Collapsible sidebar navigation
- ✅ Breadcrumb navigation
- ✅ Responsive mega-menu header
- ✅ D3.js interactive knowledge graph (`/explore/`)
- ✅ SVG planetary boundaries radar chart (homepage)
- ✅ Standards comparison matrix table
- ✅ Visual status badges (🔴🟡🟢) on environmental pages
- ✅ Research paper feeds (auto-updated from OpenAlex)

**Layout Specifications** (per ESGHubLayoutBestPractices.md):
- Three-column layout: 240px sidebar | content | 220px TOC
- Content max-width: 780px (~75 chars/line)
- Typography: Inter body (16px, line-height 1.72) + Playfair Display headings
- Wikipedia-style information architecture
- Sticky header + sticky TOC
- Infobox on right (300px) for structured metadata

### Layer 2: SurrealDB Knowledge Graph

**Schema**:
- **Tables**: planetary_boundary, standard, social_issue, governance_topic, regulation, sdg, paper, book
- **Edges**: disclosed_by, interoperable_with, aligned_with_sdg, regulated_by, researches, covers_topic
- **Indexes**: Full-text + vector embeddings (DeepSeek)

**Data Sources**:
- 9 Planetary Boundaries (Stockholm Resilience Centre 2025)
- All ESG standards (IFRS S1/S2, GRI, SASB, ESRS, TCFD, TNFD, GHG Protocol, SBTi, CDP, PCAF, ISO 26000, OECD, UNGP, UN Global Compact, ILO)
- ISO 26000 social issues
- G20/OECD 2023 governance topics
- Regional regulations (HK, China, EU, Singapore, Japan, Australia, ASEAN)
- 17 SDGs
- Simon Mak's 10 ESG books
- Academic papers (OpenAlex API)

### Layer 3: API + MCP

**FastAPI Endpoints**:
- `GET /api/v1/boundaries` - List/filter planetary boundaries
- `GET /api/v1/boundaries/{code}` - Get boundary with graph expansion
- `GET /api/v1/standards` - List/filter standards
- `GET /api/v1/standards/{abbreviation}` - Get standard with relationships
- `GET /api/v1/social` - List social issues
- `GET /api/v1/governance` - List governance topics
- `GET /api/v1/regulations` - List/filter by jurisdiction
- `GET /api/v1/sdgs` - List SDGs with linked entities
- `GET /api/v1/search` - Semantic search (vector + full-text hybrid)
- `POST /api/v1/ask` - RAG Q&A (DeepSeek or Kimi K2)
- `GET /api/v1/graph/traverse` - Graph traversal
- `GET /api/v1/research/{topic}` - Academic papers
- `GET /api/v1/health` - Health check

**MCP Tools**:
- `search_esg(query, entity_type, jurisdiction, limit)`
- `get_related_entities(entity_name, relationship_type)`
- `ask_esg_question(question, use_agent)`
- `find_research_papers(topic, min_citations, since_year, open_access_only, limit)`
- `get_jurisdiction_requirements(jurisdiction, pillar)`
- `get_boundary_status(code)`
- `compare_standards(standard_a, standard_b)`

---

## Technology Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | Jekyll + GitHub Pages + Pagefind + D3.js + Chart.js |
| Database | SurrealDB v2.x (embedded or cloud) |
| Backend API | FastAPI (Python 3.11+) |
| MCP | mcp Python SDK |
| LLMs | DeepSeek API (embeddings + RAG) + Kimi K2 API (agentic research) |
| Data Pipeline | GitHub Actions (cron) + Python scripts |
| Testing | pytest + pytest-asyncio (unit), playwright (E2E) |
| Deployment | Docker Compose (SurrealDB + FastAPI + MCP) |

---

## Implementation Phases

### Phase 1: Audit & Plan ✅ COMPLETE
- Repository structure analyzed
- 105 stub pages identified
- Implementation plan created
- **Deliverable**: `docs/IMPLEMENTATION_PLAN.md`

### Phase 2: SurrealDB Schema & Data
**Tasks**:
1. Create `/backend/` directory structure
2. Write SurrealQL schema files:
   - `001_tables.surql` - All entity tables
   - `002_edges.surql` - All RELATE edge tables
   - `003_indexes.surql` - Full-text and vector indexes
   - `004_functions.surql` - Custom SurrealDB functions
3. Write seed data scripts (Python):
   - `seed_boundaries.py` - 9 planetary boundaries
   - `seed_standards.py` - All ESG standards
   - `seed_social.py` - ISO 26000 issues
   - `seed_governance.py` - OECD 2023 topics
   - `seed_regulations.py` - Regional regulations
   - `seed_sdgs.py` - 17 SDGs
   - `seed_books.py` - Simon Mak's books
   - `seed_relationships.py` - Create all RELATE edges
4. Write embeddings generator: `backend/embeddings/generate.py`
5. **Deliverable**: Working SurrealDB with all entities and relationships

### Phase 3: FastAPI REST API
**Tasks**:
1. Create `backend/api/main.py` with all endpoints
2. Create `backend/api/db.py` - SurrealDB connection management
3. Create `backend/api/llm.py` - DeepSeek + Kimi K2 wrappers
4. Create `backend/api/rag.py` - RAG pipeline
5. Create `backend/api/models.py` - Pydantic schemas
6. Add error handling, validation, CORS
7. Create `backend/requirements.txt`
8. **Deliverable**: Functional REST API with all endpoints

### Phase 4: MCP Server
**Tasks**:
1. Create `backend/mcp/esg_server.py` with all tools
2. Create `backend/mcp/config_example.json` for Claude Desktop/Cursor
3. **Deliverable**: Working MCP server

### Phase 5: GitHub Actions Data Pipeline
**Tasks**:
1. Create `.github/workflows/update-data.yml` (weekly cron)
2. Create scraper scripts:
   - `fetch_openalex.py` - Academic papers
   - `scrape_boundaries.py` - PB status
   - `scrape_issb.py` - ISSB adoption tracker
   - `fetch_sbti.py` - SBTi companies
   - `fetch_youtube.py` - Video library
3. **Deliverable**: Automated data updates

### Phase 6: Jekyll Frontend Enhancement
**Tasks**:
1. Update `_layouts/apf-design.html`:
   - Add sidebar navigation
   - Add breadcrumbs
   - Add mega-menu
   - Add Pagefind integration
   - Add status badges
   - Ensure mobile responsive
2. Create includes:
   - `_includes/sidebar.html`
   - `_includes/breadcrumbs.html`
   - `_includes/search.html`
   - `_includes/research_feed.html`
   - `_includes/status_badge.html`
3. Add faceted metadata to all page front matter
4. Create `explore/index.md` - D3.js knowledge graph
5. Create `_data/esg_graph.yml` - Entity-relationship data
6. Update homepage with PB dashboard, standards matrix
7. Create `.github/workflows/deploy.yml` - Build + deploy
8. **Deliverable**: Enhanced Jekyll site with all visualizations

### Phase 7: Fill All Stub Pages
**Tasks**:
1. Generate full content for all 105 stub pages
2. Match quality of `environmental/climate-change.md` (4,641 bytes)
3. Include all required sections:
   - Lead paragraph (no heading)
   - Definition
   - Why This Matters
   - Key Standards & Frameworks
   - Primary Source Documents (direct PDF links)
   - Regional Regulations
   - Book Resources (Simon Mak's books)
   - Tools & Data
   - Related Topics
4. Commit in batches (10-15 pages per commit)
5. **Deliverable**: All pages ≥1500 bytes with comprehensive content

### Phase 8: Docker Compose Deployment
**Tasks**:
1. Create `docker-compose.yml`:
   - surrealdb service
   - api service
   - mcp service
2. Create `backend/Dockerfile`
3. Create `backend/docker-entrypoint.sh`
4. Create `docker-compose.override.yml` (dev settings)
5. Create `Makefile` with commands
6. **Deliverable**: One-command deployment

### Phase 9: Testing
**Tasks**:
1. Write unit tests (pytest):
   - `test_schema.py`
   - `test_seed.py`
   - `test_api_boundaries.py`
   - `test_api_standards.py`
   - `test_api_search.py`
   - `test_api_rag.py`
   - `test_api_graph.py`
   - `test_mcp_tools.py`
   - `test_embeddings.py`
   - `test_data_pipeline.py`
2. Write E2E tests (Playwright):
   - `test_homepage.py`
   - `test_navigation.py`
   - `test_search.py`
   - `test_content_pages.py`
   - `test_knowledge_graph.py`
   - `test_api_integration.py`
3. Create `pytest.ini` and `conftest.py`
4. **Deliverable**: All tests passing

### Phase 10: Documentation
**Tasks**:
1. Update `README.md` with:
   - Architecture diagram
   - Quick start guide
   - API summary
   - MCP setup
   - Development guide
   - Testing guide
   - Environment variables
2. Create `docs/API.md` - Full API documentation
3. Create `docs/MCP.md` - MCP tool documentation
4. Create `docs/ARCHITECTURE.md` - Detailed architecture
5. Create `CHANGELOG.md` - v2.0.0 release notes
6. **Deliverable**: Complete documentation

---

## Stub Pages Priority List

### Critical (Standards - 12 files, avg 589 bytes)
All standards pages are stubs and must be filled first as they are referenced throughout the site.

1. `standards/ifrs-s1-s2.md`
2. `standards/gri.md`
3. `standards/sasb.md`
4. `standards/tcfd.md`
5. `standards/tnfd.md`
6. `standards/esrs.md`
7. `standards/climate-nature/ghg-protocol.md`
8. `standards/climate-nature/sbti.md`
9. `standards/climate-nature/cdp.md`
10. `standards/climate-nature/pcaf.md`
11. `standards/climate-nature/sbtn.md`
12. `standards/social-governance/iso-26000.md`

### High Priority (HK/APAC - 8 files, avg 594 bytes)
Regional requirements are critical for Hong Kong-based foundation.

13. `hk-apac/hkex-esg-code.md`
14. `hk-apac/hkex-climate.md`
15. `hk-apac/hk-taxonomy.md`
16. `hk-apac/china-csds.md`
17. `hk-apac/singapore-sgx.md`
18. `hk-apac/japan-ssbj.md`
19. `hk-apac/asean-taxonomy.md`

### Medium Priority (Learning - 5 files, avg 568 bytes)
20. `learning/videos.md`
21. `learning/courses.md`
22. `learning/tools.md`
23. `learning/research.md`

### Medium Priority (SDG - 4 files, avg 554 bytes)
24. `sdg/environmental-sdgs.md`
25. `sdg/social-sdgs.md`
26. `sdg/governance-sdgs.md`

### Lower Priority (Governance - 28 stub files)
Most governance pages are stubs but less critical than standards.

27-54. All governance subdirectory pages

### Lower Priority (Social - 23 stub files)
Most social pages are stubs but less critical than standards.

55-77. All social subdirectory pages

---

## Content Generation Template

All stub pages must follow this structure (based on `environmental/climate-change.md`):

```markdown
---
layout: apf-design
title: "[Topic Name]"
permalink: /[path]/
pillar: [Environmental/Social/Governance/Cross-cutting]
content_type: [Standard/Planetary Boundary/Regulation/etc.]
framework: [Framework Name]
regions: [array]
sdgs: [array]
status: [if applicable]
last_verified: YYYY-MM-DD
---

# [Topic Name]

[Lead paragraph - 2-4 sentences answering "what is this and why does it matter?" - NO heading before this]

## Contents
1. [Section 1]
2. [Section 2]
...

## [Section 1 Name]
[Content with proper depth, examples, data]

## Key Standards & Frameworks
[Cards or table linking to standard pages]

## Primary Source Documents
- 📄 [Document Name](direct-link-to-PDF) — [Brief description]
- 📄 [Document Name](direct-link-to-PDF) — [Brief description]

## Regional Regulations
| Jurisdiction | Regulation | Effective Date |
|:-------------|:-----------|:---------------|
| Hong Kong | [Name](link) | YYYY-MM-DD |
| China | [Name](link) | YYYY-MM-DD |

## Latest Research
[Auto-curated from OpenAlex - will be populated by data pipeline]

## Tools & Data
- 🔗 [Tool Name](link) — [Description]
- 🔗 [Tool Name](link) — [Description]

## Book Resources
[Visual cards with relevant books from Simon Mak's collection]

## Related Topics
- [Related Topic 1](/path/)
- [Related Topic 2](/path/)

---

<small>Part of ESG Hub | Curated by Ascent Partners Foundation</small>
```

---

## Success Criteria

### Phase Completion
- ✅ All code committed to GitHub
- ✅ All tests passing (unit + E2E)
- ✅ No stub pages remain (<1500 bytes)
- ✅ All source links point to actual documents (not publisher homepages)
- ✅ Docker Compose deployment works
- ✅ API health check returns 200
- ✅ MCP server responds to all tools
- ✅ Pagefind search returns results
- ✅ D3.js knowledge graph renders
- ✅ Documentation complete

### Quality Standards
- All Python code has type hints and docstrings
- PEP 8 style compliance
- Maximum function length: 50 lines
- No hardcoded secrets
- Proper error handling and HTTP status codes
- Async/await for all I/O operations

---

## Environment Variables Required

```bash
# LLM APIs
DEEPSEEK_API_KEY=sk-...
KIMI_API_KEY=sk-...

# Database
SURREALDB_URL=ws://localhost:8000/rpc
SURREALDB_NS=esg_hub
SURREALDB_DB=production
SURREALDB_USER=root
SURREALDB_PASS=root

# External APIs
OPENALEX_EMAIL=your@email.com
YOUTUBE_API_KEY=AIza...  # Optional
```

---

## Timeline Estimate

| Phase | Estimated Time |
|:------|:---------------|
| Phase 1: Audit & Plan | ✅ Complete |
| Phase 2: SurrealDB | 4-6 hours |
| Phase 3: FastAPI | 4-6 hours |
| Phase 4: MCP | 2-3 hours |
| Phase 5: Data Pipeline | 3-4 hours |
| Phase 6: Jekyll Frontend | 6-8 hours |
| Phase 7: Fill Stubs | 10-15 hours |
| Phase 8: Docker | 2-3 hours |
| Phase 9: Testing | 6-8 hours |
| Phase 10: Documentation | 3-4 hours |
| **TOTAL** | **40-57 hours** |

---

## Risk Mitigation

### Technical Risks
1. **SurrealDB Learning Curve** - Mitigation: Use official docs, start with simple schema
2. **Vector Embedding Costs** - Mitigation: Use DeepSeek (cost-effective), batch processing
3. **GitHub Pages Build Time** - Mitigation: Optimize Pagefind index size, use incremental builds
4. **Content Quality** - Mitigation: Use gold standard template, verify all source links

### Operational Risks
1. **API Rate Limits** - Mitigation: Implement caching, respect rate limits, use polite pool
2. **Data Freshness** - Mitigation: Weekly cron jobs, manual override capability
3. **Deployment Complexity** - Mitigation: Docker Compose, comprehensive docs, health checks

---

## Next Steps

1. ✅ Phase 1 Complete - Implementation plan created
2. 🔄 **Phase 2 Starting** - Build SurrealDB schema and seed data
3. Create `/backend/` directory structure
4. Write SurrealQL schema files
5. Write Python seed scripts
6. Test database seeding

---

**Document Version**: 1.0  
**Last Updated**: February 14, 2026  
**Status**: Phase 1 Complete, Ready for Phase 2
