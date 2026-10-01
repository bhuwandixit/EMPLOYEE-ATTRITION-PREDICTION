"""
API endpoint unit & integration tests using FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "AttriGuard API"
    assert data["status"] == "operational"


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_analytics_summary():
    response = client.get("/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_employees" in data
    assert "high_risk_count" in data
    assert "department_distribution" in data


def test_model_info():
    response = client.get("/analytics/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "selected_metrics" in data


def test_list_employees():
    response = client.get("/employees")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
