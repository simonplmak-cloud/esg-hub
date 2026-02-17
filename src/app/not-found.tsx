import Link from "next/link";

export default function NotFound() {
  return (
    <div className="content-wrapper" style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
      <h1 style={{ borderBottom: "none", fontSize: "2rem" }}>Page Not Found</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem", marginBottom: "2rem" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.6em 1.5em",
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: "4px",
            textDecoration: "none",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
          }}
        >
          Go to Homepage
        </Link>
        <Link
          href="/search"
          style={{
            display: "inline-block",
            padding: "0.6em 1.5em",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            textDecoration: "none",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            color: "var(--color-text)",
          }}
        >
          Search ESG Hub
        </Link>
      </div>
    </div>
  );
}
