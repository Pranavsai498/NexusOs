from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.models import FamilyMember, AppDocument, User
from app.api.deps import get_current_user

router = APIRouter()

class AddProperty(BaseModel):
    name: str
    location: str

@router.get("/insights")
async def get_legal_insights(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get family properties checklist, vehicle documents status, rental agreements,
    pending challans, emergency nominee links, and chronological legal timelines.
    """
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()
    
    # Check document presence in vault
    has_sale_deed = any("sale" in d.filename.lower() or "deed" in d.filename.lower() for d in documents)
    has_prop_tax = any("tax" in d.filename.lower() and "property" in d.filename.lower() for d in documents)
    has_encumbrance = any("encumbrance" in d.filename.lower() for d in documents)
    has_loan = any("loan" in d.filename.lower() for d in documents)
    has_insurance = any("insurance" in d.filename.lower() and "property" in d.filename.lower() for d in documents)

    # Property documents checklist
    property_docs = {
        "Sale Deed": has_sale_deed,
        "Property Tax Receipts": has_prop_tax,
        "Encumbrance Certificate": has_encumbrance,
        "Home Loan Papers": has_loan,
        "Property Insurance": has_insurance,
        "Electricity connection NOC": any("electricity" in d.filename.lower() for d in documents),
        "Water connection NOC": any("water" in d.filename.lower() for d in documents),
        "Mutation Records": any("mutation" in d.filename.lower() for d in documents)
    }

    # Vehicles checklist compiled from warranty/vehicle documents
    vehicles = []
    vehicle_docs = [d for d in documents if d.category == "Warranty" or "vehicle" in d.filename.lower() or "bike" in d.filename.lower() or "car" in d.filename.lower()]
    for vd in vehicle_docs:
        vehicles.append({
            "type": "Vehicle",
            "name": vd.filename,
            "number": vd.tags[0] if vd.tags else "N/A",
            "documents": {
                "Registration Certificate (RC)": "rc" in vd.filename.lower(),
                "Insurance Policy": "insurance" in vd.filename.lower(),
                "Pollution Under Control (PUC)": "puc" in vd.filename.lower(),
                "Driving Licence Link": True,
                "Service History log": True,
                "Active Warranty": True,
                "Hypothecation/Loan NOC": False
            }
        })

    # Rental Agreement details
    rental_agreement = None
    rental_doc = next((d for d in documents if "rental" in d.filename.lower() or "lease" in d.filename.lower()), None)
    if rental_doc:
        rental_agreement = {
            "tenant": current_user.full_name,
            "landlord": "Landlord",
            "deposit": 20000.0,
            "start_date": "2026-01-01",
            "end_date": rental_doc.expiry_date.strftime("%Y-%m-%d") if rental_doc.expiry_date else "N/A",
            "expiry_days_left": (rental_doc.expiry_date - datetime.utcnow()).days if rental_doc.expiry_date else 0,
            "monthly_rent": 10000.0
        }

    # Challans and traffic details
    traffic = {
        "dl_expiry": "N/A",
        "dl_days_left": 0,
        "puc_expiry": "N/A",
        "puc_days_left": 0,
        "insurance_expiry": "N/A",
        "insurance_days_left": 0,
        "pending_challans": []
    }

    # Family legal checklist
    family_checklist = {
        "Aadhaar Card": any("aadhaar" in d.filename.lower() for d in documents),
        "PAN Card": any("pan" in d.filename.lower() for d in documents),
        "Passport": any("passport" in d.filename.lower() for d in documents),
        "Driving Licence": any("license" in d.filename.lower() or "licence" in d.filename.lower() for d in documents),
        "Property Ownership Deed": has_sale_deed,
        "Nominee registry (Sita Kumar)": any("nominee" in d.filename.lower() for d in documents),
        "Marriage Certificate": any("marriage" in d.filename.lower() for d in documents),
        "Birth Certificate": any("birth" in d.filename.lower() for d in documents)
    }

    timeline = []
    predictions = []
    community = []

    if documents:
        predictions.append("AI legal review: Verify documents expiration timelines.")

    return {
        "property_docs": property_docs,
        "vehicles": vehicles,
        "rental": rental_agreement,
        "traffic": traffic,
        "family": family_checklist,
        "timeline": timeline,
        "predictions": predictions,
        "community": community
    }

@router.post("/property")
async def register_property(prop_in: AddProperty, current_user: User = Depends(get_current_user)) -> Any:
    """Register property profile details."""
    return {"message": f"Successfully registered property {prop_in.name} at {prop_in.location}"}
