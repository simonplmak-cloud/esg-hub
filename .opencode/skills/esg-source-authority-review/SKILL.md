---
name: esg-source-authority-review
description: Score ESG source credibility across 5 dimensions (institutional, regulatory, methodological, timeliness, independence). Use when the user asks to evaluate, audit, or score ESG sources or domains.
compatibility: opencode
metadata:
  role: analyst
  implementer: opencode
---

## Purpose

Score the authority and credibility of ESG information sources across five weighted dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| `institutional_standing` | 0.25 | Recognized standing of the publishing organization |
| `regulatory_mandate` | 0.25 | Whether the source has formal regulatory or standard-setting authority |
| `methodological_rigour` | 0.20 | Transparency and reproducibility of methods/data |
| `timeliness` | 0.15 | How current the content is relative to the fast-moving ESG landscape |
| `independence` | 0.15 | Freedom from conflicts of interest; funding transparency |

## Trigger Conditions

- User asks to evaluate, audit, or score an ESG source or domain
- User asks "how credible is [source]?"
- User asks to compare authority between two or more sources
- Content review workflows needing source credibility validation

## Required MCP Tools

- `list_esg_resources` — search the curated external resource list by domain
- `get_esg_page` — retrieve a KB page to assess its source citations

## Input Schema

```json
{
  "source": {
    "type": "string",
    "description": "Source name, domain (e.g., 'globalreporting.org'), or ESG Hub page permalink to evaluate."
  },
  "source_type": {
    "type": "string",
    "enum": ["domain", "page_permalink", "page_id"],
    "description": "How to interpret the source value."
  },
  "context": {
    "type": "string",
    "description": "Optional: what the source is being used for (e.g., 'regulatory compliance', 'investment research')."
  }
}
```

## Output Schema

```json
{
  "source": {
    "type": "string",
    "description": "The evaluated source."
  },
  "source_type": {
    "type": "string",
    "description": "Resolved source type (domain, kb_page, etc.)."
  },
  "overall_score": {
    "type": "number",
    "description": "Weighted composite authority score (0–100).",
    "minimum": 0,
    "maximum": 100
  },
  "tier": {
    "type": "string",
    "enum": ["A", "B", "C", "D"],
    "description": "Tier rating: A (≥80), B (60–79), C (40–59), D (<40)."
  },
  "dimension_scores": {
    "type": "object",
    "properties": {
      "institutional_standing": {
        "type": "object",
        "properties": {
          "score": { "type": "number" },
          "rationale": { "type": "string" }
        }
      },
      "regulatory_mandate": {
        "type": "object",
        "properties": {
          "score": { "type": "number" },
          "rationale": { "type": "string" }
        }
      },
      "methodological_rigour": {
        "type": "object",
        "properties": {
          "score": { "type": "number" },
          "rationale": { "type": "string" }
        }
      },
      "timeliness": {
        "type": "object",
        "properties": {
          "score": { "type": "number" },
          "rationale": { "type": "string" }
        }
      },
      "independence": {
        "type": "object",
        "properties": {
          "score": { "type": "number" },
          "rationale": { "type": "string" }
        }
      }
    }
  },
  "recommendations": {
    "type": "array",
    "items": { "type": "string" },
    "description": "Actionable recommendations for source usage or improvement."
  },
  "comparable_sources": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "domain": { "type": "string" },
        "tier": { "type": "string" }
      }
    },
    "description": "Known comparable sources from the ESG Hub for context."
  }
}
```

## Procedure

1. Resolve the source: if it is a page permalink, call `get_esg_page` to retrieve its content and extract cited sources/domains.
2. If a domain, call `list_esg_resources(domain=<source>)` to find whether the domain appears in the curated resource list and gather metadata.
3. Score each dimension on a 0–100 scale:
   - **institutional_standing**: 90+ for UN bodies, ISO, IASB; 70–89 for established NGOs (GRI, CDP, WRI); 50–69 for industry bodies; <50 for unverified/unknown entities.
   - **regulatory_mandate**: 90+ for legislated bodies (EU Commission, SEC); 70–89 for standards with regulatory adoption (ISSB, ESRS); 50–69 for voluntary frameworks; <50 for non-binding guidance.
   - **methodological_rigour**: Assess based on publicly documented methodology, peer review, data provenance, reproducibility.
   - **timeliness**: Content updated within 12 months = 90+; 1–2 years = 70–89; 2–5 years = 50–69; >5 years = <50.
   - **independence**: Fully independent non-profit or intergovernmental = 90+; industry-funded with transparent governance = 70–89; opaque funding = 50–69; known conflicts = <50.
