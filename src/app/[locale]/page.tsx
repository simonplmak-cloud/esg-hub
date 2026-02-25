import { getPageByPermalink } from "@/lib/pages";
import MarkdownContent from "@/components/MarkdownContent";
import Link from "next/link";
import HomeSearchBox from "@/components/HomeSearchBox";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ClientRedirect from "@/components/ClientRedirect";
import { HOMEPAGE_SECTIONS, SECONDARY_RESOURCES } from "@/data/sections";
import { getTranslations } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headersList = await headers();
  const hostname = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  
  const t = await getTranslations({ locale, namespace: "Home" });

  if (hostname === "esg.video" || hostname === "www.esg.video" || hostname.endsWith(".esg.video")) {
    redirect("/videos");
  }
  
  const page = await getPageByPermalink("/");

  return (
    <>
      <ClientRedirect />
      <div
        style={{
          background: "var(--color-bg-alt)",
          borderBottom: "1px solid var(--color-border)",
          padding: "2.5rem 1.5rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "var(--wide-max-width)",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--color-text)",
              marginTop: 0,
              marginBottom: "0.3rem",
              borderBottom: "none",
              paddingBottom: 0,
            }}
          >
            {t("title")}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--color-text-secondary)",
              maxWidth: "600px",
              margin: "0 auto 1.25rem",
              lineHeight: 1.6,
            }}
          >
            {t("subtitle")}
          </p>

          <HomeSearchBox />
        </div>
      </div>

      <div className="wide-wrapper">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "0.8rem",
            margin: "1.2rem 0 2rem",
          }}
        >
          {HOMEPAGE_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={`/${locale}${section.href}`}
              className="section-card"
              style={{ borderLeft: `3px solid ${section.color}` }}
            >
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  marginBottom: "0.3rem",
                  color: section.color,
                }}
              >
                {section.title}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {section.description}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "var(--color-bg-alt)",
          borderTop: "1px solid var(--color-border)",
          padding: "1.5rem",
          marginTop: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "var(--wide-max-width)",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "0.8rem",
              marginTop: 0,
            }}
          >
            {t("professionalDevelopment")}
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
            }}
          >
            {SECONDARY_RESOURCES.map((resource) => (
              <Link
                key={resource.href}
                href={`/${locale}${resource.href}`}
                style={{
                  display: "inline-block",
                  padding: "0.4em 0.9em",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  color: "var(--color-link)",
                  textDecoration: "none",
                }}
              >
                {resource.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {page?.content && (
        <div className="content-wrapper" style={{ marginTop: "2rem" }}>
          <MarkdownContent content={page.content} />
        </div>
      )}
    </>
  );
}
