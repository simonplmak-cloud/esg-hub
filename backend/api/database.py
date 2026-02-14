"""
Database connection management for SurrealDB
"""

import os
import logging
from surrealdb import Surreal

logger = logging.getLogger(__name__)

# Global database connection
_db: Surreal | None = None

# Configuration from environment
SURREAL_URL = os.getenv("SURREAL_URL", "ws://localhost:8000/rpc")
SURREAL_NS = os.getenv("SURREAL_NS", "esg_hub")
SURREAL_DB = os.getenv("SURREAL_DB", "production")
SURREAL_USER = os.getenv("SURREAL_USER", "root")
SURREAL_PASS = os.getenv("SURREAL_PASS", "root")


async def init_db() -> None:
    """Initialize database connection"""
    global _db
    
    try:
        _db = Surreal(SURREAL_URL)
        await _db.connect()
        await _db.use(SURREAL_NS, SURREAL_DB)
        await _db.signin({"user": SURREAL_USER, "pass": SURREAL_PASS})
        
        logger.info(f"Connected to SurrealDB at {SURREAL_URL}")
        logger.info(f"Using namespace: {SURREAL_NS}, database: {SURREAL_DB}")
        
    except Exception as e:
        logger.error(f"Failed to connect to SurrealDB: {e}")
        raise


async def close_db() -> None:
    """Close database connection"""
    global _db
    
    if _db:
        await _db.close()
        _db = None
        logger.info("Database connection closed")


def get_db() -> Surreal:
    """Get database connection"""
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _db
