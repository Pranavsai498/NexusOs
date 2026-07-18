from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from app.core import security
from app.db.models import User, Family, FamilyMember, FinanceRecord, AppDocument, GovernmentApplication, TimelineEvent, Notification
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone_number: str | None = None

class PinVerifyRequest(BaseModel):
    pin: str

class PinSetRequest(BaseModel):
    pin: str

async def seed_family_data(user: User):
    # 1. Family Name
    last_name = user.full_name.split(" ")[-1]
    family_name = f"{last_name} Family" if last_name else f"{user.full_name} Family"
    
    family = Family(name=family_name, owner_id=str(user.id))
    await family.insert()
    
    # Update user's family_id
    user.family_id = str(family.id)
    await user.save()
    
    # 2. Family Members
    # Ramesh is the owner
    owner_member = FamilyMember(name=user.full_name.split(" ")[0], relation="Owner", age=42, user_id=str(user.id))
    await owner_member.insert()
    
    father_member = FamilyMember(name="Venkat", relation="Parent", age=68, user_id=str(user.id))
    await father_member.insert()
    
    daughter_member = FamilyMember(name="Sarah", relation="Child", age=19, user_id=str(user.id))
    await daughter_member.insert()
    
    # Link family members to family
    family.member_ids = [str(owner_member.id), str(father_member.id), str(daughter_member.id)]
    await family.save()
    
    # 3. Finance Records
    # Car EMI - due in 3 days
    emi = FinanceRecord(
        user_id=str(user.id),
        record_type="EMI",
        title="Monthly Car EMI (Tata Nexon)",
        amount=15000.0,
        category="Housing",
        frequency="Monthly",
        details={"due_date": (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d"), "status": "Pending"}
    )
    await emi.insert()
    
    # Father's insurance premium - due tomorrow
    ins_premium = FinanceRecord(
        user_id=str(user.id),
        record_type="Insurance",
        title="Father's Health Insurance Premium",
        amount=8500.0,
        category="Insurance",
        frequency="Monthly",
        details={"due_date": (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"), "status": "Pending"}
    )
    await ins_premium.insert()
    
    # Electricity Bill - due tomorrow
    elec_bill = FinanceRecord(
        user_id=str(user.id),
        record_type="Utilities",
        title="Electricity Bill",
        amount=1450.0,
        category="Utilities",
        frequency="Monthly",
        details={"due_date": (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"), "status": "Pending"}
    )
    await elec_bill.insert()

    # Crop Loan - due in 12 days
    crop_loan = FinanceRecord(
        user_id=str(user.id),
        record_type="Loan",
        title="Crop Loan Repayment",
        amount=35000.0,
        category="Agriculture",
        frequency="One-time",
        details={"due_date": (datetime.utcnow() + timedelta(days=12)).strftime("%Y-%m-%d"), "status": "Pending"}
    )
    await crop_loan.insert()
    
    # 4. App Documents (Warranties)
    # Refrigerator Warranty - expires in 18 days
    ref_warranty = AppDocument(
        filename="LG_Refrigerator_Warranty.pdf",
        content="LG Smart Inverter Refrigerator Double Door 450L. Model: LG-REF450. Warranty duration: 1 year. Purchase: 2025-07-24. Expires: 2026-08-05.",
        category="Warranty",
        user_id=str(user.id),
        expiry_date=datetime.utcnow() + timedelta(days=18),
        tags=["LG", "Refrigerator"],
        summary="Double door 450L Refrigerator warranty card"
    )
    await ref_warranty.insert()
    
    # Laptop Warranty - expires in 15 days
    lap_warranty = AppDocument(
        filename="ASUS_Laptop_Invoice.pdf",
        content="ASUS ROG Strix G15. Serial Number: ROG123456789. Purchase Date: 2025-08-02. Expiry Date: 2026-08-02.",
        category="Warranty",
        user_id=str(user.id),
        expiry_date=datetime.utcnow() + timedelta(days=15),
        tags=["ASUS", "Laptop"],
        summary="ASUS ROG Strix Gaming Laptop Warranty & Invoice"
    )
    await lap_warranty.insert()
    
    # 5. Government Applications
    scholarship_app = GovernmentApplication(
        user_id=str(user.id),
        application_name="Telangana Engineering Scholarship",
        status="Eligible",
        details={
            "category": "Education",
            "deadline": (datetime.utcnow() + timedelta(days=6)).strftime("%Y-%m-%d"),
            "amount": 50000.0,
            "eligibility": "B.Tech admission, local domicile, family income certificate"
        }
    )
    await scholarship_app.insert()
    
    rythu_app = GovernmentApplication(
        user_id=str(user.id),
        application_name="Rythu Bandhu Subsidy",
        status="Approved",
        details={
            "category": "Agriculture",
            "amount": 10000.0,
            "payout_date": (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
        }
    )
    await rythu_app.insert()
    
    # 6. Timeline Events
    await TimelineEvent(
        user_id=str(user.id),
        title="College Admission",
        description="Sarah got admitted into B.Tech Engineering Program.",
        category="Education",
        event_date=datetime.utcnow() - timedelta(days=2)
    ).insert()
    
    await TimelineEvent(
        user_id=str(user.id),
        title="Car Warranty Registered",
        description="Tata Nexon warranty registered with tracker.",
        category="System",
        event_date=datetime.utcnow() - timedelta(days=180)
    ).insert()
    
    # 7. Notifications
    await Notification(
        user_id=str(user.id),
        title="🔴 High Priority",
        message="Father's health insurance premium of ₹8,500 expires tomorrow.",
        notification_type="Warning"
    ).insert()
    
    await Notification(
        user_id=str(user.id),
        title="🔴 High Priority",
        message="Car EMI due in 3 days (₹15,000).",
        notification_type="Warning"
    ).insert()
    
    await Notification(
        user_id=str(user.id),
        title="🟠 Upcoming",
        message="Sarah is eligible for Telangana engineering scholarship. Apply within 6 Days.",
        notification_type="Info"
    ).insert()
    
    await Notification(
        user_id=str(user.id),
        title="🟠 Upcoming",
        message="Refrigerator warranty expires in 18 days.",
        notification_type="Info"
    ).insert()

    await Notification(
        user_id=str(user.id),
        title="🟠 Upcoming",
        message="Missing Income Certificate. Upload to vault to complete scholarship application.",
        notification_type="Warning"
    ).insert()

@router.post("/login")
async def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await User.find_one({"email": form_data.username})
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = security.create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
async def register_user(user_in: UserCreate) -> Any:
    """
    Register a new user and seed standard family records.
    """
    user = await User.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user_db = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        preferences={"pin": "1234"}
    )
    await user_db.insert()
    
    # Seed data disabled to start with a clean empty database state for new accounts
    # try:
    #     await seed_family_data(user_db)
    # except Exception as e:
    #     print(f"Error seeding user family data: {e}")
        
    return {"message": "User registered successfully", "user_id": str(user_db.id)}

from app.api.deps import get_current_user

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user profile.
    """
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
    }

@router.post("/logout")
async def logout() -> Any:
    """
    Logout current user (client-side token deletion).
    """
    return {"message": "Successfully logged out"}

@router.post("/verify-pin")
async def verify_pin(request: PinVerifyRequest, current_user: User = Depends(get_current_user)) -> Any:
    """Verify quick login/backup PIN."""
    saved_pin = current_user.preferences.get("pin", "1234")
    if request.pin == saved_pin:
        return {"status": "success", "message": "PIN verified successfully"}
    raise HTTPException(status_code=400, detail="Incorrect PIN")

@router.post("/set-pin")
async def set_pin(request: PinSetRequest, current_user: User = Depends(get_current_user)) -> Any:
    """Set/update quick login PIN (must be 4 digits)."""
    if len(request.pin) != 4 or not request.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be a 4-digit number")
    if not current_user.preferences:
        current_user.preferences = {}
    current_user.preferences["pin"] = request.pin
    await current_user.save()
    return {"status": "success", "message": "PIN updated successfully"}

