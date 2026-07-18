from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.models import AppDocument, User
from app.api.deps import get_current_user

router = APIRouter()

class WarrantyCreate(BaseModel):
    product_name: str
    brand: str
    purchase_date: str  # YYYY-MM-DD
    warranty_period_months: int
    expiry_date: str    # YYYY-MM-DD
    notes: Optional[str] = None

@router.get("/")
async def get_warranties(current_user: User = Depends(get_current_user)) -> Any:
    """Get all warranty entries for the current user."""
    warranties = await AppDocument.find(
        AppDocument.user_id == str(current_user.id),
        AppDocument.category == "Warranty"
    ).to_list()
    
    result = []
    for w in warranties:
        brand = w.tags[0] if w.tags else "Unknown"
        
        # Try parsing purchase date from text or use created_at as fallback
        purchase_date = w.created_at.strftime("%Y-%m-%d")
        if "Purchase Date: " in w.content:
            try:
                purchase_date = w.content.split("Purchase Date: ")[1].split("\n")[0].strip()
            except Exception:
                pass
                
        result.append({
            "id": str(w.id),
            "product_name": w.filename,
            "brand": brand,
            "purchase_date": purchase_date,
            "expiry_date": w.expiry_date.strftime("%Y-%m-%d") if w.expiry_date else None,
            "notes": w.summary,
            "content": w.content
        })
    return result

@router.post("/")
async def create_warranty(warranty_in: WarrantyCreate, current_user: User = Depends(get_current_user)) -> Any:
    """Create a new warranty document entry."""
    try:
        exp_date = datetime.strptime(warranty_in.expiry_date, "%Y-%m-%d")
    except ValueError:
        exp_date = None

    new_doc = AppDocument(
        filename=warranty_in.product_name,
        content=f"Product: {warranty_in.product_name}\nBrand: {warranty_in.brand}\nPurchase Date: {warranty_in.purchase_date}\nWarranty Months: {warranty_in.warranty_period_months}\nNotes: {warranty_in.notes or ''}",
        category="Warranty",
        user_id=str(current_user.id),
        expiry_date=exp_date,
        tags=[warranty_in.brand],
        summary=warranty_in.notes
    )
    await new_doc.insert()
    return {"message": "Warranty registered successfully", "id": str(new_doc.id)}

@router.delete("/{doc_id}")
async def delete_warranty(doc_id: str, current_user: User = Depends(get_current_user)) -> Any:
    """Delete a warranty entry."""
    from bson import ObjectId
    try:
        obj_id = ObjectId(doc_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    doc = await AppDocument.find_one(
        AppDocument.id == obj_id,
        AppDocument.user_id == str(current_user.id)
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Warranty not found")
    await doc.delete()
    return {"message": "Warranty deleted successfully"}
