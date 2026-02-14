-- ESG Hub v2 - Search Indexes Schema
-- SurrealDB v2.x full-text and vector search indexes
-- Created: 2026-02-14

-- =============================================================================
-- FULL-TEXT SEARCH INDEXES
-- =============================================================================

-- Planetary Boundaries full-text search
DEFINE ANALYZER boundary_analyzer TOKENIZERS blank,class FILTERS snowball(english);

DEFINE INDEX idx_boundary_search ON planetary_boundary FIELDS name, description SEARCH ANALYZER boundary_analyzer BM25 HIGHLIGHTS;

-- Standards full-text search
DEFINE ANALYZER standard_analyzer TOKENIZERS blank,class FILTERS snowball(english);

DEFINE INDEX idx_standard_search ON standard FIELDS full_name, description, issuing_body SEARCH ANALYZER standard_analyzer BM25 HIGHLIGHTS;

-- Social Issues full-text search
DEFINE ANALYZER social_analyzer TOKENIZERS blank,class FILTERS snowball(english);

DEFINE INDEX idx_social_search ON social_issue FIELDS name, description SEARCH ANALYZER social_analyzer BM25 HIGHLIGHTS;

-- Governance Topics full-text search
DEFINE ANALYZER governance_analyzer TOKENIZERS blank,class FILTERS snowball(english);

DEFINE INDEX idx_governance_search ON governance_topic FIELDS name, description SEARCH ANALYZER governance_analyzer BM25 HIGHLIGHTS;

-- Regulations full-text search
DEFINE ANALYZER regulation_analyzer TOKENIZERS blank,class FILTERS snowball(english);

DEFINE INDEX idx_regulation_search ON regulation FIELDS name, description, regulator SEARCH ANALYZER regulation_analyzer BM25 HIGHLIGHTS;

-- Papers full-text search
DEFINE ANALYZER paper_analyzer TOKENIZERS blank,class FILTERS snowball(english);

DEFINE INDEX idx_paper_search ON paper FIELDS title, abstract SEARCH ANALYZER paper_analyzer BM25 HIGHLIGHTS;

-- Books full-text search
DEFINE ANALYZER book_analyzer TOKENIZERS blank,class FILTERS snowball(english);

DEFINE INDEX idx_book_search ON book FIELDS title, subtitle, description SEARCH ANALYZER book_analyzer BM25 HIGHLIGHTS;

-- =============================================================================
-- VECTOR SEARCH INDEXES (for semantic search via embeddings)
-- =============================================================================

-- Note: Vector indexes in SurrealDB v2.x use MTREE for similarity search
-- Embeddings are stored as array<float> fields and indexed for cosine similarity

-- Planetary Boundaries vector index
DEFINE INDEX idx_boundary_vector ON planetary_boundary FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;

-- Standards vector index
DEFINE INDEX idx_standard_vector ON standard FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;

-- Social Issues vector index
DEFINE INDEX idx_social_vector ON social_issue FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;

-- Governance Topics vector index
DEFINE INDEX idx_governance_vector ON governance_topic FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;

-- Regulations vector index
DEFINE INDEX idx_regulation_vector ON regulation FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;

-- SDGs vector index
DEFINE INDEX idx_sdg_vector ON sdg FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;

-- Papers vector index
DEFINE INDEX idx_paper_vector ON paper FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;

-- Books vector index
DEFINE INDEX idx_book_vector ON book FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;

-- =============================================================================
-- COMPOSITE INDEXES (for common query patterns)
-- =============================================================================

-- Standards by category and jurisdiction
DEFINE INDEX idx_standard_cat_juris ON standard FIELDS category, jurisdictions;

-- Regulations by jurisdiction and pillar
DEFINE INDEX idx_reg_juris_pillar ON regulation FIELDS jurisdiction, pillar;

-- Papers by year and citations (for "latest research" queries)
DEFINE INDEX idx_paper_year_cites ON paper FIELDS publication_year, citation_count;

-- Papers by open access status (for filtering)
DEFINE INDEX idx_paper_oa ON paper FIELDS is_open_access;

-- Books by series and pillar
DEFINE INDEX idx_book_series_pillar ON book FIELDS series, pillar;

-- =============================================================================
-- NOTES ON VECTOR SEARCH
-- =============================================================================

-- Vector embeddings are generated using DeepSeek API (deepseek-embedding model)
-- Dimension: 1536 (standard for DeepSeek embeddings)
-- Distance metric: COSINE (best for semantic similarity)
-- 
-- Usage example:
-- SELECT * FROM planetary_boundary 
-- WHERE embedding <|1536,COSINE|> $query_embedding 
-- LIMIT 10;
--
-- The <|1536,COSINE|> operator performs vector similarity search
