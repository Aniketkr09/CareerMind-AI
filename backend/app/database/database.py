"""
CareerMind AI

Database Management Layer

Provides:

- PostgreSQL connection
- SQLAlchemy 2.0 engine
- Database sessions
- FastAPI dependency injection


Stack:

FastAPI
SQLAlchemy 2.0
PostgreSQL
"""


import logging

from collections.abc import Generator


from sqlalchemy import create_engine

from sqlalchemy.orm import (
    Session,
    sessionmaker,
)


from app.core.config import settings




# ======================================================
# Logger
# ======================================================


logger = logging.getLogger(
    "CareerMindAI.Database"
)





# ======================================================
# Database URL
# ======================================================


DATABASE_URL = settings.DATABASE_URL





# ======================================================
# Engine Configuration
# ======================================================


engine_kwargs = {


    # SQL logging

    "echo":
        settings.DEBUG,


    # Detect broken connections

    "pool_pre_ping":
        True,


    # Keep connections alive

    "pool_recycle":
        1800,


    # SQLAlchemy 2.0 mode

    "future":
        True,


}





# PostgreSQL Optimized Pool


if DATABASE_URL.startswith(
    "postgresql"
):


    engine_kwargs.update(

        {


            "pool_size":
                10,


            "max_overflow":
                20,


            "pool_timeout":
                30,


        }

    )





# ======================================================
# Create Engine
# ======================================================


engine = create_engine(

    DATABASE_URL,

    **engine_kwargs

)



logger.info(
    "PostgreSQL database engine initialized"
)





# ======================================================
# Session Factory
# ======================================================


SessionLocal = sessionmaker(


    bind=engine,


    class_=Session,


    autoflush=False,


    autocommit=False,


    expire_on_commit=False,


)





# ======================================================
# FastAPI Database Dependency
# ======================================================


def get_db() -> Generator[Session, None, None]:
    """
    Provides database session.

    Flow:

    Request
       |
       ↓
    Create Session
       |
       ↓
    API executes query
       |
       ↓
    Service handles commit/rollback
       |
       ↓
    Close Session


    Usage:

    db: Session = Depends(get_db)

    """


    db = SessionLocal()


    try:


        yield db



    except Exception as error:


        db.rollback()


        logger.exception(

            "Database session error: %s",

            error

        )


        raise



    finally:


        db.close()



        logger.debug(
            "Database session closed"
        )