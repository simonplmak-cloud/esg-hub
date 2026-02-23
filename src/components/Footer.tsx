"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer 
      className="site-footer" 
      role="contentinfo"
      style={{
        borderTop: "1px solid var(--color-border)",
        padding: "1rem 1.5rem",
        marginTop: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "var(--wide-max-width)",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
        }}
      >
        <div>
          <span style={{ fontWeight: 600 }}>ESG Hub</span> — An open-access encyclopedia of ESG knowledge
        </div>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link 
            href="/about" 
            style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            About
          </Link>
          <Link 
            href="/developers" 
            style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            Developers
          </Link>
          <a
            href="https://github.com/simonplmak-cloud/esg-hub"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            GitHub
          </a>
          <span>|</span>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            CC BY-SA 4.0
          </a>
          <span>|</span>
          <span>Copyright {new Date().getFullYear()} Ascent Partners Foundation</span>
        </div>
      </div>
    </footer>
  );
}
