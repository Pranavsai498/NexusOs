import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.db.models import User, AppDocument, FamilyMember

async def init_db():
    try:
        # Create Motor client
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        
        # Initialize beanie with the Document models
        await init_beanie(database=client.nexusos, document_models=[User, AppDocument, FamilyMember])
        print("Successfully connected to MongoDB and initialized schemas!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error initializing MongoDB: {e}")
