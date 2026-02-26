import { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import AISearchAgent from "@/components/AISearchAgent";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AISearch" });
  
  return {
    title: `Search — ESG Hub`,
    description: t("description"),
    alternates: {
      canonical: `https://esg-hub.ascent.partners/${locale}/search`,
    },
    openGraph: {
      title: `Search — ESG Hub AI Agent`,
      description: t("description"),
      url: `https://esg-hub.ascent.partners/${locale}/search`,
      siteName: "ESG Hub",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Search — ESG Hub AI Agent`,
      description: t("description"),
    },
  };
}

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AISearch" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  
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
              {t("title")}
            </h1>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.88rem",
              color: "var(--color-text-muted)",
            }}>
              {tCommon("loading")}
            </p>
          </div>
        </div>
      }
    >
      <AISearchAgent />
    </Suspense>
  );
}
