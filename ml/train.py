"""
Model Training Script for Employee Attrition Prediction.
Trains multiple candidate algorithms (Logistic Regression, Random Forest, Gradient Boosting),
compares metrics prioritizing ROC-AUC & Minority Recall, and serializes the winning pipeline.
"""

import json
import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from ml.preprocessing import (
    load_raw_dataset,
    audit_and_clean_data,
    create_preprocessor,
    split_data,
    COLUMNS_TO_DROP,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
)
from ml.evaluate import evaluate_model, extract_feature_importance


def train_and_select_best_model(csv_path: str, models_dir: str = "models"):
    """
    End-to-end model training, comparison, selection and serialization.
    """
    os.makedirs(models_dir, exist_ok=True)
    
    print(f"Loading raw dataset from {csv_path}...")
    df_raw = load_raw_dataset(csv_path)
    df_cleaned = audit_and_clean_data(df_raw)
    
    print(f"Dataset shape after auditing: {df_cleaned.shape}")
    X_train, X_test, y_train, y_test = split_data(df_cleaned, test_size=0.2, random_state=42)
    print(f"Train samples: {len(X_train)} (Positive rate: {y_train.mean():.2%})")
    print(f"Test samples:  {len(X_test)} (Positive rate: {y_test.mean():.2%})")
    
    preprocessor = create_preprocessor()
    
    # Candidate models tailored for imbalanced tabular classification
    candidates = {
        "LogisticRegression_Balanced": Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                (
                    "classifier",
                    LogisticRegression(
                        max_iter=1000,
                        class_weight="balanced",
                        C=0.5,
                        random_state=42,
                    ),
                ),
            ]
        ),
        "RandomForest_Balanced": Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                (
                    "classifier",
                    RandomForestClassifier(
                        n_estimators=150,
                        max_depth=8,
                        min_samples_leaf=4,
                        class_weight="balanced",
                        random_state=42,
                    ),
                ),
            ]
        ),
        "GradientBoosting": Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                (
                    "classifier",
                    GradientBoostingClassifier(
                        n_estimators=120,
                        learning_rate=0.08,
                        max_depth=4,
                        random_state=42,
                    ),
                ),
            ]
        ),
    }
    
    results = {}
    best_name = None
    best_score = -1.0
    best_pipeline = None
    
    for name, pipeline in candidates.items():
        print(f"\n--- Training {name} ---")
        pipeline.fit(X_train, y_train)
        metrics = evaluate_model(pipeline, X_test, y_test)
        results[name] = metrics
        print(f"Accuracy: {metrics['accuracy']:.4f} | Recall: {metrics['recall']:.4f} | "
              f"Precision: {metrics['precision']:.4f} | F1: {metrics['f1_score']:.4f} | ROC-AUC: {metrics['roc_auc']:.4f}")
        
        # Primary selection metric: Balanced combination of ROC-AUC and Recall
        composite_score = 0.6 * metrics["roc_auc"] + 0.4 * metrics["recall"]
        if composite_score > best_score:
            best_score = composite_score
            best_name = name
            best_pipeline = pipeline
            
    print(f"\n==========================================")
    print(f"Selected Champion Model: {best_name}")
    print(f"Composite Selection Score: {best_score:.4f}")
    print(f"==========================================")
    
    # Feature importance extraction
    top_features = extract_feature_importance(best_pipeline)
    
    # Serialization
    pipeline_file = os.path.join(models_dir, "attrition_pipeline.pkl")
    joblib.dump(best_pipeline, pipeline_file)
    print(f"Saved pipeline to {pipeline_file}")
    
    # Metadata json
    metadata = {
        "model_name": best_name,
        "model_version": "1.0.0",
        "training_framework": "scikit-learn 1.3+",
        "dataset_rows": len(df_raw),
        "test_rows": len(X_test),
        "candidate_results": results,
        "selected_metrics": results[best_name],
        "top_features": top_features,
        "dropped_columns": COLUMNS_TO_DROP,
        "categorical_features": CATEGORICAL_FEATURES,
        "numerical_features": NUMERICAL_FEATURES,
        "risk_thresholds": {"low": 0.30, "medium": 0.60},
        "disclaimer": "Predicted probabilities and explanatory signals represent statistical model outputs rather than deterministic causal assertions."
    }
    
    metadata_file = os.path.join(models_dir, "model_metadata.json")
    with open(metadata_file, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to {metadata_file}")
    
    return best_pipeline, metadata


if __name__ == "__main__":
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "WA_Fn-UseC_-HR-Employee-Attrition.csv")
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    train_and_select_best_model(csv_path, models_dir)
