"""Tests for the Database & GIS deliverables integrated with origin/main."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent
SQL_DIR = BACKEND_DIR / "app" / "database" / "sql"
SAMPLE_GEOJSON = ROOT_DIR / "datasets" / "gis" / "bhimpur_osm_sample.geojson"


def test_sql_scripts_cover_gis_views_and_indexes() -> None:
    """Verify PostGIS GIST indexes, spatial helpers, and KPI views exist."""
    idx_sql = (SQL_DIR / "001_postgis_indexes_and_constraints.sql").read_text(encoding="utf-8")
    gis_sql = (SQL_DIR / "002_gis_spatial_views_and_helpers.sql").read_text(encoding="utf-8")
    dash_sql = (SQL_DIR / "003_dashboard_views.sql").read_text(encoding="utf-8")

    assert "CREATE EXTENSION IF NOT EXISTS postgis;" in idx_sql
    assert "idx_infrastructure_location_gist" in idx_sql
    assert "idx_complaints_open_village" in idx_sql

    assert "CREATE OR REPLACE VIEW v_gis_assets_geojson" in gis_sql
    assert "CREATE OR REPLACE FUNCTION fn_assets_within_radius" in gis_sql
    assert "ST_DWithin" in gis_sql

    assert "CREATE OR REPLACE VIEW v_village_kpis" in dash_sql
    assert "CREATE OR REPLACE VIEW v_district_summary" in dash_sql


def test_sample_geojson_and_backup_scripts_valid() -> None:
    """Verify sample OSM GeoJSON and backup/restore scripts are valid."""
    geojson = json.loads(SAMPLE_GEOJSON.read_text(encoding="utf-8"))
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 2

    backup_ps1 = (BACKEND_DIR / "scripts" / "backup_db.ps1").read_text(encoding="utf-8")
    restore_ps1 = (BACKEND_DIR / "scripts" / "restore_db.ps1").read_text(encoding="utf-8")
    assert "pg_dump" in backup_ps1
    assert "pg_restore" in restore_ps1


def test_alembic_env_configured_for_postgis() -> None:
    """Verify Alembic configuration references sync_database_url and GeoAlchemy2 helpers."""
    env_py = (BACKEND_DIR / "alembic" / "env.py").read_text(encoding="utf-8")
    assert "sync_database_url" in env_py
    assert "spatial_ref_sys" in env_py
    assert "geoalchemy2" in env_py


def test_gis_loader_feature_extraction_and_import() -> None:
    """Verify GeoJSON feature extraction and loader behavior."""
    from app.database.gis_loader import load_geojson_features, _extract_lon_lat, import_infrastructure_geojson
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import Session
    from app.models.village import Village
    from app.models.infrastructure import Infrastructure
    from app.core.config import settings

    features = load_geojson_features(SAMPLE_GEOJSON)
    assert len(features) == 2

    # Verify coordinate extraction
    point_coords = _extract_lon_lat(features[0]["geometry"])
    assert point_coords == (76.7822, 23.0185)

    line_coords = _extract_lon_lat(features[1]["geometry"])
    assert line_coords == (76.7820, 23.0180)

    # Test import execution with sync database session
    engine = create_engine(settings.sync_database_url)
    with Session(engine) as db:
        village = db.scalar(select(Village).where(Village.name == "Lasudiya Khas"))
        if not village:
            village = Village(
                name="Lasudiya Khas",
                block="Ashta",
                district="Sehore",
                state="Madhya Pradesh",
                population=2150,
                literacy_rate=68.0,
                latitude=23.0180,
                longitude=76.7820
            )
            db.add(village)
            db.commit()

        result = import_infrastructure_geojson(db, SAMPLE_GEOJSON, source="osm")
        assert result["inserted"] >= 0
        assert "skipped" in result

