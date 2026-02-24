import { CodeBlock, SidebarNav, Callout, TabbedCodeBlock } from "./CodeBlock";

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "setup", label: "Setup", href: "#setup" },
  { id: "tools", label: "Tools", href: "#tools" },
  { id: "prompts", label: "Example Prompts", href: "#prompts" },
  { id: "config", label: "Configuration", href: "#config" },
];

const MCP_TOOLS = [
  {
    name: "search_esg",
    description: "Search the ESG Hub knowledge base using full-text keyword search. Returns matching articles and resources ranked by relevance.",
    params: [
      { name: "query", type: "string", description: "Search query (required)" },
      { name: "limit", type: "number", description: "Max results (default: 10)" },
      { name: "source", type: "string", description: "Filter: 'all', 'pages', or 'resources'" },
    ],
  },
  {
    name: "get_esg_page",
    description: "Retrieve a specific ESG article by its slug/permalink. Returns the full article content including title, description, and markdown content.",
    params: [
      { name: "slug", type: "string", description: "Article slug (required, e.g., 'climate-change')" },
    ],
  },
  {
    name: "list_esg_pages",
    description: "List all ESG articles with optional filtering by section or pillar. Returns article metadata without full content.",
    params: [
      { name: "section", type: "string", description: "Filter by section (e.g., 'environmental')" },
      { name: "pillar", type: "string", description: "Filter by pillar: 'Environmental', 'Social', 'Governance'" },
      { name: "limit", type: "number", description: "Max results (default: 20)" },
    ],
  },
  {
    name: "list_esg_resources",
    description: "List curated external ESG resources (articles, reports, tools) with optional filtering by type.",
    params: [
      { name: "type", type: "string", description: "Filter: 'article', 'report', 'tool', 'dataset'" },
      { name: "limit", type: "number", description: "Max results (default: 20)" },
    ],
  },
  {
    name: "get_esg_metadata",
    description: "Get statistics about the ESG Hub knowledge base including total articles, resources, and section breakdowns.",
    params: [],
  },
];

