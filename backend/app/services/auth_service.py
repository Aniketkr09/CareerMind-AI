"""
CareerMind AI
Authentication Service Layer

Responsibilities:
- Create user account
- Authenticate users
- Generate JWT access tokens
- Handle authentication workflow

Technology:
- FastAPI
- SQLAlchemy 2.0
- PostgreSQL
- JWT
- bcrypt/passlib
"""

import logging
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.user import UserCreate


# ==========================================================
# LOGGER
# ==========================================================

logger = logging.getLogger("CareerMindAI.AuthService")


class AuthService:

    # ======================================================
    # CREATE USER
    # ======================================================

    @staticmethod
    def create_user(
        db: Session,
        user_data: UserCreate,
    ) -> User:
        """
        Create a new CareerMind AI user.

        Args:
            db: SQLAlchemy database session.
            user_data: Validated user registration data.

        Returns:
            Newly created User object.

        Raises:
            HTTPException:
                409 - Email already registered.
                500 - Database/unexpected error.
        """

        try:
            # --------------------------------------------------
            # Normalize input
            # --------------------------------------------------

            email = str(user_data.email).strip().lower()
            full_name = user_data.full_name.strip()

            # --------------------------------------------------
            # Validate required values
            # --------------------------------------------------

            if not full_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Full name cannot be empty.",
                )

            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email cannot be empty.",
                )

            # --------------------------------------------------
            # Check whether email already exists
            # --------------------------------------------------

            existing_user = db.execute(
                select(User).where(User.email == email)
            ).scalar_one_or_none()

            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email is already registered.",
                )

            # --------------------------------------------------
            # Hash password
            # --------------------------------------------------

            password_hash = hash_password(user_data.password)

            # --------------------------------------------------
            # Create user
            # --------------------------------------------------

            new_user = User(
                full_name=full_name,
                email=email,
                password_hash=password_hash,
                role="student",
                is_active=True,
                is_verified=False,
            )

            db.add(new_user)

            # --------------------------------------------------
            # Commit transaction
            # --------------------------------------------------

            db.commit()

            # --------------------------------------------------
            # Refresh object
            # --------------------------------------------------

            db.refresh(new_user)

            logger.info(
                "USER_CREATED | email=%s | user_id=%s",
                email,
                new_user.id,
            )

            return new_user

        # ------------------------------------------------------
        # Expected HTTP errors
        # ------------------------------------------------------

        except HTTPException:
            db.rollback()
            raise

        # ------------------------------------------------------
        # Database integrity errors
        # ------------------------------------------------------

        except IntegrityError as error:
            db.rollback()

            logger.exception(
                "USER_CREATE_INTEGRITY_ERROR | email=%s",
                email,
            )

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered.",
            ) from error

        # ------------------------------------------------------
        # SQLAlchemy errors
        # ------------------------------------------------------

        except SQLAlchemyError as error:
            db.rollback()

            logger.exception(
                "USER_CREATE_DATABASE_ERROR | email=%s",
                email,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while creating account.",
            ) from error

        # ------------------------------------------------------
        # Unexpected errors
        # ------------------------------------------------------

        except Exception as error:
            db.rollback()

            logger.exception(
                "USER_CREATE_UNEXPECTED_ERROR | email=%s",
                email,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to create account.",
            ) from error

    # ======================================================
    # AUTHENTICATE USER
    # ======================================================

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
    ) -> Optional[User]:
        """
        Authenticate a user using email and password.

        Returns:
            User object if authentication succeeds.
            None if credentials are invalid.
        """

        try:
            # --------------------------------------------------
            # Normalize email
            # --------------------------------------------------

            normalized_email = email.strip().lower()

            # --------------------------------------------------
            # Find user
            # --------------------------------------------------

            user = db.execute(
                select(User).where(
                    User.email == normalized_email
                )
            ).scalar_one_or_none()

            # --------------------------------------------------
            # User does not exist
            # --------------------------------------------------

            if not user:
                return None

            # --------------------------------------------------
            # Account disabled
            # --------------------------------------------------

            if not user.is_active:
                return None

            # --------------------------------------------------
            # Verify password
            # --------------------------------------------------

            password_valid = verify_password(
                password,
                user.password_hash,
            )

            if not password_valid:
                return None

            return user

        except SQLAlchemyError:
            logger.exception(
                "USER_AUTH_DATABASE_ERROR | email=%s",
                email,
            )
            return None

        except Exception:
            logger.exception(
                "USER_AUTH_UNEXPECTED_ERROR | email=%s",
                email,
            )
            return None

    # ======================================================
    # LOGIN
    # ======================================================

    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
    ) -> Dict[str, Any]:
        """
        Authenticate user and generate JWT access token.

        Returns:
            Dictionary containing:
            - access_token
            - token_type
            - user
        """

        # --------------------------------------------------
        # Authenticate
        # --------------------------------------------------

        user = AuthService.authenticate_user(
            db=db,
            email=email,
            password=password,
        )

        # --------------------------------------------------
        # Invalid credentials
        # --------------------------------------------------

        if not user:
            logger.warning(
                "LOGIN_FAILED | email=%s",
                email.strip().lower(),
            )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={
                    "WWW-Authenticate": "Bearer",
                },
            )

        # --------------------------------------------------
        # Create JWT token
        # --------------------------------------------------

        token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role,
            }
        )

        logger.info(
            "LOGIN_SUCCESS | email=%s | user_id=%s",
            user.email,
            user.id,
        )

        # --------------------------------------------------
        # Response
        # --------------------------------------------------

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
            },
        }