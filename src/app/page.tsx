import { getPageByPermalink } from "@/lib/pages";
import MarkdownContent from "@/components/MarkdownContent";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Environmental (E)",
    href: "/environmental",
    description: "Planetary boundaries, climate change, biodiversity, and environmental sustainability.",
    color: "#16a34a",
  },
  {
    title: "Social (S)",
    href: "/social",
    description: "Human rights, labor practices, community relations, and social impact.",
    color: "#0369a1",
  },
  {
    title: "Governance (G)",
    href: "/governance",
    description: "Board structure, executive compensation, shareholder rights, and business ethics.",
    color: "#7c3aed",
  },
  {
    title: "Standards & Frameworks",
    href: "/standards",
    description: "GRI, IFRS S1/S2, TCFD, TNFD, SASB, and other reporting standards.",
    color: "#dc2626",
  },
  {
    title: "HK & APAC Regional",
    href: "/hk-apac",
    description: "HKEX ESG Code, regional regulations, and Asia-Pacific sustainability frameworks.",
    color: "#ea580c",
  },
  {
    title: "Learning Hub",
    href: "/learning",
    description: "Courses, research, tools, and learning paths for ESG professionals.",
    color: "#0891b2",
  },
  {
    title: "UN SDGs",
    href: "/sdg",
    description: "All 17 Sustainable Development Goals mapped to ESG pillars.",
    color: "#ca8a04",
  },
  {
    title: "ESG Ratings",
    href: "/ratings",
    description: "Rating agencies, methodologies, data quality, and rating divergence.",
    color: "#be185d",
  },
];

export default async function HomePage() {
  const page = await getPageByPermalink("/");

  return (
    <div className="content-wrapper">
      <div style={{ textAlign: "center", padding: "2rem 0 1rem" }}>
        <h1 style={{ borderBottom: "none", fontSize: "2.2rem", marginTop: 0 }}>
          ESG Hub
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--color-text-secondary)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          An open-access ESG encyclopedia by Ascent Partners Foundation.
          Comprehensive resources for professionals, students, and researchers.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
          margin: "2rem 0",
        }}
      >
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            style={{
              display: "block",
              padding: "1.2rem",
              border: "1px solid var(--color-border-light)",
              borderRadius: "8px",
              borderLeft: `4px solid ${section.color}`,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.05rem",
                marginBottom: "0.4rem",
                color: section.color,
              }}
            >
              {section.title}
            </div>
            <div
              style={{
                fontSize: "0.88rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              {section.description}
            </div>
          </Link>
        ))}
      </div>

      {page && page.content && <MarkdownContent content={page.content} />}
    </div>
  );
}