function ToolCard({ name, description, params }: { name: string; description: string; params: { name: string; type: string; description: string }[] }) {
  return (
    <div style={{ padding: "1.25rem", border: "1px solid var(--color-border)", borderRadius: "8px", marginBottom: "1rem", background: "var(--color-bg-secondary)" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontFamily: "var(--font-mono)", color: "var(--color-primary)", fontWeight: 600 }}>
        {name}
      </h3>
      <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.55, margin: "0 0 0.75rem" }}>
        {description}
      </p>
      {params.length > 0 && (
        <div style={{ fontSize: "0.82rem" }}>
          <div style={{ fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Parameters</div>
          {params.map((p) => (
            <div key={p.name} style={{ display: "flex", gap: "0.5rem", padding: "0.25rem 0" }}>
              <code style={{ color: "var(--color-link)", flexShrink: 0 }}>{p.name}</code>
              <span style={{ color: "var(--color-text-muted)" }}>— {p.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function McpDocs() {
  return (
    <div className="docs-container">
      <SidebarNav items={SIDEBAR_ITEMS} activeId="overview" />
      
      <div className="docs-main">
        <article>
          <h1>MCP Server</h1>
          <p style={{ fontSize: "1.05rem", color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.65 }}>
            Connect AI assistants to the ESG Hub knowledge base via the Model Context Protocol (MCP). The server exposes tools for searching, retrieving, and browsing ESG content.
          </p>

          <Callout type="info" title="What is MCP?">
            The <strong>Model Context Protocol</strong> is an open standard that enables AI assistants to connect to external tools and data sources. Popular clients include Claude Desktop, Cursor, and Windsurf.
          </Callout>

          {/* Setup */}
          <section id="setup" style={{ marginBottom: "3rem" }}>
            <h2>Setup</h2>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              Choose your AI assistant client below. All options connect to the same ESG Hub MCP server.
            </p>

            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Claude Desktop</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: "0.75rem" }}>
              Add to your Claude Desktop configuration:
            </p>
            <CodeBlock language="json" title="claude_desktop_config.json">{`{
  "mcpServers": {
    "esg-hub": {
      "command": "npx",
      "args": ["-y", "@ascentpartners/esg-hub-mcp"]
    }
  }
}`}</CodeBlock>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
              Configuration file location: <code style={{ fontFamily: "var(--font-mono)", background: "var(--color-bg-secondary)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) or <code style={{ fontFamily: "var(--font-mono)", background: "var(--color-bg-secondary)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>%APPDATA%/Claude/claude_desktop_config.json</code> (Windows)
            </p>

            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Cursor / Windsurf</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: "0.75rem" }}>
              Add to your Cursor or Windsurf settings:
            </p>
            <CodeBlock language="json" title="Settings > MCP Servers">{`{
  "mcpServers": {
    "esg-hub": {
      "command": "npx",
      "args": ["-y", "@ascentpartners/esg-hub-mcp"]
    }
  }
}`}</CodeBlock>

            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem", marginTop: "1.5rem" }}>Manual Setup</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: "0.75rem" }}>
              Or run the server directly with Node.js:
            </p>
            <TabbedCodeBlock
              tabs={[
                {
                  label: "Install",
                  language: "bash",
                  code: `npm install -g @ascentpartners/esg-hub-mcp`,
                },
                {
                  label: "Run",
                  language: "bash",
                  code: `npx @ascentpartners/esg-hub-mcp`,
                },
              ]}
            />
          </section>

          {/* Tools */}
          <section id="tools" style={{ marginBottom: "3rem" }}>
            <h2>Available Tools</h2>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              The MCP server exposes 5 tools for interacting with the ESG Hub:
            </p>

            {MCP_TOOLS.map((tool) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </section>

          {/* Example Prompts */}
          <section id="prompts" style={{ marginBottom: "3rem" }}>
            <h2>Example Prompts</h2>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: "1rem" }}>
              Once connected, try asking your AI assistant:
            </p>
            <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
              {[
                "What are the key ESG reporting standards and how do they compare?",
                "Find information about Scope 3 emissions and value chain decarbonization",
                "List all articles about corporate governance and board diversity",
                "What external resources are available from the Global Reporting Initiative?",
                "Explain the TCFD framework using the ESG Hub knowledge base",
                "What are the main environmental regulations in the EU?",
                "Summarize the ESG Hub's coverage of social topics",
                "Find resources about green bonds and sustainable finance",
              ].map((prompt) => (
                <div
                  key={prompt}
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.88rem",
                    color: "var(--color-text-secondary)",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    lineHeight: 1.45,
                  }}
                >
                  &ldquo;{prompt}&rdquo;
                </div>
              ))}
            </div>
          </section>

          {/* Configuration */}
          <section id="config">
            <h2>Configuration</h2>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: "1rem" }}>
              The MCP server supports optional environment variables:
            </p>
            <table style={{ width: "100%", fontSize: "0.88rem", borderCollapse: "collapse", marginBottom: "2rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Variable</th>
                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Default</th>
                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <code style={{ fontSize: "0.82rem" }}>ESG_HUB_API_URL</code>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--color-text-muted)" }}>
                    <code style={{ fontSize: "0.82rem" }}>https://esg-hub.ascent.partners</code>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--color-text-secondary)" }}>
                    Base URL of the ESG Hub API
                  </td>
                </tr>
              </tbody>
            </table>

            <h3>Resources</h3>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: "1rem" }}>
              The MCP server also exposes a resource with the full API documentation:
            </p>
            <CodeBlock language="text" title="Resource URI">{`esg-hub://api-docs`}</CodeBlock>

            <h3 style={{ marginTop: "2rem" }}>Source Code</h3>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.55 }}>
              The MCP server source code is available in the{" "}
              <a href="https://github.com/simonplmak-cloud/esg-hub/tree/main/mcp-server" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-link)" }}>
                esg-hub/mcp-server
              </a>{" "}
              directory on GitHub. Contributions and feedback are welcome.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
