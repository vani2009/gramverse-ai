import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.core.security import get_current_user, require_role
from app.core.storage import save_upload_file
from app.models.complaint import Complaint, ComplaintImage
from app.models.village import Village
from app.models.user import User
from app.schemas.complaint import (
    ComplaintResponse,
    ComplaintStatusUpdate,
    PaginatedComplaints,
)
from app.services.ai_classifier import classify_complaint_text, analyze_complaint_image

router = APIRouter(prefix="/complaints", tags=["Citizen Complaints & Grievances"])


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    village_id: int = Form(...),
    description: str = Form(..., min_length=5, max_length=2000),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Citizen grievance submission endpoint supporting:
    - Text description & GPS location
    - Evidence photo / voice note upload
    - Auto-execution of NLP complaint categorization and CV defect analysis
    """
    # 1. Verify village exists
    v_res = await db.execute(select(Village).where(Village.id == village_id))
    if not v_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Village with ID {village_id} does not exist."
        )

    # 2. Run NLP categorization
    ai_cat, ai_conf, nlp_ver = classify_complaint_text(description)

    # 3. Create complaint record
    complaint = Complaint(
        citizen_id=current_user.id,
        village_id=village_id,
        description=description,
        status="submitted",
        latitude=latitude,
        longitude=longitude,
        ai_category=ai_cat,
        ai_confidence=ai_conf,
        model_version=nlp_ver
    )
    db.add(complaint)
    await db.flush()

    # 4. Handle evidence image upload if provided
    if file and file.filename:
        file_url = await save_upload_file(file, subfolder="complaints")
        cv_labels, cv_conf, cv_ver = analyze_complaint_image(file.filename, ai_cat)

        image_record = ComplaintImage(
            complaint_id=complaint.id,
            image_url=file_url,
            cv_detected_labels=cv_labels,
            cv_confidence=cv_conf,
            model_version=cv_ver
        )
        db.add(image_record)
        await db.flush()

    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.get("", response_model=PaginatedComplaints)
async def list_complaints(
    village_id: Optional[int] = Query(None, description="Filter by village ID"),
    status: Optional[str] = Query(None, description="Filter by status: submitted, under_review, resolved, rejected"),
    category: Optional[str] = Query(None, description="Filter by category: Road, Water, Sanitation, Electricity, etc."),
    citizen_id: Optional[int] = Query(None, description="Filter by citizen user ID"),
    search: Optional[str] = Query(None, description="Search complaint description"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve complaints feed with filtering by village, status, category, and citizen ID.
    """
    query = select(Complaint)
    if village_id is not None:
        query = query.where(Complaint.village_id == village_id)
    if status:
        query = query.where(Complaint.status == status)
    if category:
        query = query.where(
            (Complaint.official_override_category == category) |
            (Complaint.ai_category == category)
        )
    if citizen_id is not None:
        query = query.where(Complaint.citizen_id == citizen_id)
    if search:
        query = query.where(Complaint.description.ilike(f"%{search}%"))

    # Compute count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * limit
    query = query.order_by(Complaint.id.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PaginatedComplaints(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve single complaint details including evidence photographs and CV inspection results.
    """
    res = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = res.scalar_one_or_none()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found."
        )
    return complaint


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    current_user: User = Depends(require_role(["panchayat", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Authorized Panchayat review endpoint:
    - Update complaint status (under_review, resolved, rejected)
    - Review and override AI predicted category (e.g. override from Water to Sanitation)
    - Attach official resolution remarks
    """
    res = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = res.scalar_one_or_none()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found."
        )

    if payload.status:
        complaint.status = payload.status
    if payload.official_override_category:
        complaint.official_override_category = payload.official_override_category
    if payload.official_remarks:
        complaint.official_remarks = payload.official_remarks

    await db.commit()
    await db.refresh(complaint)
    return complaint
