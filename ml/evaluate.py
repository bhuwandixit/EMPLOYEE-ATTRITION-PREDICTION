"""
Model Evaluation Module for Employee Attrition.
Calculates classification metrics with focus on minority class recall, ROC-AUC,
precision-recall tradeoff, and confusion matrix decomposition.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
    roc_curve,
    precision_recall_curve,
)


def evaluate_model(
    pipeline: Any,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    threshold: float = 0.5,
) -> Dict[str, Any]:
    """
    Evaluates pipeline on holdout test set.
    
    Args:
        pipeline: Trained scikit-learn Pipeline
        X_test: Holdout features
        y_test: Holdout binary labels
        threshold: Decision threshold for class 1 (default 0.5)
        
    Returns:
        Dictionary of comprehensive evaluation metrics and curves data
    """
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    y_pred = (y_proba >= threshold).astype(int)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_proba)
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    precision_vals, recall_vals, _ = precision_recall_curve(y_test, y_proba)
    
    metrics = {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "sample_counts": {
            "total_test_samples": len(y_test),
            "attrition_positives": int(y_test.sum()),
            "attrition_negatives": int((y_test == 0).sum()),
        },
        "roc_curve": {
            "fpr": [round(float(v), 4) for v in fpr[::max(1, len(fpr) // 20)]],
            "tpr": [round(float(v), 4) for v in tpr[::max(1, len(tpr) // 20)]],
        },
        "pr_curve": {
            "recall": [round(float(v), 4) for v in recall_vals[::max(1, len(recall_vals) // 20)]],
            "precision": [round(float(v), 4) for v in precision_vals[::max(1, len(precision_vals) // 20)]],
        },
    }
    
    return metrics


def extract_feature_importance(pipeline: Any) -> List[Dict[str, Any]]:
    """
    Extracts top feature importance signals from trained pipeline.
    Works for linear models (Logistic Regression coefficients) or tree ensembles (Random Forest / XGBoost).
    """
    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["classifier"]
    
    feature_names = []
    # Extract numerical names
    feature_names.extend(preprocessor.transformers_[0][2])
    # Extract one-hot encoded names
    cat_encoder = preprocessor.transformers_[1][1].named_steps["onehot"]
    cat_columns = preprocessor.transformers_[1][2]
    cat_feature_names = cat_encoder.get_feature_names_out(cat_columns)
    feature_names.extend(cat_feature_names)
    
    if hasattr(model, "coef_"):
        weights = model.coef_[0]
    elif hasattr(model, "feature_importances_"):
        weights = model.feature_importances_
    else:
        weights = np.ones(len(feature_names))
        
    paired = [
        {"feature": name, "importance": round(float(abs(weight)), 4), "direction": "positive" if weight > 0 else "negative"}
        for name, weight in zip(feature_names, weights)
    ]
    paired.sort(key=lambda x: x["importance"], reverse=True)
    return paired[:15]
