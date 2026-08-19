"""
============================================================
CareerMind AI
Interview Intelligence Router
============================================================

Features
--------
- Personalized interview question generation
- Technical interviews
- Behavioral interviews
- AI / ML interviews
- Coding interviews
- HR interviews
- System design interviews
- Difficulty filtering
- Authenticated interview sessions
- Answer evaluation
- Interview scoring
- Strength detection
- Improvement detection
- Interview readiness
- Structured API contracts for React + TypeScript

API
---
GET  /api/v1/interview/health
GET  /api/v1/interview/question
GET  /api/v1/interview/technical
GET  /api/v1/interview/behavioral
GET  /api/v1/interview/system-design
GET  /api/v1/interview/categories
POST /api/v1/interview/evaluate

Designed for
------------
React + TypeScript
FastAPI
SQLAlchemy 2.0
JWT Authentication
Future LLM integration
============================================================
"""

from __future__ import annotations

import logging
import random
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from pydantic import BaseModel, Field

from app.dependencies.auth import get_current_user
from app.models.user import User


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger(__name__)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/interview",
    tags=["Interview Intelligence"],
)


# ============================================================
# CONSTANTS
# ============================================================

SUPPORTED_CATEGORIES = {
    "technical",
    "behavioral",
    "hr",
    "ai_ml",
    "coding",
    "system_design",
    "general",
}

SUPPORTED_DIFFICULTIES = {
    "easy",
    "medium",
    "hard",
    "expert",
}


# ============================================================
# RESPONSE MODELS
# ============================================================

class InterviewQuestionResponse(BaseModel):
    """
    Question response consumed by the React frontend.
    """

    question: str = Field(..., min_length=1)

    category: str = Field(
        default="general",
    )

    difficulty: str = Field(
        default="medium",
    )

    topic: str | None = None

    expected_points: list[str] = Field(
        default_factory=list,
    )


class InterviewEvaluationRequest(BaseModel):
    """
    Interview answer submitted by the frontend.
    """

    question: str = Field(
        ...,
        min_length=1,
    )

    answer: str = Field(
        ...,
        min_length=10,
    )

    category: str | None = None

    difficulty: str | None = None


class InterviewEvaluationResponse(BaseModel):
    """
    AI-style structured interview evaluation.
    """

    score: float = Field(
        ge=0,
        le=100,
    )

    strengths: list[str] = Field(
        default_factory=list,
    )

    improvements: list[str] = Field(
        default_factory=list,
    )

    feedback: str | None = None

    recommendation: str | None = None

    category: str | None = None

    difficulty: str | None = None

    confidence: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    ideal_answer: str | None = None

    missing_points: list[str] | None = None


# ============================================================
# QUESTION BANK
# ============================================================

