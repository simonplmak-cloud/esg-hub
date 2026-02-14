-- ESG Hub v2 - Relationship Edges Schema
-- SurrealDB v2.x RELATE definitions for graph connections
-- Created: 2026-02-14

-- =============================================================================
-- DISCLOSURE RELATIONSHIPS
-- =============================================================================

-- Planetary boundaries disclosed by standards
DEFINE TABLE disclosed_by SCHEMAFULL TYPE RELATION
  IN planetary_boundary
  OUT standard;

DEFINE FIELD disclosure_level ON disclosed_by TYPE string
  ASSERT $value INSIDE ["comprehensive", "partial", "mentioned"];
DEFINE FIELD notes ON disclosed_by TYPE option<string>;

-- Social issues disclosed by standards
DEFINE TABLE discloses_social SCHEMAFULL TYPE RELATION
  IN standard
  OUT social_issue;

DEFINE FIELD coverage_level ON discloses_social TYPE string
  ASSERT $value INSIDE ["comprehensive", "partial", "mentioned"];

-- Governance topics disclosed by standards
DEFINE TABLE discloses_governance SCHEMAFULL TYPE RELATION
  IN standard
  OUT governance_topic;

DEFINE FIELD coverage_level ON discloses_governance TYPE string
  ASSERT $value INSIDE ["comprehensive", "partial", "mentioned"];

-- =============================================================================
-- INTEROPERABILITY RELATIONSHIPS
-- =============================================================================

-- Standards that are interoperable with each other
DEFINE TABLE interoperable_with SCHEMAFULL TYPE RELATION
  IN standard
  OUT standard;

DEFINE FIELD interop_type ON interoperable_with TYPE string
  ASSERT $value INSIDE ["building_block", "complementary", "compatible"];
DEFINE FIELD notes ON interoperable_with TYPE option<string>;

-- =============================================================================
-- SDG ALIGNMENT
-- =============================================================================

-- Planetary boundaries aligned with SDGs
DEFINE TABLE aligned_with_sdg SCHEMAFULL TYPE RELATION
  IN planetary_boundary
  OUT sdg;

DEFINE FIELD alignment_strength ON aligned_with_sdg TYPE string
  ASSERT $value INSIDE ["primary", "secondary", "indirect"];

-- Social issues aligned with SDGs
DEFINE TABLE social_aligned_sdg SCHEMAFULL TYPE RELATION
  IN social_issue
  OUT sdg;

DEFINE FIELD alignment_strength ON social_aligned_sdg TYPE string
  ASSERT $value INSIDE ["primary", "secondary", "indirect"];

-- Governance topics aligned with SDGs
DEFINE TABLE gov_aligned_sdg SCHEMAFULL TYPE RELATION
  IN governance_topic
  OUT sdg;

DEFINE FIELD alignment_strength ON gov_aligned_sdg TYPE string
  ASSERT $value INSIDE ["primary", "secondary", "indirect"];

-- Standards aligned with SDGs
DEFINE TABLE standard_aligned_sdg SCHEMAFULL TYPE RELATION
  IN standard
  OUT sdg;

DEFINE FIELD alignment_strength ON standard_aligned_sdg TYPE string
  ASSERT $value INSIDE ["primary", "secondary", "indirect"];

-- =============================================================================
-- REGULATORY RELATIONSHIPS
-- =============================================================================

-- Entities regulated by regulations
DEFINE TABLE regulated_by SCHEMAFULL TYPE RELATION
  IN [planetary_boundary, standard, social_issue, governance_topic]
  OUT regulation;

DEFINE FIELD requirement_type ON regulated_by TYPE string
  ASSERT $value INSIDE ["mandatory", "comply_or_explain", "voluntary"];
DEFINE FIELD effective_date ON regulated_by TYPE option<date>;

-- =============================================================================
-- RESEARCH RELATIONSHIPS
-- =============================================================================

