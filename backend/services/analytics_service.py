"""
Analytics business logic service.
Aggregates workforce attrition metrics, risk breakdowns, and distributions.
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import PredictionHistory, EmployeeRecord
from backend.schemas import DashboardSummary


def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    """Calculates live KPI metrics and distributions across active employees and prediction history."""
    total_emps = db.query(EmployeeRecord).count()
    if total_emps == 0:
        # Initial fallback baseline
        return {
            "total_employees": 1470,
            "high_risk_count": 237,
            "medium_risk_count": 396,
            "low_risk_count": 837,
            "avg_attrition_probability": 0.245,
            "department_distribution": [
                {"department": "Research & Development", "count": 961, "risk_rate": 0.138},
                {"department": "Sales", "count": 446, "risk_rate": 0.206},
                {"department": "Human Resources", "count": 63, "risk_rate": 0.190},
            ],
            "job_role_distribution": [
                {"role": "Sales Executive", "risk_rate": 0.174},
                {"role": "Research Scientist", "risk_rate": 0.161},
                {"role": "Laboratory Technician", "risk_rate": 0.239},
                {"role": "Manufacturing Director", "risk_rate": 0.069},
                {"role": "Healthcare Representative", "risk_rate": 0.068},
                {"role": "Manager", "risk_rate": 0.049},
                {"role": "Sales Representative", "risk_rate": 0.398},
                {"role": "Research Director", "risk_rate": 0.025},
                {"role": "Human Resources", "risk_rate": 0.230},
            ],
            "overtime_distribution": [
                {"overtime": "Yes", "attrition_pct": 30.5, "count": 416},
                {"overtime": "No", "attrition_pct": 10.4, "count": 1054},
            ],
            "recent_predictions": [],
        }

    high_risk = db.query(EmployeeRecord).filter(EmployeeRecord.attrition_risk == "High").count()
    med_risk = db.query(EmployeeRecord).filter(EmployeeRecord.attrition_risk == "Medium").count()
    low_risk = db.query(EmployeeRecord).filter(EmployeeRecord.attrition_risk == "Low").count()
    avg_prob = db.query(func.avg(EmployeeRecord.probability)).scalar() or 0.24

    # Department breakdown
    dept_stats = (
        db.query(
            EmployeeRecord.department,
            func.count(EmployeeRecord.id),
            func.avg(EmployeeRecord.probability),
        )
        .group_by(EmployeeRecord.department)
        .all()
    )
    dept_distribution = [
        {"department": dept, "count": cnt, "risk_rate": round(float(avg_p or 0), 3)}
        for dept, cnt, avg_p in dept_stats
    ]

    # Role breakdown
    role_stats = (
        db.query(
            EmployeeRecord.job_role,
            func.avg(EmployeeRecord.probability),
        )
        .group_by(EmployeeRecord.job_role)
        .all()
    )
    role_distribution = [
        {"role": role, "risk_rate": round(float(avg_p or 0), 3)}
        for role, avg_p in role_stats
    ]

    # Overtime breakdown
    ot_stats = (
        db.query(
            EmployeeRecord.overtime,
            func.count(EmployeeRecord.id),
            func.avg(EmployeeRecord.probability),
        )
        .group_by(EmployeeRecord.overtime)
        .all()
    )
    ot_distribution = [
        {"overtime": ot, "count": cnt, "attrition_pct": round(float((avg_p or 0) * 100), 1)}
        for ot, cnt, avg_p in ot_stats
    ]

    recent_preds = (
        db.query(PredictionHistory)
        .order_by(PredictionHistory.timestamp.desc())
        .limit(10)
        .all()
    )

    return {
        "total_employees": total_emps,
        "high_risk_count": high_risk,
        "medium_risk_count": med_risk,
        "low_risk_count": low_risk,
        "avg_attrition_probability": round(float(avg_prob), 3),
        "department_distribution": dept_distribution,
        "job_role_distribution": role_distribution,
        "overtime_distribution": ot_distribution,
        "recent_predictions": recent_preds,
    }
