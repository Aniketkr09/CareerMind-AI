"""
============================================================
CareerMind AI
Roadmap Intelligence Router
============================================================

Responsibilities
-----------------
- Generate personalized learning roadmap
- Analyze resume skills
- Identify skill gaps
- Infer target career role
- Prioritize learning phases
- Recommend portfolio work
- Calculate roadmap progress
- Recommend next best action

Endpoint
--------
GET /api/v1/roadmap

Authentication
--------------
JWT Bearer Token

Stack
-----
FastAPI
SQLAlchemy 2.0
PostgreSQL
Pydantic
CareerMind AI Intelligence Engine
============================================================
"""

from __future__ import annotations

import logging
import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.resume import Resume
from app.models.user import User


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger("CareerMindAI.Roadmap")


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/roadmap",
    tags=["Roadmap Intelligence"],
)


# ============================================================
# RESPONSE MODELS
# ============================================================

class RoadmapPhaseResponse(BaseModel):
    """
    Single personalized roadmap phase.
    """

    phase: str
    title: str

    description: str = ""

    skills: list[str] = Field(
        default_factory=list
    )

    status: str = "upcoming"

    progress: int = Field(
        default=0,
        ge=0,
        le=100,
    )

    duration: str | None = None

    resources: list[str] = Field(
        default_factory=list
    )

    priority: str = "medium"

    objective: str | None = None


class RoadmapResponse(BaseModel):
    """
    Main roadmap response consumed by React.
    """

    status: str = "ready"

    career_goal: str = "AI / ML Engineer"

    recommended_role: str | None = None

    progress: int = Field(
        default=0,
        ge=0,
        le=100,
    )

    roadmap: list[RoadmapPhaseResponse] = Field(
        default_factory=list
    )

    total_phases: int = 0

    next_action: str | None = None

    next_skill: str | None = None

    resume_id: str | None = None

    message: str | None = None


# ============================================================
# GENERIC HELPERS
# ============================================================

def _clean(value: Any) -> str:
    """
    Safely normalize arbitrary values into text.
    """

    if value is None:
        return ""

    return str(value).strip()


def _as_list(value: Any) -> list[str]:
    """
    Convert common database/API values into
    a clean list of strings.
    """

    if value is None:
        return []

    if isinstance(value, (list, tuple, set)):
        result: list[str] = []

        for item in value:
            text = _clean(item)

            if text:
                result.append(text)

        return result

    if isinstance(value, str):

        value = value.strip()

        if not value:
            return []

        # Support comma-separated values.
        parts = re.split(
            r"[,;\n|]",
            value,
        )

        return [
            part.strip()
            for part in parts
            if part.strip()
        ]

    return []


# ============================================================
# RESUME INTELLIGENCE
# ============================================================

def _get_resume_skills(
    resume: Resume,
) -> list[str]:
    """
    Extract skills from Resume.

    Supports multiple possible CareerMind
    resume intelligence structures.
    """

    # --------------------------------------------------------
    # Direct detected_skills field
    # --------------------------------------------------------

    detected_skills = getattr(
        resume,
        "detected_skills",
        None,
    )

    skills = _as_list(
        detected_skills
    )

    if skills:
        return skills

    # --------------------------------------------------------
    # Career insights
    # --------------------------------------------------------

    career_insights = getattr(
        resume,
        "career_insights",
        None,
    )

    if isinstance(
        career_insights,
        dict,
    ):

        for key in (
            "skills",
            "detected_skills",
            "technical_skills",
            "technicalSkills",
        ):

            skills = _as_list(
                career_insights.get(key)
            )

            if skills:
                return skills

    # --------------------------------------------------------
    # Analysis result fallback
    # --------------------------------------------------------

    analysis = getattr(
        resume,
        "analysis",
        None,
    )

    if isinstance(
        analysis,
        dict,
    ):

        for key in (
            "skills",
            "detected_skills",
            "technical_skills",
        ):

            skills = _as_list(
                analysis.get(key)
            )

            if skills:
                return skills

    return []


