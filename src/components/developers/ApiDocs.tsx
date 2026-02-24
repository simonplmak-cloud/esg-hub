import { CodeBlock, TabbedCodeBlock, SidebarNav, Callout } from "./CodeBlock";

const SIDEBAR_ITEMS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "authentication", label: "Authentication" },
  { id: "endpoints", label: "Endpoints", href: "#endpoints" },
  { id: "errors", label: "Error Handling", href: "#errors" },
  { id: "limits", label: "Rate Limits", href: "#limits" },
];

const BASE = "https://esg-hub.ascent.partners";

function EndpointSection({
  method,
  path,
  description,
  params,
  example,
  response,
  id,
}: {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  example: string;
  response: string;
  id?: string;
}) {
  const methodColors: Record<string, { bg: string; color: string }> = {
    GET: { bg: "#134e4a", color: "#6ee7b7" },
    POST: { bg: "#1e3a5f", color: "#60a5fa" },
    PUT: { bg: "#4a3f1e", color: "#fbbf24" },
    DELETE: { bg: "#4a1e1e", color: "#f87171" },
  };
  const colors = methodColors[method] || methodColors.GET;

  return (
    <div id={id} style={{ marginBottom: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <span
          style={{
            padding: "0.25rem 0.6rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            fontFamily: "monospace",
            borderRadius: "4px",
            backgroundColor: colors.bg,
            color: colors.color,
          }}
        >
          {method}
        </span>
        <code style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text)" }}>
          {path}
        </code>
      </div>
      <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: "1rem" }}>
        {description}
      </p>

      {params && params.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h4 style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Parameters
          </h4>
          <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Type</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Required</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.name} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.5rem 0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-link)" }}>{p.name}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>{p.type}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    {p.required ? (
                      <span style={{ color: "#f87171", fontWeight: 500 }}>Required</span>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>Optional</span>
                    )}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--color-text-secondary)" }}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Request Example
        </h4>
        <CodeBlock language="bash" title="curl">{example}</CodeBlock>
      </div>

      <div>
        <h4 style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Response
        </h4>
        <CodeBlock language="json">{response}</CodeBlock>
      </div>
    </div>
  );
}

