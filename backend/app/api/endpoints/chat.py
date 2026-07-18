from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from app.db.models import FamilyMember, FinanceRecord, AppDocument, User, GovernmentApplication, HealthRecord, EducationRecord
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
    finance_records = await FinanceRecord.find(FinanceRecord.user_id == str(current_user.id)).to_list()
    documents = await AppDocument.find(AppDocument.user_id == str(current_user.id)).to_list()
    govt_apps = await GovernmentApplication.find(GovernmentApplication.user_id == str(current_user.id)).to_list()
    health_records = await HealthRecord.find(HealthRecord.user_id == str(current_user.id)).to_list()
    
    family_context = []
    family_context.append(f"Owner Name: {current_user.full_name}, Email: {current_user.email}")
    for m in members:
        family_context.append(f"- Family Member: {m.name}, Relation: {m.relation}, Age: {m.age}")
    for r in finance_records:
        family_context.append(f"- Finance Record: {r.title}, Type: {r.record_type}, Amount: {r.amount}, Category: {r.category}, Status: {r.details.get('status', 'Pending')}, Due Date: {r.details.get('due_date', 'N/A')}")
    for d in documents:
        expiry_str = d.expiry_date.strftime('%Y-%m-%d') if d.expiry_date else 'N/A'
        family_context.append(f"- Vault Document: {d.filename}, Category: {d.category}, Expiry: {expiry_str}, Verification Status: {d.verification_status}, Summary: {d.summary or 'N/A'}")
    for g in govt_apps:
        family_context.append(f"- Government Application: {g.application_name}, Status: {g.status}, Details: {g.details}")
    for h in health_records:
        family_context.append(f"- Health Record: {h.title}, Type: {h.record_type}, Details: {h.details}, Expiry: {h.expiry_date.strftime('%Y-%m-%d') if h.expiry_date else 'N/A'}")
        
    context_str = "\n".join(family_context) if family_context else "No family context registered."
    
    # Configure Gemini with tools and set instruction
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    model_with_tools = genai.GenerativeModel(
        model_name='models/gemini-3.5-flash',
        tools=[add_family_member, add_bill_payment, add_product_warranty]
    )
    
    chat_session = model_with_tools.start_chat(enable_automatic_function_calling=True)
    
    system_instruction = (
        "You are Life Brain, the AI CEO of the family and master coordinator of NexusOS.\n"
        "You understand every family member and coordinate all other AI agents: Government, Finance, Health, Education, Legal, Planning, and Vault.\n"
        "You have access to tools that actually write this information to the database. Call them whenever appropriate.\n"
        "\n"
        "Memory Context (Everything about the family):\n"
        f"{context_str}\n"
        "\n"
        "Critical Directives:\n"
        "1. AI Memory: You must remember details. If the user asks 'Insurance status?' or similar, identify which insurance they mean and answer directly using the memory context, without asking for clarification.\n"
        "2. Voice and Language Support: Automatically detect language. If they query in Telugu, Tamil, Hindi, Malayalam, Kannada, Marathi, Bengali, or English, translate their intent, analyze it with the family memory, and reply fluently in the same language.\n"
        "Keep responses extremely clear, helpful, and concise."
    )
    
    try:
        response = await chat_session.send_message_async(
            f"{system_instruction}\n\nUser Query: {request.query}"
        )
        reply = response.text
        if "quota exceeded" in reply.lower() or "rate limit" in reply.lower():
            raise Exception("Gemini Rate Limit Exceeded")
    except Exception as e:
        print(f"Error or rate limit in chat endpoint: {e}")
        # Build dynamic fallback reply using memory context
        reply = f"Hello! I am Life Brain. I processed your request: '{request.query}'. Currently running in local fallback mode.\n\n"
        if not members:
            reply += "No family members are currently registered in the database. Please add your family members to get started!"
        else:
            reply += "Here is your current household database status:\n"
            reply += f"- Family Members: {', '.join([m.name for m in members])}\n"
            pending_bills = [r for r in finance_records if r.details.get("status") != "Paid"]
            if pending_bills:
                reply += f"- Pending bills/EMIs: {', '.join([f'{r.title} (₹{r.amount})' for r in pending_bills])}\n"
            else:
                reply += "- No pending bills or EMIs found.\n"
            
            warranties = [d for d in documents if d.category == "Warranty"]
            if warranties:
                reply += f"- Active product warranties: {', '.join([w.filename for w in warranties])}\n"
                
    return {
        "reply": reply
    }
