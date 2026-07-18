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

class DatabaseManager:
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db = None

    async def connect_with_retry(self, max_retries: int = 5, delay: float = 2.0):
        """Establish MongoDB connection with connection pooling and retries."""
        for attempt in range(1, max_retries + 1):
            try:
                # Motor client with built-in connection pooling
                self.client = AsyncIOMotorClient(
                    settings.MONGODB_URI,
                    maxPoolSize=100,
                    minPoolSize=10,
                    serverSelectionTimeoutMS=5000
                )
                
                # Check connection by pinging
                await self.client.admin.command('ping')
                
                try:
                    self.db = self.client.get_default_database()
                except Exception:
                    self.db = self.client.get_database("nexusos")
                
                # Initialize beanie with all Document models
                await init_beanie(
                    database=self.db,
                    document_models=[
                        User, Family, FamilyMember, AppDocument, HealthRecord,
                        FinanceRecord, GovernmentApplication, EducationRecord,
                        TimelineEvent, Notification, ChatHistory, KnowledgeGraph,
                        UserSettings, AuditLog
                    ]
                )
                print(f"Successfully connected to MongoDB ({self.db.name}) and initialized Beanie schemas!")
                return
            except Exception as e:
                print(f"MongoDB connection attempt {attempt}/{max_retries} failed: {e}")
                if attempt == max_retries:
                    raise e
                await asyncio.sleep(delay * attempt)

    async def close_connection(self):
        """Close connection pool cleanly."""
        if self.client:
            self.client.close()
            print("MongoDB connection pool closed.")

    async def check_health(self) -> bool:
        """Verify database health by pinging."""
        if not self.client:
            return False
        try:
            await self.client.admin.command('ping')
            return True
        except Exception:
            return False

db_manager = DatabaseManager()
