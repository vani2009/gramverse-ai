import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_village_and_household():
    headers = {"Authorization": "Bearer dev-admin-token"}
    # Ensure village exists
    v_res = client.post("/api/v1/villages", json={
        "name": "Sync Test Village",
        "block": "Ghatigaon",
        "district": "Gwalior"
    }, headers=headers)
    if v_res.status_code == 201:
        village_id = v_res.json()["id"]
    else:
        village_id = client.get("/api/v1/villages").json()[0]["id"]

    # Ensure household exists
    h_res = client.post("/api/v1/households", json={
        "village_id": village_id,
        "household_head": "Ramsewak Yadav",
        "qr_code_id": f"QR_SYNC_{uuid.uuid4().hex[:6]}"
    }, headers={"Authorization": "Bearer dev-survey-token"})

    household_id = h_res.json()["id"]
    return village_id, household_id


def test_submit_single_survey():
    village_id, household_id = get_village_and_household()
    headers = {"Authorization": "Bearer dev-survey-token"}
    client_uuid = str(uuid.uuid4())

    payload = {
        "client_uuid": client_uuid,
        "household_id": household_id,
        "survey_type": "household",
        "survey_data": {
            "drinking_water": "handpump",
            "cooking_fuel": "firewood",
            "ration_type": "BPL"
        },
        "latitude": 26.15,
        "longitude": 78.22
    }
    response = client.post("/api/v1/surveys", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["client_uuid"] == client_uuid
    assert data["household_id"] == household_id
    assert data["survey_data"]["ration_type"] == "BPL"


def test_batch_offline_sync():
    village_id, household_id = get_village_and_household()
    headers = {"Authorization": "Bearer dev-survey-token"}

    uuid1 = str(uuid.uuid4())
    uuid2 = str(uuid.uuid4())
    uuid3 = str(uuid.uuid4())

    batch_payload = {
        "surveys": [
            {
                "client_uuid": uuid1,
                "household_id": household_id,
                "survey_type": "household",
                "survey_data": {"water_hours_per_day": 2},
                "latitude": 26.151,
                "longitude": 78.221
            },
            {
                "client_uuid": uuid2,
                "household_id": household_id,
                "survey_type": "health",
                "survey_data": {"malnutrition_risk": "low", "immunization_complete": True},
                "latitude": 26.152,
                "longitude": 78.222
            },
            # Survey 3 includes brand new household registered offline
            {
                "client_uuid": uuid3,
                "village_id": village_id,
                "household_head": "Offline Farmer Singh",
                "family_size": 4,
                "monthly_income": 5000.0,
                "housing_type": "kutcha",
                "pucca_house": False,
                "qr_code_id": f"QR_OFFLINE_{uuid.uuid4().hex[:6]}",
                "survey_type": "household",
                "survey_data": {"land_irrigated": False},
                "latitude": 26.153,
                "longitude": 78.223
            }
        ]
    }

    response = client.post("/api/v1/surveys/sync", json=batch_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_received"] == 3
    assert data["inserted_count"] == 3
    assert data["updated_count"] == 0
    assert data["failed_count"] == 0


def test_idempotent_resync():
    """
    Submitting the exact same offline batch a second time MUST NOT create duplicates.
    It should update the records and return updated_count = 3.
    """
    village_id, household_id = get_village_and_household()
    headers = {"Authorization": "Bearer dev-survey-token"}

    id1 = str(uuid.uuid4())
    id2 = str(uuid.uuid4())

    initial_batch = {
        "surveys": [
            {
                "client_uuid": id1,
                "household_id": household_id,
                "survey_type": "household",
                "survey_data": {"visit_round": 1}
            },
            {
                "client_uuid": id2,
                "household_id": household_id,
                "survey_type": "household",
                "survey_data": {"visit_round": 1}
            }
        ]
    }

    # Initial sync
    res1 = client.post("/api/v1/surveys/sync", json=initial_batch, headers=headers)
    assert res1.json()["inserted_count"] == 2

    # Second sync with updated data
    modified_batch = {
        "surveys": [
            {
                "client_uuid": id1,
                "household_id": household_id,
                "survey_type": "household",
                "survey_data": {"visit_round": 2, "notes": "Followup completed"}
            },
            {
                "client_uuid": id2,
                "household_id": household_id,
                "survey_type": "household",
                "survey_data": {"visit_round": 2, "notes": "Followup completed"}
            }
        ]
    }

    res2 = client.post("/api/v1/surveys/sync", json=modified_batch, headers=headers)
    assert res2.status_code == 200
    data = res2.json()
    assert data["inserted_count"] == 0
    assert data["updated_count"] == 2
    assert data["failed_count"] == 0


def test_citizen_blocked_from_survey_sync():
    headers = {"Authorization": "Bearer dev-citizen-token"}
    payload = {
        "surveys": [
            {
                "client_uuid": str(uuid.uuid4()),
                "survey_type": "household",
                "survey_data": {}
            }
        ]
    }
    response = client.post("/api/v1/surveys/sync", json=payload, headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_list_and_get_surveys():
    headers = {"Authorization": "Bearer dev-survey-token"}
    response = client.get("/api/v1/surveys", headers=headers)
    assert response.status_code == 200
    surveys = response.json()
    assert isinstance(surveys, list)
    assert len(surveys) >= 1

    first_id = surveys[0]["id"]
    single_res = client.get(f"/api/v1/surveys/{first_id}", headers=headers)
    assert single_res.status_code == 200
    assert single_res.json()["id"] == first_id
