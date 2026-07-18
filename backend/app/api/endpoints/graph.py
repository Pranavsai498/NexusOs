from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from app.db.models import User, FamilyMember, AppDocument, FinanceRecord
from app.api.deps import get_current_user

router = APIRouter()

class SemanticSearchRequest(BaseModel):
    query: str

@router.get("/insights")
async def get_graph_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get aggregated knowledge graph summaries (nodes, links) for family networks,
    education trees, health paths, and vehicle nodes.
    """
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()
    finance = await FinanceRecord.find(FinanceRecord.user_id == str(current_user.id)).to_list()

    nodes = []
    links = []

    # If DB is empty, return empty sets
    if not members and not documents and not finance:
        return {
            "summary": {
                "members_count": 0,
                "documents_count": 0,
                "assets_count": 0,
                "relationships_count": 0
            },
            "nodes": [],
            "links": []
        }

    # Add Self
    nodes.append({"id": "self", "label": current_user.full_name, "type": "User"})

    # Add Members
    for m in members:
        nodes.append({"id": str(m.id), "label": m.name, "type": "FamilyMember"})
        links.append({"source": "self", "target": str(m.id), "label": "FAMILY_OF"})

    # Add Documents
    for d in documents:
        nodes.append({"id": str(d.id), "label": d.filename, "type": "Document"})
        target_node = d.member_id if d.member_id else "self"
        links.append({"source": target_node, "target": str(d.id), "label": "HAS_DOCUMENT"})

    # Add Finance Records
    for f in finance:
        nodes.append({"id": str(f.id), "label": f.title, "type": "Finance"})
        links.append({"source": "self", "target": str(f.id), "label": f.record_type})

    return {
        "summary": {
            "members_count": len(members),
            "documents_count": len(documents),
            "assets_count": len(finance),
            "relationships_count": len(links)
        },
        "nodes": nodes,
        "links": links
    }

@router.post("/search")
async def run_semantic_search(req: SemanticSearchRequest, current_user: User = Depends(get_current_user)) -> Any:
    """
    Search connected entities and query paths using the AI reasoning engine.
    """
    q = req.query.lower()
    
    finance = await FinanceRecord.find(FinanceRecord.user_id == str(current_user.id)).to_list()
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()

    # Search results built only from actual MongoDB matches
    results = []
    
    if "house" in q or "home" in q:
        for d in documents:
            if "house" in d.filename.lower() or "deed" in d.filename.lower():
                results.append({"entity": d.filename, "relationship": "Ownership Deed"})
        for f in finance:
            if f.record_type == "EMI" and "home" in f.title.lower():
                results.append({"entity": f.title, "relationship": "Home Mortgage"})
                
        reasoning = f"Located {len(results)} connected nodes in asset subtree." if results else "No house records matching query."
        return {
            "query": req.query,
            "reasoning": reasoning,
            "results": results
        }
        
    elif "fund" in q or "savings" in q or "reducing" in q:
        for f in finance:
            if f.record_type == "Goal" or f.amount > 5000:
                results.append({"entity": f.title, "relationship": f"Expense affecting buffer (₹{f.amount})"})
                
        reasoning = "Identified deduction pathways affecting Emergency buffers." if results else "No savings or fund records."
        return {
            "query": req.query,
            "reasoning": reasoning,
            "results": results
        }
        
    else: # Default
        return {
            "query": req.query,
            "reasoning": "Connection maps search completed.",
            "results": []
        }
