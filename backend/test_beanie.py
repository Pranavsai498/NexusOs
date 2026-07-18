import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.db.models import (
    User, Family, FamilyMember, AppDocument, HealthRecord,
    FinanceRecord, GovernmentApplication, EducationRecord,
    TimelineEvent, Notification, ChatHistory, KnowledgeGraph,
    Settings as UserSettings, AuditLog
)

async def test():
    print("1. Creating client...")
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        maxPoolSize=100,
        minPoolSize=10,
        serverSelectionTimeoutMS=5000
    )
    
    print("2. Pinging admin database...")
    await client.admin.command('ping')
    print("Ping successful!")
    
    db = client.get_database("nexusos")
    print(f"3. Database selected: {db.name}")
    
    print("4. Initializing Beanie...")
    await init_beanie(
        database=db,
        document_models=[
            User, Family, FamilyMember, AppDocument, HealthRecord,
            FinanceRecord, GovernmentApplication, EducationRecord,
            TimelineEvent, Notification, ChatHistory, KnowledgeGraph,
            UserSettings, AuditLog
        ]
    )
    print("5. Beanie initialization complete!")

if __name__ == "__main__":
    asyncio.run(test())
