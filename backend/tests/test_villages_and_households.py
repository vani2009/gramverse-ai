import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_village_as_admin():
    headers = {"Authorization": "Bearer dev-admin-token"}
    payload = {
        "name": "Lasudiya Test",
        "block": "Ashta",
        "district": "Sehore",
        "population": 1500,
        "literacy_rate": 72.0,
        "latitude": 23.02,
        "longitude": 76.78
    }
    response = client.post("/api/v1/villages", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Lasudiya Test"
    assert data["population"] == 1500


def test_create_village_as_citizen_blocked():
    headers = {"Authorization": "Bearer dev-citizen-token"}
    payload = {
        "name": "Unauthorized Village",
        "block": "Block A",
        "district": "Gwalior"
    }
    response = client.post("/api/v1/villages", json=payload, headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_list_villages():
    response = client.get("/api/v1/villages")
    assert response.status_code == 200
    villages = response.json()
    assert isinstance(villages, list)
    assert len(villages) >= 1
    assert any(v["name"] == "Lasudiya Test" for v in villages)


def test_get_village_detail():
    list_res = client.get("/api/v1/villages")
    village_id = list_res.json()[0]["id"]

    response = client.get(f"/api/v1/villages/{village_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == village_id
    assert "total_households" in data
    assert "open_complaints" in data


def test_create_household_as_surveyor():
    list_res = client.get("/api/v1/villages")
    village_id = list_res.json()[0]["id"]

    headers = {"Authorization": "Bearer dev-survey-token"}
    payload = {
        "village_id": village_id,
        "household_head": "Babulal Kushwah",
        "family_size": 6,
        "monthly_income": 4500.0,
        "housing_type": "kutcha",
        "pucca_house": False,
        "land_holding_acres": 0.5,
        "water_tap_available": False,
        "electricity_available": True,
        "toilet_available": False,
        "caste_category": "OBC",
        "qr_code_id": "QR_TEST_LASUDIYA_001"
    }
    response = client.post("/api/v1/households", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["household_head"] == "Babulal Kushwah"
    assert data["qr_code_id"] == "QR_TEST_LASUDIYA_001"


def test_duplicate_qr_code_rejected():
    list_res = client.get("/api/v1/villages")
    village_id = list_res.json()[0]["id"]

    headers = {"Authorization": "Bearer dev-survey-token"}
    payload = {
        "village_id": village_id,
        "household_head": "Duplicate Person",
        "qr_code_id": "QR_TEST_LASUDIYA_001"
    }
    response = client.post("/api/v1/households", json=payload, headers=headers)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_list_and_filter_households():
    list_res = client.get("/api/v1/villages")
    village_id = list_res.json()[0]["id"]

    # Filter by village_id and housing_type
    response = client.get(f"/api/v1/households?village_id={village_id}&housing_type=kutcha")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1
    assert data["items"][0]["housing_type"] == "kutcha"


def test_update_household():
    list_res = client.get("/api/v1/households")
    household_id = list_res.json()["items"][0]["id"]

    headers = {"Authorization": "Bearer dev-panchayat-token"}
    update_payload = {
        "monthly_income": 8000.0,
        "water_tap_available": True
    }
    response = client.patch(f"/api/v1/households/{household_id}", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["monthly_income"] == 8000.0
    assert data["water_tap_available"] is True
