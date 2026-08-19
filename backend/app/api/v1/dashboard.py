"""
CareerMind AI

Dashboard API

Provides:
- User career overview
- Resume statistics
- AI scores
- Skill insights
- Career progress

Architecture:
FastAPI + PostgreSQL + SQLAlchemy
"""


import logging


from fastapi import (
    APIRouter,
    Depends,
)


from sqlalchemy.orm import Session


from app.database.database import get_db


from app.dependencies.auth import (
    get_current_user
)


from app.models.user import User


from app.models.resume import Resume





# ======================================================
# Logger
# ======================================================


logger = logging.getLogger(
    "CareerMindAI.Dashboard"
)




# ======================================================
# Router
# ======================================================
#
# Prefix handled in main.py
#
# /api/v1/dashboard
#


router = APIRouter(

    tags=[

        "Dashboard"

    ]

)




# ======================================================
# Dashboard Endpoint
# ======================================================


@router.get(

    "/",

    summary="Get User Dashboard",

    description="""

Returns personalized CareerMind AI dashboard.

Includes:

- Resume status
- ATS score
- AI resume score
- Skills detected
- Career progress
- Interview readiness

"""

)
def get_dashboard(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    )

):


    """
    Generate authenticated user's dashboard.
    """



    # ----------------------------------------------
    # Get Latest Resume
    # ----------------------------------------------


    latest_resume = (

        db.query(Resume)

        .filter(

            Resume.user_id ==
            current_user.id

        )

        .order_by(

            Resume.created_at.desc()

        )

        .first()

    )




    # ----------------------------------------------
    # Default Values
    # ----------------------------------------------


    resume_uploaded = False

    ats_score = 0

    ai_score = 0

    skills_detected = 0

    latest_resume_name = None




    # ----------------------------------------------
    # Resume Data
    # ----------------------------------------------


    if latest_resume:


        resume_uploaded = True


        latest_resume_name = (

            latest_resume.original_filename

        )


        ats_score = (

            latest_resume.ats_score
            or 0

        )


        ai_score = (

            latest_resume.ai_score
            or 0

        )



        if latest_resume.extracted_text:


            words = (

                latest_resume.extracted_text

                .split()

            )


            skills_detected = len(

                set(words)

            )




    # ----------------------------------------------
    # Career Metrics
    # ----------------------------------------------


    career_progress = min(

        100,

        int(

            (

                ats_score +

                ai_score

            ) / 2

        )

    )



    interview_readiness = min(

        100,

        int(

            career_progress * 0.8

        )

    )




    logger.info(

        "Dashboard generated | user=%s",

        current_user.email

    )





    return {


        "user": {


            "name":

                current_user.full_name,


            "email":

                current_user.email

        },



        "resume": {


            "uploaded":

                resume_uploaded,


            "latestResume":

                latest_resume_name,


            "atsScore":

                ats_score,


            "aiScore":

                ai_score

        },



        "skills": {


            "skillsDetected":

                skills_detected

        },



        "career": {


            "careerProgress":

                career_progress,


            "interviewReadiness":

                interview_readiness

        },


        "message":

            "CareerMind AI dashboard generated successfully."

    }