QUESTION_BANK: list[dict[str, Any]] = [

    # --------------------------------------------------------
    # AI / ML
    # --------------------------------------------------------

    {
        "question": (
            "Explain a machine learning project you built. "
            "What problem did it solve, which model did you choose, "
            "and how did you evaluate its performance?"
        ),
        "category": "ai_ml",
        "difficulty": "medium",
        "topic": "Machine Learning",
        "expected_points": [
            "Problem definition",
            "Dataset",
            "Preprocessing",
            "Model selection",
            "Evaluation metrics",
            "Results",
            "Personal contribution",
        ],
    },

    {
        "question": (
            "What is overfitting in machine learning, and how would "
            "you reduce overfitting in a production model?"
        ),
        "category": "ai_ml",
        "difficulty": "medium",
        "topic": "Model Generalization",
        "expected_points": [
            "Definition of overfitting",
            "Train and validation performance",
            "Regularization",
            "Cross-validation",
            "Data augmentation",
            "Model complexity",
        ],
    },

    {
        "question": (
            "Explain precision, recall and F1-score. "
            "Give an example where recall is more important than precision."
        ),
        "category": "ai_ml",
        "difficulty": "medium",
        "topic": "Model Evaluation",
        "expected_points": [
            "Precision definition",
            "Recall definition",
            "F1-score",
            "Confusion matrix",
            "Real-world example",
        ],
    },

    {
        "question": (
            "How would you prevent data leakage while training "
            "a machine learning model?"
        ),
        "category": "ai_ml",
        "difficulty": "hard",
        "topic": "Data Leakage",
        "expected_points": [
            "Train-test separation",
            "Pipeline design",
            "Feature preprocessing",
            "Temporal leakage",
            "Validation strategy",
        ],
    },

    # --------------------------------------------------------
    # PYTHON / CODING
    # --------------------------------------------------------

    {
        "question": (
            "What is the difference between a Python list, tuple, "
            "set and dictionary? When would you use each?"
        ),
        "category": "coding",
        "difficulty": "easy",
        "topic": "Python Fundamentals",
        "expected_points": [
            "List",
            "Tuple",
            "Set",
            "Dictionary",
            "Mutability",
            "Use cases",
        ],
    },

    {
        "question": (
            "How would you optimize a Python program that processes "
            "a very large dataset?"
        ),
        "category": "coding",
        "difficulty": "hard",
        "topic": "Python Performance",
        "expected_points": [
            "Algorithmic complexity",
            "Memory usage",
            "Generators",
            "Vectorization",
            "Profiling",
            "Batch processing",
        ],
    },

    # --------------------------------------------------------
    # BACKEND / TECHNICAL
    # --------------------------------------------------------

    {
        "question": (
            "How would you design a FastAPI service for serving "
            "machine learning predictions in production?"
        ),
        "category": "technical",
        "difficulty": "hard",
        "topic": "FastAPI",
        "expected_points": [
            "API architecture",
            "Request validation",
            "Authentication",
            "Model loading",
            "Database access",
            "Error handling",
            "Monitoring",
        ],
    },

    {
        "question": (
            "How does JWT authentication work in a FastAPI application?"
        ),
        "category": "technical",
        "difficulty": "medium",
        "topic": "Authentication",
        "expected_points": [
            "Login",
            "JWT creation",
            "Bearer token",
            "Token validation",
            "Expiration",
            "Protected endpoints",
        ],
    },

    {
        "question": (
            "Explain how you would deploy a trained machine learning "
            "model as a production API."
        ),
        "category": "technical",
        "difficulty": "hard",
        "topic": "Model Deployment",
        "expected_points": [
            "Model serialization",
            "API layer",
            "Containerization",
            "Scaling",
            "Monitoring",
            "Model versioning",
        ],
    },

    # --------------------------------------------------------
    # BEHAVIORAL
    # --------------------------------------------------------

    {
        "question": (
            "Tell me about a difficult technical problem you faced "
            "and how you solved it."
        ),
        "category": "behavioral",
        "difficulty": "medium",
        "topic": "Problem Solving",
        "expected_points": [
            "Situation",
            "Task",
            "Action",
            "Result",
            "Learning",
        ],
    },

    {
        "question": (
            "Tell me about a project where you had to learn "
            "a new technology quickly."
        ),
        "category": "behavioral",
        "difficulty": "medium",
        "topic": "Adaptability",
        "expected_points": [
            "Situation",
            "Learning strategy",
            "Implementation",
            "Result",
            "Lessons learned",
        ],
    },

    {
        "question": (
            "Describe a time when something you built did not work "
            "as expected. What did you do?"
        ),
        "category": "behavioral",
        "difficulty": "medium",
        "topic": "Ownership",
        "expected_points": [
            "Problem",
            "Debugging",
            "Root cause",
            "Solution",
            "Prevention",
        ],
    },

    # --------------------------------------------------------
    # HR
    # --------------------------------------------------------

    {
        "question": (
            "Why do you want to build your career in Artificial "
            "Intelligence and Machine Learning?"
        ),
        "category": "hr",
        "difficulty": "easy",
        "topic": "Career Motivation",
        "expected_points": [
            "Personal motivation",
            "Technical interests",
            "Projects",
            "Career direction",
            "Long-term goals",
        ],
    },

    {
        "question": (
            "Why should a company hire you for an AI or machine "
            "learning engineering role?"
        ),
        "category": "hr",
        "difficulty": "medium",
        "topic": "Self Presentation",
        "expected_points": [
            "Technical skills",
            "Projects",
            "Problem solving",
            "Learning ability",
            "Business impact",
        ],
    },

    # --------------------------------------------------------
    # SYSTEM DESIGN
    # --------------------------------------------------------

    {
        "question": (
            "How would you design an AI-powered resume analysis "
            "platform that supports thousands of concurrent users?"
        ),
        "category": "system_design",
        "difficulty": "hard",
        "topic": "AI Platform Architecture",
        "expected_points": [
            "API architecture",
            "Authentication",
            "Object storage",
            "Async processing",
            "Queue system",
            "Database",
            "Caching",
            "Monitoring",
            "Scaling",
        ],
    },

    {
        "question": (
            "How would you process uploaded PDF resumes without "
            "blocking the main API server?"
        ),
        "category": "system_design",
        "difficulty": "hard",
        "topic": "Asynchronous Processing",
        "expected_points": [
            "Upload handling",
            "Object storage",
            "Background workers",
            "Queue",
            "Processing states",
            "Persistent results",
        ],
    },

    # --------------------------------------------------------
    # GENERAL
    # --------------------------------------------------------

    {
        "question": (
            "Introduce yourself and explain why you are interested "
            "in an AI engineering career."
        ),
        "category": "general",
        "difficulty": "easy",
        "topic": "Self Introduction",
        "expected_points": [
            "Education",
            "Technical skills",
            "Projects",
            "AI/ML interest",
            "Career goal",
        ],
    },
]


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_text(value: str | None) -> str:
    """
    Normalize user-provided filter values.
    """

    if not value:
        return ""

    return value.strip().lower().replace("-", "_").replace(" ", "_")


