"""
============================================================
CareerMind AI
Career Intelligence Router
============================================================

Purpose
-------
Provides personalized career-direction intelligence based on
the authenticated user's latest resume.

Endpoint
--------
GET /api/v1/career/recommendation

Response contract
-----------------
The frontend CareerMind dashboard expects:

    recommended_role
    explanation
    confidence_score
    skills_required
    next_steps

Design principles
-----------------
- JWT authenticated
- Latest resume only
- No dependency on external AI provider
- No dependency on non-existent Resume columns
- Safe handling of missing resume data
- Deterministic career intelligence
- Dashboard-compatible response
- Production-oriented logging

============================================================
"""

from __future__ import annotations

import logging
import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.resume import Resume
from app.models.user import User


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger(
    "CareerMindAI.CareerRouter"
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter()


# ============================================================
# CAREER KNOWLEDGE BASE
# ============================================================

CAREER_PROFILES: dict[str, dict[str, Any]] = {

    "AI / ML Engineer": {
        "skills": [
            "Python",
            "Machine Learning",
            "NumPy",
            "Pandas",
            "Scikit-learn",
            "SQL",
            "Deep Learning",
            "Docker",
        ],
        "signals": [
            "python",
            "machine learning",
            "artificial intelligence",
            "numpy",
            "pandas",
            "scikit-learn",
            "sklearn",
            "tensorflow",
            "pytorch",
            "deep learning",
            "nlp",
            "natural language processing",
        ],
        "next_steps": [
            "Strengthen SQL for data and ML workflows.",
            "Build one production-oriented Machine Learning project.",
            "Develop practical Deep Learning capability.",
            "Learn Docker and model deployment fundamentals.",
        ],
    },

    "Machine Learning Engineer": {
        "skills": [
            "Python",
            "Machine Learning",
            "Scikit-learn",
            "SQL",
            "Statistics",
            "Deep Learning",
            "Docker",
            "Model Deployment",
        ],
        "signals": [
            "python",
            "machine learning",
            "scikit-learn",
            "sklearn",
            "tensorflow",
            "pytorch",
            "deep learning",
            "model deployment",
            "mlops",
            "docker",
        ],
        "next_steps": [
            "Strengthen model evaluation and validation.",
            "Build an end-to-end ML deployment project.",
            "Learn Docker and production ML workflows.",
            "Improve SQL and data engineering fundamentals.",
        ],
    },

    "Backend Engineer": {
        "skills": [
            "Python",
            "FastAPI",
            "REST APIs",
            "PostgreSQL",
            "SQL",
            "Git",
            "Docker",
            "Authentication",
        ],
        "signals": [
            "python",
            "fastapi",
            "django",
            "flask",
            "postgresql",
            "postgres",
            "sql",
            "rest api",
            "api",
            "backend",
            "docker",
        ],
        "next_steps": [
            "Strengthen API architecture and system design.",
            "Build production-grade authentication and authorization.",
            "Improve PostgreSQL query and schema design.",
            "Containerize and deploy a backend application.",
        ],
    },

    "Frontend Engineer": {
        "skills": [
            "JavaScript",
            "TypeScript",
            "React",
            "HTML",
            "CSS",
            "Git",
            "REST APIs",
            "UI Engineering",
        ],
        "signals": [
            "javascript",
            "typescript",
            "react",
            "next.js",
            "nextjs",
            "html",
            "css",
            "frontend",
            "front-end",
            "ui",
            "tailwind",
        ],
        "next_steps": [
            "Strengthen TypeScript and React architecture.",
            "Build a production-quality frontend project.",
            "Improve API integration and state management.",
            "Learn frontend testing and performance optimization.",
        ],
    },

    "Data Scientist": {
        "skills": [
            "Python",
            "Pandas",
            "NumPy",
            "Statistics",
            "Machine Learning",
            "SQL",
            "Data Visualization",
            "Scikit-learn",
        ],
        "signals": [
            "python",
            "pandas",
            "numpy",
            "statistics",
            "data science",
            "machine learning",
            "scikit-learn",
            "sql",
            "matplotlib",
            "seaborn",
            "data analysis",
        ],
        "next_steps": [
            "Strengthen statistical reasoning.",
            "Build an end-to-end data science project.",
            "Improve SQL and analytical querying.",
            "Create stronger data storytelling and visualization.",
        ],
    },

    "Data Analyst": {
        "skills": [
            "SQL",
            "Python",
            "Pandas",
            "Excel",
            "Data Visualization",
            "Statistics",
            "Power BI",
        ],
        "signals": [
            "sql",
            "data analyst",
            "data analysis",
            "excel",
            "power bi",
            "tableau",
            "pandas",
            "statistics",
            "business intelligence",
        ],
        "next_steps": [
            "Strengthen advanced SQL.",
            "Build dashboard and business analytics projects.",
            "Improve data visualization.",
            "Develop stronger statistical analysis skills.",
        ],
    },

    "DevOps / Cloud Engineer": {
        "skills": [
            "Linux",
            "Git",
            "Docker",
            "CI/CD",
            "AWS",
            "Cloud",
            "Kubernetes",
            "Python",
        ],
        "signals": [
            "devops",
            "docker",
            "kubernetes",
            "aws",
            "azure",
            "gcp",
            "cloud",
            "ci/cd",
            "linux",
            "jenkins",
            "terraform",
        ],
        "next_steps": [
            "Strengthen Linux and networking fundamentals.",
            "Build a CI/CD pipeline for a real project.",
            "Learn Docker and Kubernetes fundamentals.",
            "Deploy a production application to a cloud platform.",
        ],
    },
}


# ============================================================
# TEXT HELPERS
# ============================================================

def normalize_text(value: Any) -> str:
    """
    Convert arbitrary input into normalized searchable text.
    """

    if value is None:
        return ""

    return re.sub(
        r"\s+",
        " ",
        str(value),
    ).strip().lower()


def extract_skill_signals(
    resume_text: str,
) -> list[str]:
    """
    Extract known technical skills from resume text.

    This intentionally uses a controlled vocabulary so the
    recommendation engine remains deterministic and safe.
    """

    text = normalize_text(
        resume_text
    )

    if not text:
        return []

    detected: list[str] = []

    known_skills = [
        "python",
        "java",
        "javascript",
        "typescript",
        "c++",
        "c#",
        "machine learning",
        "artificial intelligence",
        "deep learning",
        "nlp",
        "natural language processing",
        "numpy",
        "pandas",
        "scikit-learn",
        "sklearn",
        "tensorflow",
        "pytorch",
        "fastapi",
        "django",
        "flask",
        "react",
        "next.js",
        "nextjs",
        "html",
        "css",
        "sql",
        "postgresql",
        "postgres",
        "mysql",
        "mongodb",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "git",
        "linux",
        "excel",
        "power bi",
        "tableau",
        "statistics",
        "data analysis",
        "data science",
        "mlops",
        "ci/cd",
    ]

    for skill in known_skills:

        if skill in text:
            detected.append(skill)

    return detected


def pretty_skill(
    skill: str,
) -> str:
    """
    Convert normalized skill names into dashboard-friendly names.
    """

    mapping = {
        "python": "Python",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "machine learning": "Machine Learning",
        "artificial intelligence": "Artificial Intelligence",
        "deep learning": "Deep Learning",
        "nlp": "NLP",
        "natural language processing": "NLP",
        "numpy": "NumPy",
        "pandas": "Pandas",
        "scikit-learn": "Scikit-learn",
        "sklearn": "Scikit-learn",
        "tensorflow": "TensorFlow",
        "pytorch": "PyTorch",
        "fastapi": "FastAPI",
        "django": "Django",
        "flask": "Flask",
        "react": "React",
        "next.js": "Next.js",
        "nextjs": "Next.js",
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "sql": "SQL",
        "mongodb": "MongoDB",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "aws": "AWS",
        "azure": "Azure",
        "gcp": "GCP",
        "git": "Git",
        "linux": "Linux",
        "excel": "Excel",
        "power bi": "Power BI",
        "tableau": "Tableau",
        "statistics": "Statistics",
        "data analysis": "Data Analysis",
        "data science": "Data Science",
        "mlops": "MLOps",
        "ci/cd": "CI/CD",
    }

    return mapping.get(
        skill.lower(),
        skill.title(),
    )


# ============================================================
# CAREER SCORING ENGINE
# ============================================================

def calculate_career_scores(
    detected_skills: list[str],
) -> list[dict[str, Any]]:
    """
    Score every career profile against detected resume signals.
    """

    normalized_skills = {
        skill.lower()
        for skill in detected_skills
    }

    results: list[dict[str, Any]] = []

    for role, profile in CAREER_PROFILES.items():

        signals = {
            str(signal).lower()
            for signal in profile["signals"]
        }

        matched = (
            normalized_skills
            & signals
        )

        if not matched:
            continue

        raw_score = (
            len(matched)
            / max(len(signals), 1)
        ) * 100

        # Reward profiles with multiple independent signals.
        breadth_bonus = min(
            len(matched) * 3,
            15,
        )

        score = min(
            100,
            round(
                raw_score
                + breadth_bonus
            ),
        )

        results.append(
            {
                "role": role,
                "score": score,
                "matched_signals": sorted(
                    matched
                ),
            }
        )

    results.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return results


# ============================================================
# GAP ENGINE
# ============================================================

def calculate_skill_gaps(
    role: str,
    detected_skills: list[str],
) -> list[str]:
    """
    Identify high-value skills not currently visible in
    the resume evidence.
    """

    profile = CAREER_PROFILES.get(
        role
    )

    if not profile:
        return []

    current = {
        skill.lower()
        for skill in detected_skills
    }

    gaps: list[str] = []

    for skill in profile["skills"]:

        if skill.lower() not in current:
            gaps.append(skill)

    return gaps[:5]


# ============================================================
# CONFIDENCE ENGINE
# ============================================================

def calculate_confidence(
    score: int,
    skill_count: int,
) -> int:
    """
    Calculate recommendation confidence.

    The result is deliberately conservative. A recommendation
    based on only one detected signal should not look highly
    confident.
    """

    if skill_count <= 0:
        return 0

    evidence_bonus = min(
        skill_count * 4,
        20,
    )

    confidence = min(
        100,
        max(
            35,
            score + evidence_bonus,
        ),
    )

    return int(confidence)


# ============================================================
# EXPLANATION
# ============================================================

def build_explanation(
    role: str,
    matched_skills: list[str],
    gaps: list[str],
) -> str:
    """
    Generate a concise professional explanation for the UI.
    """

    matched = [
        pretty_skill(skill)
        for skill in matched_skills[:5]
    ]

    gap_names = [
        pretty_skill(skill)
        for skill in gaps[:3]
    ]

    if matched:

        evidence = ", ".join(
            matched
        )

        explanation = (
            f"Your resume shows strong alignment with "
            f"{role} based on evidence including "
            f"{evidence}."
        )

    else:

        explanation = (
            f"Your current professional evidence suggests "
            f"potential alignment with {role}."
        )

    if gap_names:

        explanation += (
            " To strengthen this direction, focus on "
            + ", ".join(gap_names)
            + "."
        )

    return explanation


# ============================================================
# NEXT STEPS
# ============================================================

def build_next_steps(
    role: str,
    gaps: list[str],
) -> list[str]:
    """
    Build actionable next moves.

    Uses role-specific strategy first, then appends the most
    important skill gaps.
    """

    profile = CAREER_PROFILES.get(
        role
    )

    if not profile:
        return [
            "Strengthen the technical skills visible in your resume.",
            "Build one production-oriented portfolio project.",
            "Improve measurable project evidence.",
            "Prepare for role-specific technical interviews.",
        ]

    steps = list(
        profile["next_steps"]
    )

    if gaps:

        first_gap = pretty_skill(
            gaps[0]
        )

        steps.insert(
            0,
            (
                f"Prioritize {first_gap} "
                f"as your highest-impact skill gap."
            ),
        )

    return steps[:5]


# ============================================================
# LATEST RESUME
# ============================================================

def get_latest_resume(
    db: Session,
    user_id: Any,
) -> Resume | None:
    """
    Fetch the authenticated user's latest resume.

    Only uses columns already present in the known Resume model:
    user_id and created_at.
    """

    return (
        db.query(Resume)
        .filter(
            Resume.user_id == user_id
        )
        .order_by(
            Resume.created_at.desc()
        )
        .first()
    )


# ============================================================
# CAREER RECOMMENDATION ENDPOINT
# ============================================================

@router.get(
    "/recommendation",
    summary="Generate personalized career recommendation",
    description=(
        "Analyzes the authenticated user's latest resume "
        "and returns a personalized career direction."
    ),
    status_code=status.HTTP_200_OK,
)
def get_career_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Generate CareerMind career intelligence.

    Frontend contract:

        {
            recommended_role,
            explanation,
            confidence_score,
            skills_required,
            next_steps
        }
    """

    logger.info(
        "Career recommendation requested | user=%s",
        getattr(
            current_user,
            "id",
            "unknown",
        ),
    )

    # --------------------------------------------------------
    # Find latest resume
    # --------------------------------------------------------

    resume = get_latest_resume(
        db=db,
        user_id=current_user.id,
    )

    if resume is None:

        logger.info(
            "No resume available | user=%s",
            current_user.id,
        )

        return {
            "status": "awaiting_resume",
            "message": (
                "Upload and analyze your resume "
                "to generate a personalized career direction."
            ),
            "recommended_role": None,
            "explanation": (
                "CareerMind needs your resume as the "
                "professional evidence dataset."
            ),
            "confidence_score": 0,
            "skills_required": [],
            "skill_gaps": [],
            "next_steps": [
                "Upload your latest PDF resume.",
                "Run Resume Intelligence analysis.",
                "Return here to generate your career direction.",
            ],
            "resume_id": None,
        }

    # --------------------------------------------------------
    # Extract resume text
    # --------------------------------------------------------

    extracted_text = getattr(
        resume,
        "extracted_text",
        None,
    )

    if not extracted_text:

        logger.info(
            "Resume exists but extracted text is unavailable "
            "| resume=%s user=%s",
            resume.id,
            current_user.id,
        )

        return {
            "status": "awaiting_analysis",
            "message": (
                "Your resume is uploaded but has not "
                "completed intelligence analysis."
            ),
            "recommended_role": None,
            "explanation": (
                "Run Resume Analysis first so CareerMind "
                "can use your professional evidence."
            ),
            "confidence_score": 0,
            "skills_required": [],
            "skill_gaps": [],
            "next_steps": [
                "Analyze your uploaded resume.",
                "Review your detected skills.",
                "Generate your career direction.",
            ],
            "resume_id": str(
                resume.id
            ),
        }

    # --------------------------------------------------------
    # Detect technical signals
    # --------------------------------------------------------

    detected_skills = extract_skill_signals(
        extracted_text
    )

    # --------------------------------------------------------
    # No meaningful signals
    # --------------------------------------------------------

    if not detected_skills:

        logger.info(
            "No recognized career signals | resume=%s",
            resume.id,
        )

        return {
            "status": "insufficient_evidence",
            "message": (
                "CareerMind could not identify enough "
                "technical career signals."
            ),
            "recommended_role": (
                "Software / AI Professional"
            ),
            "explanation": (
                "Your resume contains insufficient "
                "technical evidence for a high-confidence "
                "career recommendation."
            ),
            "confidence_score": 25,
            "skills_required": [
                "Python",
                "SQL",
                "Git",
                "Data Structures",
                "Problem Solving",
            ],
            "skill_gaps": [
                "Python",
                "SQL",
                "Git",
            ],
            "next_steps": [
                "Add measurable technical project evidence.",
                "Highlight your strongest technical skills.",
                "Include technologies used in your projects.",
                "Add quantified project outcomes where possible.",
            ],
            "resume_id": str(
                resume.id
            ),
        }

    # --------------------------------------------------------
    # Score career profiles
    # --------------------------------------------------------

    career_scores = calculate_career_scores(
        detected_skills
    )

    # --------------------------------------------------------
    # Fallback role
    # --------------------------------------------------------

    if not career_scores:

        role = (
            "Software / AI Professional"
        )

        matched_signals = detected_skills[
            :5
        ]

        confidence = calculate_confidence(
            score=45,
            skill_count=len(
                detected_skills
            ),
        )

        gaps = [
            "SQL",
            "Git",
            "Docker",
        ]

    else:

        best = career_scores[0]

        role = best["role"]

        matched_signals = (
            best["matched_signals"]
        )

        confidence = calculate_confidence(
            score=best["score"],
            skill_count=len(
                matched_signals
            ),
        )

        gaps = calculate_skill_gaps(
            role=role,
            detected_skills=detected_skills,
        )

    # --------------------------------------------------------
    # Build intelligence
    # --------------------------------------------------------

    profile = CAREER_PROFILES.get(
        role,
        {},
    )

    skills_required = [
        pretty_skill(skill)
        for skill in profile.get(
            "skills",
            [],
        )
    ]

    explanation = build_explanation(
        role=role,
        matched_skills=matched_signals,
        gaps=gaps,
    )

    next_steps = build_next_steps(
        role=role,
        gaps=gaps,
    )

    detected_for_response = [
        pretty_skill(skill)
        for skill in detected_skills[:12]
    ]

    gap_response = [
        pretty_skill(skill)
        for skill in gaps
    ]

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    response = {
        "status": "ready",

        "resume_id": str(
            resume.id
        ),

        "recommended_role": role,

        "explanation": explanation,

        "confidence_score": confidence,

        "skills_required": skills_required,

        "detected_skills": detected_for_response,

        "skill_gaps": gap_response,

        "next_steps": next_steps,

        "career_signals": {
            "matched_signals": [
                pretty_skill(skill)
                for skill in matched_signals
            ],
            "detected_skill_count": len(
                detected_skills
            ),
            "gap_count": len(
                gaps
            ),
        },

        "recommendations": next_steps,

        "intelligence": {
            "engine": "CareerMind Career Intelligence",
            "version": "1.0",
            "evidence_source": "latest_resume",
            "confidence": confidence,
        },
    }

    logger.info(
        "Career recommendation generated | "
        "user=%s resume=%s role=%s confidence=%s",
        current_user.id,
        resume.id,
        role,
        confidence,
    )

    return response