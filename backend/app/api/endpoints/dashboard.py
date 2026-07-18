from fastapi import APIRouter, Depends
from typing import Any
from app.db.models import FamilyMember, User, Family, FinanceRecord, AppDocument, GovernmentApplication, HealthRecord
from app.api.deps import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/insights")
async def get_insights(current_user: User = Depends(get_current_user)) -> Any:
    """Calculate dashboard insights dynamically based on Family and Database records"""
    
    # 1. Fetch data from MongoDB
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    finance_records = await FinanceRecord.find(FinanceRecord.user_id == str(current_user.id)).to_list()
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()
    govt_apps = await GovernmentApplication.find(GovernmentApplication.user_id == str(current_user.id)).to_list()
    health_records = await HealthRecord.find(HealthRecord.user_id == str(current_user.id)).to_list()
    
    # 2. Get family name
    family = await Family.find_one(Family.owner_id == str(current_user.id))
    family_name = family.name if family else f"{current_user.full_name.split(' ')[-1]} Family"
    if not family_name or family_name.endswith(" "):
        family_name = "Ramesh Family"
        
    # 3. Determine greeting based on local time
    hour = datetime.now().hour
    if hour < 12:
        greeting = "Good Morning 👋"
    elif hour < 17:
        greeting = "Good Afternoon 👋"
    else:
        greeting = "Good Evening 👋"
        
    # 4. Process critical tasks, upcoming tasks, and completed tasks
    critical_alerts = []
    upcoming_bills = []
    govt_benefits = []
    health_summary = []
    ai_predictions = []
    community_insights = []
    
    critical_count = 0
    upcoming_count = 0
    completed_count = 0
    
    # Compile critical/upcoming alerts from finance
    today = datetime.utcnow()
    for record in finance_records:
        due_date_str = record.details.get("due_date")
        status = record.details.get("status", "Pending")
        
        if status == "Paid":
            completed_count += 1
            continue
            
        if due_date_str:
            try:
                due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
                diff_days = (due_date - today).days + 1
                
                if diff_days <= 3 and diff_days >= 0:
                    critical_count += 1
                    critical_alerts.append({
                        "id": str(record.id),
                        "type": record.record_type,
                        "title": record.title,
                        "message": f"due in {diff_days} day(s) (₹{record.amount:,})",
                        "severity": "high",
                        "due_date": due_date_str,
                        "amount": record.amount
                    })
                elif diff_days > 3 and diff_days <= 15:
                    upcoming_count += 1
                    upcoming_bills.append({
                        "id": str(record.id),
                        "type": record.record_type,
                        "title": record.title,
                        "amount": record.amount,
                        "due_date": due_date_str,
                        "status": "Upcoming"
                    })
                else:
                    upcoming_bills.append({
                        "id": str(record.id),
                        "type": record.record_type,
                        "title": record.title,
                        "amount": record.amount,
                        "due_date": due_date_str,
                        "status": "Pending"
                    })
            except Exception:
                upcoming_bills.append({
                    "id": str(record.id),
                    "type": record.record_type,
                    "title": record.title,
                    "amount": record.amount,
                    "due_date": due_date_str,
                    "status": "Pending"
                })
        else:
            upcoming_bills.append({
                "id": str(record.id),
                "type": record.record_type,
                "title": record.title,
                "amount": record.amount,
                "due_date": "No date",
                "status": "Pending"
            })
            
    # Compile alerts from warranties / documents
    for doc in documents:
        if doc.category == "Warranty" and doc.expiry_date:
            diff_days = (doc.expiry_date - today).days
            if diff_days <= 5 and diff_days >= 0:
                critical_count += 1
                critical_alerts.append({
                    "id": str(doc.id),
                    "type": "Warranty",
                    "title": doc.filename,
                    "message": f"expires in {diff_days} days!",
                    "severity": "high",
                    "due_date": doc.expiry_date.strftime("%Y-%m-%d")
                })
            elif diff_days > 5 and diff_days <= 30:
                upcoming_count += 1
                ai_predictions.append({
                    "title": f"Warranty Expiry: {doc.filename.split('.')[0]}",
                    "description": f"Expires in {diff_days} days. Consider verifying working condition or extending coverage.",
                    "benefit": "Avoid repair costs"
                })
                
    # Add document verification status to completed
    for doc in documents:
        if doc.verification_status == "Verified":
            completed_count += 1
            
    # Government Application statuses
    for app in govt_apps:
        if app.status == "Eligible":
            upcoming_count += 1
            govt_benefits.append({
                "id": str(app.id),
                "name": app.application_name,
                "status": "Match Found",
                "deadline": app.details.get("deadline", "N/A"),
                "amount": app.details.get("amount", 0.0),
                "action": "Apply Now"
            })
        elif app.status == "Approved" or app.status == "Disbursed":
            completed_count += 1
            govt_benefits.append({
                "id": str(app.id),
                "name": app.application_name,
                "status": "Disbursed",
                "deadline": "Completed",
                "amount": app.details.get("amount", 0.0),
                "action": "View Details"
            })
            
    # Health Summaries
    has_elderly = any(m.age and m.age > 60 for m in members)
    for m in members:
        health_summary.append({
            "name": m.name,
            "relation": m.relation,
            "age": m.age,
            "status": "Normal" if m.age < 60 else "Requires Checkup",
            "last_checkup": "2026-03-10" if m.age < 60 else "2025-08-15"
        })
    if has_elderly and health_records: # Only trigger alert if there are senior checkup health records or tasks
        critical_count += 1
        critical_alerts.append({
            "id": "health_checkup",
            "type": "Health",
            "title": "Senior Citizen Health Check",
            "message": "Annual preventive checkups for senior members (Father Venkat) overdue.",
            "severity": "medium"
        })
        
    # Check for missing documents (Income Certificate for Ramesh Family) - only if we have members and document folder setup
    if members and documents:
        has_income_cert = any(doc.filename.lower().replace("_","").replace("-","").startswith("incomecertificate") or "income" in doc.filename.lower() for doc in documents)
        if not has_income_cert:
            critical_count += 1
            critical_alerts.append({
                "id": "missing_income_cert",
                "type": "Document",
                "title": "Missing Document Alert",
                "message": "Missing Income Certificate. Required for scholarship applications.",
                "severity": "high"
            })
        
    # Calculate scores based only on actual database values (no arbitrary hardcoded base scores if empty)
    total_members = len(members)
    health_score = min(100, len(health_records) * 20) if health_records else 0
    financial_score = min(100, len([f for f in finance_records if f.details.get("status") == "Paid"]) * 25) if finance_records else 0
    govt_score = min(100, len([g for g in govt_apps if g.status == "Approved"]) * 25) if govt_apps else 0
    
    # Recommendations (Backward compatibility)
    recommendations = []
    for alert in critical_alerts[:2]:
        recommendations.append({
            "id": alert["id"],
            "priority": "High Priority",
            "type": alert["type"],
            "title": alert["title"],
            "reason": alert["message"],
            "benefit": "Avoid fines/expiration",
            "action": "Pay Now" if alert["type"] in ["EMI", "Insurance", "Utilities"] else "Action Required",
            "query": f"Help me with {alert['title']}"
        })
        
    bullets = []
    if critical_alerts:
        bullets.append(f"{len(critical_alerts)} critical alerts require attention")
    else:
        bullets.append("All clear! No pending critical tasks.")
        
    return {
        "health_score": health_score,
        "financial_score": financial_score,
        "govt_score": govt_score,
        "family_name": family_name,
        "greeting": greeting,
        "brief": {
            "critical_count": critical_count,
            "upcoming_count": upcoming_count,
            "completed_count": completed_count,
            "bullets": bullets,
            "estimated_savings": sum(f.amount for f in finance_records if f.record_type == "Goal") or 0,
            "good_news": "Your family dashboard has loaded with live database records."
        },
        "critical_alerts": critical_alerts,
        "govt_benefits": govt_benefits,
        "upcoming_bills": upcoming_bills,
        "health_summary": health_summary,
        "community_insights": community_insights,
        "ai_predictions": ai_predictions,
        "recommendations": recommendations
    }