# ============================================================
# QUESTION SELECTION
# ============================================================

def select_question(
    *,
    category: str | None = None,
    difficulty: str | None = None,
) -> dict[str, Any]:
    """
    Select a question using category and difficulty.

    Matching strategy:
        1. category + difficulty
        2. category
        3. difficulty
        4. complete question bank
    """

    normalized_category = normalize_text(category)
    normalized_difficulty = normalize_text(difficulty)

    if normalized_category:
        if normalized_category not in SUPPORTED_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported interview category: "
                    f"{category}"
                ),
            )

    if normalized_difficulty:
        if normalized_difficulty not in SUPPORTED_DIFFICULTIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported interview difficulty: "
                    f"{difficulty}"
                ),
            )

    candidates = QUESTION_BANK

    # --------------------------------------------------------
    # Exact category + difficulty
    # --------------------------------------------------------

    if normalized_category and normalized_difficulty:

        exact = [
            item
            for item in candidates
            if item["category"] == normalized_category
            and item["difficulty"] == normalized_difficulty
        ]

        if exact:
            return random.choice(exact)

    # --------------------------------------------------------
    # Category
    # --------------------------------------------------------

    if normalized_category:

        category_matches = [
            item
            for item in candidates
            if item["category"] == normalized_category
        ]

        if category_matches:

            if normalized_difficulty:

                difficulty_matches = [
                    item
                    for item in category_matches
                    if item["difficulty"]
                    == normalized_difficulty
                ]

                if difficulty_matches:
                    return random.choice(
                        difficulty_matches
                    )

            return random.choice(
                category_matches
            )

    # --------------------------------------------------------
    # Difficulty
    # --------------------------------------------------------

    if normalized_difficulty:

        difficulty_matches = [
            item
            for item in candidates
            if item["difficulty"]
            == normalized_difficulty
        ]

        if difficulty_matches:
            return random.choice(
                difficulty_matches
            )

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    return random.choice(
        QUESTION_BANK
    )


# ============================================================
# RESPONSE BUILDER
# ============================================================

def build_question_response(
    question: dict[str, Any],
) -> InterviewQuestionResponse:
    """
    Convert internal question data into the public API contract.
    """

    return InterviewQuestionResponse(
        question=question["question"],
        category=question["category"],
        difficulty=question["difficulty"],
        topic=question.get("topic"),
        expected_points=question.get(
            "expected_points",
            [],
        ),
    )


# ============================================================
# HEALTH
# ============================================================

@router.get(
    "/health",
    summary="Interview service health",
)
def interview_health() -> dict[str, Any]:
    """
    Public service health endpoint.
    """

    return {
        "service": "CareerMind AI Interview Intelligence",
        "status": "online",
        "version": "1.0.0",
        "question_bank_size": len(
            QUESTION_BANK
        ),
        "categories": len(
            SUPPORTED_CATEGORIES
        ),
        "difficulties": len(
            SUPPORTED_DIFFICULTIES
        ),
    }


# ============================================================
# GENERATE QUESTION
# ============================================================

@router.get(
    "/question",
    response_model=InterviewQuestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate an interview question",
)
def generate_interview_question(
    category: str | None = Query(
        default=None,
        description=(
            "technical, behavioral, hr, ai_ml, "
            "coding, system_design or general"
        ),
    ),
    difficulty: str | None = Query(
        default=None,
        description=(
            "easy, medium, hard or expert"
        ),
    ),
    current_user: User = Depends(
        get_current_user
    ),
) -> InterviewQuestionResponse:
    """
    Generate an authenticated interview question.
    """

    try:

        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        selected = select_question(
            category=category,
            difficulty=difficulty,
        )

        logger.info(
            "Interview question generated | "
            "user=%s category=%s difficulty=%s topic=%s",
            getattr(
                current_user,
                "id",
                "unknown",
            ),
            selected["category"],
            selected["difficulty"],
            selected.get("topic"),
        )

        return build_question_response(
            selected
        )

    except HTTPException:
        raise

    except Exception as exc:

        logger.exception(
            "Interview question generation failed: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to generate interview question."
            ),
        ) from exc


