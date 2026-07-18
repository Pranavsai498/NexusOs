from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.models import FamilyMember, AppDocument, User, EducationRecord
from app.api.deps import get_current_user

router = APIRouter()

class UpdateGoal(BaseModel):
    goal_name: str

@router.get("/insights")
async def get_education_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get educational records, CGPAs, timelines, skill ratings,
    certificate checkmarks, and the AI Career Twin progress roadmap.
    """
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()
    edu_records = await EducationRecord.find(EducationRecord.user_id == str(current_user.id)).to_list()

    # Roster mapping
    student = next((m for m in members if m.relation == "Child"), None)
    student_name = student.name if student else "No Student Registered"
    
    # Document matching
    has_10th = any("10th" in d.filename.lower() or "ssc" in d.filename.lower() for d in documents)
    has_12th = any("12th" in d.filename.lower() or "hsc" in d.filename.lower() for d in documents)
    has_bonafide = any("bonafide" in d.filename.lower() for d in documents)
    has_income = any(d.card_type == "Income Certificate" for d in documents)
    has_caste = any(d.card_type == "Caste Certificate" for d in documents)

    academics = []
    for rec in edu_records:
        academics.append({
            "semester": rec.degree,
            "gpa": float(rec.grade) if rec.grade else 0.0,
            "status": "Completed" if rec.end_date else "In Progress"
        })

    scholarships = []
    for rec in edu_records:
        if rec.scholarship_status != "None":
            scholarships.append({
                "id": str(rec.id),
                "name": f"{rec.institution} Scholarship",
                "status": rec.scholarship_status,
                "benefit": "Fee Waiver match",
                "action": "View Details"
            })

    certificates = {
        "10th Memo": has_10th,
        "12th Memo": has_12th,
        "Bonafide Certificate": has_bonafide,
        "Income Certificate": has_income,
        "Caste Certificate": has_caste
    }

    exams = []
    skills = []
    internships = {
        "applied": 0,
        "interview": 0,
        "offer": 0,
        "rejected": 0
    }

    career_roadmap = {
        "goal": current_user.preferences.get("career_goal", "N/A"),
        "current_progress": 0,
        "readiness_date": "N/A",
        "next_actions": []
    }

    timeline = []
    predictions = []
    community = []

    if edu_records:
        career_roadmap["current_progress"] = 50
        career_roadmap["readiness_date"] = "June 2027"
        career_roadmap["next_actions"] = ["Verify credentials in digital locker", "Maintain minimum required SGPA"]
        timeline.append({"step": "Next Month", "task": "Verify academic records"})
        predictions.append("Maintain strong SGPA averages to safeguard current scholarship eligibility status.")

    return {
        "summary": {
            "name": student_name,
            "course": "Education Tracker",
            "branch": "Science & Arts" if student else "N/A",
            "semester": "Active Term" if student else "N/A",
            "readiness_score": 75 if student else 0,
            "scholarships_available": len(scholarships),
            "upcoming_days": 10
        },
        "academics": academics,
        "scholarships": scholarships,
        "certificates": certificates,
        "exams": exams,
        "skills": skills,
        "internships": internships,
        "career_roadmap": career_roadmap,
        "timeline": timeline,
        "predictions": predictions,
        "community": community
    }

@router.post("/goal")
async def update_career_goal(goal_in: UpdateGoal, current_user: User = Depends(get_current_user)) -> Any:
    """Updates student's target career roadmap goal."""
    current_user.preferences["career_goal"] = goal_in.goal_name
    await current_user.save()
    return {"message": f"Successfully updated career goal to {goal_in.goal_name}"}
