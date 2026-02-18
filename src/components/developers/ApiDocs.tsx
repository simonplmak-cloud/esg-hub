import Link from "next/link";

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div
      style={{
        marginBottom: "1.5rem",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {title && (
        <div
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            fontFamily: "monospace",
          }}
        >
          {title}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.85rem",
          lineHeight: 1.6,
          overflowX: "auto",
          backgroundColor: "var(--color-bg-alt, #f8f9fa)",
          fontFamily: "'Fira Code', 'SF Mono', monospace",
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

function EndpointSection({
  method,
  path,
  description,
  params,
  example,
  response,
}: {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  example: string;
  response: string;
}) {
  return (
    <div
      style={{
        marginBottom: "2.5rem",
        paddingBottom: "2rem",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            padding: "0.2rem 0.6rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            fontFamily: "monospace",
            borderRadius: "4px",
            backgroundColor: method === "GET" ? "#e8f5e9" : "#e3f2fd",
            color: method === "GET" ? "#2e7d32" : "#1565c0",
          }}
        >
          {method}
        </span>
        <code
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {path}
        </code>
      </div>
      <p
        style={{
          fontSize: "0.92rem",
          color: "var(--color-text-secondary)",
          lineHeight: 1.55,
          marginBottom: "1rem",
        }}
      >
        {description}
      </p>

      {params && params.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h4
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Parameters
          </h4>
          <table
            style={{
              width: "100%",
              fontSize: "0.85rem",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--color-border)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Type</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Required</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr
                  key={p.name}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <code style={{ fontSize: "0.82rem" }}>{p.name}</code>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--color-text-muted)" }}>
                    {p.type}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    {p.required ? (
                      <span style={{ color: "#c62828", fontWeight: 600 }}>Yes</span>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>No</span>
                    )}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--color-text-secondary)" }}>
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CodeBlock title="Example Request">{example}</CodeBlock>
      <CodeBlock title="Example Response">{response}</CodeBlock>
    </div>
  );
}

export default function ApiDocs() {
  const BASE = "https://esg-hub-six.vercel.app";

  return (
    <div className="content-wrapper">
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1rem" }}>
        <Link
          href="/developers"
          style={{
            fontSize: "0.85rem",
            color: "var(--color-link)",
            textDecoration: "none",
          }}
        >
          Developers
        </Link>
        <span style={{ margin: "0 0.5rem", color: "var(--color-text-muted)" }}>/</span>
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          REST API
        </span>
      </nav>

      <article>
        <h1>REST API Documentation</h1>
        <p
          style={{
            fontSize: "1.02rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
            lineHeight: 1.65,
            maxWidth: "720px",
          }}
        >
          The ESG Hub REST API provides programmatic access to 307 ESG articles
          and 244 curated external resources. All endpoints return JSON and
          support CORS for cross-origin access. No authentication is required.
        </p>

        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            <strong>Base URL:</strong>{" "}
            <code style={{ fontSize: "0.88rem" }}>{BASE}/api/v1</code>
          </p>
        </div>

        {/* Table of Contents */}
        <div
          style={{
            padding: "1rem 1.25rem",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            marginBottom: "2.5rem",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>Endpoints</h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.9rem", lineHeight: 1.8 }}>
            <li><a href="#meta" style={{ color: "var(--color-link)" }}>GET /api/v1/meta</a> — Database metadata and statistics</li>
            <li><a href="#list-pages" style={{ color: "var(--color-link)" }}>GET /api/v1/pages</a> — List and filter pages</li>
            <li><a href="#get-page" style={{ color: "var(--color-link)" }}>GET /api/v1/pages/:id</a> — Get a single page</li>
            <li><a href="#list-resources" style={{ color: "var(--color-link)" }}>GET /api/v1/resources</a> — List external resources</li>
            <li><a href="#search" style={{ color: "var(--color-link)" }}>GET /api/v1/search</a> — Full-text keyword search</li>
            <li><a href="#semantic-search" style={{ color: "var(--color-link)" }}>POST /api/v1/search</a> — Semantic vector search</li>
          </ul>
        </div>

        {/* Endpoints */}
        <div id="meta">
          <EndpointSection
            method="GET"
            path="/api/v1/meta"
            description="Returns database metadata including total counts, available sections, pillars, and source domains. Useful for understanding the scope of the knowledge base."
            example={`curl ${BASE}/api/v1/meta`}
            response={`{
  "stats": {
    "total_pages": 307,
    "total_resources": 244,
    "total_sections": 27,
    "total_pillars": 8,
    "total_domains": 46
  },
  "sections": [
    { "name": "environmental", "page_count": 23 },
    { "name": "social", "page_count": 83 },
    { "name": "governance", "page_count": 65 }
  ],
  "pillars": [
    { "name": "Environmental", "page_count": 14 },
    { "name": "Social", "page_count": 43 }
  ],
  "domains": [
    { "name": "www.globalreporting.org", "resource_count": 9 },
    { "name": "eur-lex.europa.eu", "resource_count": 13 }
  ]
}`}
          />
        </div>

        <div id="list-pages">
          <EndpointSection
            method="GET"
            path="/api/v1/pages"
            description="List ESG Hub articles with optional filtering by section, pillar, or title. Returns paginated results."
            params={[
              { name: "section", type: "string", required: false, description: "Filter by section (e.g., 'environmental', 'social', 'governance', 'standards')" },
              { name: "pillar", type: "string", required: false, description: "Filter by pillar (e.g., 'Environmental', 'Social', 'Governance', 'Standards')" },
              { name: "q", type: "string", required: false, description: "Filter by title substring" },
              { name: "limit", type: "number", required: false, description: "Results per page (default: 20, max: 100)" },
              { name: "offset", type: "number", required: false, description: "Pagination offset (default: 0)" },
            ]}
            example={`curl "${BASE}/api/v1/pages?section=environmental&limit=5"`}
            response={`{
  "data": [
    {
      "id": "page:abc123",
      "title": "Climate Change",
      "permalink": "/environmental/climate-change/",
      "description": "Understanding climate change...",
      "section": "environmental",
      "pillar": "Environmental"
    }
  ],
  "pagination": {
    "total": 23,
    "limit": 5,
    "offset": 0,
    "has_more": true
  }
}`}
          />
        </div>

        <div id="get-page">
          <EndpointSection
            method="GET"
            path="/api/v1/pages/:id"
            description="Retrieve the full content of a specific ESG Hub article. Accepts a permalink path, slug, or SurrealDB record ID."
            params={[
              { name: "id", type: "string", required: true, description: "Page identifier — permalink path (e.g., 'environmental/climate-change'), slug (e.g., 'climate-change'), or record ID" },
            ]}
            example={`curl ${BASE}/api/v1/pages/environmental/climate-change`}
            response={`{
  "data": {
    "id": "page:abc123",
    "title": "Climate Change",
    "permalink": "/environmental/climate-change/",
    "description": "Understanding climate change...",
    "section": "environmental",
    "pillar": "Environmental",
    "keywords": "climate, emissions, global warming",
    "content": "## Overview\\n\\nClimate change refers to..."
  }
}`}
          />
        </div>

        <div id="list-resources">
          <EndpointSection
            method="GET"
            path="/api/v1/resources"
            description="List curated external ESG resources (standards bodies, regulations, tools, databases). Filter by source domain or search by title."
            params={[
              { name: "domain", type: "string", required: false, description: "Filter by source domain (e.g., 'ghgprotocol.org', 'www.cdp.net')" },
              { name: "q", type: "string", required: false, description: "Filter by title substring" },
              { name: "limit", type: "number", required: false, description: "Results per page (default: 20, max: 100)" },
              { name: "offset", type: "number", required: false, description: "Pagination offset (default: 0)" },
            ]}
            example={`curl "${BASE}/api/v1/resources?domain=ghgprotocol.org"`}
            response={`{
  "data": [
    {
      "id": "external_resource:xyz789",
      "title": "GHG Protocol Corporate Standard",
      "url": "https://ghgprotocol.org/corporate-standard",
      "domain": "ghgprotocol.org",
      "description": "The GHG Protocol Corporate Standard..."
    }
  ],
  "pagination": {
    "total": 7,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}`}
          />
        </div>

        <div id="search">
          <EndpointSection
            method="GET"
            path="/api/v1/search"
            description="Full-text keyword search across all ESG content using BM25 ranking. Searches page titles, descriptions, content, and external resource titles."
            params={[
              { name: "q", type: "string", required: true, description: "Search query (e.g., 'carbon emissions', 'board diversity')" },
              { name: "limit", type: "number", required: false, description: "Maximum results (default: 10, max: 50)" },
              { name: "source", type: "string", required: false, description: "Filter by source: 'all' (default), 'pages', or 'external'" },
            ]}
            example={`curl "${BASE}/api/v1/search?q=carbon+emissions&limit=5"`}
            response={`{
  "query": "carbon emissions",
  "mode": "keyword",
  "data": [
    {
      "id": "page:abc123",
      "title": "Scope 3 Emissions & Value Chain Decarbonization",
      "permalink": "/emerging-topics/scope-3-emissions/",
      "description": "Understanding Scope 3 emissions...",
      "section": "emerging-topics",
      "source_type": "page",
      "relevance": 12.5
    }
  ],
  "total": 30
}`}
          />
        </div>

        <div id="semantic-search">
          <EndpointSection
            method="POST"
            path="/api/v1/search"
            description="Semantic vector search using pre-computed embeddings. Send a 384-dimensional embedding vector (BAAI/bge-small-en-v1.5 model) to find conceptually related content. The ESG Hub search page generates embeddings client-side using @huggingface/transformers."
            params={[
              { name: "embedding", type: "number[384]", required: true, description: "384-dimensional embedding vector from BAAI/bge-small-en-v1.5 or compatible model" },
              { name: "k", type: "number", required: false, description: "Number of nearest neighbors (default: 10, max: 50)" },
              { name: "source", type: "string", required: false, description: "Filter: 'all' (default), 'pages', or 'external'" },
            ]}
            example={`curl -X POST ${BASE}/api/v1/search \\
  -H "Content-Type: application/json" \\
  -d '{"embedding": [0.012, -0.034, ...], "k": 5}'`}
            response={`{
  "query": "[vector]",
  "mode": "semantic",
  "data": [
    {
      "id": "page:abc123",
      "title": "Climate Change",
      "permalink": "/environmental/climate-change/",
      "similarity": 0.748,
      "source_type": "page"
    }
  ],
  "total": 5
}`}
          />
        </div>

        {/* Rate Limits & CORS */}
        <div style={{ marginTop: "1rem" }}>
          <h2>Rate Limits &amp; CORS</h2>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
            }}
          >
            The API is currently open with no authentication required. All
            endpoints support CORS for cross-origin browser requests. There are
            no strict rate limits, but please be respectful and avoid sending
            more than 60 requests per minute.
          </p>
        </div>

        {/* Error Handling */}
        <div style={{ marginTop: "1.5rem" }}>
          <h2>Error Handling</h2>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
            }}
          >
            All errors return a JSON object with an{" "}
            <code>error</code> field containing a human-readable message. HTTP
            status codes follow standard conventions: 400 for bad requests, 404
            for not found, and 500 for server errors.
          </p>
          <CodeBlock title="Error Response">{`{
  "error": "Missing required parameter: q"
}`}</CodeBlock>
        </div>
      </article>
    </div>
  );
}
