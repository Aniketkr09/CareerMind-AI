"""
CareerMind AI

Authentication API Routes

Handles:
- User registration
- User login
- JWT authentication
- Current user profile
"""

import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService


# ======================================================
# Logger
# ======================================================

logger = logging.getLogger("CareerMindAI.AuthRouter")


# ======================================================
# Router
# ======================================================

router = APIRouter(
    tags=["Authentication"],
)


# ======================================================
# Register User
# ======================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Create a new CareerMind AI user account.",
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):

    try:

        user = AuthService.create_user(
            db=db,
            user_data=user_data,
        )

        logger.info(
            "User registered successfully | %s",
            user.email,
        )

        return user

    except HTTPException:
        # Preserve HTTPExceptions raised by the service.
        raise

    except Exception as error:

        db.rollback()

        logger.exception(
            "Unexpected registration error"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected server error: {str(error)}",
        )


# ======================================================
# Login User
# ======================================================

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login User",
    description="Authenticate user and generate JWT access token.",
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    try:

        result = AuthService.login(
            db=db,
            email=form_data.username,
            password=form_data.password,
        )

        logger.info(
            "User logged in successfully | %s",
            form_data.username,
        )

        return result

    except HTTPException:
        raise

    except Exception as error:

        logger.exception(
            "Unexpected login error"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected server error: {str(error)}",
        )


# ======================================================
# Current User
# ======================================================

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current User Profile",
    description="Return authenticated user's profile.",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):

    return current_user