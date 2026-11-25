import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def get_test_village_id():
    headers = {"Authorization": "Bearer dev-admin-token"}
    res = client.post("/api/v1/villages", json={
        "name": "Report Test Village",
        "block": "Morar",
        "district": "Gwalior",
        "population": 2200,
        "literacy_rate": 74.0
    }, headers=headers)
    if res.status_code == 201:
        return res.json()["id"]
    return client.get("/api/v1/villages").json()[0]["id"]


def test_grambot_rag_chat_citations():
    headers = {"Authorization": "Bearer dev-citizen-token"}
    payload = {
        "message": "What is the daily tap water supply guideline under Jal Jeevan Mission?"
    }
    response = client.post("/api/v1/ai/chat", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "55 liters" in data["response"]
    assert "[Source: JJM Guidelines Section 4.2]" in data["response"]
    assert len(data["sources"]) >= 1
    assert data["confidence"] >= 0.70
    assert data["model_version"] == "grambot-rag-gemini-v1.0"


def test_village_dashboard_kpis():
    village_id = get_test_village_id()

    # Seed 1 household to test coverage calculations
    client.post("/api/v1/households", json={
        "village_id": village_id,
        "household_head": "Dashboard Test Resident",
        "water_tap_available": True,
        "electricity_available": True,
        "toilet_available": True,
        "pucca_house": True
    }, headers={"Authorization": "Bearer dev-survey-token"})

    response = client.get(f"/api/v1/dashboard/village/{village_id}")
    assert response.status_code == 200
    data = response.json()

    assert data["village_id"] == village_id
    assert data["village_name"] == "Report Test Village"
    assert "coverage" in data
    assert data["coverage"]["water_tap_pct"] >= 0.0
    assert data["coverage"]["electricity_pct"] >= 0.0
    assert "complaints" in data
    assert "total" in data["complaints"]
    assert "by_category" in data["complaints"]


def test_multi_village_analytics():
    response = client.get("/api/v1/dashboard/analytics")
    assert response.status_code == 200
    analytics = response.json()
    assert isinstance(analytics, list)
    assert len(analytics) >= 1
    first = analytics[0]
    assert "village_id" in first
    assert "water_tap_coverage_pct" in first


def test_generate_pdf_report_as_panchayat():
    village_id = get_test_village_id()
    headers = {"Authorization": "Bearer dev-panchayat-token"}

    payload = {
        "village_id": village_id,
        "report_type": "GPDP"
    }
    response = client.post("/api/v1/reports/generate", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["village_id"] == village_id
    assert data["report_type"] == "GPDP"
    assert data["download_url"].startswith("/uploads/reports/")
    assert data["download_url"].endswith(".pdf")

    # Verify physical file was written to disk
    rel_path = data["download_url"].replace("/uploads/", "")
    full_path = os.path.join(settings.UPLOAD_DIR, rel_path)
    assert os.path.exists(full_path)
    assert os.path.getsize(full_path) > 1000  # Valid non-empty PDF binary


def test_citizen_blocked_from_generating_reports():
    village_id = get_test_village_id()
    headers = {"Authorization": "Bearer dev-citizen-token"}

    payload = {
        "village_id": village_id,
        "report_type": "GPDP"
    }
    response = client.post("/api/v1/reports/generate", json=payload, headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]
