import pytest
from fastapi import Depends
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import require_role
from app.models.user import User

client = TestClient(app)

# Create a temporary protected endpoint on the app for RBAC verification
@app.get("/api/v1/test-admin-only", tags=["Testing"])
async def protected_admin_endpoint(current_user: User = Depends(require_role(["admin"]))):
    return {"message": "Welcome Admin", "user": current_user.email}


def test_list_roles():
    response = client.get("/api/v1/auth/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) == 4
    role_names = [r["role"] for r in roles]
    assert "admin" in role_names
    assert "panchayat" in role_names
    assert "citizen" in role_names
    assert "survey" in role_names


def test_auth_me_unauthenticated():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_auth_me_authenticated():
    headers = {"Authorization": "Bearer dev-admin-token"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
    assert data["email"] == "admin@gramverse.gov.in"
    assert data["name"] == "District Collector Sehore"


def test_role_enforcement_allow_admin():
    headers = {"Authorization": "Bearer dev-admin-token"}
    response = client.get("/api/v1/test-admin-only", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome Admin"


def test_role_enforcement_block_citizen():
    headers = {"Authorization": "Bearer dev-citizen-token"}
    response = client.get("/api/v1/test-admin-only", headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_sync_user_profile():
    headers = {"Authorization": "Bearer dev-survey-token"}
    payload = {
        "name": "Amit Sharma (Lead Surveyor)",
        "phone": "+91-9876543210"
    }
    response = client.post("/api/v1/auth/sync", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Amit Sharma (Lead Surveyor)"
    assert data["phone"] == "+91-9876543210"
    assert data["role"] == "survey"
