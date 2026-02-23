import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPageByPermalink, getPagesBySection, isDbConfigured } from "@/lib/pages";
import { extractHeadings } from "@/lib/markdown";
import { SITE_URL, HUB_PAGE_MAX_CONTENT_LENGTH, ARTICLE_MIN_CONTENT_LENGTH, TOC_MIN_CONTENT_LENGTH } from "@/lib/constants";
import MarkdownContent from "@/components/MarkdownContent";
import Breadcrumbs from "@/components/Breadcrumbs";
import TableOfContents from "@/components/TableOfContents";
import PageImage from "@/components/PageImage";
import OpenAlexResearch from "@/components/OpenAlexResearch";
import PageToolsSidebar from "@/components/PageToolsSidebar";
import Link from "next/link";
import DevelopersLanding from "@/components/developers/DevelopersLanding";
import ApiDocs from "@/components/developers/ApiDocs";
import McpDocs from "@/components/developers/McpDocs";

/* ── Developer route map ── */
const DEVELOPER_ROUTES: Record<string, { component: React.ComponentType; title: string; description: string }> = {
  "developers": {
    component: DevelopersLanding,
    title: "Developers — ESG Hub",
    description: "Access the ESG Hub knowledge base programmatically via REST API or MCP server for AI agents.",
  },
  "developers/api": {
    component: ApiDocs,
    title: "REST API Documentation — ESG Hub",
    description: "Complete REST API reference for the ESG Hub knowledge base.",
  },
  "developers/mcp": {
    component: McpDocs,
    title: "MCP Server — ESG Hub",
    description: "Connect AI assistants to the ESG Hub knowledge base via the Model Context Protocol.",
  },
};

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

