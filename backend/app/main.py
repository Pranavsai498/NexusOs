from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, documents, family, chat, dashboard, warranty, finance, profile, notifications, government, health, education, legal, planning, predictive, graph, community
from app.core.config import settings
from app.core.database import db_manager

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
async def startup_event():
    await db_manager.connect_with_retry()

@app.on_event("shutdown")
async def shutdown_event():
    await db_manager.close_connection()

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
app.include_router(family.router, prefix=f"{settings.API_V1_STR}/family", tags=["family"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(warranty.router, prefix=f"{settings.API_V1_STR}/warranty", tags=["warranty"])
app.include_router(finance.router, prefix=f"{settings.API_V1_STR}/finance", tags=["finance"])
app.include_router(profile.router, prefix=f"{settings.API_V1_STR}/profile", tags=["profile"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(government.router, prefix=f"{settings.API_V1_STR}/government", tags=["government"])
app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["health"])
app.include_router(education.router, prefix=f"{settings.API_V1_STR}/education", tags=["education"])
app.include_router(legal.router, prefix=f"{settings.API_V1_STR}/legal", tags=["legal"])
app.include_router(planning.router, prefix=f"{settings.API_V1_STR}/planning", tags=["planning"])
app.include_router(predictive.router, prefix=f"{settings.API_V1_STR}/predictive", tags=["predictive"])
app.include_router(graph.router, prefix=f"{settings.API_V1_STR}/graph", tags=["graph"])
app.include_router(community.router, prefix=f"{settings.API_V1_STR}/community", tags=["community"])

@app.get("/")
def root():
    return {"message": "Welcome to NexusOS AI Backend"}
