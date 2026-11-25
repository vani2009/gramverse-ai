import json
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import redis.asyncio as aioredis

from app.core.config import settings
from app.models.village import Village
from app.models.household import Household
from app.models.complaint import Complaint
from app.models.infrastructure import Infrastructure

# Redis connection client with graceful fallback
_redis_pool: Optional[aioredis.Redis] = None


async def get_redis_client() -> Optional[aioredis.Redis]:
    global _redis_pool
    if _redis_pool is None:
        try:
            _redis_pool = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=1.0,
                socket_connect_timeout=1.0
            )
            # Test ping
            await _redis_pool.ping()
        except Exception:
            _redis_pool = None
    return _redis_pool


async def compute_village_dashboard_metrics(village_id: int, db: AsyncSession) -> Dict[str, Any]:
    """Computes aggregated village KPIs directly from PostgreSQL database."""
    # 1. Fetch village master details
    v_res = await db.execute(select(Village).where(Village.id == village_id))
    village = v_res.scalar_one_or_none()
    if not village:
        return {}

    # 2. Household aggregates
    hh_total = await db.scalar(select(func.count(Household.id)).where(Household.village_id == village_id)) or 0
    water_count = await db.scalar(select(func.count(Household.id)).where(Household.village_id == village_id, Household.water_tap_available == True)) or 0
    elec_count = await db.scalar(select(func.count(Household.id)).where(Household.village_id == village_id, Household.electricity_available == True)) or 0
    toilet_count = await db.scalar(select(func.count(Household.id)).where(Household.village_id == village_id, Household.toilet_available == True)) or 0
    pucca_count = await db.scalar(select(func.count(Household.id)).where(Household.village_id == village_id, Household.pucca_house == True)) or 0

    water_pct = round((water_count / hh_total * 100.0), 1) if hh_total > 0 else 0.0
    elec_pct = round((elec_count / hh_total * 100.0), 1) if hh_total > 0 else 0.0
    toilet_pct = round((toilet_count / hh_total * 100.0), 1) if hh_total > 0 else 0.0
    pucca_pct = round((pucca_count / hh_total * 100.0), 1) if hh_total > 0 else 0.0

    # 3. Complaint aggregates
    complaint_total = await db.scalar(select(func.count(Complaint.id)).where(Complaint.village_id == village_id)) or 0
    open_count = await db.scalar(select(func.count(Complaint.id)).where(Complaint.village_id == village_id, Complaint.status.in_(["submitted", "under_review"]))) or 0
    resolved_count = await db.scalar(select(func.count(Complaint.id)).where(Complaint.village_id == village_id, Complaint.status == "resolved")) or 0

    # Category breakdown
    cat_query = select(
        func.coalesce(Complaint.official_override_category, Complaint.ai_category, "Other"),
        func.count(Complaint.id)
    ).where(Complaint.village_id == village_id).group_by(func.coalesce(Complaint.official_override_category, Complaint.ai_category, "Other"))
    cat_res = await db.execute(cat_query)
    complaints_by_category = {cat: count for cat, count in cat_res.all()}

    # 4. Infrastructure count
    infra_total = await db.scalar(select(func.count(Infrastructure.id)).where(Infrastructure.village_id == village_id)) or 0

    return {
        "village_id": village.id,
        "village_name": village.name,
        "block": village.block,
        "district": village.district,
        "state": village.state,
        "population": village.population,
        "literacy_rate": village.literacy_rate,
        "households_surveyed": hh_total,
        "coverage": {
            "water_tap_pct": water_pct,
            "electricity_pct": elec_pct,
            "toilet_pct": toilet_pct,
            "pucca_house_pct": pucca_pct,
        },
        "complaints": {
            "total": complaint_total,
            "open": open_count,
            "resolved": resolved_count,
            "by_category": complaints_by_category,
        },
        "total_infrastructure_assets": infra_total,
    }


async def get_cached_village_dashboard(village_id: int, db: AsyncSession) -> Dict[str, Any]:
    """Retrieves dashboard KPIs from Redis cache with automatic fallback to database."""
    cache_key = f"dashboard:village:{village_id}"
    redis_client = await get_redis_client()

    # 1. Try fetching from Redis
    if redis_client:
        try:
            cached_val = await redis_client.get(cache_key)
            if cached_val:
                data = json.loads(cached_val)
                data["_cached"] = True
                return data
        except Exception:
            pass

    # 2. Compute from DB
    data = await compute_village_dashboard_metrics(village_id, db)
    if not data:
        return {}

    # 3. Cache in Redis (10 minutes = 600 seconds)
    if redis_client:
        try:
            await redis_client.set(cache_key, json.dumps(data), ex=600)
        except Exception:
            pass

    data["_cached"] = False
    return data
