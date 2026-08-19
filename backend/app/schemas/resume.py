"""
CareerMind AI

Resume Schemas

Handles:
- Resume upload response
- Resume details
- Resume status
- Resume metadata

Technology:
Pydantic v2
"""


from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)





# ======================================================
# Resume Upload Response
# ======================================================


class ResumeResponse(BaseModel):
    """
    Response after successful resume upload.

    Used by:

    POST /api/v1/resume/upload
    """


    id: UUID = Field(

        ...,

        description="Resume unique identifier"

    )


    original_filename: str = Field(

        ...,

        description="Original uploaded filename"

    )


    file_type: str = Field(

        ...,

        description="Uploaded resume format"

    )


    is_processed: bool = Field(

        default=False,

        description="AI processing status"

    )


    created_at: datetime = Field(

        ...,

        description="Upload timestamp"

    )



    model_config = ConfigDict(

        from_attributes=True

    )





# ======================================================
# Resume Detail Response
# ======================================================


class ResumeDetailResponse(BaseModel):
    """
    Complete resume information.

    Used internally and for authenticated users.
    """


    id: UUID


    user_id: UUID



    original_filename: str



    stored_filename: str



    file_type: str



    extracted_text: str | None = Field(

        default=None,

        description="Extracted resume content"

    )



    is_processed: bool



    created_at: datetime



    updated_at: datetime | None = None



    model_config = ConfigDict(

        from_attributes=True

    )





# ======================================================
# Resume List Response
# ======================================================


class ResumeListResponse(BaseModel):
    """
    User resume history response.
    """


    total: int = Field(

        default=0,

        description="Total uploaded resumes"

    )


    resumes: list[ResumeResponse] = Field(

        default_factory=list,

        description="Uploaded resume list"

    )



    model_config = ConfigDict(

        from_attributes=True

    )





# ======================================================
# Resume Processing Status
# ======================================================


class ResumeStatusResponse(BaseModel):
    """
    Resume AI processing status.
    """


    resume_id: UUID



    status: str = Field(

        ...,

        examples=[

            "uploaded",

            "processing",

            "completed",

            "failed"

        ]

    )



    message: str





    model_config = ConfigDict(

        from_attributes=True

    )