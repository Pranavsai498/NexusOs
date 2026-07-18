from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from app.db.models import FamilyMember, FinanceRecord, AppDocument, User
from app.api.deps import get_current_user
from app.core.config import settings
from datetime import datetime, timedelta
import google.generativeai as genai
import asyncio

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/")
async def chat(request: ChatRequest, current_user: User = Depends(get_current_user)) -> Any:
    """Chat with NexusOS AI using dynamic local tool calling to perform database writes."""
    
    # Define local tools inside request context to capture user closure scope (current_user.id)
    def add_family_member(name: str, relation: str, age: int) -> dict:
        """
        Add a new family member profile to the household roster database.
        
        Args:
            name: The full name of the family member (e.g. 'Pranav').
            relation: The relation to the owner (e.g. 'Child', 'Spouse', 'Parent', 'Grandparent').
            age: The age of the family member.
        """
        member = FamilyMember(
            name=name,
            relation=relation,
            age=age,
            user_id=str(current_user.id)
        )
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(member.insert())
        else:
            loop.run_until_complete(member.insert())
        return {
            "status": "success", 
            "message": f"Successfully registered family member {name} ({relation}, Age {age}) to the MongoDB database."
        }

    def add_bill_payment(title: str, amount: float, category: str, record_type: str, due_date: str) -> dict:
        """
        Add an outstanding bill, EMI, crop loan, or premium payment reminder.
        
        Args:
            title: Title description of the bill (e.g. 'Crop Loan Interest', 'Car EMI').
            amount: The payment amount (float).
            category: The category (e.g. 'Agriculture', 'Transportation', 'Utility', 'Insurance').
            record_type: Must be one of 'EMI', 'Loan', 'Utilities', 'Insurance'.
            due_date: The payment due date string in YYYY-MM-DD format (e.g. '2026-07-25').
        """
        record = FinanceRecord(
            user_id=str(current_user.id),
            record_type=record_type,
            title=title,
            amount=amount,
            category=category,
            frequency="Monthly",
            details={
                "due_date": due_date,
                "status": "Pending"
            }
        )
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(record.insert())
        else:
            loop.run_until_complete(record.insert())
        return {
            "status": "success",
            "message": f"Successfully registered outstanding bill {title} (Amount: {amount}, Due: {due_date}) to the database."
        }

    def add_product_warranty(product_name: str, brand: str, purchase_date: str, warranty_period_months: int, notes: str = "") -> dict:
        """
        Register a product warranty and set up an expiry tracker.
        
        Args:
            product_name: The name of the product (e.g. 'iPhone 15').
            brand: The product manufacturer brand (e.g. 'Apple').
            purchase_date: The purchase date in YYYY-MM-DD format (e.g. '2025-05-10').
            warranty_period_months: The warranty duration in months (integer, e.g. 12).
            notes: Optional additional notes about the product.
        """
        try:
            p_date = datetime.strptime(purchase_date, "%Y-%m-%d")
            # Calculate approximate expiry date
            exp_date = p_date + timedelta(days=int(30.44 * warranty_period_months))
        except Exception:
            exp_date = datetime.utcnow() + timedelta(days=30 * warranty_period_months)
            
        new_doc = AppDocument(
            filename=product_name,
            content=f"Product: {product_name}\nBrand: {brand}\nPurchase Date: {purchase_date}\nWarranty Months: {warranty_period_months}\nNotes: {notes}",
            category="Warranty",
            user_id=str(current_user.id),
            expiry_date=exp_date,
            tags=[brand],
            summary=notes
        )
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(new_doc.insert())
        else:
            loop.run_until_complete(new_doc.insert())
        return {
            "status": "success",
            "message": f"Successfully registered product warranty for {product_name} (Brand: {brand}, Expires: {exp_date.strftime('%Y-%m-%d')}) to the database."
        }

    # Retrieve context to pass to Gemini
    members = await FamilyMember.find(FamilyMember.user_id == str(current_user.id)).to_list()
    family_context = []
    for m in members:
        family_context.append(f"- Name: {m.name}, Role: {m.relation}, Age: {m.age}")
    
    context_str = "\n".join(family_context) if family_context else "No family members added yet."
    
    # Configure Gemini with tools and set instruction
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    model_with_tools = genai.GenerativeModel(
        model_name='models/gemini-3.5-flash',
        tools=[add_family_member, add_bill_payment, add_product_warranty]
    )
    
    chat_session = model_with_tools.start_chat(enable_automatic_function_calling=True)
    
    system_instruction = (
        "You are NexusOS, an AI Family Intelligence Platform. The user can perform actions "
        "like registering family members, adding bills/loans, and tracking warranties by "
        "asking you. You have access to tools that actually write this information to the database. "
        "Whenever a user asks you to add, register, save, or track a family member, bill/loan, or "
        "warranty product, ALWAYS call the corresponding tool first. Confirm tool execution and "
        "summarize the details cleanly. "
        f"\n\nCurrent Family Roster:\n{context_str}"
    )
    
    try:
        response = await chat_session.send_message_async(
            f"{system_instruction}\n\nUser Query: {request.query}"
        )
        reply = response.text
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        reply = f"Sorry, I encountered an error while executing that request: {str(e)}"
        
    return {
        "reply": reply
    }
