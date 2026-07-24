---
name: esg-relevance-ranking
description: Apply ESG re-rank weights to prioritize search results by pillar, recency, authority, keyword density, and entity matches. Use when the user asks to rank, prioritize, or re-score ESG search results.
compatibility: opencode
metadata:
  role: analyst
  implementer: opencode
---

## Purpose

Apply a weighted re-rank to ESG search results, optimizing for domain-specific relevance rather than raw BM25/vector similarity. The re-ranker uses five dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| `pillar_match` | 0.30 | How well the result's pillar aligns with the query's ESG domain |
| `recency` | 0.10 | Age of the content (decay curve; newer = higher) |
| `authority` | 0.20 | Source credibility (KB internal pages vs external resources) |
| `keyword_density` | 0.25 | Relevance of matched terms to the query |
| `entity_match` | 0.15 | Presence of query entities (frameworks, standards, regulations) in result |

## Trigger Conditions

- User asks to rank, prioritize, or re-score ESG search results
- User provides a query and a set of results needing ordering
- User asks "which result is most relevant?" or "sort these by relevance"
- Combined with `search_esg` when requiring domain-tuned ordering

## Required MCP Tools

- `search_esg` — primary search tool for both page and external resource results (hybrid mode)

## Input Schema

```json
{
  "query": {
    "type": "string",
    "description": "The original search query string."
  },
  "results": {
    "type": "array",
    "description": "Search results to re-rank.",
    "items": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "link": { "type": "string" },
        "snippet": { "type": "string" },
        "source_type": { "type": "string", "enum": ["pages", "external"] },
        "score": { "type": "number", "description": "Original BM25 or vector score." }
      }
    }
  },
  "weights": {
    "type": "object",
    "description": "Optional custom dimension weights (overrides defaults).",
    "properties": {
      "pillar_match": { "type": "number" },
      "recency": { "type": "number" },
      "authority": { "type": "number" },
      "keyword_density": { "type": "number" },
      "entity_match": { "type": "number" }
    }
  }
}
```

## Output Schema

```json
{
  "ranked_results": {
    "type": "array",
    "description": "Results re-ranked by composite ESG relevance score.",
    "items": {
      "type": "object",
      "properties": {
        "rank": { "type": "integer" },
        "title": { "type": "string" },
        "link": { "type": "string" },
        "snippet": { "type": "string" },
        "source_type": { "type": "string" },
        "composite_score": {
          "type": "number",
          "description": "Weighted sum across all dimensions (0–1)."
        },
        "dimension_scores": {
          "type": "object",
          "properties": {
            "pillar_match": { "type": "number" },
            "recency": { "type": "number" },
            "authority": { "type": "number" },
            "keyword_density": { "type": "number" },
            "entity_match": { "type": "number" }
          }
        },
        "rationale": {
          "type": "string",
          "description": "Brief explanation of the ranking decision."
        }
      }
    }
  },
  "query_pillar": {
    "type": "string",
    "description": "The ESG pillar inferred from the query."
  },
  "weights_applied": {
    "type": "object",
    "description": "The weights used for this ranking run."
  }
}
```

## Procedure

1. Execute `search_esg(query=..., source="all")` to obtain initial results.
2. Extract entities (frameworks, standards, regulation names) from the query.
3. Infer the query's ESG pillar by matching query terms against known pillar keywords (Environmental, Social, Governance, Standards, SDGs, Knowledge Base, Regional, Learn).
4. Score each result on the five dimensions:
   - **pillar_match**: 1.0 if pillar matches, partial for adjacent pillars, 0.0 for unrelated.
   - **recency**: Decay from 1.0 (last 6 months) to 0.3 (>5 years).
   - **authority**: 0.9 for internal KB pages, 0.7 for authoritative domains (e.g., ghgprotocol.org, eur-lex.europa.eu), 0.5 for others.
   - **keyword_density**: Ratio of query terms found in title+snippet.
   - **entity_match**: Jaccard similarity between query entities and result entities.
5. Compute weighted composite score.
6. Sort by composite score descending.
7. Return ranked results with per-dimension breakdowns.

## Worked Example: Rank results for "scope 3 emissions"

**User request**: "Rank the search results for scope 3 emissions by relevance."

### Step 1 — Search

```
search_esg(query="scope 3 emissions", source="all")
```

Returns (abridged):

