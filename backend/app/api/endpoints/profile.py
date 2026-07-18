from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict
from pydantic import BaseModel, Field
from app.db.models import User
from app.api.deps import get_current_user
from app.core import security

router = APIRouter()

class ProfileUpdate(BaseModel):
    full_name: str
    phone_number: str | None = None
    avatar: str | None = None
    role: str | None = "Owner"
    preferences: Dict[str, Any] = Field(default_factory=dict)

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.get("/")
async def get_profile(current_user: User = Depends(get_current_user)) -> Any:
    """Get active user profile details from MongoDB."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
        "avatar": current_user.avatar,
        "family_id": current_user.family_id,
        "role": current_user.role,
        "preferences": current_user.preferences,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "is_active": current_user.is_active,
    }

@router.put("/")
async def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update active user profile data in MongoDB."""
    current_user.full_name = profile_in.full_name
    current_user.phone_number = profile_in.phone_number
    current_user.avatar = profile_in.avatar
    current_user.role = profile_in.role
    current_user.preferences = profile_in.preferences
    
    await current_user.save()
    return {"message": "Profile updated successfully"}

@router.put("/password")
async def update_password(
    password_in: PasswordUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update user password in MongoDB."""
    if not security.verify_password(password_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
        
    current_user.hashed_password = security.get_password_hash(password_in.new_password)
    await current_user.save()
    return {"message": "Password updated successfully"}
