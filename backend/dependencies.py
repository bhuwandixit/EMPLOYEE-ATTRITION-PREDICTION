"""
FastAPI application dependencies and singletons.
"""

import os
from functools import lru_cache
from ml.predict import AttritionPredictor
from backend.database import get_db
from backend.utils.logger import logger

@lru_cache()
def get_predictor() -> AttritionPredictor:
    """Returns singleton instance of the ML predictor."""
    model_path = os.getenv(
        "MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "..", "models", "attrition_pipeline.pkl")
    )
    logger.info(f"Initializing ML AttritionPredictor from {model_path}...")
    return AttritionPredictor(model_path=model_path)
