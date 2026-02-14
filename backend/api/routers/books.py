"""Books API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from ..database import get_db
from ..models import Book

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Book])
async def list_books(series: Optional[str] = Query(None), pillar: Optional[str] = Query(None)):
    """List all Simon Mak's ESG books"""
    try:
        db = get_db()
        query = "SELECT * FROM book WHERE 1=1"
        params = {}
        if series:
            query += " AND series = $series"
            params["series"] = series
        if pillar:
            query += " AND pillar = $pillar"
            params["pillar"] = pillar
        query += " ORDER BY publication_year DESC, title"
        result = await db.query(query, params)
        return result[0]["result"]
    except Exception as e:
        logger.error(f"Error listing books: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{isbn}", response_model=Book)
async def get_book(isbn: str):
    """Get a specific book by ISBN"""
    try:
        db = get_db()
        result = await db.query("SELECT * FROM book WHERE isbn = $isbn LIMIT 1", {"isbn": isbn})
        if not result[0]["result"]:
            raise HTTPException(status_code=404, detail=f"Book with ISBN '{isbn}' not found")
        return result[0]["result"][0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting book {isbn}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
