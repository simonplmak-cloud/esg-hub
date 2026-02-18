import { Metadata } from "next";
import { getPageByPermalink } from "@/lib/pages";
import MarkdownContent from "@/components/MarkdownContent";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ESG Books & Literature",
  description:
    "Comprehensive ESG book collection with downloadable PDF resources covering carbon accounting, climate risk, carbon credits, and more.",
  alternates: { canonical: "https://esg-hub-six.vercel.app/books" },
  openGraph: {
    title: "ESG Books & Literature — ESG Hub",
    description:
      "Comprehensive ESG book collection with downloadable PDF resources.",
    url: "https://esg-hub-six.vercel.app/books",
    siteName: "ESG Hub",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

/**
 * Curated ESG book collection with PDF download links.
 * These are open-access or Creative Commons licensed resources.
 */
const ESG_BOOKS = [
  {
    title: "Carbon Accounting in Practice",
    author: "Ascent Partners Foundation",
    description:
      "A practical guide to corporate carbon accounting, covering Scope 1, 2, and 3 emissions measurement, GHG Protocol methodologies, and reporting best practices.",
    topics: ["Carbon Accounting", "GHG Protocol", "Scope 1/2/3"],
    pdfUrl: null as string | null,
    section: "environmental",
  },
  {
    title: "Climate Risk Quantification in Practice",
    author: "Ascent Partners Foundation",
    description:
      "Comprehensive guide to quantifying climate-related financial risks, including physical and transition risk assessment, scenario analysis, and TCFD-aligned reporting.",
    topics: ["Climate Risk", "TCFD", "Scenario Analysis"],
    pdfUrl: null as string | null,
    section: "environmental",
  },
  {
    title: "Carbon Credits Made Simple",
    author: "Ascent Partners Foundation",
    description:
      "An accessible introduction to carbon credit markets, covering voluntary and compliance markets, credit types, verification standards, and market mechanisms.",
    topics: ["Carbon Credits", "Carbon Markets", "Offsets"],
    pdfUrl: null as string | null,
    section: "environmental",
  },
];

/** Open-access ESG reference books from external sources */
const EXTERNAL_BOOKS = [
  {
    title: "GRI Standards 2021",
    author: "Global Reporting Initiative",
    description:
      "The complete set of GRI Universal, Sector, and Topic Standards for sustainability reporting.",
    url: "https://www.globalreporting.org/standards/",
    type: "Standards Document",
  },
  {
    title: "IFRS S1 & S2 Sustainability Disclosure Standards",
    author: "IFRS Foundation",
    description:
      "The ISSB's global baseline sustainability disclosure standards covering general requirements (S1) and climate-related disclosures (S2).",
    url: "https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/",
    type: "Standards Document",
  },
  {
    title: "TCFD Recommendations (Final Report)",
    author: "Task Force on Climate-related Financial Disclosures",
    description:
      "The foundational recommendations for climate-related financial disclosures, now incorporated into ISSB standards.",
    url: "https://www.fsb-tcfd.org/recommendations/",
    type: "Framework",
  },
  {
    title: "TNFD Recommendations",
    author: "Taskforce on Nature-related Financial Disclosures",
    description:
      "Framework for organizations to report and act on evolving nature-related dependencies, impacts, risks, and opportunities.",
    url: "https://tnfd.global/recommendations-of-the-tnfd/",
    type: "Framework",
  },
  {
    title: "UN Principles for Responsible Investment",
    author: "United Nations PRI",
    description:
      "The six principles for responsible investment and supporting resources for institutional investors.",
    url: "https://www.unpri.org/about-us/what-are-the-principles-for-responsible-investment",
    type: "Principles",
  },
];

export default async function BooksPage() {
  const page = await getPageByPermalink("/books/");

  return (
    <div className="wide-wrapper">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="separator" aria-hidden="true">/</span>
        <span aria-current="page">Books</span>
      </nav>

      <h1>ESG Literature &amp; Resources</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", maxWidth: "720px" }}>
        Comprehensive collection of ESG books, guides, and reference documents.
        Download full PDF versions of our publications or access external
        standards and frameworks.
      </p>

      {/* APF Publications */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>Ascent Partners Foundation Publications</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
            marginTop: "0.8rem",
          }}
        >
          {ESG_BOOKS.map((book) => (
            <div
              key={book.title}
              style={{
                background: "var(--color-bg-alt)",
                border: "1px solid var(--color-border-light)",
                borderRadius: "4px",
                padding: "1.2rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Book icon */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.6rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "52px",
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: "var(--color-text)",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {book.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {book.author}
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.55,
                  flex: 1,
                  margin: "0 0 0.6rem 0",
                }}
              >
                {book.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.6rem" }}>
                {book.topics.map((topic) => (
                  <span
                    key={topic}
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.15em 0.45em",
                      background: "var(--color-bg-secondary)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "3px",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {book.pdfUrl ? (
                  <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.82rem",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 500,
                      padding: "0.35em 0.7em",
                      background: "var(--color-primary)",
                      color: "#fff",
                      borderRadius: "3px",
                      textDecoration: "none",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF
                  </a>
                ) : (
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--color-text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    PDF coming soon
                  </span>
                )}
                <Link
                  href={`/${book.section}`}
                  style={{
                    fontSize: "0.82rem",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 500,
                    padding: "0.35em 0.7em",
                    border: "1px solid var(--color-border)",
                    borderRadius: "3px",
                    color: "var(--color-link)",
                    textDecoration: "none",
                  }}
                >
                  Related articles
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* External Standards & Frameworks */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>Standards &amp; Framework Documents</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: "0.8rem" }}>
          Official publications from standard-setting bodies and international organizations.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {EXTERNAL_BOOKS.map((book) => (
            <a
              key={book.title}
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="research-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="research-card-title">{book.title}</div>
                  <div className="research-card-meta">
                    {book.author} &middot; {book.type}
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  strokeWidth="2"
                  style={{ flexShrink: 0, marginTop: "0.2rem" }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
              <div className="research-card-abstract">{book.description}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Original SurrealDB content */}
      {page && page.content && (
        <section style={{ marginTop: "2rem" }}>
          <h2>Additional Reading</h2>
          <div className="prose" style={{ maxWidth: "var(--content-max-width)" }}>
            <MarkdownContent content={page.content} />
          </div>
        </section>
      )}
    </div>
  );
}
