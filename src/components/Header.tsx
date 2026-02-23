"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CONTENTS_MENU, QUICK_LINKS } from "@/data/sections";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
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
              gap: "0.45rem",
              textDecoration: "none",
              color: "var(--color-text)",
              marginRight: "1rem",
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

          {/* Contents Dropdown */}
          <div className="desktop-only" style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setContentsOpen(!contentsOpen)}
              aria-expanded={contentsOpen}
              aria-controls="contents-menu"
              className="nav-button"
              style={{
                background: contentsOpen ? "var(--color-bg-alt)" : "transparent",
                border: "none",
                color: "var(--color-text)",
                padding: "0.4em 0.8em",
                borderRadius: "3px",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              Contents
              <span style={{ fontSize: "0.7em" }}>{contentsOpen ? "▲" : "▼"}</span>
            </button>

            {contentsOpen && (
              <div
                id="contents-menu"
                className="contents-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  marginTop: "0.25rem",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  minWidth: "600px",
                  maxWidth: "800px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                  }}
                >
                  {Object.values(CONTENTS_MENU).map((category) => (
                    <div key={category.title}>
                      <h3
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.5rem",
                          borderBottom: "1px solid var(--color-border)",
                          paddingBottom: "0.25rem",
                        }}
                      >
                        {category.title}
                      </h3>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {category.links.map((link) => (
                          <li key={link.href} style={{ marginBottom: "0.4rem" }}>
                            <Link
                              href={link.href}
                              onClick={() => setContentsOpen(false)}
                              style={{
                                display: "block",
                                textDecoration: "none",
                                color: "var(--color-text)",
                                fontSize: "0.85rem",
                                fontWeight: isActive(link.href) ? 600 : 400,
                              }}
                            >
                              {link.label}
                            </Link>
                            {link.description && (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--color-text-muted)",
                                  display: "block",
                                }}
                              >
                                {link.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                  }}
                >
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setContentsOpen(false)}
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-link)",
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links - Desktop */}
          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
            <Link
              href="/search"
              style={{
                padding: "0.4em 0.8em",
                fontSize: "0.85rem",
                borderRadius: "3px",
                background: isActive("/search") ? "var(--color-bg-alt)" : "transparent",
              }}
            >
              Search
            </Link>
            <Link
              href="/developers"
              style={{
                padding: "0.4em 0.8em",
                fontSize: "0.85rem",
                borderRadius: "3px",
                background: isActive("/developers") ? "var(--color-bg-alt)" : "transparent",
              }}
            >
              Developers
            </Link>
            <Link
              href="/glossary"
              style={{
                padding: "0.4em 0.8em",
                fontSize: "0.85rem",
                borderRadius: "3px",
                background: isActive("/glossary") ? "var(--color-bg-alt)" : "transparent",
              }}
            >
              Glossary
            </Link>
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

          {Object.values(CONTENTS_MENU).map((category) => (
            <div key={category.title} style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                {category.title}
              </div>
              {category.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "0.35rem 0",
                    textDecoration: "none",
                    color: "var(--color-text)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          ))}
          
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "0.35rem 0",
                  textDecoration: "none",
                  color: "var(--color-link)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(contentsOpen || menuOpen) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => {
            setContentsOpen(false);
            setMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
