#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const BASE_URL = process.env.ESG_HUB_API_URL || "https://esg-hub.ascent.partners";
/**
 * Helper to call the ESG Hub REST API
 */
class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}
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
        throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
}
/**
 * Structured error envelope per MCP best practice (AC-B3).
 */
function toolError(code, message, retryable, hint) {
    return {
        content: [{ type: "text", text: `${message}\n\nHint: ${hint}` }],
        isError: true,
        structuredContent: {
            error: { code, message, retryable, hint },
        },
    };
}
function mapApiError(err, notFoundHint) {
    if (err instanceof ApiError) {
        if (err.status === 404) {
            return toolError("NOT_FOUND", "The requested item was not found.", false, notFoundHint);
        }
        const retryable = err.status >= 500;
        return toolError("UPSTREAM_ERROR", `The ESG Hub API returned an error (HTTP ${err.status}).`, retryable, retryable
            ? "Retry in a few seconds; if it persists, the API may be redeploying."
            : "Check the request parameters and try again.");
    }
    return toolError("UPSTREAM_ERROR", `Could not reach the ESG Hub API (${String(err)}).`, true, "Check network connectivity and try again.");
}
// ── Create MCP Server ──────────────────────────────────────────────────
const server = new McpServer({
    name: "esg-hub",
    version: "1.1.0",
    description: "Access the ESG Hub knowledge base — 307 articles and 244 curated external resources covering Environmental, Social, and Governance topics.",
});
// ── Tool: search_esg ────────────────────────────────────────────────────
server.tool("search_esg", "Full-text keyword search across all ESG Hub articles and curated external resources (BM25 ranking). Use when the user asks to find ESG information by topic or keyword (e.g., 'carbon emissions', 'board diversity', 'GRI standards'). Returns ranked results with title, link, snippet, and source type.", {
    query: z.string().min(1).describe("Search query (e.g., 'carbon emissions', 'board diversity', 'GRI standards')"),
    limit: z.number().min(1).max(50).default(10).describe("Maximum number of results to return"),
    source: z.enum(["all", "pages", "external"]).default("all").describe("Filter results by source type"),
}, { readOnlyHint: true, openWorldHint: false }, async ({ query, limit, source }) => {
    try {
        const result = await apiGet("/search", { q: query, limit: String(limit), source });
        const formatted = result.data
            .map((item, i) => {
            const link = item.permalink
                ? `${BASE_URL}${item.permalink}`
                : item.url || "";
            const src = item.source_type === "page" ? `[ESG Hub]` : `[${item.source_domain || "External"}]`;
            return `${i + 1}. **${item.title}** ${src}\n   ${item.description || ""}\n   Link: ${link}`;
        })
            .join("\n\n");
        const empty = result.data.length === 0;
        return {
            content: [
                {
                    type: "text",
                    text: empty
                        ? `No results for "${query}". Try broader terms (e.g., "climate" instead of "climate finance taxonomy"), or list_esg_pages to browse by section.`
                        : `Found ${result.total} results for "${query}":\n\n${formatted}`,
                },
            ],
            structuredContent: {
                query,
                total: result.total,
                count: result.data.length,
                items: result.data,
            },
        };
    }
    catch (err) {
        return mapApiError(err, "Try a different keyword, or list_esg_pages to browse by section.");
    }
});
// ── Tool: get_esg_page ──────────────────────────────────────────────────
server.tool("get_esg_page", "Retrieve the full content of one ESG Hub article. Use when you have a specific page identifier from search_esg or list_esg_pages. Returns the complete article text with section, pillar, keywords, and canonical URL.", {
    page_id: z
        .string()
        .min(1)
        .describe("Page identifier — can be a permalink path (e.g., 'environmental/climate-change'), a slug (e.g., 'climate-change'), or a SurrealDB record ID (e.g., 'page:abc123')"),
}, { readOnlyHint: true, openWorldHint: false, idempotentHint: true }, async ({ page_id }) => {
    try {
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
            structuredContent: { page },
        };
    }
    catch (err) {
        return mapApiError(err, "Check the identifier with search_esg or list_esg_pages — permalinks look like 'standards/gri-101'.");
    }
});
// ── Tool: list_esg_pages ────────────────────────────────────────────────
server.tool("list_esg_pages", "List and filter ESG Hub articles by section, pillar, or title substring. Use to browse the knowledge base structure or enumerate articles in a domain. Returns paginated results with pagination metadata (has_more, next_offset) for chaining.", {
    section: z
        .string()
        .optional()
        .describe("Filter by section (e.g., 'environmental', 'social', 'governance', 'standards', 'sdg', 'frameworks', 'finance', 'hk-apac', 'emerging-topics', 'learning', 'ratings', 'regulations')"),
    pillar: z
        .string()
        .optional()
        .describe("Filter by pillar (e.g., 'Environmental', 'Social', 'Governance', 'Standards', 'SDGs', 'Knowledge Base', 'Regional', 'Learn')"),
    query: z.string().optional().describe("Filter by title substring"),
    limit: z.number().min(1).max(100).default(20).describe("Number of results per page (use with offset for paging)"),
    offset: z.number().min(0).default(0).describe("Pagination offset — pass the previous response's next_offset to get the next page"),
}, { readOnlyHint: true, openWorldHint: false }, async ({ section, pillar, query, limit, offset }) => {
    try {
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
        const nextOffset = pag.offset + result.data.length;
        const summary = `Showing ${pag.offset + 1}–${nextOffset} of ${pag.total} pages${pag.has_more ? ` (more available — call again with offset=${nextOffset})` : ""}`;
        return {
            content: [
                {
                    type: "text",
                    text: `${summary}\n\n${formatted}`,
                },
            ],
            structuredContent: {
                items: result.data,
                pagination: {
                    count: result.data.length,
                    total: pag.total,
                    offset: pag.offset,
                    has_more: pag.has_more,
                    next_offset: pag.has_more ? nextOffset : null,
                },
            },
        };
    }
    catch (err) {
        return mapApiError(err, "Check filter values against get_esg_metadata's section/pillar lists.");
    }
});
// ── Tool: list_esg_resources ────────────────────────────────────────────
server.tool("list_esg_resources", "List curated external ESG resources (standards bodies, regulations, tools, databases) with their source URLs. Use to find authoritative external references by domain or title. Returns paginated results with pagination metadata (has_more, next_offset).", {
    domain: z
        .string()
        .optional()
        .describe("Filter by source domain (e.g., 'ghgprotocol.org', 'eur-lex.europa.eu', 'www.cdp.net', 'tnfd.global', 'environment.ec.europa.eu')"),
    query: z.string().optional().describe("Filter by title substring"),
    limit: z.number().min(1).max(100).default(20).describe("Number of results per page (use with offset for paging)"),
    offset: z.number().min(0).default(0).describe("Pagination offset — pass the previous response's next_offset to get the next page"),
}, { readOnlyHint: true, openWorldHint: false }, async ({ domain, query, limit, offset }) => {
    try {
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
        const nextOffset = pag.offset + result.data.length;
        const summary = `Showing ${pag.offset + 1}–${nextOffset} of ${pag.total} resources${pag.has_more ? ` (more available — call again with offset=${nextOffset})` : ""}`;
        return {
            content: [
                {
                    type: "text",
                    text: `${summary}\n\n${formatted}`,
                },
            ],
            structuredContent: {
                items: result.data,
                pagination: {
                    count: result.data.length,
                    total: pag.total,
                    offset: pag.offset,
                    has_more: pag.has_more,
                    next_offset: pag.has_more ? nextOffset : null,
                },
            },
        };
    }
    catch (err) {
        return mapApiError(err, "Check domain names against get_esg_metadata's source-domain list.");
    }
});
// ── Tool: get_esg_metadata ──────────────────────────────────────────────
server.tool("get_esg_metadata", "Get ESG Hub knowledge base statistics: total pages/resources, and the full lists of sections, pillars, and source domains with counts. Use before filtering with list_esg_pages or list_esg_resources to discover valid filter values.", {}, { readOnlyHint: true, openWorldHint: false, idempotentHint: true }, async () => {
    try {
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
            structuredContent: result,
        };
    }
    catch (err) {
        return mapApiError(err, "The metadata endpoint should always be available — retry in a few seconds.");
    }
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