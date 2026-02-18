import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MCP Server — ESG Hub",
  description:
    "Connect AI assistants to the ESG Hub knowledge base via the Model Context Protocol (MCP). Setup guide for Claude Desktop, Cursor, and Windsurf.",
};

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

function ToolCard({
  name,
  description,
  params,
}: {
  name: string;
  description: string;
  params: string[];
}) {
  return (
    <div
      style={{
        padding: "1.25rem",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        marginBottom: "1rem",
      }}
    >
      <h3
        style={{
          margin: "0 0 0.5rem",
          fontSize: "1rem",
          fontFamily: "monospace",
          color: "var(--color-accent)",
        }}
      >
        {name}
      </h3>
      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--color-text-secondary)",
          lineHeight: 1.55,
          margin: "0 0 0.75rem",
        }}
      >
        {description}
      </p>
      {params.length > 0 && (
        <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          <strong>Parameters:</strong>{" "}
          {params.map((p, i) => (
            <span key={p}>
              <code style={{ fontSize: "0.8rem" }}>{p}</code>
              {i < params.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function McpDocsPage() {
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
          MCP Server
        </span>
      </nav>

      <article>
        <h1>MCP Server</h1>
        <p
          style={{
            fontSize: "1.02rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
            lineHeight: 1.65,
            maxWidth: "720px",
          }}
        >
          The ESG Hub MCP server connects AI assistants to the knowledge base
          via the{" "}
          <a
            href="https://modelcontextprotocol.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-link)" }}
          >
            Model Context Protocol
          </a>
          . Once configured, your AI assistant can search, browse, and read all
          307 ESG articles and 244 external resources.
        </p>

        {/* Setup Instructions */}
        <h2>Setup</h2>

        <h3>Claude Desktop</h3>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
          }}
        >
          Add the following to your{" "}
          <code>claude_desktop_config.json</code> file (Settings → Developer → Edit Config):
        </p>
        <CodeBlock title="claude_desktop_config.json">{`{
  "mcpServers": {
    "esg-hub": {
      "command": "npx",
      "args": ["-y", "@esg-hub/mcp-server"]
    }
  }
}`}</CodeBlock>

        <h3>Cursor</h3>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
          }}
        >
          Open Cursor Settings → MCP → Add Server, then paste:
        </p>
        <CodeBlock title="Cursor MCP Settings">{`{
  "esg-hub": {
    "command": "npx",
    "args": ["-y", "@esg-hub/mcp-server"]
  }
}`}</CodeBlock>

        <h3>Windsurf</h3>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
          }}
        >
          Open Windsurf Settings → MCP, and add the same configuration as Cursor above.
        </p>

        <h3>Manual (from source)</h3>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
          }}
        >
          Clone the repository and run the MCP server directly:
        </p>
        <CodeBlock title="Terminal">{`git clone https://github.com/simonplmak-cloud/esg-hub.git
cd esg-hub/mcp-server
pnpm install
pnpm build
node dist/index.js`}</CodeBlock>

        {/* Available Tools */}
        <h2 style={{ marginTop: "2rem" }}>Available Tools</h2>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
            marginBottom: "1.25rem",
          }}
        >
          The MCP server exposes five tools that AI assistants can call:
        </p>

        <ToolCard
          name="search_esg"
          description="Search the ESG Hub knowledge base using full-text keyword search with BM25 ranking. Returns pages and external resources matching the query, ranked by relevance."
          params={["query (required)", "limit (1-50, default: 10)", "source ('all' | 'pages' | 'external')"]}
        />
        <ToolCard
          name="get_esg_page"
          description="Retrieve the full content of a specific ESG Hub article by its permalink, slug, or record ID. Returns the complete article text, section, pillar, keywords, and metadata."
          params={["page_id (required)"]}
        />
        <ToolCard
          name="list_esg_pages"
          description="List ESG Hub articles with optional filtering by section, pillar, or title substring. Returns paginated results with metadata."
          params={["section", "pillar", "query", "limit (1-100)", "offset"]}
        />
        <ToolCard
          name="list_esg_resources"
          description="List curated external ESG resources with optional filtering by source domain or title. Includes links to standards bodies, regulators, and ESG databases."
          params={["domain", "query", "limit (1-100)", "offset"]}
        />
        <ToolCard
          name="get_esg_metadata"
          description="Get ESG Hub database statistics including total pages, resources, available sections, pillars, and source domains. Useful for understanding the scope of the knowledge base."
          params={[]}
        />

        {/* Example Prompts */}
        <h2 style={{ marginTop: "2rem" }}>Example Prompts</h2>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
            marginBottom: "1rem",
          }}
        >
          Once the MCP server is connected, you can ask your AI assistant
          questions like:
        </p>
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
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

        {/* Environment Variables */}
        <h2>Configuration</h2>
        <table
          style={{
            width: "100%",
            fontSize: "0.88rem",
            borderCollapse: "collapse",
            marginBottom: "2rem",
          }}
        >
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
                <code style={{ fontSize: "0.82rem" }}>https://esg-hub-six.vercel.app</code>
              </td>
              <td style={{ padding: "0.5rem 0.75rem", color: "var(--color-text-secondary)" }}>
                Base URL of the ESG Hub API
              </td>
            </tr>
          </tbody>
        </table>

        {/* Resources */}
        <h2>Resources</h2>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
            marginBottom: "1rem",
          }}
        >
          The MCP server also exposes a resource with the full API documentation:
        </p>
        <CodeBlock title="Resource URI">{`esg-hub://api-docs`}</CodeBlock>

        <div style={{ marginTop: "1.5rem" }}>
          <h2>Source Code</h2>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.55,
            }}
          >
            The MCP server source code is available in the{" "}
            <a
              href="https://github.com/simonplmak-cloud/esg-hub/tree/main/mcp-server"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-link)" }}
            >
              esg-hub/mcp-server
            </a>{" "}
            directory on GitHub. Contributions and feedback are welcome.
          </p>
        </div>
      </article>
    </div>
  );
}