def _get_missing_skills(
    resume: Resume,
) -> list[str]:
    """
    Extract identified skill gaps.
    """

    career_insights = getattr(
        resume,
        "career_insights",
        None,
    )

    if isinstance(
        career_insights,
        dict,
    ):

        for key in (
            "missing_skills",
            "skill_gaps",
            "gaps",
            "missingSkills",
        ):

            result = _as_list(
                career_insights.get(key)
            )

            if result:
                return result

    analysis = getattr(
        resume,
        "analysis",
        None,
    )

    if isinstance(
        analysis,
        dict,
    ):

        for key in (
            "missing_skills",
            "skill_gaps",
            "gaps",
        ):

            result = _as_list(
                analysis.get(key)
            )

            if result:
                return result

    return []


# ============================================================
# NORMALIZATION
# ============================================================

def _normalize_skills(
    skills: list[str],
) -> list[str]:
    """
    Remove duplicates while preserving order.
    """

    result: list[str] = []

    seen: set[str] = set()

    for skill in skills:

        cleaned = skill.strip()

        if not cleaned:
            continue

        key = cleaned.lower()

        if key in seen:
            continue

        seen.add(key)

        result.append(cleaned)

    return result


# ============================================================
# ROLE INTELLIGENCE
# ============================================================

def _infer_role(
    skills: list[str],
) -> str:
    """
    Infer a reasonable career direction from
    resume skills.

    Deterministic fallback so the application
    remains functional without an LLM.
    """

    normalized = {
        skill.lower().strip()
        for skill in skills
    }

    # --------------------------------------------------------
    # AI / ML
    # --------------------------------------------------------

    if (
        "python" in normalized
        and (
            "machine learning" in normalized
            or "scikit-learn" in normalized
            or "sklearn" in normalized
        )
    ):
        return "AI / ML Engineer"

    # --------------------------------------------------------
    # Deep Learning
    # --------------------------------------------------------

    if (
        "python" in normalized
        and (
            "pytorch" in normalized
            or "tensorflow" in normalized
            or "deep learning" in normalized
        )
    ):
        return "Deep Learning Engineer"

    # --------------------------------------------------------
    # Data
    # --------------------------------------------------------

    if (
        "python" in normalized
        and (
            "pandas" in normalized
            or "numpy" in normalized
            or "data science" in normalized
        )
    ):
        return "Data Scientist"

    # --------------------------------------------------------
    # Backend
    # --------------------------------------------------------

    if (
        "python" in normalized
        and (
            "fastapi" in normalized
            or "django" in normalized
            or "flask" in normalized
        )
    ):
        return "Backend Engineer"

    # --------------------------------------------------------
    # Frontend
    # --------------------------------------------------------

    if (
        "react" in normalized
        and (
            "typescript" in normalized
            or "javascript" in normalized
        )
    ):
        return "Frontend Engineer"

    # --------------------------------------------------------
    # Full Stack
    # --------------------------------------------------------

    if (
        "react" in normalized
        and "python" in normalized
    ):
        return "Full Stack Engineer"

    # --------------------------------------------------------
    # Python
    # --------------------------------------------------------

    if "python" in normalized:
        return "Python Developer"

    return "AI / Software Engineering Professional"


# ============================================================
# DEFAULT AI/ML GAPS
# ============================================================

DEFAULT_AI_ML_GAPS = [
    "SQL",
    "Deep Learning",
    "Docker",
    "Model Deployment",
]


# ============================================================
# ROADMAP RESOURCES
# ============================================================

RESOURCE_MAP: dict[str, list[str]] = {

    "python": [
        "Python fundamentals",
        "Object-oriented programming",
        "Data structures",
    ],

    "machine learning": [
        "Supervised learning",
        "Unsupervised learning",
        "Model evaluation",
    ],

    "deep learning": [
        "Neural networks",
        "PyTorch / TensorFlow",
        "Model optimization",
    ],

    "sql": [
        "SQL fundamentals",
        "Joins and aggregations",
        "Query optimization",
    ],

    "docker": [
        "Docker fundamentals",
        "Containerization",
        "Docker Compose",
    ],

    "model deployment": [
        "FastAPI model serving",
        "Docker deployment",
        "Monitoring",
    ],

    "system design": [
        "API architecture",
        "Caching",
        "Queues",
        "Scalability",
    ],

    "git": [
        "Git fundamentals",
        "Branching strategies",
        "Pull requests",
    ],
}


