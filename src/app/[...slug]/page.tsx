import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPageByPermalink, getPagesBySection } from "@/lib/pages";
import MarkdownContent from "@/components/MarkdownContent";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

function buildPermalink(slugParts: string[]): string {
  return "/" + slugParts.join("/") + "/";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const permalink = buildPermalink(slug);
  const page = await getPageByPermalink(permalink);

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.title,
    description: page.description || `${page.title} — ESG Hub`,
    keywords: page.keywords || undefined,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const permalink = buildPermalink(slug);
  const page = await getPageByPermalink(permalink);

  if (!page) {
    notFound();
  }

  // Handle redirects
  if (page.redirect_to) {
    redirect(page.redirect_to);
  }

  // Check if this is a hub/index page — show child pages
  const isHubPage =
    page.layout === "apf-design" ||
    page.slug === "index" ||
    page.content.trim().length < 200;

  let childPages: Awaited<ReturnType<typeof getPagesBySection>> = [];
  if (page.section) {
    childPages = await getPagesBySection(page.section);
    // Filter out the current page and redirect pages
    childPages = childPages.filter(
      (p) => p.permalink !== page.permalink && !p.redirect_to
    );
  }

  return (
    <div className="content-wrapper">
      <Breadcrumbs permalink={page.permalink} title={page.title} />

      <article>
        <h1>{page.title}</h1>

        {page.description && (
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            {page.description}
          </p>
        )}

        {/* Render markdown content */}
        {page.content && page.content.trim().length > 0 && (
          <MarkdownContent content={page.content} />
        )}

        {/* Show child pages for hub/section pages */}
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
                  style={{
                    display: "block",
                    padding: "0.8rem 1rem",
                    border: "1px solid var(--color-border-light)",
                    borderRadius: "6px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
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
                        lineHeight: 1.4,
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
      </article>
    </div>
  );
}
