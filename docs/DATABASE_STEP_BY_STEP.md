# GramVerse AI — Database & GIS Layer Documentation (Member 3)

This branch (`feat/database-and-gis`) adds the PostgreSQL/PostGIS database tooling, Alembic migrations, spatial SQL helpers, dashboard KPI views, GIS layer importer, and backup/restore scripts integrated cleanly with `main`.

## Deliverables Added
1. **Alembic Migrations (`backend/alembic.ini`, `backend/alembic/env.py`)**
   - Uses `app.core.config.settings.sync_database_url` and `app.database.base.Base.metadata`.
   - Configured with `geoalchemy2.alembic_helpers` and PostGIS system-table exclusions (`spatial_ref_sys`, `geometry_columns`, etc.).
2. **PostGIS Spatial & Performance SQL (`backend/app/database/sql/`)**
   - `001_postgis_indexes_and_constraints.sql` — `postgis` extension, GIST spatial indexes (`villages`, `infrastructure`, `complaints`), partial hot-query indexes, and `ANALYZE`.
   - `002_gis_spatial_views_and_helpers.sql` — `v_gis_assets_geojson` view and `fn_assets_within_radius()` geodesic `ST_DWithin` function.
   - `003_dashboard_views.sql` — `v_village_kpis` and `v_district_summary` aggregation views matching the SQLAlchemy ORM schema.
3. **Public GIS Layer Importer (`backend/app/database/gis_loader.py` + `datasets/gis/bhimpur_osm_sample.geojson`)**
   - Imports OpenStreetMap / ISRO Bhuvan GeoJSON `FeatureCollection` files into `infrastructure`.
4. **Query Plan Verification & Backups**
   - `backend/app/database/verify_query_plans.py` — `EXPLAIN (ANALYZE, BUFFERS)` runner for spatial & dashboard views.
   - `backend/scripts/backup_db.ps1` & `backend/scripts/restore_db.ps1` — Docker `pg_dump` / `pg_restore` automation for `gramverse_postgis`.
