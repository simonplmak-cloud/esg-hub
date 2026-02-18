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
  { label: "Finance", href: "/finance" },
  { label: "Investment", href: "/investment" },
  { label: "Frameworks", href: "/frameworks" },
  { label: "Fundamentals", href: "/learning/esg-fundamentals" },
  { label: "Emerging", href: "/emerging-topics" },
  { label: "Videos", href: "/videos" },
  { label: "Books", href: "/books" },
  { label: "Glossary", href: "/glossary" },
  { label: "Developers", href: "/developers" },
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
            gap: "0.35rem",
          }}
        >
          {/* Logo + site name */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              textDecoration: "none",
              color: "var(--color-text)",
              marginRight: "0.6rem",
              flexShrink: 0,
            }}
            aria-label="ESG Hub — Home"
          >
            <Image
              src="/esg-hub-logo.png"
              alt=""
              width={26}
              height={26}
              style={{ borderRadius: "3px" }}
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "-0.01em",
                color: "var(--color-text)",
              }}
            >
              ESG Hub
            </span>
          </Link>

          {/* Desktop category links */}
          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "0.1rem", flex: 1 }}>
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
              placeholder="Search ESG Hub..."
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
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              padding: "0.3em 0.65em",
              borderRadius: "3px",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: "0.82rem",
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
            gap: "0.1rem",
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

      {/* ── Mobile menu ── */}
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
                padding: "0.5em 0.75em",
                border: "1px solid var(--color-border)",
                borderRadius: "3px",
                fontFamily: "var(--font-heading)",
                fontSize: "0.95rem",
                background: "var(--color-bg-alt)",
                color: "var(--color-text)",
              }}
            />
          </form>

          {/* Section label */}
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
            ESG Pillars
          </div>
          {PRIMARY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}

          <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginTop: "0.8rem", marginBottom: "0.25rem" }}>
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
