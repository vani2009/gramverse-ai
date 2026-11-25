from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.core.security import get_current_user, require_role
from app.models.scheme import Scheme
from app.models.village import Village
from app.models.user import User
from app.schemas.ai import (
    SchemeResponse,
    SchemeRecommendationRequest,
    SchemeRecommendationResponse,
    DevelopmentPriorityResponse,
    PrioritySimulationItem,
    PrioritySimulationResponse,
)
from app.schemas.dashboard import (
    ChatQueryRequest,
    ChatQueryResponse,
)
from app.services.scheme_engine import (
    evaluate_household_welfare_schemes,
    ensure_schemes_seeded,
)
from app.services.priority_planner import (
    generate_village_development_priorities,
    simulate_interventions,
)
from app.services.rag_service import query_grambot_rag

router = APIRouter(tags=["AI Intelligence & Decision Support"])


@router.post("/ai/chat", response_model=ChatQueryResponse)
async def chat_with_grambot(
    payload: ChatQueryRequest,
    current_user: User = Depends(get_current_user)
):
    """
    GramBot LLM + RAG Chatbot Gateway (Module 5):
    Answers questions about GPDP budgets, Jal Jeevan Mission water coverage,
    and scheme SOPs, strictly grounded in verified source citations.
    """
    return query_grambot_rag(query=payload.message, village_id=payload.village_id)


@router.get("/schemes", response_model=List[SchemeResponse])
async def list_government_schemes(
    department: Optional[str] = Query(None, description="Filter by ministry or department"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all government welfare schemes and eligibility rule sets (PMAY-G, PM-KISAN, JJM, etc.).
    """
    await ensure_schemes_seeded(db)
    query = select(Scheme)
    if department:
        query = query.where(Scheme.department.ilike(f"%{department}%"))

    result = await db.execute(query.order_by(Scheme.name))
    return result.scalars().all()


@router.post("/ai/recommend-schemes", response_model=SchemeRecommendationResponse)
async def recommend_welfare_schemes(
    payload: SchemeRecommendationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Government Scheme Recommendation Engine (Module 4):
    Evaluates household socioeconomic profile against master scheme criteria.
    Returns matched schemes, required documents, and step-by-step guidance.
    """
    raw_attrs = payload.model_dump(exclude={"household_id"}, exclude_none=True)
    return await evaluate_household_welfare_schemes(
        db=db,
        household_id=payload.household_id,
        raw_attributes=raw_attrs
    )


@router.get("/ai/development-priorities/{village_id}", response_model=List[DevelopmentPriorityResponse])
async def get_development_priorities(
    village_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    AI Development Prioritization Planner (Module 3):
    Returns ranked, explainable civic works projects for the village backed by the formula:
    Score = (Severity [1-5] * Population Affected) / Estimated Cost in Lakhs.
    """
    v_res = await db.execute(select(Village).where(Village.id == village_id))
    if not v_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Village with ID {village_id} does not exist."
        )

    return await generate_village_development_priorities(village_id, db)


@router.post("/ai/simulate-priorities", response_model=PrioritySimulationResponse)
async def simulate_priority_planner(
    items: List[PrioritySimulationItem],
    current_user: User = Depends(require_role(["panchayat", "admin"]))
):
    """
    Interactive Development Priority Simulator:
    Allows officials to simulate changing severity, cost, or population parameters
    and observe recalculated rankings and transparent mathematical scores.
    """
    return simulate_interventions(items)
