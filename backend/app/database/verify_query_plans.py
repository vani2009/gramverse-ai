"""Verify PostgreSQL/PostGIS index usage via EXPLAIN ANALYZE on core queries.

Run from D:\\GramVerse-AI\\backend:
    python -m app.database.verify_query_plans
"""

from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.core.config import settings

BENCHMARK_QUERIES: dict[str, str] = {
    "radius_search_st_dwithin": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT id, name, type
        FROM infrastructure
        WHERE ST_DWithin(
            COALESCE(location, ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))::geography,
            ST_SetSRID(ST_MakePoint(77.6212, 21.8418), 4326)::geography,
            1000
        );
    """,
    "open_complaints_partial_idx": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT id, village_id, status
        FROM complaints
        WHERE status IN ('submitted', 'under_review');
    """,
    "village_kpis_view": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT * FROM v_village_kpis;
    """,
    "district_summary_view": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT * FROM v_district_summary;
    """,
}


def main() -> None:
    """Execute EXPLAIN (ANALYZE, BUFFERS) for core spatial and dashboard queries."""
    engine = create_engine(settings.sync_database_url, pool_pre_ping=True)
    with Session(engine) as db:
        for label, sql in BENCHMARK_QUERIES.items():
            print(f"\n=== {label} ===")
            rows = db.execute(text(sql)).scalars().all()
            for line in rows:
                print(line)


if __name__ == "__main__":
    main()
