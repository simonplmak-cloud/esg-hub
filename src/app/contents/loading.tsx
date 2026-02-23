/**
 * Loading state for Contents page
 */

export default function ContentsLoading() {
  return (
    <div className="content-wrapper" style={{ maxWidth: "1000px" }}>
      {/* Breadcrumb skeleton */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div 
          style={{ 
            height: "0.85rem", 
            width: "150px", 
            background: "var(--color-border)",
            borderRadius: "2px"
          }} 
        />
      </div>

      {/* Title skeleton */}
      <div 
        style={{ 
          height: "2rem", 
          width: "200px", 
          background: "var(--color-border)",
          borderRadius: "4px",
          marginBottom: "1rem"
        }} 
      />

      {/* Description skeleton */}
      <div 
        style={{ 
          height: "1.1rem", 
          width: "60%", 
          background: "var(--color-border)",
          borderRadius: "2px",
          marginBottom: "2rem"
        }} 
      />

      {/* Stats grid skeleton */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "3rem",
          padding: "1.5rem",
          background: "var(--color-bg-alt)",
          borderRadius: "4px"
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div 
              style={{ 
                height: "2rem", 
                width: "60px", 
                background: "var(--color-border)",
                borderRadius: "4px",
                marginBottom: "0.5rem"
              }} 
            />
            <div 
              style={{ 
                height: "0.85rem", 
                width: "120px", 
                background: "var(--color-border)",
                borderRadius: "2px"
              }} 
            />
          </div>
        ))}
      </div>

      {/* Sections skeleton */}
      <div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ marginBottom: "2rem" }}>
            <div 
              style={{ 
                height: "1.2rem", 
                width: "250px", 
                background: "var(--color-border)",
                borderRadius: "2px",
                marginBottom: "1rem",
                borderBottom: "2px solid var(--color-border)",
                paddingBottom: "0.5rem"
              }} 
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <div 
                    style={{ 
                      height: "1rem", 
                      width: "80%", 
                      background: "var(--color-border)",
                      borderRadius: "2px",
                      marginBottom: "0.25rem"
                    }} 
                  />
                  <div 
                    style={{ 
                      height: "0.8rem", 
                      width: "90%", 
                      background: "var(--color-border)",
                      borderRadius: "2px"
                    }} 
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
