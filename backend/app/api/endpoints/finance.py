from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.models import FinanceRecord, User
from app.api.deps import get_current_user

router = APIRouter()

class BillCreate(BaseModel):
    title: str
    amount: float
    category: str
    record_type: str # "EMI" or "Loan" or "Utilities" or "Insurance"
    due_date: str    # YYYY-MM-DD
    frequency: str = "Monthly"

@router.get("/bills")
async def get_bills(current_user: User = Depends(get_current_user)) -> Any:
    """Get all outstanding bills/EMIs for the user."""
    records = await FinanceRecord.find(
        FinanceRecord.user_id == str(current_user.id),
        {"record_type": {"$in": ["EMI", "Loan", "Utilities", "Insurance"]}}
    ).to_list()
    
    result = []
    for r in records:
        result.append({
            "id": str(r.id),
            "title": r.title,
            "amount": r.amount,
            "category": r.category,
            "record_type": r.record_type,
            "frequency": r.frequency,
            "due_date": r.details.get("due_date"),
            "status": r.details.get("status", "Pending")
        })
    return result

@router.post("/bills")
async def create_bill(bill_in: BillCreate, current_user: User = Depends(get_current_user)) -> Any:
    """Add a new bill/EMI entry."""
    new_record = FinanceRecord(
        user_id=str(current_user.id),
        record_type=bill_in.record_type,
        title=bill_in.title,
        amount=bill_in.amount,
        category=bill_in.category,
        frequency=bill_in.frequency,
        details={
            "due_date": bill_in.due_date,
            "status": "Pending"
        }
    )
    await new_record.insert()
    return {"message": "Bill registered successfully", "id": str(new_record.id)}

@router.put("/bills/{bill_id}/pay")
async def pay_bill(bill_id: str, current_user: User = Depends(get_current_user)) -> Any:
    """Mark a bill/EMI as Paid."""
    from bson import ObjectId
    try:
        obj_id = ObjectId(bill_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    record = await FinanceRecord.find_one(
        FinanceRecord.id == obj_id,
        FinanceRecord.user_id == str(current_user.id)
    )
    if not record:
        raise HTTPException(status_code=404, detail="Bill not found")
        
    record.details["status"] = "Paid"
    await record.save()
    return {"message": "Bill marked as paid"}
