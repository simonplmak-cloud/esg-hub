---
name: esg-glossary-writer
description: Draft structured glossary term definitions with citations from the ESG Hub knowledge base. Use when the user asks to define an ESG term formally or write a glossary entry.
compatibility: opencode
metadata:
  role: writer
  implementer: opencode
---

## Purpose

Produce structured, citable glossary definitions for ESG terms. Each definition is grounded in the ESG Hub knowledge base and includes:

1. A concise 1–2 sentence definition
2. Contextual elaboration (2–4 paragraphs)
3. Framework and standard references
4. Citations with page/external resource links
5. Cross-references to related terms

## Trigger Conditions

- User asks to define an ESG term formally (e.g., "define double materiality")
- User asks to write a glossary entry
- User asks "what does [ESG term] mean in the context of ESG?"
- User needs a structured, citable definition for documentation or reporting

## Required MCP Tools

- `search_esg` — search the KB for the term and related content
- `get_esg_page` — retrieve full page content for source material
- `list_esg_resources` — find authoritative external definitions and standards

## Input Schema

```json
{
  "term": {
    "type": "string",
    "description": "The ESG term to define."
  },
  "context": {
    "type": "string",
    "description": "Optional: domain context to scope the definition (e.g., 'EU regulatory', 'investor-focused')."
  },
  "target_audience": {
    "type": "string",
    "enum": ["general", "investor", "corporate", "regulator", "academic"],
    "default": "general",
    "description": "The audience the definition is written for."
  },
  "max_citations": {
    "type": "integer",
    "default": 5,
    "description": "Maximum number of citations to include."
  }
}
```

## Output Schema

```json
{
  "term": {
    "type": "string",
    "description": "The defined term."
  },
  "definition": {
    "type": "object",
    "properties": {
      "short": {
        "type": "string",
        "description": "1–2 sentence concise definition."
      },
      "elaboration": {
        "type": "string",
        "description": "2–4 paragraphs of context, history, significance, and application."
      },
      "target_audience": {
        "type": "string"
      }
    }
  },
  "framework_references": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "framework": { "type": "string", "description": "Framework or standard name." },
        "reference": { "type": "string", "description": "Specific section, standard, or clause reference." }
      }
    },
    "description": "Relevant reporting frameworks and standards that define or use this term."
  },
  "citations": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "source": { "type": "string", "enum": ["kb_page", "external_resource"] },
        "title": { "type": "string" },
        "url": { "type": "string" },
        "excerpt": { "type": "string", "description": "Relevant quote or paraphrase from the source." }
      }
    },
    "description": "Citations from the ESG Hub KB and external resources."
  },
  "related_terms": {
    "type": "array",
    "items": { "type": "string" },
    "description": "Related ESG terms for cross-referencing."
  },
  "last_updated": {
    "type": "string",
    "description": "Date of definition generation."
  }
}
```

## Procedure

1. Search the KB with `search_esg(query=<term>)` to find relevant pages and external resources.
2. For each high-scoring KB page result, call `get_esg_page` to retrieve full content.
3. Call `list_esg_resources(query=<term>)` to find authoritative external sources.
4. Extract the core definition from sources — prefer the most authoritative source (regulatory > standard body > KB page).
5. Write the short definition, elaboration, framework references, and citations.
6. Identify related terms by searching the KB for terms co-occurring with the target term.
7. Assemble and return the structured definition.

## Worked Example: Define "double materiality"

**User request**: "Write a glossary entry for double materiality, targeted at investors."

### Step 1 — Search the KB

```
search_esg(query="double materiality", source="all")
```

Returns pages including: environmental/double-materiality, frameworks/esrs, frameworks/csrd.

### Step 2 — Fetch relevant pages

```
get_esg_page(page_id="environmental/double-materiality")
get_esg_page(page_id="frameworks/esrs")
```

### Step 3 — Find external resources

```
list_esg_resources(query="double materiality")
```

Returns: eur-lex.europa.eu (CSRD directive), efrag.org (ESRS guidance).

### Step 4–5 — Assemble definition

```json
{
  "term": "double materiality",
  "definition": {
    "short": "Double materiality is the principle that companies must assess and report both how sustainability issues affect their financial performance (financial materiality) and how their operations impact society and the environment (impact materiality).",
    "elaboration": "Introduced by the European Union's Corporate Sustainability Reporting Directive (CSRD) and operationalized through the European Sustainability Reporting Standards (ESRS), double materiality represents a paradigm shift from single-materiality approaches like the ISSB's investor-focused standards.\n\nUnder financial materiality (the 'outside-in' perspective), a company evaluates how climate change, resource scarcity, or social trends may affect its cash flows, asset values, and business model. Under impact materiality (the 'inside-out' perspective), the company assesses its own contributions to greenhouse gas emissions, biodiversity loss, human rights impacts, and community well-being.\n\nA sustainability matter is material under CSRD if it is material from either perspective — or both. This broadens the scope of sustainability reporting beyond investor concerns to include the interests of a wider set of stakeholders, including civil society, employees, and affected communities.",
    "target_audience": "investor"
  },
  "framework_references": [
    {
      "framework": "CSRD (EU 2022/2464)",
      "reference": "Article 19a, 29a — definition and application of double materiality"
    },
    {
      "framework": "ESRS 1 (General Requirements)",
      "reference": "Chapter 3 — Double materiality as the basis for sustainability reporting"
    },
    {
      "framework": "GRI 2021 Universal Standards",
      "reference": "GRI 3: Material Topics — stakeholder-inclusive approach aligns with impact materiality"
    }
  ],
  "citations": [
    {
      "source": "kb_page",
      "title": "Double Materiality",
      "url": "/en/environmental/double-materiality",
      "excerpt": "Double materiality requires companies to report on both financial materiality (how ESG issues affect the company) and impact materiality (how the company affects ESG issues)."
    },
    {
      "source": "kb_page",
      "title": "European Sustainability Reporting Standards (ESRS)",
      "url": "/en/frameworks/esrs",
      "excerpt": "ESRS 1 establishes double materiality as the mandatory reporting principle for all companies in scope of CSRD."
    },
    {
      "source": "external_resource",
      "title": "Directive (EU) 2022/2464 (CSRD)",
      "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464",
      "excerpt": "The CSRD amends the Accounting Directive to require sustainability reporting on a double materiality basis."
    }
  ],
  "related_terms": [
    "financial materiality",
    "impact materiality",
    "CSRD",
    "ESRS",
    "single materiality",
    "stakeholder capitalism",
    "impact-weighted accounts"
  ],
  "last_updated": "2026-07-24"
}
```

## Notes

- Always prefer regulatory/standard-body definitions over KB summaries when both exist.
- For ambiguous terms (e.g., "materiality" without qualification), note the ambiguity and provide the most common ESG interpretation.
- Related terms should be discoverable via `search_esg` — use the query to find co-occurring terms in the same KB pages.
- If the term is not well-covered in the KB, state this explicitly and rely on external resources, noting the coverage gap.