export default function ApiDocs() {
  return (
    <div className="docs-container">
      <SidebarNav items={SIDEBAR_ITEMS} activeId="endpoints" />
      
      <div className="docs-main">
        <article>
          <h1>REST API</h1>
          <p style={{ fontSize: "1.05rem", color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.65 }}>
            Query the ESG Hub knowledge base programmatically. Search articles, browse resources, and integrate ESG data into your applications.
          </p>

          {/* Getting Started */}
          <section id="getting-started" style={{ marginBottom: "3rem" }}>
            <h2>Getting Started</h2>
            <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              The ESG Hub API is REST-based and returns JSON responses. No authentication is required for public endpoints.
            </p>

            <Callout type="info" title="Base URL">
              All API requests should be made to: <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-link)" }}>https://esg-hub.ascent.partners/api/v1</code>
            </Callout>

            <h3 style={{ fontSize: "1.1rem", marginTop: "1.5rem", marginBottom: "0.75rem" }}>Quick Start</h3>
            <ol style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.8, paddingLeft: "1.25rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>Choose an endpoint below (e.g., <code>/api/v1/pages</code> for articles)</li>
              <li style={{ marginBottom: "0.5rem" }}>Make a request using cURL, JavaScript, or Python</li>
              <li style={{ marginBottom: "0.5rem" }}>Parse the JSON response for the data you need</li>
            </ol>

            <h3 style={{ fontSize: "1.1rem", marginTop: "1.5rem", marginBottom: "0.75rem" }}>Code Examples</h3>
            <TabbedCodeBlock
              tabs={[
                {
                  label: "cURL",
                  language: "bash",
                  code: `curl -s "${BASE}/api/v1/pages?limit=3" | jq .`,
                },
                {
                  label: "JavaScript",
                  language: "javascript",
                  code: `const response = await fetch('${BASE}/api/v1/pages?limit=3');
const data = await response.json();
console.log(data.data.map(p => p.title));`,
                },
                {
                  label: "Python",
                  language: "python",
                  code: `import requests

response = requests.get('${BASE}/api/v1/pages', params={'limit': 3})
data = response.json()
for page in data['data']:
    print(page['title'])`,
                },
              ]}
            />
          </section>

          {/* Authentication */}
          <section id="authentication" style={{ marginBottom: "3rem" }}>
            <h2>Authentication</h2>
            <Callout type="success" title="No Authentication Required">
              The ESG Hub API is currently open and does not require authentication. All endpoints are publicly accessible.
            </Callout>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginTop: "1rem" }}>
              Simply make HTTP requests to the endpoints below. For browser-based applications, CORS headers are included to allow cross-origin requests.
            </p>
          </section>

          {/* Endpoints */}
          <section id="endpoints">
            <h2>Endpoints</h2>

            <EndpointSection
              id="meta"
              method="GET"
              path="/api/v1/meta"
              description="Get metadata about the ESG Hub knowledge base, including article counts, section statistics, and database timestamps."
              example={`curl -s "${BASE}/api/v1/meta"`}
              response={`{
  "total_pages": 351,
  "total_resources": 244,
  "sections": [
    { "name": "environmental", "count": 23 },
    { "name": "governance", "count": 65 }
  ],
  "updated_at": "2026-02-24T12:00:00Z"
}`}
            />

            <EndpointSection
              id="list-pages"
              method="GET"
              path="/api/v1/pages"
              description="List all ESG articles with optional filtering. Supports filtering by section, pillar, and full-text search."
              params={[
                { name: "section", type: "string", required: false, description: "Filter by section (e.g., 'environmental', 'governance')" },
                { name: "pillar", type: "string", required: false, description: "Filter by pillar: 'Environmental', 'Social', or 'Governance'" },
                { name: "q", type: "string", required: false, description: "Full-text search in title and description" },
                { name: "limit", type: "number", required: false, description: "Results per page (default: 20, max: 100)" },
                { name: "offset", type: "number", required: false, description: "Pagination offset" },
              ]}
              example={`# List all pages
curl -s "${BASE}/api/v1/pages?limit=5"

# Filter by section
curl -s "${BASE}/api/v1/pages?section=environmental&limit=10"

# Search for climate
curl -s "${BASE}/api/v1/pages?q=climate&limit=5"`}
              response={`{
  "data": [
    {
      "id": "page:abc123",
      "title": "Climate Change",
      "description": "Understanding climate risks...",
      "section": "environmental",
      "pillar": "Environmental",
      "permalink": "/environmental/climate-change/"
    }
  ],
  "pagination": {
    "total": 351,
    "limit": 5,
    "offset": 0,
    "has_more": true
  }
}`}
            />

            <EndpointSection
              id="get-page"
              method="GET"
              path="/api/v1/pages/:id"
              description="Get a single page by its ID. Returns full content including markdown and metadata."
              example={`curl -s "${BASE}/api/v1/pages/page:abc123"`}
              response={`{
  "id": "page:abc123",
  "title": "Climate Change",
  "content": "# Climate Change\\n\\nClimate change refers to...",
  "keywords": "climate, carbon, emissions",
  "created_at": "2024-01-15T10:30:00Z"
}`}
            />

            <EndpointSection
              id="resources"
              method="GET"
              path="/api/v1/resources"
              description="List curated external ESG resources. These are links to external articles, reports, and tools."
              params={[
                { name: "type", type: "string", required: false, description: "Filter by type: 'article', 'report', 'tool', 'dataset'" },
                { name: "q", type: "string", required: false, description: "Search in title and description" },
                { name: "limit", type: "number", required: false, description: "Results per page (default: 20)" },
              ]}
              example={`# List all resources
curl -s "${BASE}/api/v1/resources?limit=5"

# Filter by type
curl -s "${BASE}/api/v1/resources?type=report&limit=10"`}
              response={`{
  "data": [
    {
      "id": "resource:xyz789",
      "title": "TCFD Recommendations",
      "url": "https://assets.bbhub.io/...",
      "type": "report",
      "source": "TCFD"
    }
  ],
  "pagination": { "total": 244, "limit": 5, "offset": 0 }
}`}
            />

            <EndpointSection
              id="search"
              method="GET"
              path="/api/v1/search"
              description="Full-text keyword search across all pages and resources. Use this for simple search queries."
              params={[
                { name: "q", type: "string", required: true, description: "Search query (required)" },
                { name: "limit", type: "number", required: false, description: "Results to return (default: 10)" },
                { name: "source", type: "string", required: false, description: "Filter: 'all', 'pages', or 'resources'" },
              ]}
              example={`curl -s "${BASE}/api/v1/search?q=carbon+emissions&limit=5"`}
              response={`{
  "query": "carbon emissions",
  "mode": "keyword",
  "data": [
    { "title": "Carbon Emissions", "permalink": "/environmental/carbon-emissions/", "score": 0.95 }
  ],
  "total": 12
}`}
            />

            <EndpointSection
              id="semantic-search"
              method="POST"
              path="/api/v1/search"
              description="Semantic vector search using pre-computed embeddings. Send a 384-dimensional embedding vector to find conceptually related content."
              params={[
                { name: "embedding", type: "number[384]", required: true, description: "384-dimensional embedding vector" },
                { name: "k", type: "number", required: false, description: "Number of results (default: 10, max: 50)" },
                { name: "source", type: "string", required: false, description: "Filter: 'all', 'pages', or 'resources'" },
              ]}
              example={`curl -X POST "${BASE}/api/v1/search" \\
  -H "Content-Type: application/json" \\
  -d '{"embedding": [0.012, -0.034, 0.056, ...], "k": 5}'`}
              response={`{
  "query": "[vector]",
  "mode": "semantic",
  "data": [
    {
      "title": "Climate Risk Assessment",
      "permalink": "/environmental/climate-risk/",
      "similarity": 0.748
    }
  ],
  "total": 5
}`}
            />
          </section>

          {/* Error Handling */}
          <section id="errors" style={{ marginTop: "2rem" }}>
            <h2>Error Handling</h2>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "1rem" }}>
              All errors return a JSON object with an <code style={{ fontFamily: "var(--font-mono)", background: "var(--color-bg-secondary)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>error</code> field containing a human-readable message.
            </p>
            <CodeBlock language="json" title="Error Response">{`{
  "error": "Missing required parameter: q"
}`}</CodeBlock>
            <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: 600 }}>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.5rem", fontFamily: "var(--font-mono)", color: "#f87171" }}>400</td>
                  <td style={{ padding: "0.5rem", color: "var(--color-text-secondary)" }}>Bad Request - Missing or invalid parameters</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.5rem", fontFamily: "var(--font-mono)", color: "#f87171" }}>404</td>
                  <td style={{ padding: "0.5rem", color: "var(--color-text-secondary)" }}>Not Found - Resource does not exist</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.5rem", fontFamily: "var(--font-mono)", color: "#f87171" }}>500</td>
                  <td style={{ padding: "0.5rem", color: "var(--color-text-secondary)" }}>Server Error - Please try again later</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Rate Limits */}
          <section id="limits" style={{ marginTop: "2rem" }}>
            <h2>Rate Limits</h2>
            <Callout type="info" title="No Strict Rate Limits">
              The API is currently open with no authentication required. Please be respectful and avoid sending more than 60 requests per minute.
            </Callout>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginTop: "1rem" }}>
              All endpoints support CORS for cross-origin browser requests. The API includes caching headers for efficient client-side caching.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