function buildPermalink(slugParts: string[]): string {
  return `/${slugParts.join("/")}/`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");

  const devRoute = DEVELOPER_ROUTES[slugPath];
  if (devRoute) {
    return { title: devRoute.title, description: devRoute.description };
  }

  const permalink = buildPermalink(slug);
  const page = await getPageByPermalink(permalink);

  if (!page) {
    if (!isDbConfigured()) {
      return { title: "Service Temporarily Unavailable — ESG Hub" };
    }
    return { title: "Page Not Found — ESG Hub" };
  }

  const pageTitle = page.title;
  const pageDescription = page.description || `${page.title} — ESG Hub by Ascent Partners Foundation`;
  const canonicalUrl = `${SITE_URL}${permalink.replace(/\/$/, "")}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: page.keywords || undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${pageTitle} — ESG Hub`,
      description: pageDescription,
      url: canonicalUrl,
      siteName: "ESG Hub",
      type: "article",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary",
      title: `${pageTitle} — ESG Hub`,
      description: pageDescription,
    },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  const devRoute = DEVELOPER_ROUTES[slugPath];
  if (devRoute) {
    const Component = devRoute.component;
    return <Component />;
  }

  const permalink = buildPermalink(slug);
  const page = await getPageByPermalink(permalink);

  if (!page) {
    if (!isDbConfigured()) {
      // Database unavailable - show maintenance message instead of 404
      return (
        <div className="content-wrapper" id="main-content" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <h1 style={{ borderBottom: "none", fontSize: "1.8rem" }}>
            Content Temporarily Unavailable
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", maxWidth: "480px", margin: "1rem auto", lineHeight: 1.6 }}>
            We&apos;re experiencing technical difficulties with our content database.
            <br />
            Please try again later or visit our homepage.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "0.6em 1.5em",
              background: "var(--color-primary)",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "0.92rem",
            }}
          >
            Go to Homepage
          </Link>
        </div>
      );
    }
    notFound();
  }

  if (page.redirect_to) {
    redirect(page.redirect_to);
  }

  // Hub/index pages are section landing pages (slug matches section name) or very short stubs
  const isHubPage =
    page.slug === "index" ||
    page.slug === page.section ||
    slug.length === 1 ||
    page.content.trim().length < HUB_PAGE_MAX_CONTENT_LENGTH;

  let childPages: Awaited<ReturnType<typeof getPagesBySection>> = [];
  if (page.section) {
    childPages = await getPagesBySection(page.section);
    childPages = childPages.filter(
      (p) => p.permalink !== page.permalink && !p.redirect_to
    );
  }

  const headings = extractHeadings(page.content);
  const showToc = headings.length >= 3 && page.content.trim().length > TOC_MIN_CONTENT_LENGTH;

  // Show image on article pages (not hub/index pages)
  const showImage = !isHubPage && page.content.trim().length > ARTICLE_MIN_CONTENT_LENGTH;

  return (
    <div id="main-content" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
      <Breadcrumbs permalink={page.permalink} title={page.title} />
      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        {/* Main Content */}
        <article className="content-wrapper" style={{ maxWidth: "none", padding: 0 }}>
          {/* Cross-Pillar Banner - EXPLICITLY HIGHLIGHTED */}
          {page.connects_to && page.connects_to.length > 1 && (
            <div
              style={{
                background: "linear-gradient(to right, #e6fffa, #faf5ff, #fff5f5)",
                borderLeft: "4px solid #3182ce",
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "0.25rem",
              }}
            >
              <span style={{ fontWeight: 600, color: "#2d3748", marginRight: "0.5rem" }}>
                Cross-Pillar Article:
              </span>
              {page.connects_to.map((pillar, i) => (
                <span key={pillar}>
                  {i > 0 && " + "}
                  <Link
                    href={pillar === "E" ? "/environmental" : pillar === "S" ? "/social" : "/governance"}
                    style={{
                      color: pillar === "E" ? "#38a169" : pillar === "S" ? "#3182ce" : "#805ad5",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {pillar === "E" && "Environmental"}
                    {pillar === "S" && "Social"}
                    {pillar === "G" && "Governance"}
                  </Link>
                </span>
              ))}
            </div>
          )}

          <h1>{page.title}</h1>

          {page.description && (
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.8rem",
                lineHeight: 1.6,
              }}
            >
              {page.description}
            </p>
          )}

          <div className="page-meta">
            {page.section && (
              <span className="page-meta-item">
                <span style={{ fontWeight: 600 }}>Section:</span>{" "}
                <Link
                  href={`/${page.section}`}
                  style={{ color: "var(--color-link)", textDecoration: "none" }}
                >
                {page.section.charAt(0).toUpperCase() + page.section.slice(1)}
              </Link>
            </span>
          )}
          {page.keywords && (
            <span className="page-meta-item">
              <span style={{ fontWeight: 600 }}>Topics:</span>{" "}
              {page.keywords}
            </span>
          )}
        </div>

        {/* Royalty-free hero image */}
        {showImage && (
          <PageImage
            section={page.section}
            title={page.title}
            keywords={page.keywords}
          />
        )}

        {showToc && <TableOfContents headings={headings} />}

        {page.content && page.content.trim().length > 0 && (
          <MarkdownContent content={page.content} />
        )}

        {/* OpenAlex research papers */}
        {!isHubPage && page.content.trim().length > 300 && (
          <OpenAlexResearch title={page.title} keywords={page.keywords} />
        )}

        {childPages.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2>Topics in this section</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "0.7rem",
                marginTop: "0.8rem",
              }}
            >
              {childPages.map((child) => (
                <Link
                  key={child.permalink}
                  href={child.permalink.replace(/\/$/, "") || "/"}
                  className="topic-card"
                >
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "var(--color-link)",
                    }}
                  >
                    {child.title}
                  </div>
                  {child.description && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                        marginTop: "0.2rem",
                        lineHeight: 1.45,
                      }}
                    >
                      {child.description.length > 120
                        ? child.description.substring(0, 120) + "..."
                        : child.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isHubPage && childPages.length > 0 && (
          <div className="related-pages">
            <h2>Related pages</h2>
            <ul style={{ paddingLeft: "1.4em", margin: "0.5rem 0" }}>
              {childPages.slice(0, 8).map((child) => (
                <li key={child.permalink} style={{ margin: "0.25rem 0" }}>
                  <Link
                    href={child.permalink.replace(/\/$/, "") || "/"}
                    style={{ fontSize: "0.9rem" }}
                  >
                    {child.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {/* Sidebar - Page Tools */}
      <PageToolsSidebar page={page} />
    </div>
  </div>
  );
}
