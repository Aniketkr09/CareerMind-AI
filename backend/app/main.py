"""
============================================================
CareerMind AI
AI Career Intelligence Platform
============================================================

Production-ready FastAPI application for intelligent
career analysis and professional growth.

Core Intelligence:
    • JWT Authentication
    • Resume Management
    • Resume Intelligence
    • ATS Analysis
    • AI Resume Scoring
    • Technical Skill Intelligence
    • Career Recommendations
    • Learning Roadmaps
    • Dashboard Intelligence
    • System Health Monitoring

Architecture:
    FastAPI
    PostgreSQL
    SQLAlchemy 2.0
    Pydantic Settings
    JWT Authentication
    AI / ML Services

Author:
    Aniket Kumar
============================================================
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings

from app.database.base import Base
from app.database.database import engine

# ============================================================
# DATABASE MODELS
# ============================================================
#
# These imports are intentionally kept here.
# SQLAlchemy must know about the models before create_all()
# is executed.
#

from app.models.user import User  # noqa: F401
from app.models.resume import Resume  # noqa: F401


# ============================================================
# API ROUTERS
# ============================================================

from app.api.v1.auth import router as auth_router
from app.api.v1.resume import router as resume_router
from app.api.v1.resume_analysis import (
    router as resume_analysis_router,
)
from app.api.v1.dashboard import router as dashboard_router

# Career Intelligence
from app.routers.career import router as career_router

# Learning Roadmap
from app.routers.roadmap import router as roadmap_router


# ============================================================
# APPLICATION CONSTANTS
# ============================================================

API_PREFIX = "/api/v1"

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format=(
        "%(asctime)s | "
        "%(levelname)s | "
        "%(name)s | "
        "%(message)s"
    ),
)

logger = logging.getLogger("CareerMindAI")


# ============================================================
# APPLICATION LIFECYCLE
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage CareerMind AI startup and shutdown lifecycle.

    Startup:
        • Initialize database metadata in development
        • Verify PostgreSQL connectivity
        • Start intelligence engine

    Shutdown:
        • Dispose database connections
        • Gracefully stop the application
    """

    logger.info("=" * 72)
    logger.info("CAREERMIND AI | INITIALIZING INTELLIGENCE ENGINE")
    logger.info("=" * 72)

    # --------------------------------------------------------
    # DATABASE INITIALIZATION
    # --------------------------------------------------------

    try:
        if settings.DEBUG:
            logger.info(
                "Environment: DEVELOPMENT"
            )

            logger.info(
                "Initializing SQLAlchemy database metadata..."
            )

            Base.metadata.create_all(
                bind=engine
            )

            logger.info(
                "Database metadata initialized successfully."
            )

        # ----------------------------------------------------
        # DATABASE CONNECTION CHECK
        # ----------------------------------------------------

        logger.info(
            "Checking PostgreSQL connection..."
        )

        with engine.connect() as connection:
            connection.execute(
                text("SELECT 1")
            )

        logger.info(
            "PostgreSQL connection: ONLINE"
        )

        logger.info(
            "CareerMind Intelligence Engine: ONLINE"
        )

        logger.info(
            "API documentation: /docs"
        )

    except Exception:
        logger.exception(
            "CareerMind AI startup failed."
        )
        raise

    # Application starts
    yield

    # --------------------------------------------------------
    # SHUTDOWN
    # --------------------------------------------------------

    logger.info(
        "CareerMind AI shutdown initiated."
    )

    try:
        engine.dispose()

        logger.info(
            "Database connections released."
        )

    except Exception:
        logger.exception(
            "Database engine disposal failed."
        )

    logger.info(
        "CareerMind AI shutdown completed."
    )

    logger.info("=" * 72)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,

    summary=(
        "AI-powered career intelligence "
        "and professional growth platform."
    ),

    description="""
# CareerMind AI 🤖

CareerMind AI transforms professional evidence into
actionable career intelligence.

The platform connects:

**Resume → Skills → Career Direction → Skill Gaps → Roadmap → Interview**

---

## Resume Intelligence

- Resume upload
- Resume parsing
- ATS compatibility analysis
- AI resume scoring
- Professional profile analysis

## Skill Intelligence

- Technical skill extraction
- Capability mapping
- Skill matching
- Skill gap detection

## Career Intelligence

- AI career recommendations
- Career readiness scoring
- Career alignment
- Next career move

## Growth Intelligence

- Personalized learning roadmaps
- Priority skill development
- Learning milestones
- Practical project recommendations

## Dashboard Intelligence

- Career readiness
- ATS intelligence
- Skill intelligence
- Career alignment
- Growth potential
- AI recommendations

---

## Technology

- FastAPI
- PostgreSQL
- SQLAlchemy 2.0
- Python
- Machine Learning
- NLP
- JWT Authentication
- React
- TypeScript
""",

    lifespan=lifespan,

    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",

    contact={
        "name": "Aniket Kumar",
        "url": "https://github.com/Aniketkr09",
    },

    license_info={
        "name": "MIT License",
    },
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=ALLOWED_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROUTER REGISTRATION
# ============================================================

