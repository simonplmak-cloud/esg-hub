"""
Pydantic models for API request/response schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime


# === Planetary Boundaries ===

class PlanetaryBoundary(BaseModel):
    """Planetary boundary model"""
    id: Optional[str] = None
    code: str
    name: str
    description: str
    control_variable: str
    threshold_value: str
    current_value: str
    status: str  # safe, approaching, transgressed, unknown
    last_updated: datetime
    source_url: str
    embedding: Optional[List[float]] = None


# === Standards ===

class Standard(BaseModel):
    """ESG standard/framework model"""
    id: Optional[str] = None
    abbreviation: str
    full_name: str
    category: str  # disclosure, climate, nature, social, governance
    description: str
    issuing_body: str
    year_established: int
    latest_version: str
    is_mandatory: bool
    jurisdictions: List[str]
    official_url: str
    document_url: Optional[str] = None
    embedding: Optional[List[float]] = None


# === Social Issues ===

class SocialIssue(BaseModel):
    """ISO 26000 social issue model"""
    id: Optional[str] = None
    code: str
    name: str
    core_subject: str
    description: str
    iso26000_reference: str
    embedding: Optional[List[float]] = None


# === Governance ===

class GovernanceTopic(BaseModel):
    """G20/OECD governance topic model"""
    id: Optional[str] = None
    code: str
    name: str
    chapter: str
    description: str
    oecd_reference: str
    embedding: Optional[List[float]] = None


# === SDGs ===

class SDG(BaseModel):
    """UN Sustainable Development Goal model"""
    id: Optional[str] = None
    number: int
    name: str
    description: str
    pillar: str  # environmental, social, governance, cross-cutting
    icon_url: str
    un_url: str
    embedding: Optional[List[float]] = None


# === Books ===

class Book(BaseModel):
    """Simon Mak's ESG book model"""
    id: Optional[str] = None
    isbn: str
    title: str
    subtitle: str
    author: str
    series: str  # made_simple, in_practice
    pillar: str
    publication_year: int
    pages: int
    description: str
    cover_url: str
    pdf_url: Optional[str] = None
    purchase_url: Optional[str] = None
    topics: List[str]
    embedding: Optional[List[float]] = None


# === Regulations ===

class Regulation(BaseModel):
    """Regional ESG regulation model"""
    id: Optional[str] = None
    code: str
    name: str
    jurisdiction: str
    type: str  # disclosure, climate, finance, governance, classification
    issuer: str
    year: int
    is_mandatory: bool
    url: str
    embedding: Optional[List[float]] = None


# === Search ===

class SearchQuery(BaseModel):
    """Search query request"""
    query: str = Field(..., min_length=1, max_length=500)
    limit: int = Field(default=10, ge=1, le=100)
    threshold: float = Field(default=0.7, ge=0.0, le=1.0)


class SearchResult(BaseModel):
    """Search result item"""
    id: str
    type: str  # boundary, standard, social, governance, sdg, book, regulation
    title: str
    description: str
    score: float
    url: Optional[str] = None


class SearchResponse(BaseModel):
    """Search response"""
    query: str
    results: List[SearchResult]
    total: int
    took_ms: float


# === Graph ===

class GraphNode(BaseModel):
    """Knowledge graph node"""
    id: str
    type: str
    label: str
    properties: dict


class GraphEdge(BaseModel):
    """Knowledge graph edge"""
    id: str
    source: str
    target: str
    type: str
    properties: dict


class GraphResponse(BaseModel):
    """Graph query response"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_nodes: int
    total_edges: int


# === Statistics ===

class Statistics(BaseModel):
    """Database statistics"""
    total_boundaries: int
    total_standards: int
    total_social_issues: int
    total_governance_topics: int
    total_sdgs: int
    total_books: int
    total_regulations: int
    total_relationships: int
    last_updated: datetime
