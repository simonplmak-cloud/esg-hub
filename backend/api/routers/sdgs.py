"""SDGs API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from ..database import get_db
from ..models import SDG

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[SDG])
async def list_sdgs(pillar: Optional[str] = Query(None)):
    """List all UN SDGs"""
    try:
        db = get_db()
        if pillar:
            result = await db.query("SELECT * FROM sdg WHERE pillar = $pillar ORDER BY number", {"pillar": pillar})
        else:
            result = await db.query("SELECT * FROM sdg ORDER BY number")
        return result[0]["result"]
    except Exception as e:
        logger.error(f"Error listing SDGs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{number}", response_model=SDG)
async def get_sdg(number: int):
    """Get a specific SDG by number"""
    try:
        db = get_db()
        result = await db.query("SELECT * FROM sdg WHERE number = $num LIMIT 1", {"num": number})
        if not result[0]["result"]:
            raise HTTPException(status_code=404, detail=f"SDG {number} not found")
        return result[0]["result"][0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting SDG {number}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
