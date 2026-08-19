"""
CareerMind AI
============================================================

Resume Analysis Schemas

Defines Pydantic response models for:

- AI resume analysis
- ATS scoring
- AI resume scoring
- Skill extraction
- Experience detection
- Education detection
- Project detection
- Career insights
- Learning recommendations

Technology:
- Python
- Pydantic v2

============================================================
"""

from typing import List

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# Skill Analysis
# ============================================================

class SkillAnalysis(BaseModel):
    """
    Categorized skills extracted from a resume.
    """

    technical_skills: List[str] = Field(
        default_factory=list,
        description="Technical skills detected from the resume.",
    )

    programming_languages: List[str] = Field(
        default_factory=list,
        description="Programming languages detected.",
    )

    frameworks: List[str] = Field(
        default_factory=list,
        description="Frameworks and libraries detected.",
    )

    tools: List[str] = Field(
        default_factory=list,
        description="Development tools and platforms detected.",
    )

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# Career Insight
# ============================================================

class CareerInsight(BaseModel):
    """
    AI-generated career insights and recommendations.
    """

    strengths: List[str] = Field(
        default_factory=list,
        description="Strong areas identified in the resume.",
    )

    weaknesses: List[str] = Field(
        default_factory=list,
        description="Areas that need improvement.",
    )

    recommendations: List[str] = Field(
        default_factory=list,
        description="AI-generated resume and career recommendations.",
    )

    learning_path: List[str] = Field(
        default_factory=list,
        description="Recommended skills and technologies to learn.",
    )

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# Resume Analysis Response
# ============================================================

class ResumeAnalysisResponse(BaseModel):
    """
    Complete AI-powered resume analysis response.

    Expected endpoint:

        POST /api/v1/resume-analysis/{resume_id}

    """

    resume_id: str = Field(
        ...,
        description="Unique identifier of the analyzed resume.",
    )

    ats_score: int = Field(
        default=0,
        ge=0,
        le=100,
        description="ATS compatibility score from 0 to 100.",
    )

    ai_score: int = Field(
        default=0,
        ge=0,
        le=100,
        description="Overall AI resume quality score from 0 to 100.",
    )

    skills: SkillAnalysis = Field(
        default_factory=SkillAnalysis,
        description="Categorized skills extracted from the resume.",
    )

    experience: List[str] = Field(
        default_factory=list,
        description="Professional experience detected from the resume.",
    )

    education: List[str] = Field(
        default_factory=list,
        description="Education information detected from the resume.",
    )

    projects: List[str] = Field(
        default_factory=list,
        description="Projects detected from the resume.",
    )

    word_count: int = Field(
        default=0,
        ge=0,
        description="Total number of words detected in the resume.",
    )

    summary: str = Field(
        default="",
        description="AI-generated professional resume summary.",
    )

    career_insights: CareerInsight = Field(
        default_factory=CareerInsight,
        description="AI-generated career insights and recommendations.",
    )

    model_config = ConfigDict(
        from_attributes=True
    )