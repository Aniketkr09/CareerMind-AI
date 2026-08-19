"""
CareerMind AI

Authentication Dependencies

Handles:
- JWT Bearer Authentication
- Access Token Validation
- Current User Retrieval
- Account Security Checks

Authentication Flow:

Frontend
    |
    | Bearer Token
    ↓
OAuth2PasswordBearer
    |
    ↓
Decode JWT
    |
    ↓
Validate User UUID
    |
    ↓
Query Database
    |
    ↓
Validate Account
    |
    ↓
Return Current User
"""

import logging
from uuid import UUID

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    OAuth2PasswordBearer,
)

from sqlalchemy.orm import Session

from app.core.security import (
    decode_access_token,
)

from app.database.database import (
    get_db,
)

from app.models.user import (
    User,
)


# ==========================================================
# Logger
# ==========================================================

logger = logging.getLogger(
    "CareerMindAI.Auth"
)


# ==========================================================
# OAuth2 Configuration
# ==========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=True,
    description=(
        "JWT access token required. "
        "Login first and provide the Bearer token."
    ),
)


# ==========================================================
# Authentication Error Helper
# ==========================================================

def authentication_error(
    message: str = "Invalid authentication credentials.",
) -> HTTPException:
    """
    Create a standardized authentication error.
    """

    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )


# ==========================================================
# Current User Dependency
# ==========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Get the currently authenticated user.

    Authentication steps:

    1. Receive Bearer token.
    2. Decode and validate JWT.
    3. Extract user UUID from `sub`.
    4. Validate UUID format.
    5. Find user in database.
    6. Verify account is active.
    7. Return User object.

    Used by protected endpoints such as:

    - /api/v1/auth/me
    - /api/v1/resume/upload
    - /api/v1/resume/latest
    - /api/v1/resume-analysis/*
    """

    # ======================================================
    # Decode JWT
    # ======================================================

    try:
        payload = decode_access_token(token)

    except ValueError as error:
        logger.warning(
            "JWT validation failed: %s",
            error,
        )

        raise authentication_error(
            "Invalid or expired access token."
        ) from error

    except Exception as error:
        logger.exception(
            "Unexpected authentication error"
        )

        raise authentication_error() from error

    # ======================================================
    # Validate Payload
    # ======================================================

    if not payload:
        raise authentication_error()

    # ======================================================
    # Extract User ID
    # ======================================================

    user_id = payload.get("sub")

    if not user_id:
        logger.warning(
            "JWT missing subject/user identity"
        )

        raise authentication_error(
            "Token missing user identity."
        )

    # ======================================================
    # Convert Subject to UUID
    # ======================================================

    try:
        user_uuid = UUID(str(user_id))

    except (ValueError, TypeError, AttributeError) as error:
        logger.warning(
            "Invalid user UUID in JWT: %s",
            user_id,
        )

        raise authentication_error(
            "Invalid user identifier."
        ) from error

    # ======================================================
    # Retrieve User
    # ======================================================

    try:
        user = (
            db.query(User)
            .filter(User.id == user_uuid)
            .first()
        )

    except Exception as error:
        logger.exception(
            "Database error while retrieving authenticated user"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to verify user account.",
        ) from error

    # ======================================================
    # User Not Found
    # ======================================================

    if not user:
        logger.warning(
            "Authenticated user not found | user_id=%s",
            user_uuid,
        )

        raise authentication_error(
            "User account not found."
        )

    # ======================================================
    # Account Status
    # ======================================================

    if not user.is_active:
        logger.warning(
            "Inactive account attempted authentication | user_id=%s",
            user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive.",
        )

    # ======================================================
    # Authentication Successful
    # ======================================================

    logger.debug(
        "Authenticated user | user_id=%s | email=%s",
        user.id,
        user.email,
    )

    return user