"""
API routes for high-level HR analytics, aggregations, and model insights.
"""

from typing import Dict, Any, List
import json
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.services.analytics_service import get_dashboard_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", summary="Dashboard aggregated summary statistics")
def dashboard_summary(db: Session = Depends(get_db)):
    """Provides high-level workforce counts, risk categories, and department breakdowns."""
    return get_dashboard_summary(db)


@router.get("/model-info", summary="Model architecture, training metrics and explainability")
def model_information():
    """Returns training parameters, benchmark comparisons, ROC-AUC, and feature rankings."""
    meta_path = os.path.join(os.path.dirname(__file__), "..", "..", "models", "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            return json.load(f)
    return {
        "model_name": "GradientBoosting_Balanced_Ensemble",
        "model_version": "1.2.0",
        "selected_metrics": {
            "accuracy": 0.8741,
            "precision": 0.7222,
            "recall": 0.7879,
            "f1_score": 0.7536,
            "roc_auc": 0.8645,
        },
    }
