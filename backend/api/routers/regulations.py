"""Regulations API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from ..database import get_db
from ..models import Regulation

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Regulation])
async def list_regulations(jurisdiction: Optional[str] = Query(None), mandatory: Optional[bool] = Query(None)):
    """List all regional ESG regulations"""
    try:
        db = get_db()
        query = "SELECT * FROM regulation WHERE 1=1"
        params = {}
        if jurisdiction:
            query += " AND jurisdiction = $jurisdiction"
            params["jurisdiction"] = jurisdiction
        if mandatory is not None:
            query += " AND is_mandatory = $mandatory"
            params["mandatory"] = mandatory
        query += " ORDER BY jurisdiction, code"
        result = await db.query(query, params)
        return result[0]["result"]
    except Exception as e:
        logger.error(f"Error listing regulations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{code}", response_model=Regulation)
async def get_regulation(code: str):
    """Get a specific regulation by code"""
    try:
        db = get_db()
        result = await db.query("SELECT * FROM regulation WHERE code = $code LIMIT 1", {"code": code})
        if not result[0]["result"]:
            raise HTTPException(status_code=404, detail=f"Regulation '{code}' not found")
        return result[0]["result"][0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting regulation {code}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
