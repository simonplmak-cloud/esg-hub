"use client";

import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "ESG Pillars",
    links: [
      { label: "Environmental", href: "/environmental" },
      { label: "Social", href: "/social" },
      { label: "Governance", href: "/governance" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Standards", href: "/standards" },
      { label: "Ratings", href: "/ratings" },
      { label: "Videos", href: "/videos" },
      { label: "Books", href: "/books" },
      { label: "Learning Hub", href: "/learning" },
    ],
  },
  {
    title: "About",
    links: [
      {
        label: "Ascent Partners Foundation",
        href: "https://ascent.partners/",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/simonplmak-cloud/esg-hub",
        external: true,
      },
      {
        label: "CC BY-SA 4.0 License",
        href: "https://creativecommons.org/licenses/by-sa/4.0/",
        external: true,
      },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div
        style={{
          maxWidth: "var(--wide-max-width)",
          margin: "0 auto",
        }}
      >
        {/* Footer columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "2rem",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: "var(--color-text)",
              }}
            >
              ESG Hub
            </div>
            <p style={{ margin: 0, maxWidth: "340px", lineHeight: 1.6, color: "var(--color-text-muted)" }}>
              An open-access ESG encyclopedia by Ascent Partners Foundation.
              Comprehensive resources for professionals, students, and researchers.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--color-text-muted)",
                }}
              >
                {section.title}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {section.links.map((link) => (
                  <li key={link.href} style={{ margin: "0.25rem 0" }}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        style={{ fontSize: "0.85rem" }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright bar */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            marginTop: "1.2rem",
            paddingTop: "0.8rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            fontSize: "0.78rem",
            color: "var(--color-text-muted)",
          }}
        >
          <span>&copy; {year} Ascent Partners Foundation</span>
          <span>
            Licensed under{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY-SA 4.0
            </a>
          </span>
        </div>
      </div>

      {/* Responsive footer grid */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
