export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div style={{ maxWidth: "var(--content-max-width)", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              ESG Hub
            </div>
            <p style={{ margin: 0, maxWidth: "400px" }}>
              An open-access ESG encyclopedia by{" "}
              <a
                href="https://ascent.partners/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ascent Partners Foundation
              </a>
              . Providing comprehensive, accessible ESG resources for
              professionals, students, and researchers.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0 }}>
              &copy; {year} Ascent Partners Foundation
            </p>
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem" }}>
              Licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
              >
                CC BY-SA 4.0
              </a>
            </p>
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem" }}>
              <a
                href="https://github.com/simonplmak-cloud/esg-hub"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
