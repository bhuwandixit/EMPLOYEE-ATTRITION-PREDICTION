"""
ML Preprocessing Module for Employee Attrition Prediction.
Handles data hygiene, column auditing, scikit-learn ColumnTransformer construction,
and stratified train/test splitting to prevent data leakage.
"""

from typing import List, Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Columns identified as non-informative, zero-variance constants, or IDs
COLUMNS_TO_DROP = [
    "EmployeeCount",   # Zero variance: constant value 1 across all records
    "StandardHours",   # Zero variance: constant value 80 across all records
    "Over18",          # Zero variance: constant value 'Y' across all records
    "EmployeeNumber",  # Arbitrary surrogate identifier with risk of spurious correlation
]

CATEGORICAL_FEATURES = [
    "BusinessTravel",
    "Department",
    "EducationField",
    "Gender",
    "JobRole",
    "MaritalStatus",
    "OverTime",
]

NUMERICAL_FEATURES = [
    "Age",
    "DailyRate",
    "DistanceFromHome",
    "Education",
    "EnvironmentSatisfaction",
    "HourlyRate",
    "JobInvolvement",
    "JobLevel",
    "JobSatisfaction",
    "MonthlyIncome",
    "MonthlyRate",
    "NumCompaniesWorked",
    "PercentSalaryHike",
    "PerformanceRating",
    "RelationshipSatisfaction",
    "StockOptionLevel",
    "TotalWorkingYears",
    "TrainingTimesLastYear",
    "WorkLifeBalance",
    "YearsAtCompany",
    "YearsInCurrentRole",
    "YearsSinceLastPromotion",
    "YearsWithCurrManager",
]

TARGET_COLUMN = "Attrition"


def load_raw_dataset(file_path: str) -> pd.DataFrame:
    """
    Load raw CSV dataset.
    
    Args:
        file_path: Path to WA_Fn-UseC_-HR-Employee-Attrition.csv
    Returns:
        pd.DataFrame containing employee records
    """
    df = pd.read_csv(file_path)
    return df


def audit_and_clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans dataset by dropping zero-variance constants and ID columns.
    Converts target 'Attrition' to binary (Yes -> 1, No -> 0).
    
    Args:
        df: Raw DataFrame
    Returns:
        Cleaned DataFrame
    """
    cleaned = df.copy()
    
    # Drop zero variance & identifier columns
    drop_candidates = [col for col in COLUMNS_TO_DROP if col in cleaned.columns]
    if drop_candidates:
        cleaned = cleaned.drop(columns=drop_candidates)
        
    # Check for duplicates
    initial_len = len(cleaned)
    cleaned = cleaned.drop_duplicates()
    deduped_count = initial_len - len(cleaned)
    if deduped_count > 0:
        print(f"Removed {deduped_count} duplicate records.")
        
    # Map target if present
    if TARGET_COLUMN in cleaned.columns:
        if cleaned[TARGET_COLUMN].dtype == object:
            cleaned[TARGET_COLUMN] = cleaned[TARGET_COLUMN].map({"Yes": 1, "No": 0})
            
    return cleaned


def create_preprocessor() -> ColumnTransformer:
    """
    Construct scikit-learn ColumnTransformer.
    - Numerical features: Median Imputation -> StandardScaler
    - Categorical features: Most Frequent Imputation -> OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    
    Returns:
        ColumnTransformer pipeline object
    """
    num_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    
    cat_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(sparse_output=False, handle_unknown="ignore")),
        ]
    )
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor


def split_data(
    df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Split dataset into train and test sets using Stratified Sampling on Attrition.
    Prevents data leakage by ensuring fitting only occurs on train fold.
    
    Args:
        df: Cleaned dataframe containing target column
        test_size: Proportion of holdout test set (default 0.2)
        random_state: Random seed for reproducibility
    Returns:
        X_train, X_test, y_train, y_test
    """
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' not found in dataframe.")
        
    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    return X_train, X_test, y_train, y_test