# ============================================================
# TECHNICAL QUESTION
# ============================================================

@router.get(
    "/technical",
    response_model=InterviewQuestionResponse,
    summary="Generate technical interview question",
)
def technical_question(
    current_user: User = Depends(
        get_current_user
    ),
) -> InterviewQuestionResponse:

    selected = select_question(
        category="technical"
    )

    return build_question_response(
        selected
    )


# ============================================================
# BEHAVIORAL QUESTION
# ============================================================

@router.get(
    "/behavioral",
    response_model=InterviewQuestionResponse,
    summary="Generate behavioral interview question",
)
def behavioral_question(
    current_user: User = Depends(
        get_current_user
    ),
) -> InterviewQuestionResponse:

    selected = select_question(
        category="behavioral"
    )

    return build_question_response(
        selected
    )


# ============================================================
# SYSTEM DESIGN QUESTION
# ============================================================

@router.get(
    "/system-design",
    response_model=InterviewQuestionResponse,
    summary="Generate system design interview question",
)
def system_design_question(
    current_user: User = Depends(
        get_current_user
    ),
) -> InterviewQuestionResponse:

    selected = select_question(
        category="system_design"
    )

    return build_question_response(
        selected
    )


# ============================================================
# CATEGORIES
# ============================================================

@router.get(
    "/categories",
    summary="Get interview categories and difficulties",
)
def interview_categories(
    current_user: User = Depends(
        get_current_user
    ),
) -> dict[str, Any]:

    return {
        "categories": sorted(
            SUPPORTED_CATEGORIES
        ),
        "difficulties": sorted(
            SUPPORTED_DIFFICULTIES
        ),
        "total_questions": len(
            QUESTION_BANK
        ),
    }


# ============================================================
# EVALUATION HELPERS
# ============================================================

def calculate_answer_score(
    answer: str,
    expected_points: list[str],
) -> tuple[float, list[str], list[str]]:
    """
    Lightweight deterministic evaluation engine.

    This is intentionally structured so it can later be replaced
    with an LLM evaluator without changing the frontend contract.
    """

    normalized_answer = answer.lower().strip()

    if not normalized_answer:
        return (
            0,
            [],
            expected_points,
        )

    matched: list[str] = []
    missing: list[str] = []

    keyword_map = {
        "problem": [
            "problem",
            "challenge",
            "issue",
        ],
        "dataset": [
            "dataset",
            "data",
        ],
        "preprocessing": [
            "preprocess",
            "cleaning",
            "missing",
        ],
        "model selection": [
            "model",
            "algorithm",
        ],
        "evaluation metrics": [
            "accuracy",
            "precision",
            "recall",
            "f1",
            "metric",
        ],
        "situation": [
            "situation",
            "context",
        ],
        "task": [
            "task",
            "responsibility",
        ],
        "action": [
            "action",
            "implemented",
            "developed",
            "built",
        ],
        "result": [
            "result",
            "achieved",
            "improved",
        ],
    }

    for point in expected_points:

        point_key = point.lower()

        keywords = keyword_map.get(
            point_key,
            [
                word
                for word in point_key.split()
                if len(word) > 3
            ],
        )

        found = any(
            keyword in normalized_answer
            for keyword in keywords
        )

        if found:
            matched.append(point)
        else:
            missing.append(point)

    coverage_score = (
        len(matched)
        / max(len(expected_points), 1)
    ) * 100

    # --------------------------------------------------------
    # Answer quality signals
    # --------------------------------------------------------

    length_bonus = 0

    if len(answer) >= 250:
        length_bonus = 8

    elif len(answer) >= 150:
        length_bonus = 5

    elif len(answer) >= 80:
        length_bonus = 2

    score = min(
        100,
        round(
            coverage_score * 0.82
            + length_bonus
        ),
    )

    strengths: list[str] = []

    if len(answer) >= 150:
        strengths.append(
            "Your answer provides reasonable detail."
        )

    if matched:
        strengths.append(
            "You addressed important interview concepts."
        )

    if any(
        word in normalized_answer
        for word in [
            "because",
            "therefore",
            "result",
            "impact",
        ]
    ):
        strengths.append(
            "You included reasoning or outcome-oriented language."
        )

    if not strengths:
        strengths.append(
            "You attempted to address the interview question."
        )

    improvements: list[str] = []

    if missing:
        improvements.append(
            "Cover more of the key points expected for this question."
        )

    if len(answer) < 100:
        improvements.append(
            "Add more specific technical or practical details."
        )

    if not any(
        word in normalized_answer
        for word in [
            "because",
            "therefore",
            "result",
            "impact",
        ]
    ):
        improvements.append(
            "Explain your reasoning and the outcome of your approach."
        )

    return (
        float(score),
        strengths,
        improvements,
    )


