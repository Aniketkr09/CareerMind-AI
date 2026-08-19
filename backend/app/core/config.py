"""
CareerMind AI
Production Application Configuration

Responsibilities:
- Environment management
- Database configuration
- JWT security
- File handling
- AI feature control
- CORS configuration

Stack:
FastAPI + Pydantic Settings v2
"""


from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)



class Settings(BaseSettings):
    """
    Global application configuration.

    Values are loaded from:
    1. Environment variables
    2. .env file
    """


    # =====================================================
    # Application
    # =====================================================


    APP_NAME: str = "CareerMind AI"

    APP_VERSION: str = "1.0.0"

    ENVIRONMENT: str = "development"

    DEBUG: bool = True



    # =====================================================
    # Database
    # =====================================================


    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL connection URL"
    )



    # =====================================================
    # JWT Security
    # =====================================================


    SECRET_KEY: str = Field(
        ...,
        min_length=32,
        description="JWT encryption secret"
    )


    ALGORITHM: str = "HS256"


    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        ge=5,
        le=1440,
        description="JWT expiration time"
    )


    PASSWORD_MIN_LENGTH: int = 8



    # =====================================================
    # File Upload
    # =====================================================


    UPLOAD_DIR: str = "uploads/resumes"


    MAX_FILE_SIZE: int = (
        5 * 1024 * 1024
    )


    ALLOWED_FILE_TYPES: list[str] = [
        "pdf"
    ]



    # =====================================================
    # AI Modules
    # =====================================================


    AI_MODEL_NAME: str = (
        "CareerMind-AI"
    )


    ENABLE_RESUME_ANALYSIS: bool = True


    ENABLE_SKILL_GAP_ANALYSIS: bool = True


    ENABLE_INTERVIEW_AI: bool = True



    # =====================================================
    # Server
    # =====================================================


    HOST: str = "127.0.0.1"


    PORT: int = 8000



    # =====================================================
    # CORS
    # =====================================================


    CORS_ORIGINS: list[str] = [

        "http://localhost:5173",

        "http://127.0.0.1:5173",

        "http://localhost:3000",

        "http://127.0.0.1:3000",

    ]



    # =====================================================
    # Validators
    # =====================================================


    @field_validator(
        "ALLOWED_FILE_TYPES",
        mode="before"
    )
    @classmethod
    def parse_file_types(
        cls,
        value
    ):

        if isinstance(value, str):

            return [
                item.strip().lower()
                for item in value.split(",")
            ]

        return value



    @field_validator(
        "SECRET_KEY"
    )
    @classmethod
    def validate_secret_key(
        cls,
        value: str
    ):

        if len(value) < 32:

            raise ValueError(
                "SECRET_KEY must contain at least 32 characters"
            )

        return value



    # =====================================================
    # Pydantic Settings
    # =====================================================


    model_config = SettingsConfigDict(

        env_file=".env",

        env_file_encoding="utf-8",

        case_sensitive=True,

        extra="ignore"

    )



# =========================================================
# Singleton Settings Instance
# =========================================================


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings loader.
    """

    settings = Settings()


    # Create upload directory automatically

    Path(
        settings.UPLOAD_DIR
    ).mkdir(
        parents=True,
        exist_ok=True
    )


    return settings



settings = get_settings()