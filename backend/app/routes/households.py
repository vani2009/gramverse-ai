import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.core.security import require_role
from app.models.household import Household
from app.models.village import Village
from app.models.user import User
from app.schemas.household import (
    HouseholdCreate,
    HouseholdUpdate,
    HouseholdResponse,
    PaginatedHouseholds,
)

router = APIRouter(prefix="/households", tags=["Households"])


@router.get("", response_model=PaginatedHouseholds)
async def list_households(
    village_id: Optional[int] = Query(None, description="Filter by village ID"),
    housing_type: Optional[str] = Query(None, description="Filter by housing type: kutcha, semi_pucca, pucca"),
    pucca_house: Optional[bool] = Query(None, description="Filter by pucca house status"),
    max_income: Optional[float] = Query(None, description="Filter by maximum monthly income"),
    caste_category: Optional[str] = Query(None, description="Filter by caste category: General, OBC, SC, ST"),
    search: Optional[str] = Query(None, description="Search by household head name or QR ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve paginated household registry with multi-criteria filters for scheme matching and panchayat surveys.
    """
    query = select(Household)

    if village_id is not None:
        query = query.where(Household.village_id == village_id)
    if housing_type:
        query = query.where(Household.housing_type == housing_type)
    if pucca_house is not None:
        query = query.where(Household.pucca_house == pucca_house)
    if max_income is not None:
        query = query.where(Household.monthly_income <= max_income)
    if caste_category:
        query = query.where(Household.caste_category == caste_category)
    if search:
        query = query.where(
            (Household.household_head.ilike(f"%{search}%")) |
            (Household.qr_code_id.ilike(f"%{search}%"))
        )

    # Compute total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # Paginate
    offset = (page - 1) * limit
    query = query.order_by(Household.id.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PaginatedHouseholds(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/{household_id}", response_model=HouseholdResponse)
async def get_household(
    household_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve single household profile by ID.
    """
    result = await db.execute(select(Household).where(Household.id == household_id))
    household = result.scalar_one_or_none()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Household with ID {household_id} not found."
        )
    return household


@router.post("", response_model=HouseholdResponse, status_code=status.HTTP_201_CREATED)
async def create_household(
    payload: HouseholdCreate,
    current_user: User = Depends(require_role(["survey", "panchayat", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new household in the registry. Restricted to Surveyors, Panchayat officials, and Admins.
    """
    # Verify village exists
    v_result = await db.execute(select(Village).where(Village.id == payload.village_id))
    if not v_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Village with ID {payload.village_id} does not exist."
        )

    # Check QR code uniqueness if provided
    if payload.qr_code_id:
        existing_qr = await db.execute(
            select(Household).where(Household.qr_code_id == payload.qr_code_id)
        )
        if existing_qr.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Household with QR Code ID '{payload.qr_code_id}' is already registered."
            )

    household = Household(**payload.model_dump())
    db.add(household)
    await db.commit()
    await db.refresh(household)
    return household


@router.patch("/{household_id}", response_model=HouseholdResponse)
async def update_household(
    household_id: int,
    payload: HouseholdUpdate,
    current_user: User = Depends(require_role(["survey", "panchayat", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update household attributes.
    """
    result = await db.execute(select(Household).where(Household.id == household_id))
    household = result.scalar_one_or_none()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Household with ID {household_id} not found."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(household, field, value)

    await db.commit()
    await db.refresh(household)
    return household
