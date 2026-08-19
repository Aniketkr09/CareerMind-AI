"""
CareerMind AI

Security Module

Provides:
- Password hashing
- Password verification
- JWT creation
- JWT decoding
- Authentication helpers

Security Stack:
- bcrypt
- JWT
- OAuth2 Bearer Authentication
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# ==========================================================
# Logger
# ==========================================================

logger = logging.getLogger("CareerMindAI.Security")


# ==========================================================
# Password Hashing Configuration
# ==========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ==========================================================
# Password Utilities
# ==========================================================

def hash_password(password: str) -> str:
    """
    Convert a plain-text password into a secure password hash.

    Used during:
    - User registration
    """

    if not password:
        raise ValueError("Password cannot be empty.")

    try:
        return pwd_context.hash(password)

    except Exception as error:
        logger.exception("Password hashing failed")

        raise RuntimeError(
            "Unable to secure password."
        ) from error


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against its stored hash.

    Used during:
    - User login
    """

    if not plain_password or not hashed_password:
        return False

    try:
        return pwd_context.verify(
            plain_password,
            hashed_password,
        )

    except Exception as error:
        logger.warning(
            "Password verification failed: %s",
            error,
        )

        return False


# ==========================================================
# JWT Token Creation
# ==========================================================

def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT access token.

    Example payload:

    {
        "sub": "USER_UUID",
        "email": "user@example.com",
        "role": "student",
        "iat": "...",
        "exp": "...",
        "type": "access"
    }
    """

    try:
        # --------------------------------------------------
        # Copy original payload
        # --------------------------------------------------

        payload = data.copy()

        # --------------------------------------------------
        # Current UTC time
        # --------------------------------------------------

        now = datetime.now(timezone.utc)

        # --------------------------------------------------
        # Token expiration
        # --------------------------------------------------

        expire = now + (
            expires_delta
            or timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

        # --------------------------------------------------
        # JWT standard/custom claims
        # --------------------------------------------------

        payload.update(
            {
                "iat": now,
                "exp": expire,
                "type": "access",
            }
        )

        # --------------------------------------------------
        # Encode JWT
        # --------------------------------------------------

        token = jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )

        return token

    except Exception as error:
        logger.exception(
            "JWT creation failed"
        )

        raise RuntimeError(
            "Unable to create access token."
        ) from error


# ==========================================================
# JWT Token Decode
# ==========================================================

def decode_access_token(
    token: str,
) -> dict[str, Any]:
    """
    Validate and decode a JWT access token.

    Returns:
        Decoded JWT payload.

    Raises:
        ValueError:
            If the token is invalid, expired, malformed,
            missing user identity, or has an invalid type.
    """

    if not token:
        raise ValueError(
            "Access token is required."
        )

    try:
        # --------------------------------------------------
        # Decode and verify JWT
        # --------------------------------------------------

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[
                settings.ALGORITHM
            ],
        )

        # --------------------------------------------------
        # Validate user identity
        # --------------------------------------------------

        user_id = payload.get("sub")

        if not user_id:
            raise ValueError(
                "Token missing user identity."
            )

        # --------------------------------------------------
        # Validate token type
        # --------------------------------------------------

        token_type = payload.get("type")

        if token_type != "access":
            raise ValueError(
                "Invalid token type."
            )

        return payload

    except ValueError:
        raise

    except JWTError as error:
        logger.warning(
            "JWT validation failed: %s",
            error,
        )

        raise ValueError(
            "Invalid or expired access token."
        ) from error

    except Exception as error:
        logger.exception(
            "Unexpected JWT decoding error"
        )

        raise ValueError(
            "Unable to validate access token."
        ) from error