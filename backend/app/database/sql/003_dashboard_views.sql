-- ============================================================================
-- GramVerse AI — Village KPI & District Rollup Views
-- Role: Member 3 (Database & GIS)
-- ============================================================================

CREATE OR REPLACE VIEW v_village_kpis AS
WITH hh_agg AS (
    SELECT
        village_id,
        COUNT(*) AS surveyed_households,
        COALESCE(SUM(family_size), 0) AS surveyed_population,
        ROUND(
            COUNT(*) FILTER (WHERE toilet_available) * 100.0 / NULLIF(COUNT(*), 0),
            2
        ) AS toilet_coverage_pct,
        ROUND(
            COUNT(*) FILTER (WHERE water_tap_available) * 100.0 / NULLIF(COUNT(*), 0),
            2
        ) AS tap_water_coverage_pct,
        ROUND(
            COUNT(*) FILTER (WHERE electricity_available) * 100.0 / NULLIF(COUNT(*), 0),
            2
        ) AS electricity_coverage_pct,
        ROUND(
            COUNT(*) FILTER (WHERE pucca_house) * 100.0 / NULLIF(COUNT(*), 0),
            2
        ) AS pucca_house_pct
    FROM households
    GROUP BY village_id
),
infra_agg AS (
    SELECT
        village_id,
        COUNT(*) AS total_assets,
        COUNT(*) FILTER (
            WHERE condition_status IN ('needs_repair', 'poor', 'critical', 'damaged')
        ) AS poor_or_critical_assets
    FROM infrastructure
    GROUP BY village_id
),
comp_agg AS (
    SELECT
        village_id,
        COUNT(*) AS total_complaints,
        COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review')) AS open_complaints,
        COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_complaints
    FROM complaints
    GROUP BY village_id
)
SELECT
    v.id AS village_id,
    v.name AS village_name,
    v.block,
    v.district,
    v.state,
    v.population,
    v.literacy_rate,
    COALESCE(h.surveyed_households, 0) AS surveyed_households,
    COALESCE(h.surveyed_population, 0) AS surveyed_population,
    COALESCE(h.toilet_coverage_pct, 0.00) AS toilet_coverage_pct,
    COALESCE(h.tap_water_coverage_pct, 0.00) AS tap_water_coverage_pct,
    COALESCE(h.electricity_coverage_pct, 0.00) AS electricity_coverage_pct,
    COALESCE(h.pucca_house_pct, 0.00) AS pucca_house_pct,
    COALESCE(i.total_assets, 0) AS total_assets,
    COALESCE(i.poor_or_critical_assets, 0) AS poor_or_critical_assets,
    COALESCE(c.total_complaints, 0) AS total_complaints,
    COALESCE(c.open_complaints, 0) AS open_complaints,
    COALESCE(c.resolved_complaints, 0) AS resolved_complaints
FROM villages v
LEFT JOIN hh_agg h ON h.village_id = v.id
LEFT JOIN infra_agg i ON i.village_id = v.id
LEFT JOIN comp_agg c ON c.village_id = v.id;

CREATE OR REPLACE VIEW v_district_summary AS
SELECT
    district,
    block,
    COUNT(*) AS village_count,
    COALESCE(SUM(surveyed_households), 0) AS surveyed_households,
    COALESCE(SUM(surveyed_population), 0) AS surveyed_population,
    ROUND(AVG(literacy_rate)::numeric, 2) AS avg_literacy_rate,
    ROUND(AVG(toilet_coverage_pct), 2) AS avg_toilet_coverage_pct,
    ROUND(AVG(tap_water_coverage_pct), 2) AS avg_tap_water_coverage_pct,
    ROUND(AVG(electricity_coverage_pct), 2) AS avg_electricity_coverage_pct,
    COALESCE(SUM(poor_or_critical_assets), 0) AS poor_or_critical_assets,
    COALESCE(SUM(open_complaints), 0) AS open_complaints
FROM v_village_kpis
GROUP BY district, block;
