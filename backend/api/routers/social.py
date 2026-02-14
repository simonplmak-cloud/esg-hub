"""Social Issues API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from ..database import get_db
from ..models import SocialIssue

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[SocialIssue])
async def list_social_issues(core_subject: Optional[str] = Query(None)):
    """List all ISO 26000 social issues"""
    try:
        db = get_db()
        if core_subject:
            result = await db.query("SELECT * FROM social_issue WHERE core_subject = $subject ORDER BY code", {"subject": core_subject})
        else:
            result = await db.query("SELECT * FROM social_issue ORDER BY code")
        return result[0]["result"]
    except Exception as e:
        logger.error(f"Error listing social issues: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{code}", response_model=SocialIssue)
async def get_social_issue(code: str):
    """Get a specific social issue by code"""
    try:
        db = get_db()
        result = await db.query("SELECT * FROM social_issue WHERE code = $code LIMIT 1", {"code": code})
        if not result[0]["result"]:
            raise HTTPException(status_code=404, detail=f"Social issue '{code}' not found")
        return result[0]["result"][0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting social issue {code}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
