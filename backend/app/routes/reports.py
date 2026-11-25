import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.core.config import settings
from app.core.security import require_role
from app.models.village import Village
from app.models.user import User
from app.schemas.dashboard import ReportGenerateRequest, ReportGenerateResponse
from app.services.dashboard_service import compute_village_dashboard_metrics
from app.services.priority_planner import generate_village_development_priorities
from app.services.pdf_generator import generate_village_pdf_report

router = APIRouter(prefix="/reports", tags=["Report Generator"])


@router.post("/generate", response_model=ReportGenerateResponse)
async def generate_pdf_report(
    payload: ReportGenerateRequest,
    current_user: User = Depends(require_role(["panchayat", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Automated PDF Report Generator (Module 9):
    Compiles live village KPIs, coverage %, and AI-ranked development priorities
    into a presentation-ready GPDP PDF report.
    """
    # 1. Fetch village data
    v_res = await db.execute(select(Village).where(Village.id == payload.village_id))
    village = v_res.scalar_one_or_none()
    if not village:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Village with ID {payload.village_id} does not exist."
        )

    # 2. Gather metrics and priorities
    metrics = await compute_village_dashboard_metrics(payload.village_id, db)
    priorities_models = await generate_village_development_priorities(payload.village_id, db)
    priorities_list = [p.model_dump() for p in priorities_models]

    # 3. Generate PDF
    download_url = generate_village_pdf_report(metrics, priorities_list)

    return ReportGenerateResponse(
        village_id=village.id,
        village_name=village.name,
        report_type=payload.report_type,
        download_url=download_url,
        generated_at=datetime.now(timezone.utc).isoformat()
    )
