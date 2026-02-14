"""Knowledge Graph API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging
from ..database import get_db
from ..models import GraphResponse, GraphNode, GraphEdge

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/explore", response_model=GraphResponse)
async def explore_graph(
    entity_id: str = Query(..., description="Starting entity ID"),
    depth: int = Query(default=1, ge=1, le=3, description="Traversal depth")
):
    """Explore knowledge graph from a starting entity"""
    try:
        db = get_db()
        
        # Traverse graph from starting entity
        result = await db.query("""
            LET $start = $entity_id;
            LET $nodes = (SELECT * FROM $start);
            LET $edges = (SELECT * FROM $start->*);
            RETURN {nodes: $nodes, edges: $edges}
        """, {"entity_id": entity_id})
        
        nodes = [GraphNode(
            id=n["id"],
            type=n.get("type", "unknown"),
            label=n.get("name", n.get("title", "Unknown")),
            properties=n
        ) for n in result[0]["result"][0]["nodes"]]
        
        edges = [GraphEdge(
            id=e["id"],
            source=e["in"],
            target=e["out"],
            type=e.get("relationship_type", "related"),
            properties=e
        ) for e in result[0]["result"][0]["edges"]]
        
        return GraphResponse(
            nodes=nodes,
            edges=edges,
            total_nodes=len(nodes),
            total_edges=len(edges)
        )
    except Exception as e:
        logger.error(f"Error exploring graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))