# ============================================================
# EVALUATE ANSWER
# ============================================================

@router.post(
    "/evaluate",
    response_model=InterviewEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate an interview answer",
)
def evaluate_interview_answer(
    payload: InterviewEvaluationRequest,
    current_user: User = Depends(
        get_current_user
    ),
) -> InterviewEvaluationResponse:
    """
    Evaluate a candidate's interview answer.

    Current implementation:
        Structured deterministic evaluation.

    Future implementation:
        Replace calculate_answer_score() with an LLM
        evaluation service.
    """

    try:

        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        question = payload.question.strip()
        answer = payload.answer.strip()

        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interview question cannot be empty.",
            )

        if len(answer) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Please provide a more detailed answer."
                ),
            )

        selected_question = None

        # ----------------------------------------------------
        # Find original question
        # ----------------------------------------------------

        for item in QUESTION_BANK:

            if (
                item["question"].strip()
                == question
            ):
                selected_question = item
                break

        # ----------------------------------------------------
        # Fallback question metadata
        # ----------------------------------------------------

        if selected_question is None:

            selected_question = {
                "category": (
                    normalize_text(
                        payload.category
                    )
                    or "general"
                ),
                "difficulty": (
                    normalize_text(
                        payload.difficulty
                    )
                    or "medium"
                ),
                "topic": "Interview Assessment",
                "expected_points": [],
            }

        expected_points = selected_question.get(
            "expected_points",
            [],
        )

        score, strengths, improvements = (
            calculate_answer_score(
                answer,
                expected_points,
            )
        )

        category = selected_question.get(
            "category",
            "general",
        )

        difficulty = selected_question.get(
            "difficulty",
            "medium",
        )

        # ----------------------------------------------------
        # Readiness recommendation
        # ----------------------------------------------------

        if score >= 90:

            recommendation = (
                "Excellent response. "
                "You demonstrate strong interview readiness."
            )

        elif score >= 80:

            recommendation = (
                "Strong response. "
                "Refine your examples and technical depth."
            )

        elif score >= 70:

            recommendation = (
                "Good foundation. "
                "Improve structure, specificity and evidence."
            )

        elif score >= 60:

            recommendation = (
                "Developing response. "
                "Practice structured answers and add more detail."
            )

        else:

            recommendation = (
                "Needs improvement. "
                "Focus on structured explanations and core concepts."
            )

        # ----------------------------------------------------
        # Confidence
        # ----------------------------------------------------

        confidence = min(
            100,
            max(
                20,
                round(
                    55
                    + (
                        score * 0.4
                    )
                ),
            ),
        )

        # ----------------------------------------------------
        # Feedback
        # ----------------------------------------------------

        feedback = (
            f"Your response scored {score:.0f}/100. "
            f"You covered {len(expected_points) - len(improvements)} "
            f"of the major evaluation signals identified for this question."
        )

        # ----------------------------------------------------
        # Ideal answer guidance
        # ----------------------------------------------------

        ideal_answer = (
            "Build your response using a clear structure. "
            "Explain the situation or problem, describe your "
            "technical approach, explain why you selected it, "
            "and finish with measurable results or lessons learned."
        )

        logger.info(
            "Interview answer evaluated | user=%s score=%s category=%s",
            getattr(
                current_user,
                "id",
                "unknown",
            ),
            score,
            category,
        )

        return InterviewEvaluationResponse(
            score=score,
            strengths=strengths,
            improvements=improvements,
            feedback=feedback,
            recommendation=recommendation,
            category=category,
            difficulty=difficulty,
            confidence=float(confidence),
            ideal_answer=ideal_answer,
            missing_points=(
                expected_points
                if expected_points
                else None
            ),
        )

    except HTTPException:
        raise

    except Exception as exc:

        logger.exception(
            "Interview evaluation failed: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to evaluate interview answer."
            ),
        ) from exc