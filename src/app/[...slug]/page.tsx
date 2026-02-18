import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPageByPermalink, getPagesBySection } from "@/lib/pages";
import MarkdownContent from "@/components/MarkdownContent";
import Breadcrumbs from "@/components/Breadcrumbs";
import TableOfContents from "@/components/TableOfContents";
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
  return "/" + slugParts.join("/") + "/";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Check developer routes first
  const devRoute = DEVELOPER_ROUTES[slugPath];
  if (devRoute) {
    return { title: devRoute.title, description: devRoute.description };
  }

  const permalink = buildPermalink(slug);
  const page = await getPageByPermalink(permalink);

  if (!page) {
    return { title: "Page Not Found — ESG Hub" };
  }

  return {
    title: `${page.title} — ESG Hub`,
    description: page.description || `${page.title} — ESG Hub by Ascent Partners Foundation`,
    keywords: page.keywords || undefined,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Check developer routes first
  const devRoute = DEVELOPER_ROUTES[slugPath];
  if (devRoute) {
    const Component = devRoute.component;
    return <Component />;
  }

  const permalink = buildPermalink(slug);
  const page = await getPageByPermalink(permalink);

  if (!page) {
    notFound();
  }

  // Handle redirects
  if (page.redirect_to) {
    redirect(page.redirect_to);
  }

  // Check if this is a hub/index page
  const isHubPage =
    page.layout === "apf-design" ||
    page.slug === "index" ||
    page.content.trim().length < 200;

  let childPages: Awaited<ReturnType<typeof getPagesBySection>> = [];
  if (page.section) {
    childPages = await getPagesBySection(page.section);
    childPages = childPages.filter(
      (p) => p.permalink !== page.permalink && !p.redirect_to
    );
  }

  // Extract headings for Table of Contents
  const headings = extractHeadings(page.content);
  const showToc = headings.length >= 3 && page.content.trim().length > 800;

  return (
    <div className="content-wrapper" id="main-content">
      <Breadcrumbs permalink={page.permalink} title={page.title} />

      <article>
        <h1>{page.title}</h1>

        {/* Page metadata */}
        {page.description && (
          <p
            style={{
              fontSize: "1.02rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
              lineHeight: 1.65,
            }}
          >
            {page.description}
          </p>
        )}

        {/* Section + keywords metadata */}
        <div className="page-meta">
          {page.section && (
            <span className="page-meta-item">
              <span style={{ fontWeight: 600 }}>Section:</span>{" "}
              <Link
                href={`/${page.section}`}
                style={{
                  color: "var(--color-link)",
                  textDecoration: "none",
                }}
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

        {/* Table of Contents */}
        {showToc && <TableOfContents headings={headings} />}

        {/* Markdown content */}
        {page.content && page.content.trim().length > 0 && (
          <MarkdownContent content={page.content} />
        )}

        {/* Child pages for hub/section pages */}
        {childPages.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2>Topics in this section</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "0.8rem",
                marginTop: "1rem",
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
                      fontSize: "0.92rem",
                      color: "var(--color-link)",
                    }}
                  >
                    {child.title}
                  </div>
                  {child.description && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--color-text-muted)",
                        marginTop: "0.3rem",
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

        {/* Related pages (siblings in the same section) */}
        {!isHubPage && childPages.length > 0 && (
          <div className="related-pages">
            <h2>Related pages</h2>
            <ul style={{ paddingLeft: "1.4em", margin: "0.5rem 0" }}>
              {childPages.slice(0, 8).map((child) => (
                <li key={child.permalink} style={{ margin: "0.3rem 0" }}>
                  <Link
                    href={child.permalink.replace(/\/$/, "") || "/"}
                    style={{ fontSize: "0.92rem" }}
                  >
                    {child.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}

/* ── Extract h2/h3 headings from markdown for ToC ── */
interface Heading {
  level: number;
  text: string;
  id: string;
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`\[\]]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      headings.push({ level, text, id });
    }
  }
  return headings;
}
