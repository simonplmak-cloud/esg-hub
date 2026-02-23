import { getPageByPermalink } from "@/lib/pages";
import MarkdownContent from "@/components/MarkdownContent";
import Link from "next/link";
import HomeSearchBox from "@/components/HomeSearchBox";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ClientRedirect from "@/components/ClientRedirect";
import { HOMEPAGE_SECTIONS, SECONDARY_RESOURCES } from "@/data/sections";

export default async function HomePage() {
  const headersList = await headers();
  const hostname = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  
  // Debug: Log hostname to see what we're getting
  console.log("[DEBUG] Hostname detected:", hostname);
  
  if (hostname === "esg.video" || hostname === "www.esg.video" || hostname.endsWith(".esg.video")) {
    console.log("[DEBUG] Redirecting to /videos");
    redirect("/videos");
  }
  
  const page = await getPageByPermalink("/");

  return (
    <>
      <ClientRedirect />
      {/* DEBUG: Hostname detected: {hostname} - Should redirect if esg.video */}
      {/* Hero section with prominent search */}
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
            ESG Hub
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
            An open-access ESG encyclopedia by Ascent Partners Foundation.
            Ask any ESG question — powered by AI and 300+ articles.
          </p>

          {/* Prominent search box */}
          <HomeSearchBox />
        </div>
      </div>

      {/* Section cards */}
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
              href={section.href}
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
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {section.description}
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Resources */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: "1.5rem 0",
            marginTop: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-text-muted)",
              marginBottom: "0.75rem",
            }}
          >
            Professional Development & Resources
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem 1.5rem",
            }}
          >
            {SECONDARY_RESOURCES.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-link)",
                  textDecoration: "none",
                }}
              >
                {resource.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Homepage content from SurrealDB */}
        {page && page.content && (
          <div className="content-wrapper" style={{ padding: "0 0 2rem" }}>
            <MarkdownContent content={page.content} />
          </div>
        )}
      </div>
    </>
  );
}
