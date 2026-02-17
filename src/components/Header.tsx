"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";

const PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "Environmental", href: "/environmental" },
  { label: "Social", href: "/social" },
  { label: "Governance", href: "/governance" },
  { label: "Standards", href: "/standards" },
  { label: "Regional", href: "/hk-apac" },
  { label: "Learn", href: "/learning" },
  { label: "SDGs", href: "/sdg" },
];

const SECONDARY_NAV = [
  { label: "Ratings", href: "/ratings" },
  { label: "Finance", href: "/finance" },
  { label: "Investment", href: "/investment" },
  { label: "Frameworks", href: "/frameworks" },
  { label: "Fundamentals", href: "/fundamentals" },
  { label: "Emerging", href: "/emerging-topics" },
  { label: "Books", href: "/books" },
  { label: "Glossary", href: "/glossary" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Primary Navigation */}
      <header className="primary-nav" role="banner">
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginRight: "1rem" }}
        >
          <Image
            src="/esg-hub-logo.png"
            alt="ESG Hub"
            width={32}
            height={32}
            style={{ borderRadius: "4px" }}
          />
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>ESG Hub</span>
        </Link>

        {/* Desktop nav links */}
        <nav
          aria-label="Primary navigation"
          style={{ display: "flex", gap: "0.15rem", flex: 1 }}
          className="hidden lg:flex"
        >
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search form (desktop) */}
        <form onSubmit={handleSearch} className="hidden lg:flex" style={{ marginLeft: "auto" }}>
          <div style={{ position: "relative" }}>
            <input
              type="search"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search ESG Hub"
            />
            <button
              type="submit"
              aria-label="Submit search"
              style={{
                position: "absolute",
                right: "0.4rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                padding: "0.2rem",
              }}
            >
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "0.4rem",
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Secondary Navigation (desktop) */}
      <nav className="secondary-nav hidden lg:flex" aria-label="Knowledge base navigation">
        {SECONDARY_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Navigation menu">
          {/* Close button at top */}
          <div style={{ position: "fixed", top: "0.8rem", right: "1rem", zIndex: 210 }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                background: "var(--color-primary)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "4px",
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
            <input
              type="search"
              placeholder="Search ESG Hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search ESG Hub"
              style={{
                width: "100%",
                padding: "0.6em 1em",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                fontFamily: "var(--font-heading)",
                fontSize: "1rem",
              }}
            />
          </form>

          {/* Primary links */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              Main Sections
            </div>
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Secondary links */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              Knowledge Base
            </div>
            {SECONDARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
