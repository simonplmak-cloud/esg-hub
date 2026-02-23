/**
 * Default loading state for ESG Hub pages
 * Displayed while server components fetch data
 * WCAG 2.2 AAA Compliant with accessible loading indicators
 */

export default function Loading() {
  return (
    <div 
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading content"
      style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        minHeight: "50vh",
        flexDirection: "column",
        gap: "1rem"
      }}
    >
      <div 
        style={{
          width: "48px",
          height: "48px",
          border: "3px solid var(--color-border)",
          borderTopColor: "var(--color-link)",
          borderRadius: "50%",
        }} 
        aria-hidden="true"
      />
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
        Loading...
      </p>
      
      <span className="visually-hidden">
        Please wait while the page content loads.
      </span>
      
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          div[aria-hidden="true"] {
            animation: spin 1s linear infinite;
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}
