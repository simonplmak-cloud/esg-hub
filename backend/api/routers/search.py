"""Search API endpoints"""
from fastapi import APIRouter, HTTPException
import logging
import time
from ..database import get_db
from ..models import SearchQuery, SearchResponse, SearchResult

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=SearchResponse)
async def hybrid_search(query: SearchQuery):
    """Hybrid search combining vector similarity and full-text search"""
    try:
        start = time.time()
        db = get_db()
        
        # Use custom hybrid_search function from schema
        result = await db.query(
            "SELECT * FROM fn::hybrid_search($query, $limit, $threshold)",
            {"query": query.query, "limit": query.limit, "threshold": query.threshold}
        )
        
        results = []
        for item in result[0]["result"]:
            results.append(SearchResult(
                id=item["id"],
                type=item["type"],
                title=item["title"],
                description=item["description"],
                score=item["score"],
                url=item.get("url")
            ))
        
        took_ms = (time.time() - start) * 1000
        
        return SearchResponse(
            query=query.query,
            results=results,
            total=len(results),
            took_ms=round(took_ms, 2)
        )
    except Exception as e:
        logger.error(f"Error in hybrid search: {e}")
        raise HTTPException(status_code=500, detail=str(e))
