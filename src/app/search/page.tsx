import { Metadata } from "next";
import { keywordSearch, type SearchResult } from "@/lib/search";
import { semanticSearch } from "@/lib/search";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; mode?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} — ESG Hub` : "Search — ESG Hub",
    description: q
      ? `Search results for "${q}" across ESG Hub knowledge base and external resources.`
      : "Search across 300+ ESG topics, standards, frameworks, and 240+ external authoritative sources.",
  };
}

/**
 * Generate embedding server-side using fastembed Python library
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const { execSync } = await import("child_process");
    const truncated = text.slice(0, 2000).replace(/\n/g, " ").replace(/\r/g, "");
    const escapedText = truncated.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    const result = execSync(
      `python3 -c "
import json
from fastembed import TextEmbedding
model = TextEmbedding('BAAI/bge-small-en-v1.5')
emb = list(model.embed(['${escapedText.replace(/'/g, "\\'")}']))[0]
print(json.dumps(emb.tolist()))
"`,
      { timeout: 30000, encoding: "utf-8" }
    );

    return JSON.parse(result.trim());
  } catch (err) {
    console.error("Embedding generation failed:", err);
    return null;
  }
}

function ResultCard({ result }: { result: SearchResult }) {
  const isExternal = result.source_type === "external";
  const href = isExternal
    ? result.url || "#"
    : (result.permalink?.replace(/\/$/, "") || "/");

  return (
    <a
      href={href}
      className="search-result"
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      style={{ display: "block" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "1rem",
            color: "var(--color-link)",
          }}
        >
          {result.title}
        </span>
        {isExternal && (
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "0.1em 0.45em",
              borderRadius: "3px",
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            External
          </span>
        )}
      </div>

      {/* Source info */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {result.section && (
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.78rem",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            {result.section}
          </span>
        )}
        {result.source_domain && (
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.78rem",
              color: "var(--color-text-muted)",
            }}
          >
            {result.source_domain}
          </span>
        )}
        {result.distance !== undefined && (
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
            }}
          >
            Similarity: {((1 - result.distance) * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {result.description && (
        <div
          style={{
            fontSize: "0.88rem",
            color: "var(--color-text-secondary)",
            marginTop: "0.25rem",
            lineHeight: 1.5,
          }}
        >
          {result.description.length > 200
            ? result.description.substring(0, 200) + "..."
            : result.description}
        </div>
      )}
    </a>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, mode: modeParam } = await searchParams;
  const query = q?.trim() || "";
  const mode = modeParam === "semantic" ? "semantic" : "keyword";

  let results: SearchResult[] = [];
  let embeddingGenerated = false;

  if (query) {
    try {
      if (mode === "semantic") {
        const embedding = await generateEmbedding(query);
        if (embedding) {
          embeddingGenerated = true;
          results = await semanticSearch(embedding, 20);
        } else {
          // Fallback to keyword search if embedding fails
          results = (await keywordSearch(query)).map((r) => ({
            ...r,
            source_type: r.source_type || "page",
          }));
        }
      } else {
        results = (await keywordSearch(query)).map((r) => ({
          ...r,
          source_type: r.source_type || "page",
        }));
      }
    } catch {
      results = [];
    }
  }

  const pageResults = results.filter((r) => r.source_type === "page");
  const externalResults = results.filter((r) => r.source_type === "external");

  return (
    <div className="content-wrapper" id="main-content">
      <h1 style={{ borderBottom: "none", marginBottom: "0.5rem" }}>
        Search ESG Hub
      </h1>

      {/* Search form with mode toggle */}
      <form
        action="/search"
        method="GET"
        role="search"
        style={{ marginBottom: "1.5rem" }}
      >
        <label
          htmlFor="search-input"
          style={{
            display: "block",
            fontFamily: "var(--font-heading)",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            marginBottom: "0.4rem",
          }}
        >
          Enter a topic, framework, or keyword
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            id="search-input"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="e.g. climate change, GRI, TCFD..."
            aria-label="Search query"
            style={{
              flex: 1,
              padding: "0.6em 0.8em",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              fontFamily: "var(--font-heading)",
              fontSize: "1rem",
              color: "var(--color-text)",
              background: "var(--color-bg)",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.6em 1.2em",
              background: "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontFamily: "var(--font-heading)",
              fontSize: "0.92rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        {/* Search mode toggle */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "0.75rem",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.82rem",
              color: "var(--color-text-muted)",
              fontWeight: 500,
            }}
          >
            Search mode:
          </span>
          <div
            style={{
              display: "flex",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <button
              type="submit"
              name="mode"
              value="keyword"
              style={{
                padding: "0.3em 0.8em",
                fontFamily: "var(--font-heading)",
                fontSize: "0.82rem",
                fontWeight: mode === "keyword" ? 700 : 400,
                border: "none",
                cursor: "pointer",
                background:
                  mode === "keyword"
                    ? "var(--color-primary)"
                    : "var(--color-bg)",
                color: mode === "keyword" ? "#fff" : "var(--color-text-secondary)",
              }}
              aria-pressed={mode === "keyword"}
            >
              Keyword (BM25)
            </button>
            <button
              type="submit"
              name="mode"
              value="semantic"
              style={{
                padding: "0.3em 0.8em",
                fontFamily: "var(--font-heading)",
                fontSize: "0.82rem",
                fontWeight: mode === "semantic" ? 700 : 400,
                border: "none",
                borderLeft: "1px solid var(--color-border)",
                cursor: "pointer",
                background:
                  mode === "semantic"
                    ? "var(--color-primary)"
                    : "var(--color-bg)",
                color:
                  mode === "semantic" ? "#fff" : "var(--color-text-secondary)",
              }}
              aria-pressed={mode === "semantic"}
            >
              Semantic (AI)
            </button>
          </div>
          {mode === "semantic" && (
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                fontStyle: "italic",
              }}
            >
              Finds conceptually related content using vector embeddings
            </span>
          )}
        </div>
      </form>

      {/* Results */}
      {query && (
        <div aria-live="polite">
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.88rem",
              color: "var(--color-text-muted)",
              marginBottom: "1rem",
            }}
          >
            {results.length === 0
              ? `No results found for "${query}".`
              : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
            {mode === "semantic" && embeddingGenerated && (
              <span> — semantic search</span>
            )}
          </p>

          {/* ESG Hub pages */}
          {pageResults.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  borderBottom: "none",
                  marginTop: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                ESG Hub Articles ({pageResults.length})
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {pageResults.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            </div>
          )}

          {/* External resources */}
          {externalResults.length > 0 && (
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  borderBottom: "none",
                  marginTop: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                External Resources ({externalResults.length})
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                Curated content from authoritative ESG sources (OECD, ILO, GRI,
                IFRS, HKEX, EPA, and more).
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {externalResults.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!query && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem 0",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
            Search across 300+ ESG topics and 240+ external authoritative
            sources.
          </p>
          <p style={{ fontSize: "0.88rem", marginBottom: "1rem" }}>
            Try searching for{" "}
            <Link href="/search?q=climate+change">climate change</Link>,{" "}
            <Link href="/search?q=GRI">GRI</Link>, or{" "}
            <Link href="/search?q=TCFD">TCFD</Link>.
          </p>
          <div
            style={{
              background: "var(--color-bg-alt)",
              border: "1px solid var(--color-border-light)",
              borderRadius: "6px",
              padding: "1.2rem 1.5rem",
              maxWidth: "600px",
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.95rem",
                fontWeight: 700,
                marginTop: 0,
                marginBottom: "0.5rem",
              }}
            >
              Search Modes
            </h3>
            <div style={{ fontSize: "0.88rem", lineHeight: 1.65 }}>
              <p style={{ margin: "0.4em 0" }}>
                <strong style={{ fontFamily: "var(--font-heading)" }}>
                  Keyword (BM25):
                </strong>{" "}
                Traditional full-text search. Matches exact terms in titles and
                content using BM25 ranking.
              </p>
              <p style={{ margin: "0.4em 0" }}>
                <strong style={{ fontFamily: "var(--font-heading)" }}>
                  Semantic (AI):
                </strong>{" "}
                AI-powered search using vector embeddings. Finds conceptually
                related content even when exact keywords differ. Powered by
                SurrealDB HNSW vector index.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
