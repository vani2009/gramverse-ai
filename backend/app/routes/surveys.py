from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.core.security import require_role, get_current_user
from app.models.survey import Survey
from app.models.household import Household
from app.models.user import User
from app.schemas.survey import (
    SurveyCreate,
    SurveySyncItem,
    SurveySyncRequest,
    SurveySyncResponse,
    SurveyResponse,
)
from app.services.survey_sync import process_survey_sync_batch

router = APIRouter(prefix="/surveys", tags=["Surveys & Offline Sync"])


@router.post("/sync", response_model=SurveySyncResponse)
async def sync_offline_surveys(
    payload: SurveySyncRequest,
    current_user: User = Depends(require_role(["survey", "panchayat", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Offline Survey Synchronization Engine.
    Receives batch of surveys captured offline on the PWA.
    De-duplicates and updates records idempotently via client_uuid.
    """
    return await process_survey_sync_batch(db, payload.surveys, current_user)


@router.post("", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
async def submit_single_survey(
    payload: SurveyCreate,
    current_user: User = Depends(require_role(["survey", "panchayat", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a single survey online.
    """
    sync_item = SurveySyncItem(**payload.model_dump())
    batch_res = await process_survey_sync_batch(db, [sync_item], current_user)
    if batch_res.failed_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=batch_res.results[0].message
        )

    survey_id = batch_res.results[0].survey_id
    res = await db.execute(select(Survey).where(Survey.id == survey_id))
    return res.scalar_one()


@router.get("", response_model=List[SurveyResponse])
async def list_surveys(
    household_id: Optional[int] = Query(None, description="Filter by household ID"),
    survey_type: Optional[str] = Query(None, description="Filter by survey type"),
    volunteer_id: Optional[int] = Query(None, description="Filter by surveyor ID"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve survey records with optional filtering.
    """
    query = select(Survey)
    if household_id is not None:
        query = query.where(Survey.household_id == household_id)
    if survey_type:
        query = query.where(Survey.survey_type == survey_type)
    if volunteer_id is not None:
        query = query.where(Survey.volunteer_id == volunteer_id)

    query = query.order_by(Survey.id.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{survey_id}", response_model=SurveyResponse)
async def get_survey(
    survey_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve single survey record by ID.
    """
    res = await db.execute(select(Survey).where(Survey.id == survey_id))
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey with ID {survey_id} not found."
        )
    return survey
