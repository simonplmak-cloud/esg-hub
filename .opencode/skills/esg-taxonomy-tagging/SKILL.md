---
name: esg-taxonomy-tagging
description: Classify ESG content across perspective facets (topic, industry, framework, jurisdiction, stakeholder). Use when the user provides ESG content to classify, categorize, or tag.
compatibility: opencode
metadata:
  role: analyst
  implementer: opencode
---

## Purpose

Classify ESG content across five perspective facets:

| Facet | Description | Examples |
|-------|-------------|----------|
| `topic` | ESG subject area | climate-change, board-diversity, executive-compensation |
| `industry` | Sector applicability | financial-services, oil-gas, technology |
| `framework` | Reporting standard/framework | GRI, SASB, ISSB, TCFD, ESRS |
| `jurisdiction` | Geographic scope | EU, global, HK, US, CN |
| `stakeholder` | Primary audience | investors, regulators, corporates, consumers |

## Trigger Conditions

- User provides ESG content and asks to classify, tag, or categorize it
- User asks "what facets apply to this content?"
- User needs to identify frameworks, industries, or jurisdictions for a piece of ESG content

## Required MCP Tools

- `search_esg` — search the KB for related pages to ground classification
- `get_esg_metadata` — retrieve valid sections, pillars, and source domains for taxonomy alignment
- `list_esg_pages` — browse pages by section/pillar to verify facet assignments
- `get_esg_page` — retrieve full page content for deep classification when needed

## Input Schema

```json
{
  "content": {
    "type": "string",
    "description": "The ESG content text to classify. Can be a full article, excerpt, or summary."
  },
  "context": {
    "type": "object",
    "description": "Optional hints to constrain classification.",
    "properties": {
      "known_topic": { "type": "string" },
      "known_industry": { "type": "string" },
      "known_framework": { "type": "string" },
      "known_jurisdiction": { "type": "string" },
      "known_stakeholder": { "type": "string" }
    }
  }
}
```

## Output Schema

```json
{
  "facets": {
    "type": "object",
    "description": "Classification results across the five perspective facets.",
    "properties": {
      "topic": {
        "type": "array",
        "items": { "type": "string" },
        "description": "One or more ESG topic labels."
      },
      "industry": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Applicable industries/sectors."
      },
      "framework": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Relevant reporting frameworks or standards."
      },
      "jurisdiction": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Geographic or regulatory scope."
      },
      "stakeholder": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Primary audience(s) for this content."
      }
    }
  },
  "confidence": {
    "type": "object",
    "description": "Per-facet confidence scores (0–1).",
    "properties": {
      "topic": { "type": "number" },
      "industry": { "type": "number" },
      "framework": { "type": "number" },
      "jurisdiction": { "type": "number" },
      "stakeholder": { "type": "number" }
    }
  },
  "supporting_pages": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "page_id": { "type": "string" },
        "title": { "type": "string" },
        "section": { "type": "string" },
        "pillar": { "type": "string" }
      }
    },
    "description": "KB pages that support the classification."
  }
}
```

## Procedure

1. If only a permalink is given, fetch the page via `get_esg_page` to obtain the full content.
2. Search the KB with `search_esg` using key terms extracted from the content to find related pages.
3. Call `get_esg_metadata` to obtain the taxonomy of valid sections, pillars, and source domains.
4. Map the content to the five facets, citing supporting KB pages for each facet assignment.
5. Assign confidence scores — lower scores when content spans multiple frameworks/industries or is ambiguous.

## Worked Example: Classify "environmental/climate-change"

**User request**: "Classify the ESG Hub page on climate change."

### Step 1 — Fetch the page

```
get_esg_page(page_id="environmental/climate-change")
```

Returns the full page content covering GHG emissions, Paris Agreement, TCFD, carbon pricing, transition risks.

### Step 2 — Search for related pages

```
search_esg(query="climate change emissions TCFD carbon")
```

Returns related pages: environmental/carbon-accounting, frameworks/tcfd, environmental/ghg-protocol.

### Step 3 — Get metadata

```
get_esg_metadata()
```

Returns sections list (environmental, social, governance, frameworks, ...) and pillars for alignment.

### Step 4 — Classify

| Facet | Assignment | Rationale |
|-------|-----------|-----------|
| `topic` | `["climate-change", "carbon-emissions", "transition-risk"]` | Core subject is climate; covers emissions and transition |
| `industry` | `["cross-sector"]` | Climate applies to all industries |
| `framework` | `["TCFD", "GHG-Protocol", "Paris-Agreement"]` | Multiple frameworks referenced in content |
| `jurisdiction` | `["global"]` | Not jurisdiction-specific; global scope |
| `stakeholder` | `["investors", "regulators", "corporates"]` | TCFD targets investors; regulatory content targets all three |

### Step 5 — Output

```json
{
  "facets": {
    "topic": ["climate-change", "carbon-emissions", "transition-risk"],
    "industry": ["cross-sector"],
    "framework": ["TCFD", "GHG-Protocol", "Paris-Agreement"],
    "jurisdiction": ["global"],
    "stakeholder": ["investors", "regulators", "corporates"]
  },
  "confidence": {
    "topic": 0.95,
    "industry": 0.70,
    "framework": 0.90,
    "jurisdiction": 0.85,
    "stakeholder": 0.80
  },
  "supporting_pages": [
    {
      "page_id": "environmental/climate-change",
      "title": "Climate Change",
      "section": "environmental",
      "pillar": "Environmental"
    },
    {
      "page_id": "environmental/carbon-accounting",
      "title": "Carbon Accounting",
      "section": "environmental",
      "pillar": "Environmental"
    },
    {
      "page_id": "frameworks/tcfd",
      "title": "TCFD",
      "section": "frameworks",
      "pillar": "Standards"
    }
  ]
}
```

## Notes

- Facet values should align with the KB's existing section and pillar taxonomy from `get_esg_metadata`.
- If content does not fit cleanly into one value, return multiple and lower the confidence score.
- The `supporting_pages` array links the classification back to KB evidence for auditability.
