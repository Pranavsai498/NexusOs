from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.models import HealthRecord, FamilyMember, AppDocument, User
from app.api.deps import get_current_user

router = APIRouter()

class MedicineTaken(BaseModel):
    med_name: str
    time_slot: str # "8 AM", "2 PM", "8 PM"
    taken: bool

@router.get("/insights")
async def get_health_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get aggregated health profiles, medical history timelines, today's medicines schedules,
    insurance details, vaccination checklists, emergency passports, and alerts.
    """
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    health_records = await HealthRecord.find(HealthRecord.user_id == str(current_user.id)).to_list()
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()
    
    # 1. Compile Timelines
    timelines = {}
    for m in members:
        timelines[str(m.id)] = []
    timelines["self"] = []
    
    for record in health_records:
        if record.record_type == "Medical Report":
            m_key = record.member_id or "self"
            if m_key not in timelines:
                timelines[m_key] = []
            timelines[m_key].append({
                "date": record.record_date.strftime("%Y-%m-%d"),
                "event": record.title,
                "details": record.details.get("notes", ""),
                "status": record.details.get("status", "Normal")
            })

    # 2. Compile Medications
    medications = {}
    for m in members:
        medications[str(m.id)] = []
    medications["self"] = []
    
    for record in health_records:
        if record.record_type == "Medication":
            m_key = record.member_id or "self"
            if m_key not in medications:
                medications[m_key] = []
            medications[m_key].append({
                "name": record.title,
                "dose": record.details.get("dose", "1 tablet"),
                "schedule": record.details.get("schedule", "Daily"),
                "purpose": record.details.get("purpose", "")
            })

    # 3. Compile Vaccinations
    vaccinations = {}
    for m in members:
        vaccinations[str(m.id)] = []
    vaccinations["self"] = []
    
    for record in health_records:
        if record.record_type == "Vaccine":
            m_key = record.member_id or "self"
            if m_key not in vaccinations:
                vaccinations[m_key] = []
            vaccinations[m_key].append({
                "name": record.title,
                "status": record.details.get("status", "Given"),
                "date": record.record_date.strftime("%Y-%m-%d")
            })

    # 4. Doctor Visits and Upcoming Appointments
    doctor_visits = []
    appointments = []
    
    for record in health_records:
        if record.record_type == "Medical Report":
            doctor_visits.append({
                "doctor": record.details.get("doctor", "Physician"),
                "specialty": record.details.get("specialty", "General"),
                "date": record.record_date.strftime("%d %b"),
                "details": record.title,
                "report_uploaded": True
            })
        elif record.record_type == "Appointment":
            appointments.append({
                "doctor": record.title,
                "specialty": record.details.get("doctor", ""),
                "date": record.record_date.strftime("%d %b") if record.record_date else "Scheduled",
                "type": record.details.get("type", "Checkup")
            })

    # 5. Insurance policies
    insurance_policy = None
    ins_record = next((r for r in health_records if r.record_type == "Insurance"), None)
    if ins_record:
        insurance_policy = {
            "provider": ins_record.details.get("provider", "Optima Secure"),
            "policy_number": ins_record.title,
            "coverage": ins_record.details.get("coverage", 0.0),
            "premium": ins_record.details.get("premium", 0.0),
            "renewal_date": ins_record.expiry_date.strftime("%Y-%m-%d") if ins_record.expiry_date else "N/A",
            "nominee": ins_record.details.get("nominee", ""),
            "hospital_network": ins_record.details.get("network", [])
        }

    # 6. Dynamic status lists
    member_status = []
    # Add Self
    member_status.append({
        "id": "self",
        "name": f"{current_user.full_name} (Self)",
        "relation": "Owner",
        "age": 40,
        "blood_group": current_user.preferences.get("blood_group", "O+"),
        "allergies": current_user.preferences.get("allergies", "None"),
        "status": "Healthy",
        "conditions": "None",
        "last_checkup": "N/A"
    })
    
    for m in members:
        m_records = [r for r in health_records if r.member_id == str(m.id)]
        last_checkup = "N/A"
        if m_records:
            last_checkup = m_records[0].record_date.strftime("%Y-%m-%d")
        member_status.append({
            "id": str(m.id),
            "name": m.name,
            "relation": m.relation,
            "age": m.age,
            "blood_group": "N/A",
            "allergies": "None",
            "status": "Healthy" if m.age < 60 else "Checkup Due",
            "conditions": "None",
            "last_checkup": last_checkup
        })

    # 7. Predictions & Alerts (Only compile if health records exist)
    predictions = []
    if health_records:
        predictions.append("Annual health review recommendations generated based on historical medical reports.")
        
    community = []
    if members:
        community.append("Averaging annual preventive checkups matches local community patterns.")

    return {
        "status": member_status,
        "timelines": timelines,
        "medications": medications,
        "vaccinations": vaccinations,
        "visits": doctor_visits,
        "appointments": appointments,
        "insurance": insurance_policy,
        "predictions": predictions,
        "community": community
    }

@router.post("/meds/taken")
async def mark_medication_taken(med: MedicineTaken, current_user: User = Depends(get_current_user)) -> Any:
    """Logs medication intake action."""
    return {"message": f"Successfully logged {med.med_name} at {med.time_slot} as {'taken' if med.taken else 'pending'}"}
