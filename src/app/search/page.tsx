import { Metadata } from "next";
import { searchPages } from "@/lib/pages";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} — ESG Hub` : "Search — ESG Hub",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  let results: Awaited<ReturnType<typeof searchPages>> = [];

  if (query) {
    try {
      results = await searchPages(query);
    } catch {
      results = [];
    }
  }

  return (
    <div className="content-wrapper" id="main-content">
      <h1 style={{ borderBottom: "none", marginBottom: "0.5rem" }}>
        Search ESG Hub
      </h1>

      {/* Search form */}
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
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {results.map((page) => (
              <Link
                key={page.id}
                href={page.permalink.replace(/\/$/, "") || "/"}
                className="search-result"
              >
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "var(--color-link)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {page.title}
                </div>
                {page.section && (
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.78rem",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {page.section}
                  </span>
                )}
                {page.description && (
                  <div
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--color-text-secondary)",
                      marginTop: "0.25rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {page.description.length > 200
                      ? page.description.substring(0, 200) + "..."
                      : page.description}
                  </div>
                )}
              </Link>
            ))}
          </div>
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
            Search across 300+ ESG topics, standards, and frameworks.
          </p>
          <p style={{ fontSize: "0.88rem" }}>
            Try searching for{" "}
            <Link href="/search?q=climate+change">climate change</Link>,{" "}
            <Link href="/search?q=GRI">GRI</Link>, or{" "}
            <Link href="/search?q=TCFD">TCFD</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
