from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.core.security import require_role
from app.models.village import Village
from app.models.household import Household
from app.models.infrastructure import Infrastructure
from app.models.complaint import Complaint
from app.models.user import User
from app.schemas.village import VillageCreate, VillageResponse, VillageDetailResponse

router = APIRouter(prefix="/villages", tags=["Villages"])


@router.get("", response_model=List[VillageResponse])
async def list_villages(
    district: Optional[str] = Query(None, description="Filter by district"),
    search: Optional[str] = Query(None, description="Search by village name"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve list of all villages with demographic baselines.
    """
    query = select(Village)
    if district:
        query = query.where(Village.district.ilike(f"%{district}%"))
    if search:
        query = query.where(Village.name.ilike(f"%{search}%"))

    query = query.order_by(Village.name)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{village_id}", response_model=VillageDetailResponse)
async def get_village_profile(
    village_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve single village profile along with asset, household, and complaint summary counts.
    """
    result = await db.execute(select(Village).where(Village.id == village_id))
    village = result.scalar_one_or_none()
    if not village:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Village with ID {village_id} not found."
        )

    # Compute summary counts
    hh_count = await db.scalar(select(func.count(Household.id)).where(Household.village_id == village_id)) or 0
    infra_count = await db.scalar(select(func.count(Infrastructure.id)).where(Infrastructure.village_id == village_id)) or 0
    complaint_count = await db.scalar(select(func.count(Complaint.id)).where(Complaint.village_id == village_id)) or 0
    open_complaints = await db.scalar(
        select(func.count(Complaint.id)).where(
            Complaint.village_id == village_id,
            Complaint.status.in_(["submitted", "under_review"])
        )
    ) or 0

    return VillageDetailResponse(
        id=village.id,
        name=village.name,
        block=village.block,
        district=village.district,
        state=village.state,
        population=village.population,
        literacy_rate=village.literacy_rate,
        latitude=village.latitude,
        longitude=village.longitude,
        created_at=village.created_at,
        updated_at=village.updated_at,
        total_households=hh_count,
        total_infrastructure=infra_count,
        total_complaints=complaint_count,
        open_complaints=open_complaints
    )


@router.post("", response_model=VillageResponse, status_code=status.HTTP_201_CREATED)
async def create_village(
    payload: VillageCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new village master record. Restricted to District / Block Administrators.
    """
    # Check duplicate
    existing = await db.execute(
        select(Village).where(
            Village.name == payload.name,
            Village.block == payload.block,
            Village.district == payload.district
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Village '{payload.name}' already exists in block '{payload.block}', district '{payload.district}'."
        )

    village = Village(**payload.model_dump())
    db.add(village)
    await db.commit()
    await db.refresh(village)
    return village
