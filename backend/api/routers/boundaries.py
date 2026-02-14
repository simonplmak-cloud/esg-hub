"""Planetary Boundaries API endpoints"""
from fastapi import APIRouter, HTTPException
from typing import List
import logging
from ..database import get_db
from ..models import PlanetaryBoundary

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[PlanetaryBoundary])
async def list_boundaries():
    """List all planetary boundaries"""
    try:
        db = get_db()
        result = await db.query("SELECT * FROM planetary_boundary ORDER BY code")
        return result[0]["result"]
    except Exception as e:
        logger.error(f"Error listing boundaries: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{code}", response_model=PlanetaryBoundary)
async def get_boundary(code: str):
    """Get a specific planetary boundary by code"""
    try:
        db = get_db()
        result = await db.query("SELECT * FROM planetary_boundary WHERE code = $code LIMIT 1", {"code": code})
        if not result[0]["result"]:
            raise HTTPException(status_code=404, detail=f"Boundary '{code}' not found")
        return result[0]["result"][0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting boundary {code}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
