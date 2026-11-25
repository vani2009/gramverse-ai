import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_test_village_id():
    headers = {"Authorization": "Bearer dev-admin-token"}
    res = client.post("/api/v1/villages", json={
        "name": "AI Planner Village",
        "block": "Ghatigaon",
        "district": "Gwalior",
        "population": 1800
    }, headers=headers)
    if res.status_code == 201:
        return res.json()["id"]
    return client.get("/api/v1/villages").json()[0]["id"]


def test_list_master_schemes():
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 7
    codes = [s["code"] for s in schemes]
    assert "PMAY-G" in codes
    assert "PM-KISAN" in codes
    assert "JJM" in codes
    assert "AYUSHMAN-BHARAT" in codes
    assert "SBM-G" in codes


def test_scheme_recommendation_kutcha_household():
    """
    Kutcha house without water tap, toilet, and income under ₹15,000 should be
    eligible for PMAY-G, JJM, SBM-G, and Ayushman Bharat.
    """
    payload = {
        "monthly_income": 6000.0,
        "housing_type": "kutcha",
        "pucca_house": False,
        "water_tap_available": False,
        "toilet_available": False,
        "electricity_available": True,
        "land_holding_acres": 0.0,
        "caste_category": "SC"
    }
    response = client.post("/api/v1/ai/recommend-schemes", json=payload)
    assert response.status_code == 200
    data = response.json()

    eligible_codes = [s["code"] for s in data["eligible_schemes"]]
    assert "PMAY-G" in eligible_codes
    assert "JJM" in eligible_codes
    assert "SBM-G" in eligible_codes
    assert "AYUSHMAN-BHARAT" in eligible_codes

    # Verify document checklist is populated
    pmay = next(s for s in data["eligible_schemes"] if s["code"] == "PMAY-G")
    assert "Aadhaar Card" in pmay["required_documents"]
    assert len(pmay["matched_criteria"]) >= 1


def test_scheme_recommendation_small_farmer():
    """
    Farmer with 2.0 acres land should be eligible for PM-KISAN.
    """
    payload = {
        "monthly_income": 10000.0,
        "land_holding_acres": 2.0,
        "housing_type": "pucca",
        "pucca_house": True,
        "water_tap_available": True,
        "toilet_available": True
    }
    response = client.post("/api/v1/ai/recommend-schemes", json=payload)
    assert response.status_code == 200
    data = response.json()

    eligible_codes = [s["code"] for s in data["eligible_schemes"]]
    assert "PM-KISAN" in eligible_codes
    # Pucca house owner must NOT be eligible for PMAY-G
    assert "PMAY-G" not in eligible_codes


def test_get_development_priorities_for_village():
    village_id = get_test_village_id()
    response = client.get(f"/api/v1/ai/development-priorities/{village_id}")
    assert response.status_code == 200
    priorities = response.json()
    assert len(priorities) >= 3

    # Verify ranks are sequential (1, 2, 3...) and scores are descending
    for i in range(len(priorities)):
        assert priorities[i]["rank"] == i + 1
        assert priorities[i]["priority_score"] > 0
        if i > 0:
            assert priorities[i - 1]["priority_score"] >= priorities[i]["priority_score"]


def test_priority_simulator_recalculation():
    headers = {"Authorization": "Bearer dev-panchayat-token"}
    scenarios = [
        # Project 1: (Severity 5 * 1000 people) / 5 Lakhs = 1000.00
        {
            "issue": "High Impact Water Pipeline",
            "category": "Water",
            "severity": 5,
            "population_affected": 1000,
            "estimated_cost_lakhs": 5.0,
            "matching_scheme": "JJM"
        },
        # Project 2: (Severity 2 * 300 people) / 6 Lakhs = 100.00
        {
            "issue": "Low Impact Streetlight Extension",
            "category": "Electricity",
            "severity": 2,
            "population_affected": 300,
            "estimated_cost_lakhs": 6.0,
            "matching_scheme": "PM Surya Ghar"
        }
    ]
    response = client.post("/api/v1/ai/simulate-priorities", json=scenarios, headers=headers)
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    assert len(items) == 2
    assert items[0]["issue"] == "High Impact Water Pipeline"
    assert items[0]["priority_score"] == 1000.0
    assert items[0]["rank"] == 1

    assert items[1]["issue"] == "Low Impact Streetlight Extension"
    assert items[1]["priority_score"] == 100.0
    assert items[1]["rank"] == 2


def test_citizen_blocked_from_priority_simulation():
    headers = {"Authorization": "Bearer dev-citizen-token"}
    scenarios = [
        {
            "issue": "Test",
            "category": "Road",
            "severity": 3,
            "population_affected": 100,
            "estimated_cost_lakhs": 1.0
        }
    ]
    response = client.post("/api/v1/ai/simulate-priorities", json=scenarios, headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]
