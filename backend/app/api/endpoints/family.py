from fastapi import APIRouter, Depends
from typing import Any, List
from pydantic import BaseModel
from app.db.models import FamilyMember, User
from app.api.deps import get_current_user

router = APIRouter()

class FamilyMemberCreate(BaseModel):
    name: str
    relation: str
    age: int

@router.post("/")
async def create_member(member_in: FamilyMemberCreate, current_user: User = Depends(get_current_user)) -> Any:
    """Create a new family member."""
    member = FamilyMember(
        name=member_in.name,
        relation=member_in.relation,
        age=member_in.age,
        user_id=str(current_user.id)
    )
    await member.insert()
    return {"message": "Family member created", "id": str(member.id)}

@router.get("/")
async def get_members(current_user: User = Depends(get_current_user)) -> Any:
    """Get all family members for current user."""
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    return members
