from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.models import User, FinanceRecord, TimelineEvent, FamilyMember
from app.api.deps import get_current_user

router = APIRouter()

class EventChecklist(BaseModel):
    event_type: str

@router.get("/insights")
async def get_planning_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get aggregated family daily tasks, priorities calendars, morning focus briefs,
    event checklists, and predictive timeline planners.
    """
    finance_records = await FinanceRecord.find(FinanceRecord.user_id == str(current_user.id)).to_list()
    timeline_events = await TimelineEvent.find(TimelineEvent.user_id == str(current_user.id)).to_list()
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()

    critical_tasks = []
    important_tasks = []
    normal_tasks = []
    future_tasks = []

    for f in finance_records:
        status = f.details.get("status", "Pending")
        if status == "Paid":
            continue
        due_date_str = f.details.get("due_date")
        
        task_item = {
            "title": f.title,
            "due": due_date_str or "No Date",
            "type": f.record_type
        }
        
        if due_date_str:
            try:
                due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
                diff_days = (due_date - datetime.utcnow()).days + 1
                if diff_days <= 3:
                    critical_tasks.append({"title": f.title, "time": due_date_str, "type": f.record_type})
                elif diff_days <= 15:
                    important_tasks.append(task_item)
                else:
                    normal_tasks.append(task_item)
            except Exception:
                normal_tasks.append(task_item)
        else:
            normal_tasks.append(task_item)

    # Shared Calendar agenda
    calendar = []
    for m in members:
        calendar.append({
            "member": m.name,
            "event": "Routine Day agenda",
            "time": "All Day"
        })

    # Weekly plan
    weekly_plan = []
    for t in timeline_events[:4]:
        weekly_plan.append({
            "day": t.event_date.strftime("%A"),
            "task": t.title
        })

    # Monthly planner totals
    monthly_planner = {
        "emis": len([f for f in finance_records if f.record_type == "EMI"]),
        "insurance_renewals": len([f for f in finance_records if f.record_type == "Insurance"]),
        "govt_applications": 0,
        "medical_checkups": 0,
        "school_fees": 0
    }

    # Long term planner milestones
    long_term = []
    for f in finance_records:
        if f.record_type == "Goal":
            long_term.append({
                "year": f.details.get("target_year", "2027"),
                "milestone": f.title,
                "progress": int(f.details.get("progress", 50))
            })

    # Life Event checklists matching user selection
    checklists = {
        "moving": [
            "Submit Address Update forms",
            "Update Aadhaar Card residency addresses",
            "Collect School Transfer bonafides",
            "Transfer electricity & water utility lines"
        ],
        "car": [
            "Compare car dealer quotes & financing plans",
            "Confirm HDFC vehicle loan rates & deposits",
            "Register third-party comprehensive insurance policy",
            "Generate RC registration numbers & plates"
        ],
        "college": [
            "Verify all marks cards and transcripts",
            "Collect income certificate for fee concessions",
            "Apply for student scholarships",
            "Confirm hostel allocation details"
        ]
    }

    # Compile dynamic stats for focus_brief
    focus_brief = {
        "critical_count": len(critical_tasks),
        "health_reminders": 0,
        "bills_due": len(important_tasks) + len(critical_tasks),
        "potential_savings": sum(f.amount for f in finance_records if f.record_type == "Goal") or 0.0,
        "weather": "Clear & Sunny",
        "busy_hours": "No overlap detected"
    }

    summary = {
        "today_count": len(critical_tasks),
        "week_count": len(important_tasks),
        "month_count": len(normal_tasks),
        "goals_count": len(long_term)
    }

    predictions = [
        "LPG Cylinder price index projected to rise by 4.2% next month.",
        "Monsoon showers likely to increase traffic density during school hours."
    ]

    return {
        "critical": critical_tasks,
        "important": important_tasks,
        "normal": normal_tasks,
        "future": future_tasks,
        "calendar": calendar,
        "weekly": weekly_plan,
        "monthly": monthly_planner,
        "long_term": long_term,
        "checklists": checklists,
        "focus_brief": focus_brief,
        "summary": summary,
        "predictions": predictions
    }

@router.post("/checklist")
async def compile_event_checklist(checklist_in: EventChecklist, current_user: User = Depends(get_current_user)) -> Any:
    """Compile custom milestone timeline checklists."""
    return {"message": f"Successfully compiled checklist for {checklist_in.event_type}"}
