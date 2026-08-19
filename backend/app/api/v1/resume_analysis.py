import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.resume import Resume
from app.models.user import User
from app.services.resume_analysis_service import (
    ResumeAnalysisService,
)


logger = logging.getLogger(
    "CareerMindAI.ResumeAnalysis"
)


router = APIRouter()


@router.get(
    "/{resume_id}",
    summary="Get Resume Analysis",
    status_code=status.HTTP_200_OK,
)
def get_resume_analysis(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        resume = (
            db.query(Resume)
            .filter(
                Resume.id == resume_id,
                Resume.user_id == current_user.id,
            )
            .first()
        )

        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found",
            )

        if not resume.is_processed:
            logger.info(
                "Resume has not been analyzed yet | resume=%s",
                resume.id,
            )

            result = (
                ResumeAnalysisService.analyze_resume(
                    db=db,
                    resume=resume,
                )
            )

            return {
                "success": True,
                "data": result,
                "message": (
                    "Resume analyzed successfully."
                ),
            }

        result = (
            ResumeAnalysisService.analyze_resume(
                db=db,
                resume=resume,
            )
        )

        return {
            "success": True,
            "data": result,
            "message": (
                "Resume analysis retrieved successfully."
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Resume analysis failed | resume=%s | error=%s",
            resume_id,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process resume analysis.",
        )