"""
Prediction business logic service.
Executes inference, computes risk tiers, records audit history into PostgreSQL.
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models import PredictionHistory, EmployeeRecord
from backend.schemas import EmployeePredictInput, PredictionResponse
from backend.utils.logger import logger
from ml.predict import AttritionPredictor


def execute_prediction(
    input_data: EmployeePredictInput,
    predictor: AttritionPredictor,
    db: Session,
    low_thresh: float = 0.30,
    high_thresh: float = 0.60,
) -> PredictionResponse:
    """
    Executes ML inference on employee features, logs prediction to DB,
    and returns standardized response.
    """
    payload_dict = input_data.model_dump()
    logger.info(f"Received prediction request for Department={input_data.Department}, Role={input_data.JobRole}")
    
    result = predictor.predict_single(
        emp_data=payload_dict,
        low_threshold=low_thresh,
        high_threshold=high_thresh,
    )
    
    # Audit log to Database
    try:
        history_entry = PredictionHistory(
            employee_id=input_data.EmployeeId,
            age=input_data.Age,
            department=input_data.Department,
            job_role=input_data.JobRole,
            monthly_income=input_data.MonthlyIncome,
            years_at_company=float(input_data.YearsAtCompany),
            overtime=input_data.OverTime,
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"],
            top_factors=result["top_explanatory_factors"],
        )
        db.add(history_entry)
        
        # If employee_id is registered in employees table, update their cached assessment
        if input_data.EmployeeId:
            emp = db.query(EmployeeRecord).filter(EmployeeRecord.employee_id == input_data.EmployeeId).first()
            if emp:
                emp.attrition_risk = result["risk_level"]
                emp.probability = result["probability"]
                
        db.commit()
    except Exception as e:
        logger.error(f"Error persisting prediction history to database: {e}")
        db.rollback()
        
    return PredictionResponse(**result)
