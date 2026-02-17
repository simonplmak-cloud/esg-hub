import { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Search — ESG Hub",
  description:
    "Search across 300+ ESG topics, standards, frameworks, and 240+ external authoritative sources. Supports keyword and AI-powered semantic search.",
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
