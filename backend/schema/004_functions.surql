-- ESG Hub v2 - Custom Functions Schema
-- SurrealDB v2.x custom functions for common operations
-- Created: 2026-02-14

-- =============================================================================
-- GRAPH TRAVERSAL FUNCTIONS
-- =============================================================================

-- Get all entities related to a planetary boundary (1-hop)
DEFINE FUNCTION fn::boundary_related($boundary_code: string) {
  LET $boundary = (SELECT * FROM planetary_boundary WHERE code = $boundary_code LIMIT 1);
  
  RETURN {
    boundary: $boundary,
    disclosed_by: (SELECT ->disclosed_by->standard.* FROM $boundary.id),
    aligned_sdgs: (SELECT ->aligned_with_sdg->sdg.* FROM $boundary.id),
    regulations: (SELECT ->regulated_by->regulation.* FROM $boundary.id),
    research: (SELECT <-researches_boundary<-paper.* FROM $boundary.id ORDER BY citation_count DESC LIMIT 10),
    books: (SELECT <-covers_boundary<-book.* FROM $boundary.id),
    social_impacts: (SELECT <-social_impacts_boundary<-social_issue.* FROM $boundary.id),
    governance: (SELECT <-governs_boundary<-governance_topic.* FROM $boundary.id)
  };
};

-- Get all entities related to a standard (1-hop)
DEFINE FUNCTION fn::standard_related($standard_abbr: string) {
  LET $standard = (SELECT * FROM standard WHERE abbreviation = $standard_abbr LIMIT 1);
  
  RETURN {
    standard: $standard,
    discloses_boundaries: (SELECT <-disclosed_by<-planetary_boundary.* FROM $standard.id),
    discloses_social: (SELECT ->discloses_social->social_issue.* FROM $standard.id),
    discloses_governance: (SELECT ->discloses_governance->governance_topic.* FROM $standard.id),
    interoperable: (SELECT ->interoperable_with->standard.* FROM $standard.id),
    aligned_sdgs: (SELECT ->standard_aligned_sdg->sdg.* FROM $standard.id),
    regulations: (SELECT ->regulated_by->regulation.* FROM $standard.id),
    research: (SELECT <-researches_standard<-paper.* FROM $standard.id ORDER BY citation_count DESC LIMIT 10),
    books: (SELECT <-covers_standard<-book.* FROM $standard.id)
  };
};

-- Get all entities related to an SDG (1-hop)
DEFINE FUNCTION fn::sdg_related($sdg_number: int) {
  LET $sdg = (SELECT * FROM sdg WHERE number = $sdg_number LIMIT 1);
  
  RETURN {
    sdg: $sdg,
    boundaries: (SELECT <-aligned_with_sdg<-planetary_boundary.* FROM $sdg.id),
    social_issues: (SELECT <-social_aligned_sdg<-social_issue.* FROM $sdg.id),
    governance_topics: (SELECT <-gov_aligned_sdg<-governance_topic.* FROM $sdg.id),
    standards: (SELECT <-standard_aligned_sdg<-standard.* FROM $sdg.id)
  };
};

-- =============================================================================
-- SEARCH FUNCTIONS
-- =============================================================================

-- Hybrid search combining full-text and vector similarity
DEFINE FUNCTION fn::hybrid_search($query: string, $query_embedding: array<float>, $entity_type: option<string>, $limit: int) {
  -- Full-text search results
  LET $text_results = IF $entity_type = "boundary" THEN
    (SELECT *, search::score(1) AS text_score FROM planetary_boundary WHERE name @1@ $query OR description @1@ $query)
  ELSE IF $entity_type = "standard" THEN
    (SELECT *, search::score(1) AS text_score FROM standard WHERE full_name @1@ $query OR description @1@ $query)
  ELSE IF $entity_type = "social" THEN
    (SELECT *, search::score(1) AS text_score FROM social_issue WHERE name @1@ $query OR description @1@ $query)
  ELSE IF $entity_type = "governance" THEN
    (SELECT *, search::score(1) AS text_score FROM governance_topic WHERE name @1@ $query OR description @1@ $query)
  ELSE IF $entity_type = "regulation" THEN
    (SELECT *, search::score(1) AS text_score FROM regulation WHERE name @1@ $query OR description @1@ $query)
  ELSE IF $entity_type = "paper" THEN
    (SELECT *, search::score(1) AS text_score FROM paper WHERE title @1@ $query OR abstract @1@ $query)
  ELSE
    -- Search all tables if no entity_type specified
    (SELECT *, search::score(1) AS text_score FROM planetary_boundary WHERE name @1@ $query OR description @1@ $query)
    UNION
    (SELECT *, search::score(1) AS text_score FROM standard WHERE full_name @1@ $query OR description @1@ $query)
    UNION
    (SELECT *, search::score(1) AS text_score FROM social_issue WHERE name @1@ $query OR description @1@ $query)
    UNION
    (SELECT *, search::score(1) AS text_score FROM governance_topic WHERE name @1@ $query OR description @1@ $query)
    UNION
    (SELECT *, search::score(1) AS text_score FROM regulation WHERE name @1@ $query OR description @1@ $query)
  END;
  
  -- Vector search results
  LET $vector_results = IF $entity_type = "boundary" THEN
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM planetary_boundary WHERE embedding IS NOT NONE)
  ELSE IF $entity_type = "standard" THEN
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM standard WHERE embedding IS NOT NONE)
  ELSE IF $entity_type = "social" THEN
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM social_issue WHERE embedding IS NOT NONE)
  ELSE IF $entity_type = "governance" THEN
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM governance_topic WHERE embedding IS NOT NONE)
  ELSE IF $entity_type = "regulation" THEN
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM regulation WHERE embedding IS NOT NONE)
  ELSE IF $entity_type = "paper" THEN
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM paper WHERE embedding IS NOT NONE)
  ELSE
    -- Search all tables if no entity_type specified
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM planetary_boundary WHERE embedding IS NOT NONE)
    UNION
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM standard WHERE embedding IS NOT NONE)
    UNION
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM social_issue WHERE embedding IS NOT NONE)
    UNION
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM governance_topic WHERE embedding IS NOT NONE)
    UNION
    (SELECT *, vector::similarity::cosine(embedding, $query_embedding) AS vector_score FROM regulation WHERE embedding IS NOT NONE)
  END;
  
  -- Combine and rank results (0.4 * text_score + 0.6 * vector_score)
  RETURN (
    SELECT *, (0.4 * text_score + 0.6 * vector_score) AS combined_score
    FROM (
      SELECT * FROM $text_results
      UNION
      SELECT * FROM $vector_results
    )
    ORDER BY combined_score DESC
    LIMIT $limit
  );
};

