"""
Database configuration and SQLAlchemy session factory.
Connects to PostgreSQL in production (AWS RDS / Docker) or SQLite for local dev.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Read DATABASE_URL or build from Postgres credentials
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    pg_user = os.getenv("POSTGRES_USER", "postgres")
    pg_password = os.getenv("POSTGRES_PASSWORD", "postgres")
    pg_host = os.getenv("POSTGRES_HOST", "localhost")
    pg_port = os.getenv("POSTGRES_PORT", "5432")
    pg_db = os.getenv("POSTGRES_DB", "attrition_db")
    
    # Try PostgreSQL first if explicit host provided, else fallback to SQLite for local ease
    if os.getenv("USE_POSTGRES", "false").lower() == "true":
        DATABASE_URL = f"postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_db}"
    else:
        DATABASE_URL = "sqlite:///./attrition.db"

# Adjust connect_args for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI Dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
