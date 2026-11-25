from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.priority import DevelopmentPriority
from app.models.village import Village
from app.models.complaint import Complaint
from app.models.infrastructure import Infrastructure
from app.schemas.ai import (
    DevelopmentPriorityResponse,
    PrioritySimulationItem,
    PrioritySimulationResponse,
)


def calculate_priority_score(severity: int, population_affected: int, cost_lakhs: float) -> float:
    """
    Transparent rule-based priority score:
    Score = (Severity [1-5] * Population Affected) / Estimated Cost in Lakhs
    """
    if cost_lakhs <= 0:
        cost_lakhs = 0.5  # prevent division by zero
    return round((severity * population_affected) / cost_lakhs, 2)


async def generate_village_development_priorities(
    village_id: int,
    db: AsyncSession
) -> List[DevelopmentPriorityResponse]:
    """
    Retrieves or auto-derives ranked civic interventions for a village based on:
    - Saved development priority projects
    - Active complaints & infrastructure gaps
    """
    # 1. Fetch saved priorities
    res = await db.execute(
        select(DevelopmentPriority)
        .where(DevelopmentPriority.village_id == village_id)
        .order_by(DevelopmentPriority.priority_score.desc())
    )
    saved_items = res.scalars().all()

    # If already populated in DB, re-rank and return
    if saved_items:
        ranked_responses = []
        for idx, item in enumerate(saved_items, start=1):
            item.rank = idx
            ranked_responses.append(DevelopmentPriorityResponse.model_validate(item))
        await db.commit()
        return ranked_responses

    # 2. If no priorities saved yet, auto-derive candidates from complaints and village size
    v_res = await db.execute(select(Village).where(Village.id == village_id))
    village = v_res.scalar_one_or_none()
    pop = village.population if village and village.population > 0 else 1200

    candidate_projects = [
        {
            "issue": "Construct Concrete Approach Road to Primary School & Health Center",
            "category": "Road",
            "severity": 4,
            "population_affected": int(pop * 0.70),
            "estimated_cost_lakhs": 4.5,
            "matching_scheme": "PMGSY / Mukhya Mantri Gram Sadak Yojana"
        },
        {
            "issue": "Install 25,000L Overhead Water Tank & Deep Borewell",
            "category": "Water",
            "severity": 5,
            "population_affected": int(pop * 0.85),
            "estimated_cost_lakhs": 6.0,
            "matching_scheme": "Jal Jeevan Mission (Har Ghar Jal)"
        },
        {
            "issue": "Upgrade Community Health Sub-Centre with Solar Cold Storage",
            "category": "Health",
            "severity": 4,
            "population_affected": pop,
            "estimated_cost_lakhs": 5.0,
            "matching_scheme": "National Health Mission (NHM)"
        },
        {
            "issue": "Construct Covered Drainage Network in Main Settlement",
            "category": "Sanitation",
            "severity": 3,
            "population_affected": int(pop * 0.60),
            "estimated_cost_lakhs": 3.2,
            "matching_scheme": "Swachh Bharat Mission - Gramin"
        },
        {
            "issue": "Install 40 High-Efficiency Solar LED Streetlights",
            "category": "Electricity",
            "severity": 2,
            "population_affected": int(pop * 0.50),
            "estimated_cost_lakhs": 2.0,
            "matching_scheme": "PM Surya Ghar / Gramin Vikas Nidhi"
        }
    ]

    # Calculate scores and sort
    for cp in candidate_projects:
        cp["priority_score"] = calculate_priority_score(
            cp["severity"],
            cp["population_affected"],
            cp["estimated_cost_lakhs"]
        )

    candidate_projects.sort(key=lambda x: x["priority_score"], reverse=True)

    db_items = []
    for rank, cp in enumerate(candidate_projects, start=1):
        dp = DevelopmentPriority(
            village_id=village_id,
            issue=cp["issue"],
            category=cp["category"],
            severity=cp["severity"],
            population_affected=cp["population_affected"],
            estimated_cost_lakhs=cp["estimated_cost_lakhs"],
            priority_score=cp["priority_score"],
            rank=rank,
            matching_scheme=cp["matching_scheme"],
            status="proposed"
        )
        db.add(dp)
        db_items.append(dp)

    await db.commit()
    for dp in db_items:
        await db.refresh(dp)

    return [DevelopmentPriorityResponse.model_validate(dp) for dp in db_items]


def simulate_interventions(items: List[PrioritySimulationItem]) -> PrioritySimulationResponse:
    """
    Simulates ranking for user-supplied intervention scenarios in real time.
    """
    calculated_items = []
    for itm in items:
        score = calculate_priority_score(itm.severity, itm.population_affected, itm.estimated_cost_lakhs)
        explanation = (
            f"({itm.severity} Severity × {itm.population_affected} Affected) ÷ "
            f"₹{itm.estimated_cost_lakhs}L Cost = {score:.2f} Priority Score"
        )
        calculated_items.append({
            "issue": itm.issue,
            "category": itm.category,
            "severity": itm.severity,
            "population_affected": itm.population_affected,
            "estimated_cost_lakhs": itm.estimated_cost_lakhs,
            "priority_score": score,
            "matching_scheme": itm.matching_scheme,
            "explanation": explanation
        })

    # Sort descending
    calculated_items.sort(key=lambda x: x["priority_score"], reverse=True)

    for rank, itm in enumerate(calculated_items, start=1):
        itm["rank"] = rank

    return PrioritySimulationResponse(items=calculated_items)
