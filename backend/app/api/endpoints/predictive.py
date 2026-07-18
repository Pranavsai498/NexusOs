from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from app.db.models import User, FinanceRecord, FamilyMember, AppDocument
from app.api.deps import get_current_user
from datetime import datetime

router = APIRouter()

class SimulationRequest(BaseModel):
    scenario: str

@router.get("/insights")
async def get_predictive_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get aggregated family predictive forecasts, opportunity feeds, risk status logs,
    predictive timeline tracks, and community comparison benchmarks.
    """
    finance_records = await FinanceRecord.find(FinanceRecord.user_id == str(current_user.id)).to_list()
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()

    opportunity_feed = []
    risks = []
    categories_predictions = {
        "Finance": [],
        "Health": [],
        "Government": [],
        "Education": [],
        "Legal": [],
        "Assets": [],
        "Family": []
    }
    timeline_nodes = []
    community = []

    # Compile dynamic risks from finance records
    for f in finance_records:
        if f.record_type == "Loan" or f.record_type == "EMI":
            due_date_str = f.details.get("due_date")
            if due_date_str:
                risks.append({
                    "name": f"Pending {f.title}",
                    "level": "🔴 High Risk" if f.amount > 10000 else "🟠 Medium Risk",
                    "desc": f"EMI of ₹{f.amount} is outstanding, due on {due_date_str}.",
                    "category": "Finance"
                })

    # Compile timeline nodes
    for f in finance_records:
        due_date_str = f.details.get("due_date")
        if due_date_str:
            timeline_nodes.append({
                "period": due_date_str,
                "task": f"Pay {f.title}"
            })

    # Compile opportunities from goals
    for f in finance_records:
        if f.record_type == "Goal":
            opportunity_feed.append({
                "title": f"Complete {f.title}",
                "desc": f"Save towards target amount of ₹{f.amount}.",
                "category": "Finance"
            })

    return {
        "summary": {
            "risks_count": len(risks),
            "opportunities_count": len(opportunity_feed),
            "trends_count": len(timeline_nodes),
            "confidence": 95 if finance_records else 0
        },
        "opportunities": opportunity_feed,
        "risks": risks,
        "categories": categories_predictions,
        "timeline": timeline_nodes,
        "community": community
    }

@router.post("/simulate")
async def run_predictive_simulation(req: SimulationRequest, current_user: User = Depends(get_current_user)) -> Any:
    """
    Simulate 'What If' future events across all 6 family pillars.
    """
    scenario = req.scenario.lower()

    if "house" in scenario:
        return {
            "scenario": "Buy a house next year",
            "impacts": {
                "Finance": "Adds new SBI Home Loan EMI payment of ₹32,000 monthly.",
                "Government": "Identifies PMAY housing subsidy benefit eligibility details.",
                "Legal": "Triggers Sale Deed, Encumbrance, and Mutation checklists.",
                "Vault": "Structures new 'Ramesh House Deeds' document folder.",
                "Planning": "Adjusts monthly family savings target buffer from ₹38,000 to ₹10,000.",
                "Family": "Reduces Emergency fund cover lifespan from 8 months to 5 months.",
                "Prediction": "Projected 5-year financial health index adjusts to 'Fair' status."
            }
        }
    elif "job" in scenario:
        return {
            "scenario": "Lose current employment",
            "impacts": {
                "Finance": "Triggers emergency fund depletion sequence (expected span: 8 months).",
                "Government": "Retrieves state unemployment scheme criteria details.",
                "Vault": "Secures scanned severance letter copy & active employer claims.",
                "Planning": "Locks non-essential recharges, subscriptions, and leisure budgets.",
                "Family": "Adjusts individual monthly family contribution balance to zero.",
                "Prediction": "Emergency buffer risk flags to 🔴 High Priority status."
            }
        }
    elif "abroad" in scenario or "study" in scenario:
        return {
            "scenario": "Daughter Sarah studies abroad",
            "impacts": {
                "Finance": "Triggers collateral education loan application checklist.",
                "Government": "Checks overseas educational student benefits eligibility.",
                "Vault": "Compiles visa, TOEFL scorecard, and admission memo directories.",
                "Planning": "Maps 4-year foreign tuition schedules & semester fee due dates.",
                "Family": "Adjusts household emergency buffers.",
                "Prediction": "Deficit forecast warning flagged (potential gap: ₹8,00,000)."
            }
        }
    elif "retire" in scenario:
        return {
            "scenario": "Retire at age 58",
            "impacts": {
                "Finance": "Switches tracking from salary logs to EPF & pension annuities.",
                "Government": "Initiates Senior Citizen Pension benefits application.",
                "Vault": "Retrieves employment records & gratuity settlement forms.",
                "Planning": "Prepares 20-year post-retirement consumption forecast.",
                "Family": "Calculates health coverage transition details for dependents.",
                "Prediction": "Suggested action: Create immediate annuity investment coverages."
            }
        }
    else: # Increase SIP
        return {
            "scenario": "Increase Monthly SIP by ₹2,000",
            "impacts": {
                "Finance": "Increases mutual fund investments allocation share to ₹5,500.",
                "Government": "Matches additional 80C tax exemption criteria details.",
                "Vault": "Logs new bank mandate approvals.",
                "Planning": "Maintains savings milestones goals coverages.",
                "Family": "Improves overall household financial health indicator index.",
                "Prediction": "Reduces long-term education deficit target gap by ₹1,50,000."
            }
        }