| # | Title | Source | Snippet |
|---|-------|--------|---------|
| 1 | GHG Protocol Scope 3 Standard | external | The GHG Protocol Corporate Value Chain (Scope 3) Standard... |
| 2 | Carbon Accounting | pages | Covers Scope 1, 2, and 3 emissions accounting... |
| 3 | Supply Chain Emissions | pages | Understanding upstream and downstream Scope 3... |
| 4 | CDP Climate Change Questionnaire | external | CDP disclosure includes Scope 3 reporting requirements... |
| 5 | Board Diversity | pages | Board composition and diversity metrics... |

### Step 2 — Extract entities

Query entities: `["Scope 3", "GHG Protocol", "emissions", "supply chain"]`

### Step 3 — Infer pillar

Query pillar: **Environmental** (emissions/climate domain)

### Step 4 — Score each result

| # | Title | pillar_match | recency | authority | keyword_density | entity_match | Composite |
|---|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | GHG Protocol Scope 3 Standard | 0.9 | 0.5 | 0.9 | 1.0 | 0.8 | **0.83** |
| 3 | Supply Chain Emissions | 1.0 | 1.0 | 0.9 | 0.8 | 0.6 | **0.88** |
| 2 | Carbon Accounting | 1.0 | 0.7 | 0.9 | 0.6 | 0.4 | **0.77** |
| 4 | CDP Climate Change Questionnaire | 1.0 | 0.5 | 0.7 | 0.6 | 0.4 | **0.70** |
| 5 | Board Diversity | 0.1 | 0.8 | 0.9 | 0.0 | 0.0 | **0.26** |

### Step 5 — Ranked output

```json
{
  "ranked_results": [
    {
      "rank": 1,
      "title": "Supply Chain Emissions",
      "link": "/en/environmental/supply-chain-emissions",
      "snippet": "Understanding upstream and downstream Scope 3...",
      "source_type": "pages",
      "composite_score": 0.88,
      "dimension_scores": {
        "pillar_match": 1.0,
        "recency": 1.0,
        "authority": 0.9,
        "keyword_density": 0.8,
        "entity_match": 0.6
      },
      "rationale": "Direct ESG Hub page on Scope 3 supply chain emissions with strong entity overlap and recent content. Highest overall relevance."
    },
    {
      "rank": 2,
      "title": "GHG Protocol Scope 3 Standard",
      "link": "https://ghgprotocol.org/scope-3-standard",
      "snippet": "The GHG Protocol Corporate Value Chain (Scope 3) Standard...",
      "source_type": "external",
      "composite_score": 0.83,
      "dimension_scores": {
        "pillar_match": 0.9,
        "recency": 0.5,
        "authority": 0.9,
        "keyword_density": 1.0,
        "entity_match": 0.8
      },
      "rationale": "Authoritative external standard with perfect keyword match, but lower recency and slightly lower pillar match as an external source."
    },
    {
      "rank": 3,
      "title": "Carbon Accounting",
      "link": "/en/environmental/carbon-accounting",
      "snippet": "Covers Scope 1, 2, and 3 emissions accounting...",
      "source_type": "pages",
      "composite_score": 0.77,
      "rationale": "Relevant KB page but broader scope (covers all three scopes), diluting keyword density."
    },
    {
      "rank": 4,
      "title": "CDP Climate Change Questionnaire",
      "link": "https://www.cdp.net/en/guidance",
      "source_type": "external",
      "composite_score": 0.70,
      "rationale": "CDP disclosure tool includes Scope 3 but is not primarily about Scope 3."
    },
    {
      "rank": 5,
      "title": "Board Diversity",
      "link": "/en/social/board-diversity",
      "source_type": "pages",
      "composite_score": 0.26,
      "rationale": "No relevance to the query; Social pillar content with zero keyword/entity overlap."
    }
  ],
  "query_pillar": "Environmental",
  "weights_applied": {
    "pillar_match": 0.30,
    "recency": 0.10,
    "authority": 0.20,
    "keyword_density": 0.25,
    "entity_match": 0.15
  }
}
```

## Notes

- Default weights prioritize keyword relevance and pillar alignment. Override via the `weights` input for domain-specific tuning.
- For queries spanning multiple pillars (e.g., "ESG reporting requirements"), `pillar_match` should be computed against all relevant pillars.
- `source_type: "pages"` has a higher baseline `authority` score than external sources unless the external domain is a recognized authority (see `list_esg_resources` for known domains).
