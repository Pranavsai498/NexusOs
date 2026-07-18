from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from app.core import security
from app.db.models import User
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone_number: str | None = None

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
    Register a new user.
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
    )
    await user_db.insert()
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
