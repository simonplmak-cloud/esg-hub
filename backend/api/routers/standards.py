"""ESG Standards API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from ..database import get_db
from ..models import Standard

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Standard])
async def list_standards(category: Optional[str] = Query(None), mandatory: Optional[bool] = Query(None)):
    """List all ESG standards with optional filters"""
    try:
        db = get_db()
        query = "SELECT * FROM standard WHERE 1=1"
        params = {}
        if category:
            query += " AND category = $category"
            params["category"] = category
        if mandatory is not None:
            query += " AND is_mandatory = $mandatory"
            params["mandatory"] = mandatory
        query += " ORDER BY abbreviation"
        result = await db.query(query, params)
        return result[0]["result"]
    except Exception as e:
        logger.error(f"Error listing standards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{abbreviation}", response_model=Standard)
async def get_standard(abbreviation: str):
    """Get a specific standard by abbreviation"""
    try:
        db = get_db()
        result = await db.query("SELECT * FROM standard WHERE abbreviation = $abbr LIMIT 1", {"abbr": abbreviation})
        if not result[0]["result"]:
            raise HTTPException(status_code=404, detail=f"Standard '{abbreviation}' not found")
        return result[0]["result"][0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting standard {abbreviation}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
