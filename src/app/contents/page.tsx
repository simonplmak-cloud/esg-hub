import { Metadata } from "next";
import Link from "next/link";
import { getAllPages } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Contents — ESG Hub",
  description: "Complete directory of ESG Hub content organized by subject, type, and pillar.",
};

export default async function ContentsPage() {
  const pages = await getAllPages();
  
  // Group pages by section
  const bySection = pages.reduce((acc, page) => {
    const section = page.section || "uncategorized";
    if (!acc[section]) acc[section] = [];
    acc[section].push(page);
    return acc;
  }, {} as Record<string, typeof pages>);
  
  // Count pages by pillar
  const pillarCounts = {
    E: pages.filter(p => p.section === "environmental").length,
    S: pages.filter(p => p.section === "social").length,
    G: pages.filter(p => p.section === "governance").length,
  };
  
  const totalCount = pages.length;

  return (
    <div className="content-wrapper layout-content">
      <nav aria-label="Breadcrumb">
        <ol style={{ 
          listStyle: "none", 
          padding: 0, 
          margin: "0 0 1.5rem",
          display: "flex",
          gap: "0.5rem",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)"
        }}>
          <li><Link href="/" style={{ color: "var(--color-link)" }}>ESG Hub</Link></li>
          <li>›</li>
          <li aria-current="page">Contents</li>
        </ol>
      </nav>
      
      <h1>Contents</h1>
      
      <p style={{ 
        fontSize: "1.1rem", 
        color: "var(--color-text-secondary)",
        marginBottom: "2rem"
      }}>
        Complete directory of the ESG Hub knowledge base. 
        {totalCount} articles organized by subject, type, and ESG pillar.
      </p>
      
      {/* Statistics */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
        padding: "1.5rem",
        background: "var(--color-bg-alt)",
        borderRadius: "4px"
      }}>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-section-env)" }}>{pillarCounts.E}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Environmental Articles</div>
        </div>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-section-social)" }}>{pillarCounts.S}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Social Articles</div>
        </div>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-section-gov)" }}>{pillarCounts.G}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Governance Articles</div>
        </div>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{totalCount}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Total Articles</div>
        </div>
      </div>
      
      {/* Browse by Subject */}
      <h2 id="by-subject">Browse by Subject</h2>
      
      <div style={{ marginBottom: "3rem" }}>
        {/* ESG Pillars */}
        <section style={{ marginBottom: "2rem" }}>
          <h3 style={{ 
            color: "var(--color-section-env)",
            borderBottom: "2px solid var(--color-section-env)",
            paddingBottom: "0.5rem",
            marginBottom: "1rem"
          }}>
            ESG Pillars
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            <div>
              <Link 
                href="/environmental" 
                style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: 600,
                  color: "var(--color-section-env)",
                  textDecoration: "none"
                }}
              >
                Environmental (E)
              </Link>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.5rem 0" }}>
                9 aspects: Climate Change, Energy, Water, Biodiversity, Materials, Waste, Pollution, Compliance, Supply Chain
              </p>
              <Link href="/environmental" style={{ fontSize: "0.85rem" }}>
                View all {pillarCounts.E} articles →
              </Link>
            </div>
            
            <div>
              <Link 
                href="/social" 
                style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: 600,
                  color: "var(--color-section-social)",
                  textDecoration: "none"
                }}
              >
                Social (S)
              </Link>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.5rem 0" }}>
                10 topics: Employment, Health & Safety, Training, Diversity, Human Rights, Communities, Supply Chain
              </p>
              <Link href="/social" style={{ fontSize: "0.85rem" }}>
                View all {pillarCounts.S} articles →
              </Link>
            </div>
            
            <div>
              <Link 
                href="/governance" 
                style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: 600,
                  color: "var(--color-section-gov)",
                  textDecoration: "none"
                }}
              >
                Governance (G)
              </Link>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.5rem 0" }}>
                9 areas: Board Governance, Executive Compensation, Shareholder Rights, Transparency, Risk Management, Ethics
              </p>
              <Link href="/governance" style={{ fontSize: "0.85rem" }}>
                View all {pillarCounts.G} articles →
              </Link>
            </div>
          </div>
        </section>
        
        {/* Standards & Regulations */}
        <section style={{ marginBottom: "2rem" }}>
          <h3 style={{ 
            color: "var(--color-section-standards)",
            borderBottom: "2px solid var(--color-section-standards)",
            paddingBottom: "0.5rem",
            marginBottom: "1rem"
          }}
          >
            Standards, Frameworks & Regulations
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {[
              { title: "Standards & Frameworks", href: "/standards", count: bySection.standards?.length || 0, desc: "GRI, IFRS S1/S2, TCFD, TNFD, SASB" },
              { title: "Regional Regulations", href: "/hk-apac", count: (bySection["hk-apac"]?.length || 0) + (bySection.regulations?.length || 0), desc: "EU, APAC, North America" },
              { title: "ESG Ratings & Data", href: "/ratings", count: bySection.ratings?.length || 0, desc: "Rating agencies & methodologies" },
            ].map(item => (
              <div key={item.href}>
                <Link href={item.href} style={{ fontWeight: 600, textDecoration: "none" }}>
                  {item.title}
                </Link>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.25rem 0" }}>
                  {item.desc}
                </p>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {item.count} articles
                </span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Finance & Investment */}
        <section style={{ marginBottom: "2rem" }}>
          <h3 style={{ 
            color: "var(--color-section-climate)",
            borderBottom: "2px solid var(--color-section-climate)",
            paddingBottom: "0.5rem",
            marginBottom: "1rem"
          }}
          >
            Finance & Investment
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {[
              { title: "ESG Finance", href: "/finance", count: bySection.finance?.length || 0, desc: "Blended Finance, Green Taxonomies, Social Bonds" },
              { title: "Climate Finance", href: "/climate-finance", count: bySection["climate-finance"]?.length || 0, desc: "Carbon Markets, Green Bonds, Net-Zero" },
              { title: "ESG Investment", href: "/investment", count: bySection.investment?.length || 0, desc: "Impact Investing, Shareholder Activism" },
            ].map(item => (
              <div key={item.href}>
                <Link href={item.href} style={{ fontWeight: 600, textDecoration: "none" }}>
                  {item.title}
                </Link>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.25rem 0" }}>
                  {item.desc}
                </p>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {item.count} articles
                </span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Sustainability Topics */}
        <section style={{ marginBottom: "2rem" }}>
          <h3 style={{ 
            color: "var(--color-section-biodiversity)",
            borderBottom: "2px solid var(--color-section-biodiversity)",
            paddingBottom: "0.5rem",
            marginBottom: "1rem"
          }}
          >
            Sustainability Topics
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {[
              { title: "Biodiversity & Nature", href: "/biodiversity", count: bySection.biodiversity?.length || 0, desc: "TNFD, Ecosystem Services, Nature-Positive" },
              { title: "Emerging Topics", href: "/emerging-topics", count: bySection["emerging-topics"]?.length || 0, desc: "AI Ethics, Circular Economy, Just Transition" },
              { title: "UN SDGs", href: "/sdg", count: (bySection.sdg?.length || 0) + (bySection.sdgs?.length || 0), desc: "17 Sustainable Development Goals" },
            ].map(item => (
              <div key={item.href}>
                <Link href={item.href} style={{ fontWeight: 600, textDecoration: "none" }}>
                  {item.title}
                </Link>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.25rem 0" }}>
                  {item.desc}
                </p>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {item.count} articles
                </span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Professional Development */}
        <section style={{ marginBottom: "2rem" }}>
          <h3 style={{ 
            color: "var(--color-section-learning)",
            borderBottom: "2px solid var(--color-section-learning)",
            paddingBottom: "0.5rem",
            marginBottom: "1rem"
          }}
          >
            Professional Development
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {[
              { title: "Learning Hub", href: "/learning", count: (bySection.learning?.length || 0) + (bySection.learn?.length || 0), desc: "Courses & Certifications" },
              { title: "Practice & Implementation", href: "/practice", count: bySection.practice?.length || 0, desc: "Implementation Guides" },
              { title: "ESG Fundamentals", href: "/learning/esg-fundamentals", count: bySection.fundamentals?.length || 0, desc: "Foundation Knowledge" },
            ].map(item => (
              <div key={item.href}>
                <Link href={item.href} style={{ fontWeight: 600, textDecoration: "none" }}>
                  {item.title}
                </Link>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.25rem 0" }}>
                  {item.desc}
                </p>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {item.count} articles
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Quick Links */}
      <div style={{ 
        borderTop: "1px solid var(--color-border)",
        paddingTop: "2rem",
        marginTop: "2rem"
      }}>
        <h2>Quick Access</h2>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/search" style={{ fontSize: "0.95rem" }}>Search</Link>
          <Link href="/glossary" style={{ fontSize: "0.95rem" }}>Glossary</Link>
          <Link href="/books" style={{ fontSize: "0.95rem" }}>Books</Link>
          <Link href="/videos" style={{ fontSize: "0.95rem" }}>Videos</Link>
          <Link href="/developers" style={{ fontSize: "0.95rem" }}>Developers</Link>
        </div>
      </div>
    </div>
  );
}
