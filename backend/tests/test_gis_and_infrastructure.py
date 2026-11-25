import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_test_village_id():
    headers = {"Authorization": "Bearer dev-admin-token"}
    res = client.post("/api/v1/villages", json={
        "name": "GIS Map Village",
        "block": "Morar",
        "district": "Gwalior",
        "latitude": 26.20,
        "longitude": 78.20
    }, headers=headers)
    if res.status_code == 201:
        return res.json()["id"]
    return client.get("/api/v1/villages").json()[0]["id"]


def test_create_infrastructure_as_panchayat():
    village_id = get_test_village_id()
    headers = {"Authorization": "Bearer dev-panchayat-token"}

    payload = {
        "village_id": village_id,
        "name": "Central Overhead Water Tank",
        "type": "water_tank",
        "condition_status": "operational",
        "latitude": 26.2050,
        "longitude": 78.2050,
        "capacity_or_size": "50,000 Liters"
    }
    response = client.post("/api/v1/infrastructure", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Central Overhead Water Tank"
    assert data["type"] == "water_tank"
    assert data["latitude"] == 26.2050


def test_create_infrastructure_citizen_blocked():
    village_id = get_test_village_id()
    headers = {"Authorization": "Bearer dev-citizen-token"}

    payload = {
        "village_id": village_id,
        "name": "Unauthorized Asset",
        "type": "road",
        "latitude": 26.20,
        "longitude": 78.20
    }
    response = client.post("/api/v1/infrastructure", json=payload, headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_list_infrastructure():
    response = client.get("/api/v1/infrastructure")
    assert response.status_code == 200
    assets = response.json()
    assert isinstance(assets, list)
    assert len(assets) >= 1


def test_gis_assets_geojson_rfc7946():
    """
    Leaflet requires RFC 7946 GeoJSON FeatureCollections:
    type = 'FeatureCollection', geometry.coordinates = [lon, lat]
    """
    response = client.get("/api/v1/gis/assets")
    assert response.status_code == 200
    geojson = response.json()

    assert geojson["type"] == "FeatureCollection"
    assert "features" in geojson
    assert len(geojson["features"]) >= 1

    first_feature = geojson["features"][0]
    assert first_feature["type"] == "Feature"
    assert first_feature["geometry"]["type"] == "Point"
    coords = first_feature["geometry"]["coordinates"]
    assert len(coords) == 2
    # Verify [lon, lat] ordering
    lon, lat = coords
    assert -180.0 <= lon <= 180.0
    assert -90.0 <= lat <= 90.0

    props = first_feature["properties"]
    assert "name" in props
    assert "type" in props
    assert "condition_status" in props


def test_gis_nearby_radius_search():
    village_id = get_test_village_id()
    headers = {"Authorization": "Bearer dev-panchayat-token"}

    # Base coordinates: 26.2000, 78.2000
    # Asset Close (~110 meters north: 26.2010, 78.2000)
    client.post("/api/v1/infrastructure", json={
        "village_id": village_id,
        "name": "Nearby Handpump",
        "type": "water_tank",
        "latitude": 26.2010,
        "longitude": 78.2000
    }, headers=headers)

    # Asset Far (~11,000 meters north: 26.3000, 78.2000)
    client.post("/api/v1/infrastructure", json={
        "village_id": village_id,
        "name": "Far Away Substation",
        "type": "electricity",
        "latitude": 26.3000,
        "longitude": 78.2000
    }, headers=headers)

    # Search within 1000m radius
    response = client.get("/api/v1/gis/nearby?latitude=26.2000&longitude=78.2000&radius_meters=1000")
    assert response.status_code == 200
    geojson = response.json()

    feature_names = [f["properties"]["name"] for f in geojson["features"]]
    assert "Nearby Handpump" in feature_names
    assert "Far Away Substation" not in feature_names

    # Verify distance_meters property exists and is sorted ascending
    distances = [f["properties"]["distance_meters"] for f in geojson["features"]]
    assert distances == sorted(distances)