-- Papers that research planetary boundaries
DEFINE TABLE researches_boundary SCHEMAFULL TYPE RELATION
  IN paper
  OUT planetary_boundary;

DEFINE FIELD focus_level ON researches_boundary TYPE string
  ASSERT $value INSIDE ["primary", "secondary", "mentioned"];

-- Papers that research standards
DEFINE TABLE researches_standard SCHEMAFULL TYPE RELATION
  IN paper
  OUT standard;

DEFINE FIELD focus_level ON researches_standard TYPE string
  ASSERT $value INSIDE ["primary", "secondary", "mentioned"];

-- Papers that research social issues
DEFINE TABLE researches_social SCHEMAFULL TYPE RELATION
  IN paper
  OUT social_issue;

DEFINE FIELD focus_level ON researches_social TYPE string
  ASSERT $value INSIDE ["primary", "secondary", "mentioned"];

-- Papers that research governance topics
DEFINE TABLE researches_governance SCHEMAFULL TYPE RELATION
  IN paper
  OUT governance_topic;

DEFINE FIELD focus_level ON researches_governance TYPE string
  ASSERT $value INSIDE ["primary", "secondary", "mentioned"];

-- =============================================================================
-- BOOK COVERAGE RELATIONSHIPS
-- =============================================================================

-- Books covering planetary boundaries
DEFINE TABLE covers_boundary SCHEMAFULL TYPE RELATION
  IN book
  OUT planetary_boundary;

DEFINE FIELD chapter_references ON covers_boundary TYPE array<string> DEFAULT [];
DEFINE FIELD depth ON covers_boundary TYPE string
  ASSERT $value INSIDE ["comprehensive", "moderate", "brief"];

-- Books covering standards
DEFINE TABLE covers_standard SCHEMAFULL TYPE RELATION
  IN book
  OUT standard;

DEFINE FIELD chapter_references ON covers_standard TYPE array<string> DEFAULT [];
DEFINE FIELD depth ON covers_standard TYPE string
  ASSERT $value INSIDE ["comprehensive", "moderate", "brief"];

-- Books covering social issues
DEFINE TABLE covers_social SCHEMAFULL TYPE RELATION
  IN book
  OUT social_issue;

DEFINE FIELD chapter_references ON covers_social TYPE array<string> DEFAULT [];
DEFINE FIELD depth ON covers_social TYPE string
  ASSERT $value INSIDE ["comprehensive", "moderate", "brief"];

-- Books covering governance topics
DEFINE TABLE covers_governance SCHEMAFULL TYPE RELATION
  IN book
  OUT governance_topic;

DEFINE FIELD chapter_references ON covers_governance TYPE array<string> DEFAULT [];
DEFINE FIELD depth ON covers_governance TYPE string
  ASSERT $value INSIDE ["comprehensive", "moderate", "brief"];

-- =============================================================================
-- CROSS-PILLAR RELATIONSHIPS
-- =============================================================================

-- Social issues related to planetary boundaries
DEFINE TABLE social_impacts_boundary SCHEMAFULL TYPE RELATION
  IN social_issue
  OUT planetary_boundary;

DEFINE FIELD impact_type ON social_impacts_boundary TYPE string
  ASSERT $value INSIDE ["direct", "indirect", "systemic"];

-- Governance topics related to planetary boundaries
DEFINE TABLE governs_boundary SCHEMAFULL TYPE RELATION
  IN governance_topic
  OUT planetary_boundary;

DEFINE FIELD governance_mechanism ON governs_boundary TYPE string
  ASSERT $value INSIDE ["regulatory", "market", "voluntary"];

-- Governance topics related to social issues
DEFINE TABLE governs_social SCHEMAFULL TYPE RELATION
  IN governance_topic
  OUT social_issue;

DEFINE FIELD governance_mechanism ON governs_social TYPE string
  ASSERT $value INSIDE ["regulatory", "market", "voluntary"];
