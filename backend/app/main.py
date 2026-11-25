import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import check_db_connection, engine
from app.models import Base
from app.routes.auth import router as auth_router
from app.routes.villages import router as villages_router
from app.routes.households import router as households_router
from app.routes.surveys import router as surveys_router
from app.routes.infrastructure import router as infrastructure_router
from app.routes.complaints import router as complaints_router
from app.routes.ai import router as ai_router
from app.routes.dashboard import router as dashboard_router
from app.routes.reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload subdirectories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "complaints"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "reports"), exist_ok=True)

    # Startup: Check database connectivity and ensure tables exist in dev
    db_ok = await check_db_connection()
    if db_ok:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Database connection established successfully.")
        if settings.ENV == "development":
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Database tables verified and ready.")
    else:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Warning: Could not connect to database at {settings.async_database_url}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="REST API service powering village demographics, PostGIS spatial mapping, offline survey synchronization, grievance triaging, and AI intelligence pipelines.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS Middleware using settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists before mounting static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(villages_router, prefix=settings.API_V1_STR)
app.include_router(households_router, prefix=settings.API_V1_STR)
app.include_router(surveys_router, prefix=settings.API_V1_STR)
app.include_router(infrastructure_router, prefix=settings.API_V1_STR)
app.include_router(complaints_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root():
    """Root healthcheck endpoint."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "env": settings.ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed healthcheck for monitoring and Cloud Run."""
    db_status = "connected" if await check_db_connection() else "unreachable"
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