def _get_resources(
    skills: list[str],
) -> list[str]:
    """
    Generate useful learning resources/topics
    for a roadmap phase.
    """

    resources: list[str] = []

    for skill in skills:

        key = skill.lower().strip()

        mapped = RESOURCE_MAP.get(
            key,
            [],
        )

        resources.extend(
            mapped
        )

    # Remove duplicates.
    return _normalize_skills(
        resources
    )


# ============================================================
# ROADMAP BUILDER
# ============================================================

def _build_roadmap(
    skills: list[str],
    missing_skills: list[str],
    role: str,
) -> list[dict[str, Any]]:
    """
    Build a personalized multi-stage career roadmap.
    """

    skills = _normalize_skills(
        skills
    )

    missing_skills = _normalize_skills(
        missing_skills
    )

    existing = {
        skill.lower()
        for skill in skills
    }

    # --------------------------------------------------------
    # Remove gaps already present
    # --------------------------------------------------------

    gaps = [
        skill
        for skill in missing_skills
        if skill.lower() not in existing
    ]

    # --------------------------------------------------------
    # Intelligent fallback
    # --------------------------------------------------------

    if not gaps:

        if "ai" in role.lower():

            gaps = [
                skill
                for skill in DEFAULT_AI_ML_GAPS
                if skill.lower() not in existing
            ]

        else:

            gaps = [
                "SQL",
                "System Design",
                "Docker",
            ]

            gaps = [
                skill
                for skill in gaps
                if skill.lower() not in existing
            ]

    gaps = gaps[:4]

    phases: list[dict[str, Any]] = []

    # ========================================================
    # PHASE 1 — FOUNDATION
    # ========================================================

    foundation_skills = (
        skills[:5]
        if skills
        else [
            "Python",
            "Git",
            "Data Structures",
            "SQL",
        ]
    )

    phases.append(
        {
            "phase": "1",
            "title": "Foundation & Core Skills",
            "description": (
                "Strengthen the technical foundation "
                "required for your target career path."
            ),
            "skills": foundation_skills,
            "status": "current",
            "progress": 25,
            "duration": "2–3 weeks",
            "resources": _get_resources(
                foundation_skills
            ),
            "priority": "high",
            "objective": (
                "Build strong fundamentals and "
                "remove core knowledge gaps."
            ),
        }
    )

    # ========================================================
    # PHASE 2+ — SKILL GAPS
    # ========================================================

    for index, skill in enumerate(
        gaps,
        start=2,
    ):

        clean_skill = skill.strip()

        phase_status = (
            "upcoming"
            if index == 2
            else "locked"
        )

        phase_progress = (
            10
            if index == 2
            else 0
        )

        priority = (
            "high"
            if index <= 2
            else "medium"
        )

        phases.append(
            {
                "phase": str(index),
                "title": (
                    f"Master {clean_skill}"
                ),
                "description": (
                    f"Develop practical {clean_skill} "
                    "skills through focused learning "
                    "and hands-on implementation."
                ),
                "skills": [
                    clean_skill
                ],
                "status": phase_status,
                "progress": phase_progress,
                "duration": "2–4 weeks",
                "resources": _get_resources(
                    [clean_skill]
                ),
                "priority": priority,
                "objective": (
                    f"Become confident using "
                    f"{clean_skill} in real projects."
                ),
            }
        )

    # ========================================================
    # FINAL PHASE — PRODUCTION
    # ========================================================

    phases.append(
        {
            "phase": str(
                len(phases) + 1
            ),
            "title": "Build Production Portfolio",
            "description": (
                "Transform your learning into a "
                "production-oriented project that "
                "demonstrates real engineering ability."
            ),
            "skills": [
                "System Design",
                "Testing",
                "Deployment",
                "GitHub",
            ],
            "status": "locked",
            "progress": 0,
            "duration": "3–5 weeks",
            "resources": [
                "System Design",
                "API Architecture",
                "Testing",
                "Docker",
                "CI/CD",
            ],
            "priority": "high",
            "objective": (
                "Create portfolio evidence aligned "
                "with your target role."
            ),
        }
    )

    return phases


