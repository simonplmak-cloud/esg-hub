"""
ESG Hub REST API
FastAPI application providing programmatic access to ESG knowledge graph
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .database import init_db, close_db
from .routers import (
    boundaries,
    standards,
    social,
    governance,
    sdgs,
    books,
    regulations,
    search,
    graph
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting ESG Hub API...")
    await init_db()
    logger.info("✅ Database connection established")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down ESG Hub API...")
    await close_db()
    logger.info("✅ Database connection closed")


# Create FastAPI application
app = FastAPI(
    title="ESG Hub API",
    description="REST API for ESG knowledge graph - planetary boundaries, standards, frameworks, and regulations",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://esg-hub.ascent.partners",
        "http://localhost:4000",  # Jekyll dev server
        "http://127.0.0.1:4000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(boundaries.router, prefix="/api/boundaries", tags=["Planetary Boundaries"])
app.include_router(standards.router, prefix="/api/standards", tags=["ESG Standards"])
app.include_router(social.router, prefix="/api/social", tags=["Social Issues"])
app.include_router(governance.router, prefix="/api/governance", tags=["Governance"])
app.include_router(sdgs.router, prefix="/api/sdgs", tags=["SDGs"])
app.include_router(books.router, prefix="/api/books", tags=["Books"])
app.include_router(regulations.router, prefix="/api/regulations", tags=["Regulations"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(graph.router, prefix="/api/graph", tags=["Knowledge Graph"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ESG Hub API",
        "version": "2.0.0"
    }


@app.get("/api")
async def root():
    """API root endpoint"""
    return {
        "message": "ESG Hub API v2.0",
        "docs": "/api/docs",
        "health": "/api/health",
        "endpoints": {
            "boundaries": "/api/boundaries",
            "standards": "/api/standards",
            "social": "/api/social",
            "governance": "/api/governance",
            "sdgs": "/api/sdgs",
            "books": "/api/books",
            "regulations": "/api/regulations",
            "search": "/api/search",
            "graph": "/api/graph"
        }
    }
