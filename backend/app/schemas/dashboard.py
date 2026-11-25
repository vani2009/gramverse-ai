from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ChatQueryRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=1000)
    village_id: Optional[int] = None
    conversation_id: Optional[str] = None


class ChatSource(BaseModel):
    title: str
    citation: str


class ChatQueryResponse(BaseModel):
    query: str
    response: str
    sources: List[ChatSource]
    confidence: float
    model_version: str
    timestamp: str


class VillageCoverage(BaseModel):
    water_tap_pct: float
    electricity_pct: float
    toilet_pct: float
    pucca_house_pct: float


class VillageComplaintsSummary(BaseModel):
    total: int
    open: int
    resolved: int
    by_category: Dict[str, int]


class VillageDashboardResponse(BaseModel):
    village_id: int
    village_name: str
    block: str
    district: str
    state: str
    population: int
    literacy_rate: float
    households_surveyed: int
    coverage: VillageCoverage
    complaints: VillageComplaintsSummary
    total_infrastructure_assets: int
    cached: Optional[bool] = Field(default=False, alias="_cached")


class ReportGenerateRequest(BaseModel):
    village_id: int
    report_type: str = "GPDP"  # GPDP, INFRASTRUCTURE, HEALTH


class ReportGenerateResponse(BaseModel):
    village_id: int
    village_name: str
    report_type: str
    download_url: str
    generated_at: str
