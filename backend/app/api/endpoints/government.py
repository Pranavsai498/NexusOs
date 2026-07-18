from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.models import GovernmentApplication, FamilyMember, AppDocument, User
from app.api.deps import get_current_user

router = APIRouter()

class ApplyScheme(BaseModel):
    scheme_name: str
    details: Optional[dict] = {}

@router.get("/insights")
async def get_govt_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Evaluates family members, vault documents, and returns matched recommended schemes,
    application trackers, opportunity radars, and predictive alerts.
    """
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()
    applications = await GovernmentApplication.find(GovernmentApplication.user_id == str(current_user.id)).to_list()

    # Document checkmarks in vault
    has_aadhaar = any(d.card_type == "Aadhaar Card" for d in documents)
    has_pan = any(d.card_type == "PAN Card" for d in documents)
    has_income = any(d.card_type == "Income Certificate" for d in documents)
    has_caste = any(d.card_type == "Caste Certificate" for d in documents)
    has_bonafide = any("bonafide" in d.filename.lower() for d in documents)
    has_residence = any("residence" in d.filename.lower() for d in documents)

    # Determine eligibility based on family members
    has_elderly = any(m.age >= 60 for m in members)
    has_student = any(18 <= m.age <= 22 for m in members)
    
    # Recommended Schemes built dynamically from family profile
    recommended = []
    
    if has_student:
        recommended.append({
            "id": "aicte-scholarship",
            "title": "AICTE Pragati Scholarship Scheme",
            "category": "Scholarships",
            "benefit": "₹50,000 per year for technical degree students",
            "eligible": has_student,
            "matching_member": next((m.name for m in members if 18 <= m.age <= 22), "N/A"),
            "documents": {
                "Aadhaar Card": has_aadhaar,
                "Income Certificate": has_income,
                "Caste Certificate": has_caste,
                "Bonafide Certificate": has_bonafide
            }
        })

    if has_elderly:
        recommended.append({
            "id": "senior-pension",
            "title": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
            "category": "Pension",
            "benefit": "Monthly pension of ₹3,000",
            "eligible": has_elderly,
            "matching_member": next((m.name for m in members if m.age >= 60), "N/A"),
            "documents": {
                "Aadhaar Card": has_aadhaar,
                "Residence Certificate": has_residence,
                "Income Certificate": has_income
            }
        })

    # Applied Trackers
    trackers = []
    for app in applications:
        trackers.append({
            "id": str(app.id),
            "name": app.application_name,
            "status": app.status,
            "submission_date": app.submission_date.strftime("%Y-%m-%d"),
            "expected_date": (app.submission_date + timedelta(days=15)).strftime("%Y-%m-%d"),
            "verification_completed": app.details.get("verification_completed", False)
        })

    # Opportunity Radar & Predictions
    radar = []
    calendar = []
    predictions = []
    community = {
        "families_claimed": 0.0,
        "popular_scheme": "N/A"
    }

    if applications:
        radar.append({
            "title": "Active Application progress verification",
            "eligibility": "In Progress",
            "benefit": "Status updates loaded dynamically",
            "deadline": "Active"
        })
        calendar.append({"date": "Today", "title": "Check scheme status updates", "type": "Status"})
        predictions.append("Review application statuses periodically for any verification calls.")
        community["families_claimed"] = len(applications) * 10
        community["popular_scheme"] = applications[0].application_name

    return {
        "summary": {
            "recommended_count": len(recommended),
            "applied_count": len(trackers),
            "approved_count": len([t for t in trackers if t["status"] == "Approved" or t["status"] == "Disbursed"]),
            "pending_count": len([t for t in trackers if t["status"] != "Approved" and t["status"] != "Disbursed"])
        },
        "recommended": recommended,
        "trackers": trackers,
        "radar": radar,
        "calendar": calendar,
        "predictions": predictions,
        "community": community
    }

@router.post("/apply")
async def apply_for_scheme(app_in: ApplyScheme, current_user: User = Depends(get_current_user)) -> Any:
    """Submit application for a government benefit."""
    new_app = GovernmentApplication(
        user_id=str(current_user.id),
        application_name=app_in.scheme_name,
        status="Submitted",
        submission_date=datetime.utcnow(),
        details={"verification_completed": False}
    )
    await new_app.insert()
    return {"message": f"Successfully applied for {app_in.scheme_name}", "application_id": str(new_app.id)}
