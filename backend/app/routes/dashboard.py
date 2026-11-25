from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.village import Village
from app.schemas.dashboard import VillageDashboardResponse
from app.services.dashboard_service import get_cached_village_dashboard, compute_village_dashboard_metrics

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])


@router.get("/village/{village_id}", response_model=VillageDashboardResponse)
async def get_village_dashboard(
    village_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Village Profile & KPI Dashboard endpoint (Module 2):
    Returns population, literacy rate, water coverage %, electricity %,
    sanitation %, and live complaint breakdown. Cached in Redis (TTL: 10 mins).
    """
    data = await get_cached_village_dashboard(village_id, db)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Village with ID {village_id} not found."
        )
    return data


@router.get("/analytics", response_model=List[Dict[str, Any]])
async def get_multi_village_analytics(
    db: AsyncSession = Depends(get_db)
):
    """
    Multi-village comparative analytics for District & Block Administrators (Module 10):
    Returns side-by-side infrastructure coverage % and development indicators across all villages.
    """
    v_res = await db.execute(select(Village.id))
    village_ids = v_res.scalars().all()

    analytics = []
    for vid in village_ids:
        metrics = await compute_village_dashboard_metrics(vid, db)
        if metrics:
            analytics.append({
                "village_id": metrics["village_id"],
                "village_name": metrics["village_name"],
                "district": metrics["district"],
                "population": metrics["population"],
                "water_tap_coverage_pct": metrics["coverage"]["water_tap_pct"],
                "electricity_coverage_pct": metrics["coverage"]["electricity_pct"],
                "toilet_coverage_pct": metrics["coverage"]["toilet_pct"],
                "pucca_house_pct": metrics["coverage"]["pucca_house_pct"],
                "open_complaints": metrics["complaints"]["open"],
                "resolved_complaints": metrics["complaints"]["resolved"]
            })

    return analytics
