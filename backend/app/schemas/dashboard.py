"""
CareerMind AI

Dashboard Response Schemas

Provides:
- User profile overview
- Resume statistics
- AI scores
- Skill insights
- Career progress tracking

Technology:
Pydantic v2
"""


from typing import Optional, List

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
)



# ======================================================
# User Dashboard Profile
# ======================================================


class DashboardUser(BaseModel):

    """
    Authenticated user information.
    """

    name: str = Field(
        ...,
        description="User full name"
    )


    email: str = Field(
        ...,
        description="User email address"
    )


    model_config = ConfigDict(
        from_attributes=True
    )



# ======================================================
# Resume Dashboard
# ======================================================


class ResumeDashboard(BaseModel):

    """
    Resume analytics information.
    """


    uploaded: bool = Field(
        default=False,
        description="Resume upload status"
    )


    latestResume: Optional[str] = Field(
        default=None,
        description="Latest uploaded resume filename"
    )


    atsScore: float = Field(
        default=0,
        ge=0,
        le=100,
        description="ATS compatibility score"
    )


    aiScore: float = Field(
        default=0,
        ge=0,
        le=100,
        description="AI resume quality score"
    )


    processed: bool = Field(
        default=False,
        description="Resume AI processing status"
    )



# ======================================================
# Skills Dashboard
# ======================================================


class SkillsDashboard(BaseModel):

    """
    Resume skill statistics.
    """


    skillsDetected: int = Field(
        default=0,
        ge=0,
        description="Number of detected skills"
    )


    topSkills: List[str] = Field(
        default_factory=list,
        description="Most relevant detected skills"
    )



# ======================================================
# Career Dashboard
# ======================================================


class CareerDashboard(BaseModel):

    """
    Career growth metrics.
    """


    careerProgress: int = Field(
        default=0,
        ge=0,
        le=100,
        description="Career progress percentage"
    )


    interviewReadiness: int = Field(
        default=0,
        ge=0,
        le=100,
        description="Interview preparation score"
    )


# ======================================================
# Complete Dashboard Response
# ======================================================


class DashboardResponse(BaseModel):

    """
    Complete CareerMind AI dashboard response.
    """


    user: DashboardUser = Field(
        ...,
        description="User profile information"
    )


    resume: ResumeDashboard = Field(
        ...,
        description="Resume statistics"
    )


    skills: SkillsDashboard = Field(
        ...,
        description="Skill analysis information"
    )


    career: CareerDashboard = Field(
        ...,
        description="Career growth information"
    )


    message: str = Field(
        default="Dashboard generated successfully.",
        description="API response message"
    )


    model_config = ConfigDict(
        from_attributes=True
    )