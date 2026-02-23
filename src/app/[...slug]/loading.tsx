/**
 * Loading state for article pages
 * Shows skeleton layout matching the article structure
 */

export default function ArticleLoading() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Breadcrumb skeleton */}
      <div style={{ marginBottom: "1rem" }}>
        <div 
          style={{ 
            height: "1rem", 
            width: "200px", 
            background: "var(--color-border)",
            borderRadius: "2px"
          }} 
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "3rem" }}>
        {/* Main content skeleton */}
        <div>
          {/* Title skeleton */}
          <div 
            style={{ 
              height: "2.5rem", 
              width: "70%", 
              background: "var(--color-border)",
              borderRadius: "4px",
              marginBottom: "1rem"
            }} 
          />
          
          {/* Description skeleton */}
          <div 
            style={{ 
              height: "1.2rem", 
              width: "90%", 
              background: "var(--color-border)",
              borderRadius: "2px",
              marginBottom: "2rem"
            }} 
          />
          
          {/* Content paragraphs skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ marginBottom: "1.5rem" }}>
              <div 
                style={{ 
                  height: "1rem", 
                  width: "100%", 
                  background: "var(--color-border)",
                  borderRadius: "2px",
                  marginBottom: "0.5rem"
                }} 
              />
              <div 
                style={{ 
                  height: "1rem", 
                  width: "95%", 
                  background: "var(--color-border)",
                  borderRadius: "2px",
                  marginBottom: "0.5rem"
                }} 
              />
              <div 
                style={{ 
                  height: "1rem", 
                  width: "85%", 
                  background: "var(--color-border)",
                  borderRadius: "2px"
                }} 
              />
            </div>
          ))}
        </div>

        {/* Sidebar skeleton */}
        <div style={{ borderLeft: "1px solid var(--color-border)", paddingLeft: "1.5rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: "2rem" }}>
              {/* Section title skeleton */}
              <div 
                style={{ 
                  height: "0.8rem", 
                  width: "60%", 
                  background: "var(--color-border)",
                  borderRadius: "2px",
                  marginBottom: "1rem"
                }} 
              />
              
              {/* Links skeleton */}
              {[1, 2, 3, 4].map((j) => (
                <div 
                  key={j}
                  style={{ 
                    height: "0.8rem", 
                    width: `${80 + Math.random() * 20}%`, 
                    background: "var(--color-border)",
                    borderRadius: "2px",
                    marginBottom: "0.5rem"
                  }} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
