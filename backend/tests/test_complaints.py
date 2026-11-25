import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_test_village_id():
    headers = {"Authorization": "Bearer dev-admin-token"}
    res = client.post("/api/v1/villages", json={
        "name": "Complaint Test Village",
        "block": "Ghatigaon",
        "district": "Gwalior"
    }, headers=headers)
    if res.status_code == 201:
        return res.json()["id"]
    return client.get("/api/v1/villages").json()[0]["id"]


def test_submit_complaint_text_only():
    village_id = get_test_village_id()
    headers = {"Authorization": "Bearer dev-citizen-token"}

    form_data = {
        "village_id": str(village_id),
        "description": "The main drinking water pipe near the temple is leaking continuously.",
        "latitude": "26.155",
        "longitude": "78.255"
    }
    response = client.post("/api/v1/complaints", data=form_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "submitted"
    assert data["ai_category"] == "Water"
    assert data["ai_confidence"] >= 0.70
    assert data["model_version"] is not None


def test_submit_complaint_with_image_upload():
    village_id = get_test_village_id()
    headers = {"Authorization": "Bearer dev-citizen-token"}

    # Mock JPEG file in memory
    fake_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xFF\xDB\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xFF\xC0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xFF\xC4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xFF\xDA\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xFF\xD9"
    files = {
        "file": ("road_pothole.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")
    }
    form_data = {
        "village_id": str(village_id),
        "description": "Deep dangerous pothole on the village main road causing accidents.",
        "latitude": "26.158",
        "longitude": "78.258"
    }

    response = client.post("/api/v1/complaints", data=form_data, files=files, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["ai_category"] == "Road"
    assert len(data["images"]) == 1

    img = data["images"][0]
    assert img["image_url"].startswith("/uploads/complaints/")
    assert len(img["cv_detected_labels"]) >= 1
    assert img["cv_detected_labels"][0]["label"] == "pothole"
    assert img["cv_confidence"] >= 0.80


def test_list_complaints():
    response = client.get("/api/v1/complaints")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 2


def test_panchayat_override_and_resolve():
    list_res = client.get("/api/v1/complaints")
    complaint_id = list_res.json()["items"][0]["id"]

    headers = {"Authorization": "Bearer dev-panchayat-token"}
    update_payload = {
        "status": "resolved",
        "official_override_category": "Sanitation",
        "official_remarks": "Pipe repaired and drain blockage cleared by Gram Panchayat team."
    }
    response = client.patch(f"/api/v1/complaints/{complaint_id}/status", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "resolved"
    assert data["official_override_category"] == "Sanitation"
    assert "Pipe repaired" in data["official_remarks"]


def test_citizen_blocked_from_status_update():
    list_res = client.get("/api/v1/complaints")
    complaint_id = list_res.json()["items"][0]["id"]

    headers = {"Authorization": "Bearer dev-citizen-token"}
    update_payload = {"status": "resolved"}
    response = client.patch(f"/api/v1/complaints/{complaint_id}/status", json=update_payload, headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]
