from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from app.db.models import FamilyMember, User, FinanceRecord, GovernmentApplication, TimelineEvent
from app.api.deps import get_current_user

router = APIRouter()

class FamilyMemberCreate(BaseModel):
    name: str
    relation: str
    age: int

@router.post("/")
async def create_member(member_in: FamilyMemberCreate, current_user: User = Depends(get_current_user)) -> Any:
    """Create a new family member."""
    member = FamilyMember(
        name=member_in.name,
        relation=member_in.relation,
        age=member_in.age,
        user_id=str(current_user.id)
    )
    await member.insert()
    return {"message": "Family member created", "id": str(member.id)}

@router.get("/")
async def get_members(current_user: User = Depends(get_current_user)) -> Any:
    """Get all family members for current user."""
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    return members

@router.get("/insights")
async def get_family_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get aggregated family profiles, relationships maps, permissions controls,
    shared calendars, mutual goals trackers, family timeline, and AI digital twin events.
    """
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    finance_records = await FinanceRecord.find(FinanceRecord.user_id == str(current_user.id)).to_list()
    govt_apps = await GovernmentApplication.find(GovernmentApplication.user_id == str(current_user.id)).to_list()
    timeline_events = await TimelineEvent.find(TimelineEvent.user_id == str(current_user.id)).to_list()

    # Dynamic status
    member_status = []
    
    # Add self
    member_status.append({
        "id": "self",
        "name": current_user.full_name,
        "relation": "Self",
        "role": "Family Head",
        "age": 40,
        "status": "Active",
        "avatar": f"https://api.dicebear.com/7.x/notionists/svg?seed={current_user.full_name}",
        "permissions": "All Access"
    })
    
    for m in members:
        member_status.append({
            "id": str(m.id),
            "name": m.name,
            "relation": m.relation,
            "role": m.relation,
            "age": m.age,
            "status": "Active",
            "avatar": f"https://api.dicebear.com/7.x/notionists/svg?seed={m.name}",
            "permissions": "View Only"
        })

    # Goals tracker
    goals = []
    for f in finance_records:
        if f.record_type == "Goal":
            goals.append({
                "name": f.title,
                "progress": int(f.details.get("progress", 50))
            })

    # Shared Calendar
    calendar = []
    for f in finance_records:
        due_date = f.details.get("due_date")
        if due_date:
            calendar.append({
                "time": "12:00 PM",
                "title": f"Due: {f.title} (₹{f.amount})",
                "type": f.record_type
            })

    # Family Timeline
    timeline = []
    for t in timeline_events:
        timeline.append({
            "year": t.event_date.strftime("%Y"),
            "event": t.title,
            "details": t.description
        })

    # Predictions
    predictions = []
    if members:
        predictions.append("Review complete household roster permissions annually.")

    community = []

    # Digital Twin Simulation response
    twin_events = None
    if members:
        twin_events = {
            "event": "Roster Expansion Simulation",
            "consequences": {
                "Finance": "Triggers dynamic budgets checks.",
                "Government": "Retrieves regional benefits checklists.",
                "Vault": "Prepares folder storage mapping grids.",
                "Planning": "Aligns upcoming milestone trackers.",
                "Family": "Adjusts access permission levels.",
                "Life Brain": "Initiates twin event consequence models."
            }
        }

    return {
        "members": member_status,
        "goals": goals,
        "calendar": calendar,
        "timeline": timeline,
        "predictions": predictions,
        "community": community,
        "twin": twin_events,
        "summary": {
            "health": "Excellent" if len(members) else "N/A",
            "finance": "Good" if len(finance_records) else "N/A",
            "education": f"{len(goals)} Goals" if goals else "None",
            "government": f"{len(govt_apps)} Applications" if govt_apps else "None",
            "legal": "No Pending Alerts"
        }
    }
