"""
CareerMind AI

Resume Database Model

Stores uploaded resumes and AI-generated insights.

Features:
- Resume file metadata
- Extracted resume text
- ATS score
- AI score
- Processing status
- User relationship

Technology:
- SQLAlchemy 2.0
- PostgreSQL
"""

from __future__ import annotations

import uuid

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base



class Resume(Base):

    """
    Resume model.

    Stores uploaded resume files
    and AI analysis results.
    """

    __tablename__ = "resumes"


    # -------------------------
    # Primary Key
    # -------------------------

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )


    # -------------------------
    # User Relationship
    # -------------------------

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True,
    )


    # -------------------------
    # Resume File Information
    # -------------------------

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )


    stored_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )


    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )


    file_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )


    file_size: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )


    # -------------------------
    # Extracted Resume Content
    # -------------------------

    extracted_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


    # -------------------------
    # Processing Status
    # -------------------------

    is_processed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
    )


    # -------------------------
    # AI Analysis Results
    # -------------------------

    ats_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )


    ai_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )


    # -------------------------
    # Timestamps
    # -------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


    # -------------------------
    # Relationship
    # -------------------------

    user: Mapped["User"] = relationship(
        "User",
        back_populates="resumes",
    )


    def __repr__(self) -> str:

        return (
            f"<Resume("
            f"id={self.id}, "
            f"filename={self.original_filename}"
            f")>"
        )