-- ============================================================================
-- GramVerse AI — PostGIS Spatial Views & Radius Search Helper
-- Role: Member 3 (Database & GIS)
-- ============================================================================

CREATE OR REPLACE VIEW v_gis_assets_geojson AS
SELECT
    i.id,
    i.village_id,
    v.name AS village_name,
    v.block,
    v.district,
    i.name AS asset_name,
    i.type AS asset_type,
    i.condition_status,
    i.latitude,
    i.longitude,
    i.extra_data,
    ST_AsGeoJSON(
        COALESCE(i.location, ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326))
    )::jsonb AS geojson_geometry
FROM infrastructure i
JOIN villages v ON v.id = i.village_id;

CREATE OR REPLACE FUNCTION fn_assets_within_radius(
    p_lon DOUBLE PRECISION,
    p_lat DOUBLE PRECISION,
    p_radius_meters DOUBLE PRECISION DEFAULT 1000.0,
    p_asset_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    asset_id INTEGER,
    village_id INTEGER,
    name VARCHAR,
    type VARCHAR,
    condition_status VARCHAR,
    distance_meters NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.village_id,
        i.name,
        i.type,
        i.condition_status,
        ROUND(
            ST_Distance(
                COALESCE(i.location, ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326))::geography,
                ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography
            )::numeric,
            2
        ) AS distance_meters
    FROM infrastructure i
    WHERE ST_DWithin(
        COALESCE(i.location, ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326))::geography,
        ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
        p_radius_meters
    )
      AND (p_asset_type IS NULL OR i.type = p_asset_type)
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;
