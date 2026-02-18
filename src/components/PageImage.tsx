"use client";

import { useState } from "react";

/**
 * Maps ESG sections/topics to relevant Unsplash search terms.
 * Using curated keywords ensures high-quality, relevant images.
 */
const SECTION_IMAGE_MAP: Record<string, string> = {
  environmental: "nature sustainability green earth",
  social: "community people diversity workplace",
  governance: "corporate boardroom business meeting",
  standards: "document compliance regulation",
  "hk-apac": "hong kong skyline asia city",
  learning: "education books library study",
  sdg: "sustainable development goals global",
  ratings: "data analytics chart financial",
  finance: "finance stock market investment",
  investment: "investment portfolio sustainable finance",
  frameworks: "framework structure blueprint",
  "emerging-topics": "innovation technology future",
  books: "books library reading knowledge",
  videos: "video presentation conference",
  glossary: "dictionary reference guide",
};

/**
 * Keyword-based fallback for pages without a clear section match.
 */
const KEYWORD_IMAGE_MAP: Record<string, string> = {
  climate: "climate change weather earth",
  carbon: "carbon emissions factory smoke",
  biodiversity: "biodiversity wildlife nature forest",
  water: "water ocean river clean",
  energy: "renewable energy solar wind",
  waste: "recycling waste management",
  "human rights": "human rights equality justice",
  labor: "workers labor rights factory",
  health: "health safety workplace wellbeing",
  diversity: "diversity inclusion workplace",
  board: "corporate board governance meeting",
  ethics: "business ethics integrity",
  risk: "risk management assessment",
  supply: "supply chain logistics global",
  gri: "sustainability reporting standards",
  ifrs: "financial reporting accounting",
  tcfd: "climate disclosure reporting",
  tnfd: "nature biodiversity ecosystem",
  sasb: "sustainability accounting standards",
  sdg: "sustainable development goals united nations",
};

interface PageImageProps {
  section?: string | null;
  title: string;
  keywords?: string | null;
}

/**
 * Determines the best search query for an Unsplash image.
 */
function getImageQuery(section?: string | null, title?: string, keywords?: string | null): string {
  // Try section map first
  if (section && SECTION_IMAGE_MAP[section]) {
    return SECTION_IMAGE_MAP[section];
  }

  // Try keyword matching
  const lowerTitle = (title || "").toLowerCase();
  const lowerKeywords = (keywords || "").toLowerCase();
  const combined = lowerTitle + " " + lowerKeywords;

  for (const [key, query] of Object.entries(KEYWORD_IMAGE_MAP)) {
    if (combined.includes(key)) {
      return query;
    }
  }

  // Default fallback
  return "sustainability environment business";
}

/**
 * Renders a royalty-free hero image from Unsplash for a content page.
 * Uses the Unsplash Source API (no API key required for basic usage).
 */
export default function PageImage({ section, title, keywords }: PageImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const query = getImageQuery(section, title, keywords);
  // Use Unsplash Source API for royalty-free images (no key needed)
  const imageUrl = `https://source.unsplash.com/960x280/?${encodeURIComponent(query)}`;

  if (error) return null;

  return (
    <div style={{ position: "relative", marginBottom: "1rem" }}>
      <img
        src={imageUrl}
        alt={`Illustration for ${title}`}
        className="page-hero-image"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s",
        }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {loaded && (
        <div
          style={{
            position: "absolute",
            bottom: "0.4rem",
            right: "0.5rem",
            fontSize: "0.65rem",
            color: "rgba(255,255,255,0.6)",
            background: "rgba(0,0,0,0.4)",
            padding: "0.1em 0.4em",
            borderRadius: "2px",
          }}
        >
          Photo via{" "}
          <a
            href={`https://unsplash.com/s/photos/${encodeURIComponent(query)}?utm_source=esg_hub&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
}
