"""
API routes for model inference, batch scoring, and prediction history.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.dependencies import get_predictor
from backend.models import PredictionHistory
from backend.schemas import (
    EmployeePredictInput,
    PredictionResponse,
    PredictionHistoryRecord,
    RiskThresholdConfig,
)
from backend.services.prediction_service import execute_prediction
from backend.utils.logger import logger
from ml.predict import AttritionPredictor

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post(
    "",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict single employee attrition risk",
)
def predict_employee_attrition(
    payload: EmployeePredictInput,
    low_thresh: float = Query(0.30, ge=0.05, le=0.50, description="Threshold for Low vs Medium Risk"),
    high_thresh: float = Query(0.60, ge=0.50, le=0.95, description="Threshold for Medium vs High Risk"),
    db: Session = Depends(get_db),
    predictor: AttritionPredictor = Depends(get_predictor),
):
    """
    Evaluates individual employee features and computes predicted probability of leaving,
    risk classification, and top driving factors.
    """
    try:
        response = execute_prediction(
            input_data=payload,
            predictor=predictor,
            db=db,
            low_thresh=low_thresh,
            high_thresh=high_thresh,
        )
        return response
    except Exception as e:
        logger.error(f"Inference execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}",
        )


@router.get(
    "/history",
    response_model=List[PredictionHistoryRecord],
    summary="Retrieve prediction audit history",
)
def get_prediction_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    risk_level: Optional[str] = Query(None, description="Filter by risk tier: Low, Medium, High"),
    db: Session = Depends(get_db),
):
    """Retrieves chronological history of prediction evaluations with pagination and filtering."""
    query = db.query(PredictionHistory)
    if risk_level:
        query = query.filter(PredictionHistory.risk_level == risk_level.capitalize())
        
    records = query.order_by(PredictionHistory.timestamp.desc()).offset(offset).limit(limit).all()
    return records
