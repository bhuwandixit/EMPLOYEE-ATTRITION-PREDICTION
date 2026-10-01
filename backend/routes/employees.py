"""
API routes for employee roster management and risk monitoring.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models import EmployeeRecord
from backend.schemas import EmployeeCreate, EmployeeResponse
from backend.utils.logger import logger

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
):
    """Enrolls a new employee in the workforce registry."""
    existing = db.query(EmployeeRecord).filter(EmployeeRecord.employee_id == payload.employee_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee ID '{payload.employee_id}' is already registered.",
        )
        
    new_emp = EmployeeRecord(
        employee_id=payload.employee_id,
        name=payload.name,
        department=payload.department,
        job_role=payload.job_role,
        age=payload.age,
        monthly_income=payload.monthly_income,
        years_at_company=payload.years_at_company,
        overtime=payload.overtime,
        business_travel=payload.business_travel,
        job_satisfaction=payload.job_satisfaction,
        work_life_balance=payload.work_life_balance,
        last_assessed=datetime.utcnow(),
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    logger.info(f"Registered employee {payload.employee_id} ({payload.name})")
    return new_emp


@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    search: Optional[str] = Query(None, description="Search by name, ID, or job role"),
    department: Optional[str] = Query(None, description="Filter by department"),
    risk_level: Optional[str] = Query(None, description="Filter by risk: Low, Medium, High"),
    sort_by: str = Query("id", regex="^(id|name|monthly_income|years_at_company|probability)$"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Lists employees with full search, department/risk filtering, sorting, and pagination."""
    query = db.query(EmployeeRecord)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                EmployeeRecord.name.ilike(search_filter),
                EmployeeRecord.employee_id.ilike(search_filter),
                EmployeeRecord.job_role.ilike(search_filter),
            )
        )
        
    if department:
        query = query.filter(EmployeeRecord.department == department)
        
    if risk_level:
        query = query.filter(EmployeeRecord.attrition_risk == risk_level.capitalize())
        
    col = getattr(EmployeeRecord, sort_by)
    if sort_order == "desc":
        query = query.order_by(col.desc())
    else:
        query = query.order_by(col.asc())
        
    employees = query.offset(offset).limit(limit).all()
    return employees


@router.get("/{id}", response_model=EmployeeResponse)
def get_employee(
    id: int,
    db: Session = Depends(get_db),
):
    """Retrieves employee profile by database primary key."""
    emp = db.query(EmployeeRecord).filter(EmployeeRecord.id == id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return emp


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
):
    """Removes employee from roster."""
    emp = db.query(EmployeeRecord).filter(EmployeeRecord.id == id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
    db.delete(emp)
    db.commit()
    logger.info(f"Removed employee record ID={id}")
    return None
