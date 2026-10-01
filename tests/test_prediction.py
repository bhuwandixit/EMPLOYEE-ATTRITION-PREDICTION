"""
ML Inference validation tests.
Verifies prediction output schema, risk boundaries, validation failures, and explainability factors.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_predict_valid_employee():
    payload = {
        "Age": 32,
        "Gender": "Male",
        "MaritalStatus": "Single",
        "Education": 3,
        "EducationField": "Life Sciences",
        "Department": "Sales",
        "JobRole": "Sales Representative",
        "JobLevel": 1,
        "BusinessTravel": "Travel_Frequently",
        "DistanceFromHome": 20,
        "MonthlyIncome": 2500,
        "PercentSalaryHike": 11,
        "StockOptionLevel": 0,
        "EnvironmentSatisfaction": 1,
        "JobSatisfaction": 1,
        "JobInvolvement": 2,
        "RelationshipSatisfaction": 2,
        "WorkLifeBalance": 1,
        "PerformanceRating": 3,
        "TotalWorkingYears": 3,
        "YearsAtCompany": 1,
        "YearsInCurrentRole": 1,
        "YearsSinceLastPromotion": 0,
        "YearsWithCurrManager": 1,
        "NumCompaniesWorked": 3,
        "TrainingTimesLastYear": 1,
        "OverTime": "Yes",
    }
    
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Assert contract
    assert data["prediction"] in ["Yes", "No"]
    assert 0.0 <= data["probability"] <= 1.0
    assert data["risk_level"] in ["Low", "Medium", "High"]
    assert "top_explanatory_factors" in data
    assert isinstance(data["top_explanatory_factors"], list)
    assert len(data["top_explanatory_factors"]) > 0


def test_predict_invalid_data_types():
    """Testing that Pydantic rejects invalid string age and missing required fields."""
    payload = {
        "Age": "thirty",
        "Department": "Sales",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # Unprocessable Entity


def test_predict_out_of_range_values():
    """Testing range bounds (e.g. Satisfaction 1-4)."""
    payload = {
        "Age": 25,
        "JobSatisfaction": 99,  # Out of range 1-4
        "Department": "Sales",
        "JobRole": "Sales Representative",
        "MonthlyIncome": 3000,
        "OverTime": "No",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
