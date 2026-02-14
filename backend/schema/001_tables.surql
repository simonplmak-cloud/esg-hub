-- ESG Hub v2 - Entity Tables Schema
-- SurrealDB v2.x SCHEMAFULL definitions
-- Created: 2026-02-14

-- =============================================================================
-- PLANETARY BOUNDARIES
-- =============================================================================

DEFINE TABLE planetary_boundary SCHEMAFULL;

DEFINE FIELD code ON planetary_boundary TYPE string
  ASSERT $value != NONE AND string::len($value) > 0;
DEFINE FIELD name ON planetary_boundary TYPE string
  ASSERT $value != NONE;
DEFINE FIELD description ON planetary_boundary TYPE string;
DEFINE FIELD control_variable ON planetary_boundary TYPE string;
DEFINE FIELD threshold_value ON planetary_boundary TYPE option<string>;
DEFINE FIELD current_value ON planetary_boundary TYPE option<string>;
DEFINE FIELD status ON planetary_boundary TYPE string
  ASSERT $value INSIDE ["safe", "approaching", "transgressed", "unknown"];
DEFINE FIELD last_updated ON planetary_boundary TYPE datetime;
DEFINE FIELD source_url ON planetary_boundary TYPE string;
DEFINE FIELD embedding ON planetary_boundary TYPE option<array<float>>;

DEFINE INDEX idx_boundary_code ON planetary_boundary FIELDS code UNIQUE;
DEFINE INDEX idx_boundary_status ON planetary_boundary FIELDS status;

-- =============================================================================
-- STANDARDS & FRAMEWORKS
-- =============================================================================

DEFINE TABLE standard SCHEMAFULL;

DEFINE FIELD abbreviation ON standard TYPE string
  ASSERT $value != NONE AND string::len($value) > 0;
DEFINE FIELD full_name ON standard TYPE string
  ASSERT $value != NONE;
DEFINE FIELD category ON standard TYPE string
  ASSERT $value INSIDE ["disclosure", "climate", "nature", "social", "governance"];
DEFINE FIELD description ON standard TYPE string;
DEFINE FIELD issuing_body ON standard TYPE string;
DEFINE FIELD year_established ON standard TYPE option<int>;
DEFINE FIELD latest_version ON standard TYPE option<string>;
DEFINE FIELD is_mandatory ON standard TYPE bool DEFAULT false;
DEFINE FIELD jurisdictions ON standard TYPE array<string> DEFAULT [];
DEFINE FIELD official_url ON standard TYPE string;
DEFINE FIELD document_url ON standard TYPE option<string>;
DEFINE FIELD embedding ON standard TYPE option<array<float>>;

DEFINE INDEX idx_standard_abbr ON standard FIELDS abbreviation UNIQUE;
DEFINE INDEX idx_standard_category ON standard FIELDS category;

-- =============================================================================
-- SOCIAL ISSUES (ISO 26000)
-- =============================================================================

DEFINE TABLE social_issue SCHEMAFULL;

DEFINE FIELD code ON social_issue TYPE string
  ASSERT $value != NONE;
DEFINE FIELD name ON social_issue TYPE string
  ASSERT $value != NONE;
DEFINE FIELD core_subject ON social_issue TYPE string
  ASSERT $value INSIDE [
    "organizational_governance",
    "human_rights",
    "labour_practices",
    "fair_operating_practices",
    "consumer_issues",
    "community_involvement"
  ];
DEFINE FIELD description ON social_issue TYPE string;
DEFINE FIELD iso26000_reference ON social_issue TYPE string;
DEFINE FIELD embedding ON social_issue TYPE option<array<float>>;

DEFINE INDEX idx_social_code ON social_issue FIELDS code UNIQUE;
DEFINE INDEX idx_social_subject ON social_issue FIELDS core_subject;

-- =============================================================================
-- GOVERNANCE TOPICS (G20/OECD 2023)
-- =============================================================================

DEFINE TABLE governance_topic SCHEMAFULL;

DEFINE FIELD code ON governance_topic TYPE string
  ASSERT $value != NONE;
DEFINE FIELD name ON governance_topic TYPE string
  ASSERT $value != NONE;
DEFINE FIELD chapter ON governance_topic TYPE string
  ASSERT $value INSIDE [
    "effective_framework",
    "shareholder_rights",
    "institutional_investors",
    "disclosure_transparency",
    "board_responsibilities",
    "sustainability_resilience"
  ];
DEFINE FIELD description ON governance_topic TYPE string;
DEFINE FIELD oecd_principle ON governance_topic TYPE string;
DEFINE FIELD embedding ON governance_topic TYPE option<array<float>>;

DEFINE INDEX idx_gov_code ON governance_topic FIELDS code UNIQUE;
DEFINE INDEX idx_gov_chapter ON governance_topic FIELDS chapter;

-- =============================================================================
-- REGULATIONS
-- =============================================================================

DEFINE TABLE regulation SCHEMAFULL;

DEFINE FIELD code ON regulation TYPE string
  ASSERT $value != NONE;
DEFINE FIELD name ON regulation TYPE string
  ASSERT $value != NONE;
DEFINE FIELD jurisdiction ON regulation TYPE string
  ASSERT $value != NONE;
