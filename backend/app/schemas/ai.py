from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# -------------------------------------------------------------
# Scheme Recommendation Schemas
# -------------------------------------------------------------

class SchemeBase(BaseModel):
    name: str
    code: str
    department: str
    description: str
    benefit_summary: Optional[str] = None
    application_deadline: Optional[str] = None
    eligibility_rules: Dict[str, Any] = Field(default_factory=dict)
    required_documents: List[str] = Field(default_factory=list)


class SchemeResponse(SchemeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SchemeMatchResult(BaseModel):
    scheme_id: Optional[int] = None
    code: str
    name: str
    department: str
    match_status: str  # eligible, potential, ineligible
    matched_criteria: List[str] = []
    unmet_criteria: List[str] = []
    required_documents: List[str] = []
    benefit_summary: Optional[str] = None


class SchemeRecommendationRequest(BaseModel):
    household_id: Optional[int] = None
    # Real-time manual evaluation attributes (e.g. for Citizen Scheme Explorer)
    monthly_income: Optional[float] = None
    housing_type: Optional[str] = None  # kutcha, semi_pucca, pucca
    pucca_house: Optional[bool] = None
    land_holding_acres: Optional[float] = None
    water_tap_available: Optional[bool] = None
    electricity_available: Optional[bool] = None
    toilet_available: Optional[bool] = None
    caste_category: Optional[str] = None


class SchemeRecommendationResponse(BaseModel):
    household_id: Optional[int] = None
    total_evaluated: int
    eligible_count: int
    potential_count: int
    eligible_schemes: List[SchemeMatchResult]
    potential_schemes: List[SchemeMatchResult]


# -------------------------------------------------------------
# Development Priority Planner Schemas
# -------------------------------------------------------------

class DevelopmentPriorityBase(BaseModel):
    issue: str
    category: str
    severity: int = Field(default=3, ge=1, le=5)
    population_affected: int = Field(default=0, ge=0)
    estimated_cost_lakhs: float = Field(default=1.0, gt=0.0)
    matching_scheme: Optional[str] = None
    status: str = "proposed"


class DevelopmentPriorityCreate(DevelopmentPriorityBase):
    village_id: int


class DevelopmentPriorityResponse(DevelopmentPriorityBase):
    id: int
    village_id: int
    priority_score: float
    rank: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PrioritySimulationItem(BaseModel):
    issue: str
    category: str
    severity: int = Field(..., ge=1, le=5)
    population_affected: int = Field(..., ge=0)
    estimated_cost_lakhs: float = Field(..., gt=0.0)
    matching_scheme: Optional[str] = None


class PrioritySimulationResponse(BaseModel):
    formula: str = "Score = (Severity [1-5] * Population Affected) / Estimated Cost in Lakhs"
    items: List[Dict[str, Any]]
