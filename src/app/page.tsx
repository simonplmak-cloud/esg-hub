import { getPageByPermalink } from "@/lib/pages";
import MarkdownContent from "@/components/MarkdownContent";
import Link from "next/link";
import HomeSearchBox from "@/components/HomeSearchBox";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const SECTIONS = [
  {
    title: "Environmental (E)",
    href: "/environmental",
    description:
      "Planetary boundaries, climate change, biodiversity, and environmental sustainability.",
    color: "var(--color-section-env)",
  },
  {
    title: "Social (S)",
    href: "/social",
    description:
      "Human rights, labor practices, community relations, and social impact.",
    color: "var(--color-section-social)",
  },
  {
    title: "Governance (G)",
    href: "/governance",
    description:
      "Board structure, executive compensation, shareholder rights, and business ethics.",
    color: "var(--color-section-gov)",
  },
  {
    title: "Standards & Frameworks",
    href: "/standards",
    description:
      "GRI, IFRS S1/S2, TCFD, TNFD, SASB, and other reporting standards.",
    color: "var(--color-section-standards)",
  },
  {
    title: "HK & APAC Regional",
    href: "/hk-apac",
    description:
      "HKEX ESG Code, regional regulations, and Asia-Pacific sustainability frameworks.",
    color: "var(--color-section-regional)",
  },
  {
    title: "Learning Hub",
    href: "/learning",
    description:
      "Courses, research, tools, and learning paths for ESG professionals.",
    color: "var(--color-section-learning)",
  },
  {
    title: "UN SDGs",
    href: "/sdg",
    description:
      "All 17 Sustainable Development Goals mapped to ESG pillars.",
    color: "var(--color-section-sdg)",
  },
  {
    title: "ESG Ratings",
    href: "/ratings",
    description:
      "Rating agencies, methodologies, data quality, and rating divergence.",
    color: "var(--color-section-ratings)",
  },
];

export default async function HomePage() {
  const headersList = headers();
  const hostname = headersList.get("host") || "";
  
  if (hostname === "esg.video" || hostname === "www.esg.video") {
    redirect("/videos");
  }
  
  const page = await getPageByPermalink("/");

  return (
    <>
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
          {SECTIONS.map((section) => (
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
