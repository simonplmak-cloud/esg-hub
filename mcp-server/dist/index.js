#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const BASE_URL = process.env.ESG_HUB_API_URL || "https://esg-hub.ascent.partners";
/**
 * Helper to call the ESG Hub REST API
 */
async function apiGet(path, params) {
    const url = new URL(`/api/v1${path}`, BASE_URL);
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== "") {
                url.searchParams.set(key, value);
            }
        }
    }
    const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
    });
    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
}
// ── Create MCP Server ──────────────────────────────────────────────────
const server = new McpServer({
    name: "esg-hub",
    version: "1.0.0",
    description: "Access the ESG Hub knowledge base — 307 articles and 244 curated external resources covering Environmental, Social, and Governance topics.",
});
// ── Tool: search_esg ────────────────────────────────────────────────────
server.tool("search_esg", "Search the ESG Hub knowledge base using full-text keyword search (BM25 ranking). Returns pages and external resources matching the query.", {
    query: z.string().describe("Search query (e.g., 'carbon emissions', 'board diversity', 'GRI standards')"),
    limit: z.number().min(1).max(50).default(10).describe("Maximum number of results to return"),
    source: z.enum(["all", "pages", "external"]).default("all").describe("Filter results by source type"),
}, async ({ query, limit, source }) => {
    const result = await apiGet("/search", { q: query, limit: String(limit), source });
    const formatted = result.data
        .map((item, i) => {
        const link = item.permalink
            ? `${BASE_URL}${item.permalink}`
            : item.url || "";
        const source = item.source_type === "page" ? `[ESG Hub]` : `[${item.source_domain || "External"}]`;
        return `${i + 1}. **${item.title}** ${source}\n   ${item.description || ""}\n   Link: ${link}`;
    })
        .join("\n\n");
    return {
        content: [
            {
                type: "text",
                text: `Found ${result.total} results for "${query}":\n\n${formatted}`,
            },
        ],
    };
});
// ── Tool: get_esg_page ──────────────────────────────────────────────────
server.tool("get_esg_page", "Retrieve the full content of a specific ESG Hub article by its permalink or slug. Returns the complete article text, section, pillar, and metadata.", {
    page_id: z
        .string()
        .describe("Page identifier — can be a permalink path (e.g., 'environmental/climate-change'), a slug (e.g., 'climate-change'), or a SurrealDB record ID (e.g., 'page:abc123')"),
}, async ({ page_id }) => {
    const result = await apiGet(`/pages/${encodeURIComponent(page_id)}`);
    const page = result.data;
    const header = [
        `# ${page.title}`,
        page.description ? `\n> ${page.description}` : "",
        `\n**Section:** ${page.section || "N/A"} | **Pillar:** ${page.pillar || "N/A"}`,
        page.keywords ? `**Keywords:** ${page.keywords}` : "",
        `**URL:** ${BASE_URL}${page.permalink}`,
        `\n---\n`,
    ]
        .filter(Boolean)
        .join("\n");
    return {
        content: [
            {
                type: "text",
                text: `${header}\n${page.content}`,
            },
        ],
    };
});
// ── Tool: list_esg_pages ────────────────────────────────────────────────
server.tool("list_esg_pages", "List ESG Hub articles with optional filtering by section or pillar. Returns paginated results with title, permalink, description, and metadata.", {
    section: z
        .string()
        .optional()
        .describe("Filter by section (e.g., 'environmental', 'social', 'governance', 'standards', 'sdg', 'frameworks', 'finance', 'hk-apac', 'emerging-topics', 'learning', 'ratings', 'regulations')"),
    pillar: z
        .string()
        .optional()
        .describe("Filter by pillar (e.g., 'Environmental', 'Social', 'Governance', 'Standards', 'SDGs', 'Knowledge Base', 'Regional', 'Learn')"),
    query: z.string().optional().describe("Filter by title substring"),
    limit: z.number().min(1).max(100).default(20).describe("Number of results per page"),
    offset: z.number().min(0).default(0).describe("Pagination offset"),
}, async ({ section, pillar, query, limit, offset }) => {
    const params = {
        limit: String(limit),
        offset: String(offset),
    };
    if (section)
        params.section = section;
    if (pillar)
        params.pillar = pillar;
    if (query)
        params.q = query;
    const result = await apiGet("/pages", params);
    const formatted = result.data
        .map((page, i) => {
        const idx = result.pagination.offset + i + 1;
        return `${idx}. **${page.title}**\n   Section: ${page.section || "N/A"} | Pillar: ${page.pillar || "N/A"}\n   ${page.description || ""}\n   Link: ${BASE_URL}${page.permalink}`;
    })
        .join("\n\n");
    const pag = result.pagination;
    const summary = `Showing ${pag.offset + 1}–${pag.offset + result.data.length} of ${pag.total} pages${pag.has_more ? " (more available)" : ""}`;
    return {
        content: [
            {
                type: "text",
                text: `${summary}\n\n${formatted}`,
            },
        ],
    };
});
// ── Tool: list_esg_resources ────────────────────────────────────────────
server.tool("list_esg_resources", "List curated external ESG resources (standards, regulations, tools, databases). Filter by source domain or search by title.", {
    domain: z
        .string()
        .optional()
        .describe("Filter by source domain (e.g., 'ghgprotocol.org', 'eur-lex.europa.eu', 'www.cdp.net', 'tnfd.global', 'environment.ec.europa.eu')"),
    query: z.string().optional().describe("Filter by title substring"),
    limit: z.number().min(1).max(100).default(20).describe("Number of results"),
    offset: z.number().min(0).default(0).describe("Pagination offset"),
}, async ({ domain, query, limit, offset }) => {
    const params = {
        limit: String(limit),
        offset: String(offset),
    };
    if (domain)
        params.domain = domain;
    if (query)
        params.q = query;
    const result = await apiGet("/resources", params);
    const formatted = result.data
        .map((res, i) => {
        const idx = result.pagination.offset + i + 1;
        return `${idx}. **${res.title}** [${res.domain}]\n   ${res.description || res.content?.slice(0, 150) || ""}\n   URL: ${res.url}`;
    })
        .join("\n\n");
    const pag = result.pagination;
    const summary = `Showing ${pag.offset + 1}–${pag.offset + result.data.length} of ${pag.total} resources${pag.has_more ? " (more available)" : ""}`;
    return {
        content: [
            {
                type: "text",
                text: `${summary}\n\n${formatted}`,
            },
        ],
    };
});
// ── Tool: get_esg_metadata ──────────────────────────────────────────────
server.tool("get_esg_metadata", "Get ESG Hub database statistics including total pages, resources, available sections, pillars, and source domains. Useful for understanding the scope of the knowledge base.", {}, async () => {
    const result = await apiGet("/meta");
    const stats = result.stats;
    const sectionsStr = result.sections
        .map((s) => `  - ${s.name}: ${s.page_count} pages`)
        .join("\n");
    const pillarsStr = result.pillars
        .map((p) => `  - ${p.name}: ${p.page_count} pages`)
        .join("\n");
    const domainsStr = result.domains
        .slice(0, 20)
        .map((d) => `  - ${d.name}: ${d.resource_count} resources`)
        .join("\n");
    return {
        content: [
            {
                type: "text",
                text: `# ESG Hub Knowledge Base Statistics

**Total Pages:** ${stats.total_pages}
**Total External Resources:** ${stats.total_resources}
**Sections:** ${stats.total_sections}
**Pillars:** ${stats.total_pillars}
**Source Domains:** ${stats.total_domains}

## Sections
${sectionsStr}

## Pillars
${pillarsStr}

## Top Source Domains
${domainsStr}`,
            },
        ],
    };
});
// ── Resources ───────────────────────────────────────────────────────────
server.resource("esg-hub-api-docs", "esg-hub://api-docs", {
    description: "ESG Hub REST API documentation with endpoints, parameters, and examples",
    mimeType: "text/markdown",
}, async () => ({
    contents: [
        {
            uri: "esg-hub://api-docs",
            mimeType: "text/markdown",
            text: `# ESG Hub REST API Documentation

Base URL: ${BASE_URL}/api/v1

## Endpoints

### GET /api/v1/meta
Returns database metadata (sections, pillars, domains, stats).

### GET /api/v1/pages
List pages with filtering and pagination.
- \`section\`: Filter by section
- \`pillar\`: Filter by pillar
- \`q\`: Search within titles
- \`limit\`: Results per page (max 100)
- \`offset\`: Pagination offset

### GET /api/v1/pages/:id
Get a single page by ID, permalink, or slug.
- Supports SurrealDB record IDs, permalink paths, and slugs

### GET /api/v1/resources
List external resources.
- \`domain\`: Filter by source domain
- \`q\`: Search within titles
- \`limit\`: Results per page (max 100)
- \`offset\`: Pagination offset

### GET /api/v1/search?q=query
Full-text keyword search (BM25).
- \`q\`: Search query (required)
- \`limit\`: Max results (max 50)
- \`source\`: "all" | "pages" | "external"

### POST /api/v1/search
Semantic vector search.
- Body: \`{ embedding: number[384], k?: number, source?: string }\`
- Model: BAAI/bge-small-en-v1.5 (384 dimensions)

## CORS
All endpoints support CORS for cross-origin access.
`,
        },
    ],
}));
// ── Start Server ────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ESG Hub MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map