DEFINE FIELD pillar ON regulation TYPE string
  ASSERT $value INSIDE ["environmental", "social", "governance", "cross-cutting"];
DEFINE FIELD description ON regulation TYPE string;
DEFINE FIELD regulator ON regulation TYPE string;
DEFINE FIELD effective_date ON regulation TYPE option<date>;
DEFINE FIELD is_mandatory ON regulation TYPE bool DEFAULT true;
DEFINE FIELD official_url ON regulation TYPE string;
DEFINE FIELD document_url ON regulation TYPE option<string>;
DEFINE FIELD embedding ON regulation TYPE option<array<float>>;

DEFINE INDEX idx_reg_code ON regulation FIELDS code UNIQUE;
DEFINE INDEX idx_reg_jurisdiction ON regulation FIELDS jurisdiction;
DEFINE INDEX idx_reg_pillar ON regulation FIELDS pillar;

-- =============================================================================
-- SUSTAINABLE DEVELOPMENT GOALS
-- =============================================================================

DEFINE TABLE sdg SCHEMAFULL;

DEFINE FIELD number ON sdg TYPE int
  ASSERT $value >= 1 AND $value <= 17;
DEFINE FIELD name ON sdg TYPE string
  ASSERT $value != NONE;
DEFINE FIELD description ON sdg TYPE string;
DEFINE FIELD pillar ON sdg TYPE string
  ASSERT $value INSIDE ["environmental", "social", "governance", "cross-cutting"];
DEFINE FIELD icon_url ON sdg TYPE option<string>;
DEFINE FIELD un_url ON sdg TYPE string;
DEFINE FIELD embedding ON sdg TYPE option<array<float>>;

DEFINE INDEX idx_sdg_number ON sdg FIELDS number UNIQUE;
DEFINE INDEX idx_sdg_pillar ON sdg FIELDS pillar;

-- =============================================================================
-- ACADEMIC PAPERS
-- =============================================================================

DEFINE TABLE paper SCHEMAFULL;

DEFINE FIELD openalex_id ON paper TYPE string
  ASSERT $value != NONE;
DEFINE FIELD title ON paper TYPE string
  ASSERT $value != NONE;
DEFINE FIELD authors ON paper TYPE array<string> DEFAULT [];
DEFINE FIELD publication_year ON paper TYPE option<int>;
DEFINE FIELD publication_date ON paper TYPE option<date>;
DEFINE FIELD journal ON paper TYPE option<string>;
DEFINE FIELD doi ON paper TYPE option<string>;
DEFINE FIELD abstract ON paper TYPE option<string>;
DEFINE FIELD citation_count ON paper TYPE int DEFAULT 0;
DEFINE FIELD is_open_access ON paper TYPE bool DEFAULT false;
DEFINE FIELD pdf_url ON paper TYPE option<string>;
DEFINE FIELD topics ON paper TYPE array<string> DEFAULT [];
DEFINE FIELD sdgs ON paper TYPE array<int> DEFAULT [];
DEFINE FIELD embedding ON paper TYPE option<array<float>>;
DEFINE FIELD last_updated ON paper TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_paper_openalex ON paper FIELDS openalex_id UNIQUE;
DEFINE INDEX idx_paper_year ON paper FIELDS publication_year;
DEFINE INDEX idx_paper_citations ON paper FIELDS citation_count;

-- =============================================================================
-- BOOKS (Simon Mak's ESG Collection)
-- =============================================================================

DEFINE TABLE book SCHEMAFULL;

DEFINE FIELD isbn ON book TYPE string
  ASSERT $value != NONE;
DEFINE FIELD title ON book TYPE string
  ASSERT $value != NONE;
DEFINE FIELD subtitle ON book TYPE option<string>;
DEFINE FIELD author ON book TYPE string DEFAULT "Simon Mak";
DEFINE FIELD series ON book TYPE string
  ASSERT $value INSIDE ["made_simple", "in_practice"];
DEFINE FIELD pillar ON book TYPE string
  ASSERT $value INSIDE ["environmental", "social", "governance", "cross-cutting"];
DEFINE FIELD publication_year ON book TYPE int;
DEFINE FIELD pages ON book TYPE int;
DEFINE FIELD description ON book TYPE string;
DEFINE FIELD cover_url ON book TYPE option<string>;
DEFINE FIELD pdf_url ON book TYPE option<string>;
DEFINE FIELD purchase_url ON book TYPE option<string>;
DEFINE FIELD topics ON book TYPE array<string> DEFAULT [];
DEFINE FIELD embedding ON book TYPE option<array<float>>;

DEFINE INDEX idx_book_isbn ON book FIELDS isbn UNIQUE;
DEFINE INDEX idx_book_series ON book FIELDS series;
DEFINE INDEX idx_book_pillar ON book FIELDS pillar;

-- =============================================================================
-- METADATA
-- =============================================================================

-- Track schema version
DEFINE TABLE schema_version SCHEMAFULL;
DEFINE FIELD version ON schema_version TYPE string;
DEFINE FIELD applied_at ON schema_version TYPE datetime DEFAULT time::now();

-- Insert initial version
CREATE schema_version SET version = "1.0.0", applied_at = time::now();
