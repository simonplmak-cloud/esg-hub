/**
 * Default loading state for ESG Hub pages
 * Displayed while server components fetch data
 */

export default function Loading() {
  return (
    <div 
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
          animation: "spin 1s linear infinite"
        }} 
      />
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
        Loading...
      </p>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
