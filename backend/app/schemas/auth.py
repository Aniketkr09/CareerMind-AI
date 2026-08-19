"""
CareerMind AI

Authentication Schemas

Handles:
- Login validation
- JWT token response
- Authenticated user information

Technology:
- Pydantic v2
"""

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


# ==========================================================
# Login Request Schema
# ==========================================================

class LoginRequest(BaseModel):
    """
    User login request model.

    Used for:
    - Email validation
    - Password validation
    """

    email: EmailStr = Field(
        ...,
        description="Registered user email address.",
        examples=[
            "aniketkumar4908@gmail.com"
        ],
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User account password.",
        examples=[
            "SecurePassword123"
        ],
    )

    # ------------------------------------------------------
    # Password Validation
    # ------------------------------------------------------

    @field_validator("password")
    @classmethod
    def validate_password(
        cls,
        value: str,
    ) -> str:
        """
        Validate and normalize password input.
        """

        value = value.strip()

        if len(value) < 8:
            raise ValueError(
                "Password must contain at least 8 characters."
            )

        return value

    # ------------------------------------------------------
    # Pydantic Configuration
    # ------------------------------------------------------

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "email": "aniketkumar4908@gmail.com",
                "password": "SecurePassword123",
            }
        },
    )


# ==========================================================
# Authenticated User Response
# ==========================================================

class AuthUserResponse(BaseModel):
    """
    User information returned after successful authentication.
    """

    id: str = Field(
        ...,
        description="User unique identifier.",
    )

    full_name: str = Field(
        ...,
        description="User full name.",
    )

    email: EmailStr = Field(
        ...,
        description="User email address.",
    )

    role: str = Field(
        default="student",
        description="User role.",
    )

    is_active: bool = Field(
        default=True,
        description="Account active status.",
    )

    is_verified: bool = Field(
        default=False,
        description="Email verification status.",
    )

    # ------------------------------------------------------
    # Pydantic Configuration
    # ------------------------------------------------------

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# JWT Token Response
# ==========================================================

class TokenResponse(BaseModel):
    """
    JWT authentication response.

    Returned after successful login.

    Contains:
    - Access token
    - Token type
    - Authenticated user profile
    """

    access_token: str = Field(
        ...,
        description="JWT access token.",
    )

    token_type: str = Field(
        default="bearer",
        description="Authentication scheme.",
    )

    user: AuthUserResponse = Field(
        ...,
        description="Authenticated user information.",
    )

    # ------------------------------------------------------
    # Pydantic Configuration
    # ------------------------------------------------------

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIs...",
                "token_type": "bearer",
                "user": {
                    "id": "579ac718-d901-4893-9680-6d3c4b574990",
                    "full_name": "Aniket Kumar",
                    "email": "aniketkumar4908@gmail.com",
                    "role": "student",
                    "is_active": True,
                    "is_verified": False,
                },
            }
        },
    )