-- =============================================================================
-- AGGREGATION FUNCTIONS
-- =============================================================================

-- Get statistics for a jurisdiction
DEFINE FUNCTION fn::jurisdiction_stats($jurisdiction: string) {
  RETURN {
    jurisdiction: $jurisdiction,
    total_regulations: (SELECT count() FROM regulation WHERE jurisdiction = $jurisdiction GROUP ALL)[0].count,
    by_pillar: (SELECT pillar, count() AS count FROM regulation WHERE jurisdiction = $jurisdiction GROUP BY pillar),
    mandatory_count: (SELECT count() FROM regulation WHERE jurisdiction = $jurisdiction AND is_mandatory = true GROUP ALL)[0].count,
    standards_required: (SELECT DISTINCT <-regulated_by<-standard.* FROM regulation WHERE jurisdiction = $jurisdiction)
  };
};

-- Get planetary boundary status summary
DEFINE FUNCTION fn::boundary_status_summary() {
  RETURN {
    total: (SELECT count() FROM planetary_boundary GROUP ALL)[0].count,
    by_status: (SELECT status, count() AS count FROM planetary_boundary GROUP BY status),
    transgressed: (SELECT * FROM planetary_boundary WHERE status = "transgressed"),
    approaching: (SELECT * FROM planetary_boundary WHERE status = "approaching"),
    safe: (SELECT * FROM planetary_boundary WHERE status = "safe")
  };
};

-- Get standard adoption statistics
DEFINE FUNCTION fn::standard_adoption_stats() {
  RETURN (
    SELECT 
      abbreviation,
      full_name,
      category,
      (SELECT count() FROM ->disclosed_by GROUP ALL)[0].count AS discloses_boundaries_count,
      (SELECT count() FROM ->discloses_social GROUP ALL)[0].count AS discloses_social_count,
      (SELECT count() FROM ->discloses_governance GROUP ALL)[0].count AS discloses_governance_count,
      (SELECT count() FROM ->interoperable_with GROUP ALL)[0].count AS interoperable_count,
      (SELECT count() FROM <-regulated_by GROUP ALL)[0].count AS mandated_by_count,
      (SELECT count() FROM <-researches_standard GROUP ALL)[0].count AS research_papers_count
    FROM standard
    ORDER BY research_papers_count DESC
  );
};

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Generate a summary of all entities in the knowledge graph
DEFINE FUNCTION fn::knowledge_graph_summary() {
  RETURN {
    entities: {
      boundaries: (SELECT count() FROM planetary_boundary GROUP ALL)[0].count,
      standards: (SELECT count() FROM standard GROUP ALL)[0].count,
      social_issues: (SELECT count() FROM social_issue GROUP ALL)[0].count,
      governance_topics: (SELECT count() FROM governance_topic GROUP ALL)[0].count,
      regulations: (SELECT count() FROM regulation GROUP ALL)[0].count,
      sdgs: (SELECT count() FROM sdg GROUP ALL)[0].count,
      papers: (SELECT count() FROM paper GROUP ALL)[0].count,
      books: (SELECT count() FROM book GROUP ALL)[0].count
    },
    relationships: {
      disclosed_by: (SELECT count() FROM disclosed_by GROUP ALL)[0].count,
      interoperable_with: (SELECT count() FROM interoperable_with GROUP ALL)[0].count,
      aligned_with_sdg: (SELECT count() FROM aligned_with_sdg GROUP ALL)[0].count,
      regulated_by: (SELECT count() FROM regulated_by GROUP ALL)[0].count,
      researches: (
        (SELECT count() FROM researches_boundary GROUP ALL)[0].count +
        (SELECT count() FROM researches_standard GROUP ALL)[0].count +
        (SELECT count() FROM researches_social GROUP ALL)[0].count +
        (SELECT count() FROM researches_governance GROUP ALL)[0].count
      ),
      covers: (
        (SELECT count() FROM covers_boundary GROUP ALL)[0].count +
        (SELECT count() FROM covers_standard GROUP ALL)[0].count +
        (SELECT count() FROM covers_social GROUP ALL)[0].count +
        (SELECT count() FROM covers_governance GROUP ALL)[0].count
      )
    },
    last_updated: time::now()
  };
};
