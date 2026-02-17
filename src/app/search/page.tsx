import { Metadata } from "next";
import { searchPages } from "@/lib/pages";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
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
      // Full-text search may not be available; fall back to empty
      results = [];
    }
  }

  return (
    <div className="content-wrapper">
      <h1>Search ESG Hub</h1>

      <form action="/search" method="GET" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search for ESG topics..."
            aria-label="Search query"
            style={{
              flex: 1,
              padding: "0.6em 1em",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              fontFamily: "var(--font-heading)",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.6em 1.5em",
              background: "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
          {results.length > 0
            ? `Found ${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
            : `No results found for "${query}"`}
        </p>
      )}

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {results.map((page) => (
            <Link
              key={page.id}
              href={page.permalink.replace(/\/$/, "") || "/"}
              style={{
                display: "block",
                padding: "1rem 1.2rem",
                border: "1px solid var(--color-border-light)",
                borderRadius: "6px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "var(--color-link)",
                  marginBottom: "0.3rem",
                }}
              >
                {page.title}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.3rem",
                }}
              >
                {page.permalink}
              </div>
              {page.description && (
                <div
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {page.description}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
