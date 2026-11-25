-- ============================================================================
-- GramVerse AI — PostGIS Extension, Spatial GIST Indexes & Performance Indexes
-- Role: Member 3 (Database & GIS)
-- Compatible with backend/app/models/* SQLAlchemy schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- Spatial GIST indexes on PostGIS geometry columns
CREATE INDEX IF NOT EXISTS idx_villages_location_gist
ON villages USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_infrastructure_location_gist
ON infrastructure USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_complaints_location_gist
ON complaints USING GIST (location);

-- Composite & partial indexes for Panchayat / Admin hot queries
CREATE INDEX IF NOT EXISTS idx_households_village_qr
ON households (village_id, qr_code_id);

CREATE INDEX IF NOT EXISTS idx_complaints_open_village
ON complaints (village_id, created_at DESC)
WHERE status IN ('submitted', 'under_review');

CREATE INDEX IF NOT EXISTS idx_infrastructure_poor_critical
ON infrastructure (village_id, type)
WHERE condition_status IN ('needs_repair', 'poor', 'critical', 'damaged');

CREATE INDEX IF NOT EXISTS idx_dev_priorities_village_rank
ON development_priorities (village_id, rank);

-- Refresh planner statistics
ANALYZE villages;
ANALYZE households;
ANALYZE surveys;
ANALYZE infrastructure;
ANALYZE complaints;
ANALYZE schemes;
ANALYZE development_priorities;
