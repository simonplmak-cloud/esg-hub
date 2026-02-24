import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
    title: "307+ ESG Articles",
    description: "Comprehensive coverage of ESG topics with regularly updated content",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    ),
    title: "244 Resources",
    description: "Curated external resources from leading ESG organizations",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
    title: "12+ Sections",
    description: "Organized content across environmental, social, and governance topics",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
    title: "Dual Search Modes",
    description: "Keyword search and semantic vector search for smarter results",
  },
];

export default function DevelopersLanding() {
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
          Access the ESG Hub knowledge base programmatically. Query 307 ESG articles and 244 curated external resources via our REST API, or connect AI agents through the Model Context Protocol (MCP) server.
        </p>

        {/* Feature Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "1rem",
                background: "var(--color-bg-secondary)",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ color: "var(--color-primary)", flexShrink: 0 }}>
                {feature.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Integration Options */}
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Choose Your Integration</h2>
        
        {/* REST API vs MCP Comparison */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem",
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
              transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
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
                  fontSize: "1.25rem",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                }}
                role="img"
                aria-label="API"
              >
                {"{ }"}
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}>
                  REST API
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>HTTP JSON</span>
              </div>
            </div>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.55, margin: 0 }}>
              Query pages, resources, and search the knowledge base with a simple HTTP API. Supports full-text keyword search and semantic vector search.
            </p>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--color-bg-alt)", borderRadius: "4px", color: "var(--color-text-muted)" }}>6 Endpoints</span>
              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--color-bg-alt)", borderRadius: "4px", color: "var(--color-text-muted)" }}>No Auth</span>
              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--color-bg-alt)", borderRadius: "4px", color: "var(--color-text-muted)" }}>JSON</span>
            </div>
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
              transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
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
                  fontSize: "1.25rem",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                  fontWeight: 700,
                }}
                role="img"
                aria-label="MCP"
              >
                AI
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}>
                  MCP Server
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Model Context Protocol</span>
              </div>
            </div>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.55, margin: 0 }}>
              Connect AI assistants (Claude, Cursor, Windsurf) to the ESG Hub via the Model Context Protocol. Five tools for searching, browsing, and reading ESG content.
            </p>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--color-bg-alt)", borderRadius: "4px", color: "var(--color-text-muted)" }}>5 Tools</span>
              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--color-bg-alt)", borderRadius: "4px", color: "var(--color-text-muted)" }}>Claude Compatible</span>
              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "var(--color-bg-alt)", borderRadius: "4px", color: "var(--color-text-muted)" }}>Zero Setup</span>
            </div>
          </Link>
        </div>

        {/* When to Use Which */}
        <div style={{ marginBottom: "2.5rem", padding: "1.5rem", background: "var(--color-bg-secondary)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", marginTop: 0 }}>Which should I use?</h3>
          <div style={{ display: "grid", gap: "1rem", fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>REST API</span>
              <span>— Best for web applications, mobile apps, server-side integrations, and when you need full control over requests.</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>MCP Server</span>
              <span>— Best for AI-powered workflows, chatbots, code assistants, and when you want AI to search and cite ESG content directly.</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Knowledge Base at a Glance</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "1rem",
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
