"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

interface OpenAlexWork {
  id: string;
  title: string;
  doi: string | null;
  publication_year: number;
  cited_by_count: number;
  authorships: Array<{
    author: { display_name: string };
  }>;
  primary_location?: {
    source?: { display_name: string };
  };
  abstract_inverted_index?: Record<string, number[]>;
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  citations: number;
  abstract: string;
  url: string;
}

/**
 * Reconstruct abstract from OpenAlex inverted index format.
 */
function reconstructAbstract(invertedIndex: Record<string, number[]> | undefined): string {
  if (!invertedIndex) return "";
  const words: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos]);
    }
  }
  words.sort((a, b) => a[1] - b[1]);
  const text = words.map(([word]) => word).join(" ");
  return text.length > 300 ? text.substring(0, 300) + "..." : text;
}

/**
 * Build a search query from the page title and keywords.
 */
function buildSearchQuery(title: string, keywords?: string | null): string {
  // Extract key terms, remove common words
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "this", "that",
    "these", "those", "it", "its", "not", "no", "nor", "as", "if",
  ]);

  const terms = (title + " " + (keywords || ""))
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Take up to 5 most relevant terms
  const unique = [...new Set(terms)].slice(0, 5);
  return unique.join(" ");
}

interface OpenAlexResearchProps {
  title: string;
  keywords?: string | null;
}

export default function OpenAlexResearch({ title, keywords }: OpenAlexResearchProps) {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("OpenAlex");

  const searchQuery = useMemo(() => buildSearchQuery(title, keywords), [title, keywords]);

  useEffect(() => {
    if (!searchQuery) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchPapers() {
      try {
        const url = `https://api.openalex.org/works?search=${encodeURIComponent(searchQuery)}&filter=cited_by_count:>5,type:article&sort=cited_by_count:desc&per_page=6&mailto=info@ascent.partners`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error("OpenAlex API error");

        const data = await res.json();
        const results: ResearchPaper[] = (data.results || []).map((work: OpenAlexWork) => ({
          id: work.id,
          title: work.title || "Untitled",
          authors: work.authorships
            ?.slice(0, 3)
            .map((a) => a.author.display_name)
            .join(", ") || "Unknown",
          year: work.publication_year || 0,
          journal: work.primary_location?.source?.display_name || "Unknown",
          citations: work.cited_by_count || 0,
          abstract: reconstructAbstract(work.abstract_inverted_index),
          url: work.doi ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}` : work.id,
        }));

        setPapers(results);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPapers();
    return () => controller.abort();
  }, [searchQuery]);

  if (error || (!loading && papers.length === 0)) return null;

  return (
    <section
      style={{
        marginTop: "2rem",
        borderTop: "1px solid var(--color-border-light)",
        paddingTop: "1.2rem",
      }}
    >
      <h2
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            style={{
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          {t("relatedResearch")}
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--color-text-muted)",
              fontWeight: 400,
              marginLeft: "0.3rem",
            }}
          >
            {t("viaOpenAlex")}
          </span>
        </span>
      </h2>

      {loading && (
        <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
          {t("loadingPapers")}
        </div>
      )}

      {expanded && !loading && papers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
          {papers.map((paper) => (
            <a
              key={paper.id}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="research-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="research-card-title">{paper.title}</div>
              <div className="research-card-meta">
                {paper.authors}
                {paper.year > 0 && ` (${paper.year})`}
                {paper.journal !== "Unknown" && ` — ${paper.journal}`}
                {paper.citations > 0 && ` · ${paper.citations} citations`}
              </div>
              {paper.abstract && (
                <div className="research-card-abstract">{paper.abstract}</div>
              )}
            </a>
          ))}
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
            {t("dataSourced")}
          </div>
        </div>
      )}

      {!expanded && !loading && papers.length > 0 && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            marginTop: "0.2rem",
          }}
          onClick={() => setExpanded(true)}
        >
          {t("papersFound", { count: papers.length })}
        </p>
      )}
    </section>
  );
}
