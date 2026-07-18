from fastapi import APIRouter, Depends
from typing import Any
from app.db.models import FamilyMember, User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/insights")
async def get_insights(current_user: User = Depends(get_current_user)) -> Any:
    """Calculate dashboard insights dynamically based on Family data"""
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    
    total_members = len(members)
    
    if total_members == 0:
        return {
            "health_score": 0,
            "financial_score": 0,
            "govt_score": 0,
            "recommendations": []
        }
    
    # Dynamic scores based on family structure
    health_score = min(100, 50 + (total_members * 10))
    financial_score = min(100, 40 + (total_members * 15))
    govt_score = min(100, 30 + (total_members * 20))
    
    recommendations = []
    
    has_student = any(m.age and m.age < 22 for m in members)
    if has_student:
        recommendations.append({
            "id": 1,
            "priority": "High Priority",
            "type": "Education",
            "title": "Student Scholarship Alert",
            "reason": f"Based on a student member in your family profile.",
            "benefit": "Eligible for educational grants",
            "action": "Apply Now",
            "query": "Apply for student scholarships"
        })
        
    has_elderly = any(m.age and m.age > 60 for m in members)
    if has_elderly:
        recommendations.append({
            "id": 2,
            "priority": "High Priority",
            "type": "Health",
            "title": "Senior Citizen Health Check",
            "reason": "Annual preventive checkups for senior members.",
            "benefit": "Early detection and wellness",
            "action": "Book Checkup",
            "query": "Book health checkup for senior citizens"
        })
        
    if not recommendations:
        recommendations.append({
            "id": 3,
            "priority": "Medium Priority",
            "type": "Finance",
            "title": "Family Budget Optimization",
            "reason": "Review monthly expenses to increase savings.",
            "benefit": "Save up to 10% monthly",
            "action": "Review Budget",
            "query": "Review family budget"
        })
        
    return {
        "health_score": health_score,
        "financial_score": financial_score,
        "govt_score": govt_score,
        "recommendations": recommendations
    }
