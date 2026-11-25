"""GeoJSON importer for public GIS layers (OpenStreetMap / ISRO Bhuvan) into PostGIS.

Usage (from D:\\GramVerse-AI\\backend):
    python -m app.database.gis_loader --file ../datasets/gis/bhimpur_osm_sample.geojson --source osm
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Infrastructure, Village


def load_geojson_features(geojson_path: Path) -> list[dict[str, Any]]:
    """Read and validate a GeoJSON FeatureCollection file."""
    payload = json.loads(geojson_path.read_text(encoding="utf-8"))
    if payload.get("type") != "FeatureCollection" or not isinstance(payload.get("features"), list):
        raise ValueError(f"Expected a GeoJSON FeatureCollection in {geojson_path}")
    return payload["features"]


def _extract_lon_lat(geometry: dict[str, Any]) -> tuple[float, float] | None:
    """Extract representative (lon, lat) from Point or LineString GeoJSON geometry."""
    geom_type = geometry.get("type")
    coords = geometry.get("coordinates")
    if not coords:
        return None
    if geom_type == "Point":
        return float(coords[0]), float(coords[1])
    if geom_type == "LineString":
        mid = coords[len(coords) // 2]
        return float(mid[0]), float(mid[1])
    return None


def import_infrastructure_geojson(
    db: Session,
    geojson_path: Path,
    source: str = "osm",
) -> dict[str, int]:
    """Import GeoJSON infrastructure features into the `infrastructure` table."""
    features = load_geojson_features(geojson_path)
    inserted = 0
    skipped = 0

    for feature in features:
        props = feature.get("properties") or {}
        geometry = feature.get("geometry") or {}
        lon_lat = _extract_lon_lat(geometry)
        village_name = props.get("village_name")
        asset_name = props.get("name")

        if not lon_lat or not village_name or not asset_name:
            skipped += 1
            continue

        village = db.scalar(select(Village).where(Village.name == village_name))
        if village is None:
            skipped += 1
            continue

        existing = db.scalar(
            select(Infrastructure).where(
                Infrastructure.village_id == village.id,
                Infrastructure.name == asset_name,
            )
        )
        if existing is not None:
            skipped += 1
            continue

        lon, lat = lon_lat
        extra_data = {
            k: v
            for k, v in props.items()
            if k not in {"name", "type", "condition_status", "village_name"}
        }
        extra_data["source"] = source

        db.add(
            Infrastructure(
                village_id=village.id,
                name=asset_name,
                type=props.get("type", "other"),
                condition_status=props.get("condition_status", "operational"),
                latitude=lat,
                longitude=lon,
                location=f"SRID=4326;POINT({lon} {lat})",
                extra_data=extra_data,
            )
        )
        inserted += 1

    db.commit()
    return {"inserted": inserted, "skipped": skipped}


def main() -> None:
    """CLI entrypoint for loading OSM/Bhuvan GeoJSON layers."""
    parser = argparse.ArgumentParser(description="Import GeoJSON infrastructure layer into PostGIS")
    parser.add_argument("--file", required=True, type=Path, help="Path to GeoJSON FeatureCollection")
    parser.add_argument("--source", default="osm", choices=["survey", "osm", "isro_bhuvan"])
    args = parser.parse_args()

    engine = create_engine(settings.sync_database_url, pool_pre_ping=True)
    with Session(engine) as db:
        result = import_infrastructure_geojson(db, args.file, source=args.source)
    print("GIS import summary:", result)


if __name__ == "__main__":
    main()