# ------------------------------------------------------------
# AUTHENTICATION
# ------------------------------------------------------------

app.include_router(
    auth_router,
    prefix=f"{API_PREFIX}/auth",
    tags=["Authentication"],
)


# ------------------------------------------------------------
# RESUME MANAGEMENT
# ------------------------------------------------------------

app.include_router(
    resume_router,
    prefix=f"{API_PREFIX}/resume",
    tags=["Resume Intelligence"],
)


# ------------------------------------------------------------
# RESUME ANALYSIS
# ------------------------------------------------------------

app.include_router(
    resume_analysis_router,
    prefix=f"{API_PREFIX}/resume-analysis",
    tags=["Resume Analysis"],
)


# ------------------------------------------------------------
# CAREER INTELLIGENCE
# ------------------------------------------------------------

app.include_router(
    career_router,
    prefix=f"{API_PREFIX}/career",
    tags=["Career Intelligence"],
)


# ------------------------------------------------------------
# LEARNING ROADMAP
# ------------------------------------------------------------
#
# roadmap.py should define:
#
# @router.get("/roadmap")
#
# Therefore:
#
# /api/v1 + /roadmap
#
# becomes:
#
# /api/v1/roadmap
#

app.include_router(
    roadmap_router,
    prefix=API_PREFIX,
    tags=["Learning Intelligence"],
)


# ------------------------------------------------------------
# DASHBOARD
# ------------------------------------------------------------

app.include_router(
    dashboard_router,
    prefix=f"{API_PREFIX}/dashboard",
    tags=["Dashboard Intelligence"],
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get(
    "/",
    tags=["System"],
    summary="CareerMind AI system information",
)
async def home() -> dict:
    """
    Return basic CareerMind AI platform information.
    """

    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",

        "message": (
            "CareerMind AI Intelligence Engine "
            "is operational."
        ),

        "platform": "AI Career Intelligence",

        "documentation": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
        "health": "/health",

        "api_prefix": API_PREFIX,

        "modules": {
            "authentication": True,
            "resume_intelligence": True,
            "resume_analysis": True,
            "career_intelligence": True,
            "learning_roadmap": True,
            "dashboard_intelligence": True,
            "interview_intelligence": False,
        },

        "timestamp": datetime.now(
            timezone.utc
        ),
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get(
    "/health",
    tags=["System"],
    summary="CareerMind AI health status",
)
async def health() -> dict:
    """
    Verify application and database health.
    """

    database_status = "connected"

    try:
        with engine.connect() as connection:
            connection.execute(
                text("SELECT 1")
            )

    except Exception:
        database_status = "disconnected"

    overall_status = (
        "healthy"
        if database_status == "connected"
        else "degraded"
    )

    return {
        "status": overall_status,

        "application": settings.APP_NAME,

        "version": settings.APP_VERSION,

        "environment": (
            "development"
            if settings.DEBUG
            else "production"
        ),

        "database": database_status,

        "api": API_PREFIX,

        "intelligence_engine": (
            "online"
            if database_status == "connected"
            else "degraded"
        ),

        "server_time": datetime.now(
            timezone.utc
        ),
    }


# ============================================================
# API SYSTEM STATUS
# ============================================================

@app.get(
    f"{API_PREFIX}/system/status",
    tags=["System"],
    summary="CareerMind AI API status",
)
async def api_status() -> dict:
    """
    Return lightweight platform intelligence status.
    """

    return {
        "status": "online",

        "engine": (
            "CareerMind Intelligence Engine"
        ),

        "version": settings.APP_VERSION,

        "modules": {
            "authentication": "online",
            "resume_intelligence": "online",
            "resume_analysis": "online",
            "career_intelligence": "online",
            "learning_roadmap": "online",
            "dashboard": "online",
            "interview_intelligence": "not_configured",
        },

        "endpoints": {
            "career_recommendation": (
                f"{API_PREFIX}/career/recommendation"
            ),
            "learning_roadmap": (
                f"{API_PREFIX}/roadmap"
            ),
            "dashboard": (
                f"{API_PREFIX}/dashboard"
            ),
        },

        "timestamp": datetime.now(
            timezone.utc
        ),
    }


# ============================================================
# STARTUP LOG
# ============================================================

logger.info(
    "CareerMind AI application initialized successfully."
)

logger.info(
    "API prefix: %s",
    API_PREFIX,
)

logger.info(
    "Environment: %s",
    (
        "development"
        if settings.DEBUG
        else "production"
    ),
)

logger.info(
    "Career Intelligence endpoint: "
    "%s/career/recommendation",
    API_PREFIX,
)

logger.info(
    "Learning Roadmap endpoint: "
    "%s/roadmap",
    API_PREFIX,
)