# ============================================================
# PROGRESS CALCULATOR
# ============================================================

def _calculate_progress(
    roadmap: list[dict[str, Any]],
) -> int:
    """
    Calculate overall roadmap progress from
    individual phase progress.
    """

    if not roadmap:
        return 0

    values = [
        max(
            0,
            min(
                int(
                    phase.get(
                        "progress",
                        0,
                    )
                ),
                100,
            ),
        )
        for phase in roadmap
    ]

    return round(
        sum(values) / len(values)
    )


# ============================================================
# GET ROADMAP
# ============================================================

@router.get(
    "",
    response_model=RoadmapResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate personalized AI learning roadmap",
)
def get_learning_roadmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> RoadmapResponse:
    """
    Generate a personalized roadmap from
    the authenticated user's latest resume.
    """

    try:

        # ----------------------------------------------------
        # Find latest resume
        # ----------------------------------------------------

        resume = (
            db.query(Resume)
            .filter(
                Resume.user_id
                == current_user.id
            )
            .order_by(
                Resume.created_at.desc()
            )
            .first()
        )

        # ----------------------------------------------------
        # No resume
        # ----------------------------------------------------

        if not resume:

            return RoadmapResponse(
                status="awaiting_resume",
                career_goal="AI / ML Engineer",
                recommended_role=None,
                progress=0,
                roadmap=[],
                total_phases=0,
                next_action=(
                    "Upload and analyze your resume"
                ),
                next_skill=None,
                resume_id=None,
                message=(
                    "Upload and analyze your resume "
                    "to generate your personalized "
                    "CareerMind AI roadmap."
                ),
            )

        # ----------------------------------------------------
        # Extract intelligence
        # ----------------------------------------------------

        skills = _get_resume_skills(
            resume
        )

        missing_skills = _get_missing_skills(
            resume
        )

        role = _infer_role(
            skills
        )

        # ----------------------------------------------------
        # Build roadmap
        # ----------------------------------------------------

        roadmap = _build_roadmap(
            skills=skills,
            missing_skills=missing_skills,
            role=role,
        )

        # ----------------------------------------------------
        # Calculate progress
        # ----------------------------------------------------

        progress = _calculate_progress(
            roadmap
        )

        # ----------------------------------------------------
        # Determine current / next phase
        # ----------------------------------------------------

        current_phase = next(
            (
                phase
                for phase in roadmap
                if phase.get("status")
                == "current"
            ),
            None,
        )

        next_phase = next(
            (
                phase
                for phase in roadmap
                if phase.get("status")
                in {
                    "current",
                    "upcoming",
                }
            ),
            roadmap[0]
            if roadmap
            else None,
        )

        # ----------------------------------------------------
        # Convert roadmap into response model
        # ----------------------------------------------------

        roadmap_response = [
            RoadmapPhaseResponse(
                **phase
            )
            for phase in roadmap
        ]

        logger.info(
            "Roadmap generated | user=%s | role=%s | phases=%s",
            current_user.id,
            role,
            len(roadmap_response),
        )

        return RoadmapResponse(
            status="ready",
            career_goal=role,
            recommended_role=role,
            progress=progress,
            roadmap=roadmap_response,
            total_phases=len(
                roadmap_response
            ),
            next_action=(
                next_phase["title"]
                if next_phase
                else "Continue your learning journey"
            ),
            next_skill=(
                next_phase["skills"][0]
                if next_phase
                and next_phase.get("skills")
                else None
            ),
            resume_id=str(
                resume.id
            ),
            message=(
                "Your personalized CareerMind AI "
                "learning roadmap is ready."
            ),
        )

    except HTTPException:
        raise

    except Exception as exc:

        logger.exception(
            "Roadmap generation failed: %s",
            exc,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Unable to generate learning roadmap."
            ),
        ) from exc


# ============================================================
# ROADMAP HEALTH
# ============================================================

@router.get(
    "/health",
    summary="Roadmap intelligence health",
)
def roadmap_health() -> dict[str, Any]:

    return {
        "service": "CareerMind AI Roadmap Intelligence",
        "status": "online",
        "version": "1.0",
    }