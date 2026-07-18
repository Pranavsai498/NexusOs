from typing import List, Optional, Dict, Any
from beanie import Document, Indexed
from pydantic import BaseModel, Field
from datetime import datetime

# 1. User
class User(Document):
    email: Indexed(str, unique=True)
    full_name: str
    phone_number: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    avatar: Optional[str] = None
    family_id: Optional[str] = None
    role: Optional[str] = "Owner"
    preferences: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "users"

# 2. Family
class Family(Document):
    name: str
    owner_id: Indexed(str)
    member_ids: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "families"

# 3. FamilyMember
class FamilyMember(Document):
    name: str
    relation: str
    age: int
    user_id: Indexed(str)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "family_members"

# 4. AppDocument
class DocumentChunk(BaseModel):
    text_content: str
    embedding: List[float] = Field(default_factory=list)

class AppDocument(Document):
    filename: Indexed(str)
    content: str
    category: Optional[str] = "General"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    chunks: List[DocumentChunk] = []
    user_id: Indexed(str)
    member_id: Optional[str] = None
    card_type: Optional[str] = None
    verification_status: str = "Pending"  # Pending, Verified, Rejected
    expiry_date: Optional[datetime] = None
    tags: List[str] = []
    summary: Optional[str] = None

    class Settings:
        name = "documents"

# 5. HealthRecord
class HealthRecord(Document):
    user_id: Indexed(str)
    member_id: Optional[Indexed(str)] = None
    record_type: str  # Medical Report, Vaccine, Allergy, Insurance, Medication
    title: str
    details: Dict[str, Any] = {}
    record_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None

    class Settings:
        name = "health_records"

# 6. FinanceRecord
class FinanceRecord(Document):
    user_id: Indexed(str)
    record_type: str  # Income, Expense, EMI, Budget, Loan, Goal, Insurance
    title: str
    amount: float
    category: str  # Housing, Food, Utilities, Transport, Leisure, etc.
    frequency: str = "One-time"  # One-time, Monthly, Yearly
    record_date: datetime = Field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = {}

    class Settings:
        name = "finance_records"

# 7. GovernmentApplication
class GovernmentApplication(Document):
    user_id: Indexed(str)
    application_name: str
    status: str = "Submitted"  # Eligible, Submitted, Approved, Rejected, Expired
    eligible_schemes: List[str] = []
    submission_date: datetime = Field(default_factory=datetime.utcnow)
    renewal_date: Optional[datetime] = None
    details: Dict[str, Any] = {}

    class Settings:
        name = "government_applications"

# 8. EducationRecord
class EducationRecord(Document):
    user_id: Indexed(str)
    member_id: Optional[Indexed(str)] = None
    institution: str
    degree: str
    grade: Optional[str] = None
    scholarship_status: str = "None"  # None, Eligible, Applied, Approved
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    class Settings:
        name = "education_records"

# 9. TimelineEvent
class TimelineEvent(Document):
    user_id: Indexed(str)
    title: str
    description: str
    category: str  # Health, Finance, Legal, Government, Education, System
    event_date: datetime = Field(default_factory=datetime.utcnow)
    reference_id: Optional[str] = None  # Reference to other document collections

    class Settings:
        name = "timeline_events"

# 10. Notification
class Notification(Document):
    user_id: Indexed(str)
    title: str
    message: str
    is_read: bool = False
    notification_type: str = "Info"  # Info, Warning, Alert, Success
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"

# 11. ChatHistory
class ChatMessage(BaseModel):
    role: str  # user, assistant
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatHistory(Document):
    user_id: Indexed(str)
    conversation_id: Indexed(str)
    messages: List[ChatMessage] = []
    agent_used: Optional[str] = None
    referenced_documents: List[str] = []  # List of AppDocument IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "chat_histories"

# 12. KnowledgeGraph
class KnowledgeGraphNode(BaseModel):
    node_id: str
    node_type: str  # User, FamilyMember, Document, Health, Finance, etc.
    label: str

class KnowledgeGraph(Document):
    user_id: Indexed(str)
    source: KnowledgeGraphNode
    target: KnowledgeGraphNode
    relationship: str  # OWNS, MEMBER_OF, RELATES_TO, ELIGIBLE_FOR, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "knowledge_graphs"

# 13. Settings
class Settings(Document):
    user_id: Indexed(str, unique=True)
    theme: str = "light"
    email_alerts: bool = True
    sms_notifications: bool = False
    daily_briefs: bool = True
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "settings"

# 14. AuditLog
class AuditLog(Document):
    user_id: Optional[Indexed(str)] = None
    action: str
    module: str  # Auth, Documents, Finance, Health, Family, Chat
    ip_address: Optional[str] = None
    status: str = "Success"  # Success, Failure
    details: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"
