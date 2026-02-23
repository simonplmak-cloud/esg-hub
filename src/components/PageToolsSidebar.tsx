"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Page } from "@/lib/pages";
import { extractHeadings } from "@/lib/markdown";
import { PILLAR_STYLES, MAX_RELATED_PAGES } from "@/lib/constants";

interface PageToolsSidebarProps {
  page: Page;
}

interface RelatedPage {
  id: string;
  title: string;
  permalink: string;
  section: string;
}

interface BacklinkPage {
  id: string;
  title: string;
  permalink: string;
}

export default function PageToolsSidebar({ page }: PageToolsSidebarProps) {
  const [relatedPages, setRelatedPages] = useState<RelatedPage[]>([]);
  const [backlinks, setBacklinks] = useState<BacklinkPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [liveStatus, setLiveStatus] = useState<string>("");

  const fetchCrossReferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLiveStatus("Loading related content...");

    try {
      // Fetch related pages (automatic, max 15)
      const relatedRes = await fetch(
        `/api/v1/pages/${encodeURIComponent(page.id)}/related?limit=${MAX_RELATED_PAGES}`
      );
      
      let relatedData: RelatedPage[] = [];
      if (relatedRes.ok) {
        const data = await relatedRes.json();
        relatedData = data.data || [];
        setRelatedPages(relatedData);
      }

      // Fetch backlinks (show all)
      const backlinksRes = await fetch(
        `/api/v1/pages/${encodeURIComponent(page.id)}/backlinks`
      );
      
      let backlinksData: BacklinkPage[] = [];
      if (backlinksRes.ok) {
        const data = await backlinksRes.json();
        backlinksData = data.data || [];
        setBacklinks(backlinksData);
      }

      // Announce completion to screen readers
      const relatedCount = relatedData.length;
      const backlinkCount = backlinksData.length;
      setLiveStatus(
        `Content loaded. Found ${relatedCount} related topic${relatedCount !== 1 ? 's' : ''} and ${backlinkCount} page${backlinkCount !== 1 ? 's' : ''} that link here.`
      );
    } catch (err) {
      console.error("Error fetching cross-references:", err);
      const errorMessage = "Failed to load related content. Please try again later.";
      setError(errorMessage);
      setLiveStatus(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [page.id]);

  useEffect(() => {
    if (page.id) {
      fetchCrossReferences();
    }
  }, [page.id, fetchCrossReferences]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchCrossReferences();
  };

  const headings = extractHeadings(page.content);
  const standards = page.standards || [];
  const connectsTo = page.connects_to || [];

  return (
    <aside
      className="page-tools-sidebar"
      style={{
        borderLeft: "1px solid var(--color-border)",
        paddingLeft: "1.5rem",
        fontSize: "0.9rem",
      }}
      aria-label="Page tools and related content"
    >
      {/* Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        {liveStatus}
      </div>

      {/* Contents Navigation */}
      {headings.length > 0 && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-text)",
              marginBottom: "0.75rem",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "0.25rem",
            }}
          >
            Contents
          </h3>
          <nav aria-label="Page contents">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  style={{
                    marginLeft: heading.level === 3 ? "1rem" : 0,
                    marginBottom: "0.35rem",
                  }}
                >
                  <a
                    href={`#${heading.id}`}
                    style={{
                      color: "var(--color-link)",
                      textDecoration: "none",
                      fontSize: heading.level === 2 ? "0.9rem" : "0.85rem",
                      display: "block",
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      )}

      {/* Cross-Pillar Connections - EXPLICITLY HIGHLIGHTED */}
      {connectsTo.length > 1 && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-text)",
              marginBottom: "0.75rem",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "0.25rem",
            }}
          >
            Cross-Pillar Connections
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            {connectsTo.map((pillar: string) => {
              const style = PILLAR_STYLES[pillar as keyof typeof PILLAR_STYLES];
              return (
                <Link
                  key={pillar}
                  href={style?.href || "/"}
                  className={`pillar-badge ${pillar.toLowerCase()}`}
                  style={{
                    display: "inline-block",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: style?.bg || "#e2e8f0",
                    color: style?.color || "#2d3748",
                  }}
                >
                  {style?.label || pillar}
                </Link>
              );
            })}
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
            }}
          >
            This article connects to multiple ESG pillars
          </p>
        </section>
      )}

      {/* Applicable Standards - EVERY ARTICLE */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--color-text)",
            marginBottom: "0.75rem",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "0.25rem",
          }}
        >
          Applicable Standards
        </h3>
        {standards.length > 0 ? (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {standards.map((standard: string) => (
              <li
                key={standard}
                style={{
                  padding: "0.4rem 0",
                  borderBottom: "1px solid var(--color-border-light)",
                  fontSize: "0.85rem",
                }}
              >
                <Link
                  href={`/standards/${standard.toLowerCase().replace(/[^\w]/g, "-")}`}
                  style={{
                    color: "var(--color-link)",
                    textDecoration: "none",
                  }}
                >
                  {standard}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
            }}
          >
            No specific standards apply to this topic.
          </p>
        )}
      </section>

      {/* Related Topics - AUTOMATIC (Max 15) */}
      <section 
        style={{ marginBottom: "1.5rem" }}
        aria-busy={loading}
        aria-live="polite"
      >
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--color-text)",
            marginBottom: "0.75rem",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "0.25rem",
          }}
        >
          Related Topics
          {!loading && relatedPages.length > 0 && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 400,
                color: "var(--color-text-muted)",
                marginLeft: "0.5rem",
              }}
            >
              ({relatedPages.length})
            </span>
          )}
        </h3>
        
        {error ? (
          <div role="alert" aria-live="assertive">
            <p style={{ fontSize: "0.85rem", color: "#e53e3e", marginBottom: "0.75rem" }}>
              {error}
            </p>
            <button
              onClick={handleRetry}
              disabled={loading}
              style={{
                fontSize: "0.85rem",
                padding: "0.4rem 0.75rem",
                background: "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "3px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
              aria-label="Retry loading related content"
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>
          </div>
        ) : loading ? (
          <div role="status" aria-label="Loading related topics">
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Loading related topics...
            </p>
          </div>
        ) : relatedPages.length > 0 ? (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {relatedPages.slice(0, MAX_RELATED_PAGES).map((related) => (
              <li
                key={related.id}
                style={{
                  padding: "0.4rem 0",
                  borderBottom: "1px solid var(--color-border-light)",
                }}
              >
                <Link
                  href={related.permalink}
                  style={{
                    color: "var(--color-link)",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    display: "block",
                  }}
                >
                  {related.title}
                </Link>
                {related.section && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginTop: "0.15rem",
                    }}
                  >
                    {related.section}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
            }}
          >
            No related topics found.
          </p>
        )}
      </section>

      {/* Backlinks - SHOW ALL */}
      {backlinks.length > 0 && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-text)",
              marginBottom: "0.75rem",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "0.25rem",
            }}
          >
            What Links Here
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 400,
                color: "var(--color-text-muted)",
                marginLeft: "0.5rem",
              }}
            >
              ({backlinks.length})
            </span>
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {backlinks.map((link) => (
              <li
                key={link.id}
                style={{
                  padding: "0.4rem 0",
                  borderBottom: "1px solid var(--color-border-light)",
                }}
              >
                <Link
                  href={link.permalink}
                  style={{
                    color: "var(--color-link)",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Page Actions */}
      <section>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--color-text)",
            marginBottom: "0.75rem",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "0.25rem",
          }}
        >
          Page Tools
        </h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          <li style={{ marginBottom: "0.5rem" }}>
            <a
              href={`/api/v1/pages/${page.id}/pdf`}
              style={{
                color: "var(--color-link)",
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              Download as PDF
            </a>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <a
              href={`/api/v1/pages/${page.id}/cite`}
              style={{
                color: "var(--color-link)",
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              Cite this page
            </a>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <Link
              href={`/search?q=${encodeURIComponent(page.title)}`}
              style={{
                color: "var(--color-link)",
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              Find similar
            </Link>
          </li>
          <li>
            <Link
              href="/developers/api"
              style={{
                color: "var(--color-link)",
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              API Access
            </Link>
          </li>
        </ul>
      </section>
    </aside>
  );
}
