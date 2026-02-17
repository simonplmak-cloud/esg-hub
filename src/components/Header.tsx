"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

/* ── 1st tier: ESG pillar categories ── */
const PRIMARY_LINKS = [
  { label: "Environmental", href: "/environmental" },
  { label: "Social", href: "/social" },
  { label: "Governance", href: "/governance" },
  { label: "Standards", href: "/standards" },
  { label: "Regional", href: "/hk-apac" },
  { label: "Learning", href: "/learning" },
  { label: "SDGs", href: "/sdg" },
];

/* ── 2nd tier: knowledge-base sub-sections ── */
const SECONDARY_LINKS = [
  { label: "Ratings", href: "/ratings" },
  { label: "Finance", href: "/learning/esg-finance" },
  { label: "Investment", href: "/learning/esg-investment" },
  { label: "Frameworks", href: "/learning/esg-frameworks" },
  { label: "Fundamentals", href: "/learning/esg-fundamentals" },
  { label: "Emerging", href: "/learning/emerging-topics" },
  { label: "Books", href: "/learning/books" },
  { label: "Glossary", href: "/learning/glossary" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q")?.toString().trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setMenuOpen(false);
    }
  };

  return (
    <header role="banner">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* ── Primary navigation bar ── */}
      <nav className="primary-nav" aria-label="Main navigation">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: "var(--wide-max-width)",
            margin: "0 auto",
            gap: "0.5rem",
          }}
        >
          {/* Logo + site name */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: "#fff",
              marginRight: "0.75rem",
              flexShrink: 0,
            }}
            aria-label="ESG Hub — Home"
          >
            <Image
              src="/esg-hub-logo.png"
              alt=""
              width={28}
              height={28}
              style={{ borderRadius: "4px" }}
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.05rem",
                letterSpacing: "-0.01em",
              }}
            >
              ESG Hub
            </span>
          </Link>

          {/* Desktop category links */}
          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "0.15rem", flex: 1 }}>
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop search */}
          <form
            onSubmit={handleSearch}
            role="search"
            aria-label="Search ESG Hub"
            className="desktop-only"
            style={{ flexShrink: 0, marginLeft: "auto" }}
          >
            <label htmlFor="nav-search" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>
              Search
            </label>
            <input
              id="nav-search"
              name="q"
              type="search"
              className="search-input"
              placeholder="Search..."
              aria-label="Search ESG Hub"
            />
          </form>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              display: "none",
              background: "none",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "#fff",
              padding: "0.35em 0.7em",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginLeft: "auto",
            }}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* ── Secondary navigation bar ── */}
      <nav className="secondary-nav desktop-only" aria-label="Knowledge base navigation">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: "var(--wide-max-width)",
            margin: "0 auto",
            gap: "0.15rem",
          }}
        >
          {SECONDARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "true" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Mobile menu (no animations) ── */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* Search */}
          <form onSubmit={handleSearch} role="search" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="mobile-search" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>
              Search
            </label>
            <input
              id="mobile-search"
              name="q"
              type="search"
              placeholder="Search ESG Hub..."
              aria-label="Search ESG Hub"
              style={{
                width: "100%",
                padding: "0.6em 0.8em",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                fontFamily: "var(--font-heading)",
                fontSize: "1rem",
                background: "var(--color-bg-alt)",
                color: "var(--color-text)",
              }}
            />
          </form>

          {/* Section label */}
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>
            ESG Pillars
          </div>
          {PRIMARY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}

          <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginTop: "1rem", marginBottom: "0.3rem" }}>
            Knowledge Base
          </div>
          {SECONDARY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (min-width: 901px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 900px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
