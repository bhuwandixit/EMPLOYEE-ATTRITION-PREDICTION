"""
SQLAlchemy ORM models for Employee Attrition Database.
Stores prediction audit history and employee roster records.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from backend.database import Base


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    employee_id = Column(String(50), nullable=True, index=True)
    
    # Selected key attributes logged for audit
    age = Column(Integer, nullable=True)
    department = Column(String(100), nullable=True)
    job_role = Column(String(100), nullable=True)
    monthly_income = Column(Float, nullable=True)
    years_at_company = Column(Float, nullable=True)
    overtime = Column(String(10), nullable=True)
    
    # Model predictions
    prediction = Column(String(10), nullable=False)      # "Yes" or "No"
    probability = Column(Float, nullable=False)          # e.g., 0.78
    risk_level = Column(String(20), nullable=False)      # "Low", "Medium", "High"
    top_factors = Column(JSON, nullable=True)            # Top explanatory signals


class EmployeeRecord(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    job_role = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    monthly_income = Column(Float, nullable=False)
    years_at_company = Column(Float, nullable=False)
    overtime = Column(String(10), nullable=False, default="No")
    business_travel = Column(String(50), default="Travel_Rarely")
    job_satisfaction = Column(Integer, default=3)
    work_life_balance = Column(Integer, default=3)
    
    # Latest assessment cache
    attrition_risk = Column(String(20), default="Low")
    probability = Column(Float, default=0.15)
    last_assessed = Column(DateTime, default=datetime.utcnow)
