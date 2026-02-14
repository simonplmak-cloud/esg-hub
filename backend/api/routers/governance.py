"""Governance Topics API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from ..database import get_db
from ..models import GovernanceTopic

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[GovernanceTopic])
async def list_governance_topics(chapter: Optional[str] = Query(None)):
    """List all G20/OECD governance topics"""
    try:
        db = get_db()
        if chapter:
            result = await db.query("SELECT * FROM governance_topic WHERE chapter = $chapter ORDER BY code", {"chapter": chapter})
        else:
            result = await db.query("SELECT * FROM governance_topic ORDER BY code")
        return result[0]["result"]
    except Exception as e:
        logger.error(f"Error listing governance topics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{code}", response_model=GovernanceTopic)
async def get_governance_topic(code: str):
    """Get a specific governance topic by code"""
    try:
        db = get_db()
        result = await db.query("SELECT * FROM governance_topic WHERE code = $code LIMIT 1", {"code": code})
        if not result[0]["result"]:
            raise HTTPException(status_code=404, detail=f"Governance topic '{code}' not found")
        return result[0]["result"][0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting governance topic {code}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