4. Compute weighted composite score.
5. Assign tier rating.
6. Provide recommendations and comparable sources.

## Worked Example: Score authority for globalreporting.org

**User request**: "Evaluate the authority of globalreporting.org as an ESG source."

### Step 1 — Resolve source

```
list_esg_resources(domain="globalreporting.org")
```

Returns: GRI Standards — the most widely used sustainability reporting framework globally.

### Step 2–3 — Score dimensions

| Dimension | Score | Rationale |
|-----------|:-----:|-----------|
| institutional_standing | 90 | GRI is the longest-standing global sustainability reporting body (founded 1997). Recognized by the UN, OECD, and EU. Used by 10,000+ organizations in 100+ countries. |
| regulatory_mandate | 75 | GRI is a voluntary framework, not legislated. However, it is referenced by mandatory regulations (CSRD, EU Taxonomy) and is the de facto reporting baseline. One notch below ISSB/ESRS due to lack of direct regulatory mandate. |
| methodological_rigour | 85 | GRI Standards undergo a formal due process with multi-stakeholder working groups, public comment periods, and a Global Sustainability Standards Board (GSSB). Methods are publicly documented. |
| timeliness | 80 | GRI Universal Standards updated 2023; Sector Standards rolling out through 2024–2026. Content is current but sector coverage is incomplete. |
| independence | 85 | Independent non-profit foundation. Transparent governance via stakeholder council, due process oversight committee. Funding from diverse sources (governments, foundations, corporate donors) with public disclosure. |

### Step 4–5 — Compute and tier

```
Composite = (90×0.25) + (75×0.25) + (85×0.20) + (80×0.15) + (85×0.15)
         = 22.5 + 18.75 + 17.0 + 12.0 + 12.75
         = 83.0
Tier: A
```

### Step 6 — Full output

```json
{
  "source": "globalreporting.org",
  "source_type": "domain",
  "overall_score": 83.0,
  "tier": "A",
  "dimension_scores": {
    "institutional_standing": {
      "score": 90,
      "rationale": "GRI is the longest-standing global sustainability reporting body (founded 1997), recognized by the UN, OECD, and EU. Used by 10,000+ organizations across 100+ countries."
    },
    "regulatory_mandate": {
      "score": 75,
      "rationale": "Voluntary framework, but referenced by mandatory regulations (CSRD, EU Taxonomy). De facto global baseline for sustainability reporting, though one tier below legislated bodies."
    },
    "methodological_rigour": {
      "score": 85,
      "rationale": "Formal due process with multi-stakeholder working groups, public comment periods, and independent GSSB oversight. Transparent documented methodology."
    },
    "timeliness": {
      "score": 80,
      "rationale": "Universal Standards updated 2023. Sector Standards rolling out through 2026. Current but sector coverage is still expanding."
    },
    "independence": {
      "score": 85,
      "rationale": "Independent non-profit with diverse funding (governments, foundations, corporate donors). Public governance transparency via stakeholder council and due process oversight."
    }
  },
  "recommendations": [
    "GRI Standards are suitable as a primary reference for sustainability reporting methodology.",
    "For regulatory compliance within the EU, pair GRI with ESRS (which references GRI impact materiality).",
    "Monitor GRI-ISSB interoperability guidance as the two frameworks converge on key topics."
  ],
  "comparable_sources": [
    { "name": "IFRS/ISSB", "domain": "ifrs.org", "tier": "A" },
    { "name": "EFRAG/ESRS", "domain": "efrag.org", "tier": "A" },
    { "name": "CDP", "domain": "cdp.net", "tier": "A" },
    { "name": "SASB", "domain": "sasb.org", "tier": "B" }
  ]
}
```

## Notes

- The `institutional_standing` score should factor in longevity, global adoption, and recognition by other authoritative bodies.
- `regulatory_mandate` is weighted equally to `institutional_standing` (0.25 each) because regulatory authority is the strongest signal of credibility in ESG.
- When scoring KB pages, the authority of the page's cited sources should be factored into the page's own scores.
- If the source is not found in `list_esg_resources`, use `search_esg` to check for any KB page references to the domain, then score based on publicly available information about the organization.
- Tier A sources should be suitable for regulatory filings and investment decisions. Tier B for research and benchmarking. Tier C for general awareness. Tier D should carry a warning.
