import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developers — ESG Hub",
  description:
    "Access the ESG Hub knowledge base programmatically via REST API or MCP server for AI agents.",
};

export default function DevelopersPage() {
  return (
    <div className="content-wrapper">
      <article>
        <h1>Developers</h1>
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--color-text-secondary)",
            marginBottom: "2rem",
            lineHeight: 1.65,
            maxWidth: "720px",
          }}
        >
          Access the ESG Hub knowledge base programmatically. Query 307 ESG
          articles and 244 curated external resources via our REST API, or
          connect AI agents through the Model Context Protocol (MCP) server.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          {/* REST API Card */}
          <Link
            href="/developers/api"
            style={{
              display: "block",
              padding: "1.5rem",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            className="topic-card"
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
                  fontSize: "1.5rem",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                }}
                role="img"
                aria-label="API"
              >
                {"{ }"}
              </span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontFamily: "var(--font-heading)",
                }}
              >
                REST API
              </h2>
            </div>
            <p
              style={{
                fontSize: "0.92rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Query pages, resources, and search the knowledge base with a
              simple HTTP API. Supports full-text keyword search and semantic
              vector search.
            </p>
          </Link>

          {/* MCP Server Card */}
          <Link
            href="/developers/mcp"
            style={{
              display: "block",
              padding: "1.5rem",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            className="topic-card"
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
                  fontSize: "1.5rem",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                }}
                role="img"
                aria-label="MCP"
              >
                AI
              </span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontFamily: "var(--font-heading)",
                }}
              >
                MCP Server
              </h2>
            </div>
            <p
              style={{
                fontSize: "0.92rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Connect AI assistants (Claude, Cursor, Windsurf) to the ESG Hub
              via the Model Context Protocol. Five tools for searching,
              browsing, and reading ESG content.
            </p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div style={{ marginTop: "2.5rem" }}>
          <h2>Knowledge Base at a Glance</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            {[
              { label: "ESG Articles", value: "307" },
              { label: "External Resources", value: "244" },
              { label: "Sections", value: "12+" },
              { label: "Source Domains", value: "46" },
              { label: "Search Modes", value: "2" },
              { label: "API Endpoints", value: "6" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-accent)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--color-text-muted)",
                    marginTop: "0.25rem",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
