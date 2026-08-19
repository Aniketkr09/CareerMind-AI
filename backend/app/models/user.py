"""
CareerMind AI

User Database Model

Stores:
- User authentication information
- Profile details
- Career preferences
- Account status

Technology:
SQLAlchemy 2.0 ORM
PostgreSQL UUID
"""


import uuid

from datetime import datetime

from typing import TYPE_CHECKING


from sqlalchemy import (

    String,

    Boolean,

    DateTime,

    text,

    func,

)

from sqlalchemy.dialects.postgresql import UUID


from sqlalchemy.orm import (

    Mapped,

    mapped_column,

    relationship,

)


from app.database.base import Base




if TYPE_CHECKING:

    from app.models.resume import Resume






class User(Base):

    """
    User ORM Model.


    Represents CareerMind AI users.

    Example roles:

    - student
    - professional
    - recruiter

    """


    __tablename__ = "users"




    # ==================================================
    # Primary Key
    # ==================================================


    id: Mapped[uuid.UUID] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4,

        nullable=False,

    )





    # ==================================================
    # User Information
    # ==================================================


    full_name: Mapped[str] = mapped_column(

        String(100),

        nullable=False,

    )



    email: Mapped[str] = mapped_column(

        String(255),

        unique=True,

        index=True,

        nullable=False,

    )





    # ==================================================
    # Authentication
    # ==================================================


    password_hash: Mapped[str] = mapped_column(

        String(255),

        nullable=False,

    )





    # ==================================================
    # User Role
    # ==================================================


    role: Mapped[str] = mapped_column(

        String(20),

        nullable=False,

        default="student",

        server_default="student",

        index=True,

    )





    # ==================================================
    # Account Status
    # ==================================================


    is_active: Mapped[bool] = mapped_column(

        Boolean,

        nullable=False,

        default=True,

        server_default=text("true"),

    )



    is_verified: Mapped[bool] = mapped_column(

        Boolean,

        nullable=False,

        default=False,

        server_default=text("false"),

    )





    # ==================================================
    # Career Profile
    # ==================================================


    career_goal: Mapped[str | None] = mapped_column(

        String(100),

        nullable=True,

    )



    experience_level: Mapped[str | None] = mapped_column(

        String(50),

        nullable=True,

    )





    # ==================================================
    # Timestamps
    # ==================================================


    created_at: Mapped[datetime] = mapped_column(

        DateTime(timezone=True),

        nullable=False,

        server_default=func.now(),

    )



    updated_at: Mapped[datetime] = mapped_column(

        DateTime(timezone=True),

        nullable=False,

        server_default=func.now(),

        onupdate=func.now(),

    )





    # ==================================================
    # Relationships
    # ==================================================


    resumes: Mapped[list["Resume"]] = relationship(

        "Resume",

        back_populates="user",

        cascade="all, delete-orphan",

        lazy="selectin",

    )





    # ==================================================
    # Representation
    # ==================================================


    def __repr__(self) -> str:

        return (

            f"<User "

            f"id={self.id} "

            f"email={self.email}>"

        )