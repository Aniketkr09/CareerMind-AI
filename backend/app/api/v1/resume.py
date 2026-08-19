"""
============================================================
CareerMind AI

Resume API Routes

Features
--------
• Upload Resume
• Get Latest Resume
• List User Resumes
• Get Resume Details
• Delete Resume

Author:
Aniket Kumar
============================================================
"""

import logging

from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.resume_service import ResumeService

logger = logging.getLogger("CareerMindAI.ResumeAPI")

# NOTE:
# main.py already uses:
# prefix="/api/v1/resume"
# Therefore DO NOT add prefix="/resume" here.
router = APIRouter(
    tags=["Resume"]
)

# ==========================================================
# Upload Resume
# POST /api/v1/resume/upload
# ==========================================================


@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    summary="Upload Resume",
)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resume = await ResumeService.upload_resume(
        db=db,
        file=file,
        user_id=current_user.id,
    )

    return {
        "message": "Resume uploaded successfully.",
        "resume": {
            "id": str(resume.id),
            "original_filename": resume.original_filename,
            "file_type": resume.file_type,
            "is_processed": resume.is_processed,
        },
    }


# ==========================================================
# Latest Resume
# GET /api/v1/resume/latest
# ==========================================================


@router.get(
    "/latest",
    summary="Get Latest Resume",
)
def get_latest_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resumes = ResumeService.get_user_resumes(
        db=db,
        user_id=current_user.id,
    )

    if not resumes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found.",
        )

    latest = resumes[0]

    return {
        "id": str(latest.id),
        "original_filename": latest.original_filename,
        "file_type": latest.file_type,
        "is_processed": latest.is_processed,
        "ats_score": latest.ats_score or 0,
        "ai_score": latest.ai_score or 0,
    }


# ==========================================================
# List User Resumes
# GET /api/v1/resume/
# ==========================================================


@router.get(
    "/",
    summary="List User Resumes",
)
def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resumes = ResumeService.get_user_resumes(
        db=db,
        user_id=current_user.id,
    )

    return {
        "total": len(resumes),
        "resumes": [
            {
                "id": str(resume.id),
                "original_filename": resume.original_filename,
                "file_type": resume.file_type,
                "ats_score": resume.ats_score or 0,
                "ai_score": resume.ai_score or 0,
                "is_processed": resume.is_processed,
            }
            for resume in resumes
        ],
    }


# ==========================================================
# Resume Details
# GET /api/v1/resume/{resume_id}
# ==========================================================


@router.get(
    "/{resume_id}",
    summary="Get Resume Details",
)
def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return ResumeService.get_resume(
        db=db,
        resume_id=resume_id,
        user_id=current_user.id,
    )


# ==========================================================
# Delete Resume
# DELETE /api/v1/resume/{resume_id}
# ==========================================================


@router.delete(
    "/{resume_id}",
    summary="Delete Resume",
)
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resume = ResumeService.get_resume(
        db=db,
        resume_id=resume_id,
        user_id=current_user.id,
    )

    return ResumeService.delete_resume(
        db=db,
        resume=resume,
    )