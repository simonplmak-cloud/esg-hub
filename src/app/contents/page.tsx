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
        <ol className="breadcrumb">
          <li><Link href="/">ESG Hub</Link></li>
          <li>›</li>
          <li aria-current="page">Contents</li>
        </ol>
      </nav>
      
      <h1>Contents</h1>
      
      <p className="contents-description">
        Complete directory of the ESG Hub knowledge base. 
        {totalCount} articles organized by subject, type, and ESG pillar.
      </p>
      
      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--color-section-env)" }}>{pillarCounts.E}</div>
          <div className="stat-label">Environmental Articles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--color-section-social)" }}>{pillarCounts.S}</div>
          <div className="stat-label">Social Articles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--color-section-gov)" }}>{pillarCounts.G}</div>
          <div className="stat-label">Governance Articles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Articles</div>
        </div>
      </div>
      
      {/* Browse by Subject */}
      <h2 id="by-subject">Browse by Subject</h2>
      
      <div style={{ marginBottom: "3rem" }}>
        {/* ESG Pillars */}
        <section className="section-card">
          <h3 className="section-heading env">ESG Pillars</h3>
          <div className="section-links">
            <Link href="/environmental" className="section-link">
              <span className="section-link-title">Environmental</span>
              <span className="section-link-desc">{bySection.environmental?.length || 0} articles — Climate, emissions, biodiversity</span>
            </Link>
            <Link href="/social" className="section-link">
              <span className="section-link-title">Social</span>
              <span className="section-link-desc">{bySection.social?.length || 0} articles — Human rights, labor, community</span>
            </Link>
            <Link href="/governance" className="section-link">
              <span className="section-link-title">Governance</span>
              <span className="section-link-desc">{bySection.governance?.length || 0} articles — Board, ethics, transparency</span>
            </Link>
          </div>
        </section>

        {/* Standards */}
        <section className="section-card">
          <h3 className="section-heading standards">Standards & Frameworks</h3>
          <div className="section-links">
            <Link href="/standards" className="section-link">
              <span className="section-link-title">Standards & Frameworks</span>
              <span className="section-link-desc">{bySection.standards?.length || 0} articles — GRI, IFRS S1/S2, TCFD, TNFD, SASB</span>
            </Link>
            <Link href="/hk-apac" className="section-link">
              <span className="section-link-title">Regional Regulations</span>
              <span className="section-link-desc">{(bySection["hk-apac"]?.length || 0) + (bySection.regulations?.length || 0)} articles — EU, APAC, North America</span>
            </Link>
            <Link href="/ratings" className="section-link">
              <span className="section-link-title">ESG Ratings & Data</span>
              <span className="section-link-desc">{bySection.ratings?.length || 0} articles — Rating agencies & methodologies</span>
            </Link>
          </div>
        </section>

        {/* Finance */}
        <section className="section-card">
          <h3 className="section-heading finance">Finance & Investment</h3>
          <div className="section-links">
            <Link href="/finance" className="section-link">
              <span className="section-link-title">ESG Finance</span>
              <span className="section-link-desc">{bySection.finance?.length || 0} articles — Blended Finance, Green Taxonomies, Social Bonds</span>
            </Link>
            <Link href="/climate-finance" className="section-link">
              <span className="section-link-title">Climate Finance</span>
              <span className="section-link-desc">{bySection["climate-finance"]?.length || 0} articles — Carbon Markets, Green Bonds, Net-Zero</span>
            </Link>
            <Link href="/investment" className="section-link">
              <span className="section-link-title">ESG Investment</span>
              <span className="section-link-desc">{bySection.investment?.length || 0} articles — Impact Investing, Shareholder Activism</span>
            </Link>
          </div>
        </section>

        {/* Sustainability Topics */}
        <section className="section-card">
          <h3 className="section-heading biodiversity">Sustainability Topics</h3>
          <div className="section-links">
            <Link href="/biodiversity" className="section-link">
              <span className="section-link-title">Biodiversity & Nature</span>
              <span className="section-link-desc">{bySection.biodiversity?.length || 0} articles — TNFD, Ecosystem Services, Nature-Positive</span>
            </Link>
            <Link href="/emerging-topics" className="section-link">
              <span className="section-link-title">Emerging Topics</span>
              <span className="section-link-desc">{bySection["emerging-topics"]?.length || 0} articles — AI Ethics, Circular Economy, Just Transition</span>
            </Link>
            <Link href="/sdg" className="section-link">
              <span className="section-link-title">UN SDGs</span>
              <span className="section-link-desc">{(bySection.sdg?.length || 0) + (bySection.sdgs?.length || 0)} articles — 17 Sustainable Development Goals</span>
            </Link>
          </div>
        </section>

        {/* Learning */}
        <section className="section-card">
          <h3 className="section-heading learning">Learning & Practice</h3>
          <div className="section-links">
            <Link href="/learning" className="section-link">
              <span className="section-link-title">Learning Hub</span>
              <span className="section-link-desc">{(bySection.learning?.length || 0) + (bySection.learn?.length || 0)} articles — Courses & Certifications</span>
            </Link>
            <Link href="/practice" className="section-link">
              <span className="section-link-title">Practice & Implementation</span>
              <span className="section-link-desc">{bySection.practice?.length || 0} articles — Implementation Guides</span>
            </Link>
            <Link href="/learning/esg-fundamentals" className="section-link">
              <span className="section-link-title">ESG Fundamentals</span>
              <span className="section-link-desc">{bySection.fundamentals?.length || 0} articles — Foundation Knowledge</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Footer links */}
      <div className="contents-footer-links">
        <Link href="/search" className="footer-link">Search</Link>
        <Link href="/glossary" className="footer-link">Glossary</Link>
        <Link href="/books" className="footer-link">Books</Link>
        <Link href="/videos" className="footer-link">Videos</Link>
        <Link href="/developers" className="footer-link">Developers</Link>
      </div>
    </div>
  );
}
