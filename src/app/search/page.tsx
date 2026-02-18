import { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Search — ESG Hub",
  description:
    "Search across 300+ ESG topics, standards, frameworks, and 240+ external authoritative sources. Supports keyword and AI-powered semantic search.",
  alternates: {
    canonical: "https://esg-hub-six.vercel.app/search",
  },
  openGraph: {
    title: "Search — ESG Hub",
    description:
      "Search across 300+ ESG topics, standards, frameworks, and 240+ external authoritative sources.",
    url: "https://esg-hub-six.vercel.app/search",
    siteName: "ESG Hub",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Search — ESG Hub",
    description:
      "Search across 300+ ESG topics, standards, and frameworks.",
  },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="content-wrapper" id="main-content">
          <h1 style={{ borderBottom: "none", marginBottom: "0.5rem" }}>
            Search ESG Hub
          </h1>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.88rem",
              color: "var(--color-text-muted)",
            }}
          >
            Loading search...
          </p>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
