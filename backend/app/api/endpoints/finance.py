from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.models import FinanceRecord, User
from app.api.deps import get_current_user

router = APIRouter()

class BillCreate(BaseModel):
    title: str
    amount: float
    category: str
    record_type: str # "EMI" or "Loan" or "Utilities" or "Insurance" or "Income" or "Expense" or "Goal"
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

@router.get("/cfo-insights")
async def get_cfo_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get aggregated CFO analytics, budgets, loans, credit cards, score, 
    predictions and savings coach opportunities.
    """
    records = await FinanceRecord.find(FinanceRecord.user_id == str(current_user.id)).to_list()
    
    # Calculate Income/Expense
    income_records = [r for r in records if r.record_type == "Income"]
    income_sum = sum(r.amount for r in income_records)
    
    utility_records = [r for r in records if r.record_type == "Utilities" and r.details.get("status") != "Paid"]
    emi_records = [r for r in records if r.record_type == "EMI" and r.details.get("status") != "Paid"]
    loan_records = [r for r in records if r.record_type == "Loan" and r.details.get("status") != "Paid"]
    insurance_records = [r for r in records if r.record_type == "Insurance" and r.details.get("status") != "Paid"]
    
    bills_due_count = len(utility_records) + len(emi_records) + len(loan_records)
    insurance_due_count = len(insurance_records)
    
    expense_sum = sum(r.amount for r in records if r.record_type in ["Utilities", "EMI", "Loan", "Insurance", "Expense"] and r.details.get("status") != "Paid")
    savings_sum = max(0.0, income_sum - expense_sum)
    
    # Compile budgets dynamically
    budget_map = {}
    for r in records:
        if r.record_type == "Expense":
            budget_map[r.category] = budget_map.get(r.category, 0.0) + r.amount

    budgets = []
    for cat, spent in budget_map.items():
        budgets.append({
            "category": cat,
            "spent": spent,
            "limit": 20000.0,
            "status": "Good" if spent <= 20000.0 else "Over Limit"
        })

    # Compile loans dynamically
    loans = []
    for r in records:
        if r.record_type == "Loan":
            loans.append({
                "name": r.title,
                "provider": r.details.get("provider", "Bank"),
                "amount": r.amount,
                "interest": r.details.get("interest", 9.0),
                "emi": r.amount / 12,
                "balance": r.amount,
                "completion": r.details.get("due_date", "N/A"),
                "refinance_opportunity": False
            })

    # Compile Credit Cards
    credit_cards = []
    # Compile Insurance
    insurance = []
    for r in records:
        if r.record_type == "Insurance":
            insurance.append({
                "name": r.title,
                "type": r.category,
                "premium": r.amount,
                "renewal": r.details.get("due_date", "N/A"),
                "coverage": r.details.get("coverage", r.amount * 10),
                "nominee": r.details.get("nominee", "Sita Kumar"),
                "policy_number": r.details.get("policy_number", "N/A")
            })

    # Compile Recharges
    recharges = []
    for r in records:
        if r.record_type == "Utilities":
            recharges.append({
                "name": r.title,
                "expires_in_days": 15,
                "amount": r.amount
            })

    savings_coach = {
        "total_annual_benefit": 0.0,
        "items": []
    }
    
    predictions = []
    
    if records:
        predictions.append({
            "title": "Monthly budget check completed",
            "description": f"Currently tracking {len(records)} financial log entries in vault.",
            "type": "info"
        })
    
    return {
        "summary": {
            "income": income_sum,
            "expense": expense_sum,
            "savings": savings_sum,
            "bills_due_count": bills_due_count,
            "insurance_due_count": insurance_due_count,
            "investments_count": len([r for r in records if r.record_type == "Goal"]),
            "estimated_savings": savings_sum
        },
        "budgets": budgets,
        "budget_analysis": "Dynamic budget analysis completed.",
        "loans": loans,
        "credit_cards": credit_cards,
        "insurance": insurance,
        "recharges": recharges,
        "savings_coach": savings_coach,
        "predictions": predictions,
        "tax_intelligence": {
            "possible_tax_saving": 0.0,
            "recommendations": []
        },
        "health_score": {
            "score": 100 if income_sum > expense_sum else 50 if records else 0,
            "status": "Healthy" if income_sum > expense_sum else "Warning",
            "checklist": [
                {"name": "Emergency Fund", "status": income_sum > expense_sum},
                {"name": "Insurance Coverage", "status": len(insurance) > 0},
                {"name": "EMI Healthy", "status": len(emi_records) == 0},
                {"name": "Budget limits", "status": len(budgets) > 0}
            ]
        },
        "community": {
            "refinance_saved": 0.0,
            "area_broadband": 799.0,
            "your_broadband": 1099.0
        }
    }
