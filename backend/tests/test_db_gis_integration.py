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
