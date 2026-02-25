import { Metadata } from "next";
import { Suspense } from "react";
import AISearchAgent from "@/components/AISearchAgent";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Search — ESG Hub",
    description:
      "AI-powered ESG search agent. Ask any ESG question and get comprehensive answers grounded in 300+ articles, 10 reference books, and 240+ authoritative sources.",
    alternates: {
      canonical: `https://esg-hub.ascent.partners/${locale}/search`,
    },
    openGraph: {
      title: "Search — ESG Hub AI Agent",
      description:
        "AI-powered ESG search. Ask questions about standards, frameworks, climate risk, and sustainability reporting.",
      url: `https://esg-hub.ascent.partners/${locale}/search`,
      siteName: "ESG Hub",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Search — ESG Hub AI Agent",
      description:
        "AI-powered ESG search with RAG across 300+ articles and 10 reference books.",
    },
  };
}

export default async function SearchPage({ params }: Props) {
  await params;
  
  return (
    <Suspense
      fallback={
        <div className="content-wrapper" id="main-content">
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              fontWeight: 700,
              borderBottom: "none",
              marginBottom: "0.5rem",
            }}>
              ESG Hub Search
            </h1>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.88rem",
              color: "var(--color-text-muted)",
            }}>
              Loading search agent...
            </p>
          </div>
        </div>
      }
    >
      <AISearchAgent />
    </Suspense>
  );
}
