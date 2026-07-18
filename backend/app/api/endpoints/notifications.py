from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.db.models import FinanceRecord, AppDocument, User
from app.api.deps import get_current_user

router = APIRouter()

class MedToggle(BaseModel):
    med_name: str
    taken: bool

@router.get("/")
async def get_notifications(current_user: User = Depends(get_current_user)) -> Any:
    """Get dynamic, real-time notifications for the current user."""
    notifications = []
    now = datetime.utcnow()
    
    # 1. Check outstanding bills and EMIs (due in <= 5 days)
    bills = await FinanceRecord.find(
        FinanceRecord.user_id == str(current_user.id),
        {"record_type": {"$in": ["EMI", "Loan", "Utilities", "Insurance"]}}
    ).to_list()
    
    for bill in bills:
        status = bill.details.get("status", "Pending")
        due_date_str = bill.details.get("due_date")
        if status == "Pending" and due_date_str:
            try:
                due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
                days_left = (due_date - now).days + 1
                
                if days_left <= 5 and days_left >= 0:
                    notifications.append({
                        "id": f"bill-{bill.id}",
                        "type": "bill",
                        "title": f"Upcoming Bill: {bill.title}",
                        "message": f"An amount of ₹{bill.amount:.2f} is due on {due_date_str} ({days_left} days left).",
                        "severity": "critical" if days_left <= 2 else "warning",
                        "timestamp": f"{days_left} days left"
                    })
                elif days_left < 0:
                    notifications.append({
                        "id": f"bill-{bill.id}",
                        "type": "bill",
                        "title": f"Overdue Bill: {bill.title}",
                        "message": f"An amount of ₹{bill.amount:.2f} was due on {due_date_str} (Overdue by {abs(days_left)} days).",
                        "severity": "critical",
                        "timestamp": "Overdue"
                    })
            except Exception:
                pass

    # 2. Check expiring product warranties (expiring in <= 30 days)
    warranties = await AppDocument.find(
        AppDocument.user_id == str(current_user.id),
        AppDocument.category == "Warranty"
    ).to_list()
    
    for warranty in warranties:
        if warranty.expiry_date:
            days_left = (warranty.expiry_date - now).days
            if days_left <= 30 and days_left >= 0:
                notifications.append({
                    "id": f"warranty-{warranty.id}",
                    "type": "warranty",
                    "title": f"Warranty Expiry: {warranty.filename}",
                    "message": f"The warranty for your {warranty.filename} expires on {warranty.expiry_date.strftime('%Y-%m-%d')} ({days_left} days left).",
                    "severity": "warning" if days_left > 7 else "critical",
                    "timestamp": f"{days_left} days left"
                })
            elif days_left < 0:
                notifications.append({
                    "id": f"warranty-{warranty.id}",
                    "type": "warranty",
                    "title": f"Expired Warranty: {warranty.filename}",
                    "message": f"The warranty for your {warranty.filename} expired on {warranty.expiry_date.strftime('%Y-%m-%d')}.",
                    "severity": "info",
                    "timestamp": "Expired"
                })

    # Sort notifications: critical first, then warning, then info
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    notifications.sort(key=lambda x: severity_order.get(x["severity"], 3))
    
    return notifications

@router.get("/reminders-insights")
async def get_reminders_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get smart prioritized reminders, multi-stage notification schedules,
    adaptive escalation routes, and context-aware summaries.
    """
    notifications = await get_notifications(current_user)
    
    critical = []
    important = []
    upcoming = []
    
    for n in notifications:
        item = {
            "id": n["id"],
            "title": n["title"],
            "due": n["timestamp"],
            "message": n["message"],
            "category": n["type"].capitalize()
        }
        if n["severity"] == "critical":
            critical.append(item)
        elif n["severity"] == "warning":
            important.append(item)
        else:
            upcoming.append(item)

    # Escalation levels
    escalation = [
        {"stage": "30 Days Before", "desc": "Normal Warning email alert"},
        {"stage": "15 Days Before", "desc": "Dashboard banner notice"},
        {"stage": "7 Days Before", "desc": "Floating assistant text ping"},
        {"stage": "3 Days Before", "desc": "Intense SMS reminder dispatch"},
        {"stage": "Tomorrow", "desc": "Critical Dashboard Alarm & notification"},
        {"stage": "Today", "desc": "Immediate Life Brief priority alert"},
        {"stage": "Urgent Overdue", "desc": "Continuous phone ring & alarm trigger"}
    ]

    grouping = None
    if critical or important:
        grouping = {
            "title": "Today's Pending Tasks Group",
            "items": [c["title"] for c in critical] + [i["title"] for i in important],
            "estimated_time": f"{len(critical) * 5} Minutes"
        }

    location_alerts = []
    predictions = []
    community = []

    return {
        "summary": {
            "critical_count": len(critical),
            "important_count": len(important),
            "upcoming_count": len(upcoming),
            "completed_count": 0
        },
        "critical": critical,
        "important": important,
        "upcoming": upcoming,
        "escalation": escalation,
        "grouping": grouping,
        "location_alerts": location_alerts,
        "predictions": predictions,
        "community": community
    }
