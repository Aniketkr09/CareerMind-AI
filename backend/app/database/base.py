"""
CareerMind AI

SQLAlchemy Base Configuration

Responsible for:
- ORM model foundation
- Metadata management
- Alembic migration support

Stack:
SQLAlchemy 2.0
PostgreSQL
FastAPI
"""


from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase



# ======================================================
# Naming Convention
# ======================================================

metadata = MetaData(

    naming_convention={

        "ix":
            "ix_%(column_0_label)s",

        "uq":
            "uq_%(table_name)s_%(column_0_name)s",

        "ck":
            "ck_%(table_name)s_%(constraint_name)s",

        "fk":
            "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",

        "pk":
            "pk_%(table_name)s",

    }

)



# ======================================================
# Base Model Class
# ======================================================


class Base(DeclarativeBase):
    """
    Base class for all CareerMind AI models.

    Every SQLAlchemy model inherits from this.

    Example:

        class User(Base):
            __tablename__ = "users"

    """


    metadata = metadata



    def __repr__(self):
        """
        Default readable representation.
        """

        return (
            f"<{self.__class__.__name__}>"
        )