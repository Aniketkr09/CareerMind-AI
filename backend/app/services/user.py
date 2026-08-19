"""
CareerMind AI

User Schemas

Handles:
- User registration validation
- User API responses
- Public user profile representation

Technology:
- Pydantic v2
- FastAPI
"""


from datetime import datetime
from uuid import UUID


from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)





# ==========================================================
# User Registration Request Schema
# ==========================================================


class UserCreate(BaseModel):
    """
    Schema for creating a new user account.
    """


    full_name: str = Field(

        ...,

        min_length=2,

        max_length=100,

        description="User full name",

        examples=[
            "Aniket Kumar"
        ]

    )



    email: EmailStr = Field(

        ...,

        description="User email address",

        examples=[
            "aniket@example.com"
        ]

    )



    password: str = Field(

        ...,

        min_length=8,

        max_length=128,

        description="Account password",

        examples=[
            "StrongPassword@123"
        ]

    )





    @field_validator("full_name")
    @classmethod
    def validate_full_name(
        cls,
        value: str
    ) -> str:


        value = value.strip()


        if len(value.split()) < 2:

            raise ValueError(
                "Please enter your full name."
            )


        return value






    @field_validator("password")
    @classmethod
    def validate_password(
        cls,
        value: str
    ) -> str:


        value = value.strip()



        if " " in value:

            raise ValueError(
                "Password cannot contain spaces."
            )



        if not any(
            char.isupper()
            for char in value
        ):

            raise ValueError(
                "Password must contain at least one uppercase letter."
            )



        if not any(
            char.islower()
            for char in value
        ):

            raise ValueError(
                "Password must contain at least one lowercase letter."
            )



        if not any(
            char.isdigit()
            for char in value
        ):

            raise ValueError(
                "Password must contain at least one number."
            )


        return value






    model_config = ConfigDict(

        extra="forbid",

        str_strip_whitespace=True,

        json_schema_extra={

            "example": {

                "full_name":
                    "Aniket Kumar",

                "email":
                    "aniket@example.com",

                "password":
                    "StrongPassword@123"

            }

        }

    )







# ==========================================================
# User Response Schema
# ==========================================================


class UserResponse(BaseModel):
    """
    Public user information returned by API.
    """


    id: UUID


    full_name: str


    email: EmailStr


    role: str


    is_active: bool


    is_verified: bool


    created_at: datetime



    model_config = ConfigDict(

        from_attributes=True

    )







# ==========================================================
# User Profile Schema
# ==========================================================


class UserProfile(BaseModel):
    """
    Authenticated user profile response.
    """


    id: UUID


    full_name: str


    email: EmailStr


    role: str



    model_config = ConfigDict(

        from_attributes=True

    )