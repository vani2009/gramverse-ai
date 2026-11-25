from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class SurveyBase(BaseModel):
    survey_type: str = "household"  # household, infrastructure, health, education
    survey_data: Dict[str, Any] = Field(default_factory=dict)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SurveyCreate(SurveyBase):
    client_uuid: str
    household_id: Optional[int] = None


class SurveySyncItem(SurveyBase):
    client_uuid: str
    household_id: Optional[int] = None
    village_id: Optional[int] = None
    # Embedded household profile fields (for new household registrations captured offline)
    household_head: Optional[str] = None
    family_size: Optional[int] = None
    monthly_income: Optional[float] = None
    housing_type: Optional[str] = None
    pucca_house: Optional[bool] = None
    land_holding_acres: Optional[float] = None
    water_tap_available: Optional[bool] = None
    electricity_available: Optional[bool] = None
    toilet_available: Optional[bool] = None
    caste_category: Optional[str] = None
    qr_code_id: Optional[str] = None
    client_timestamp: Optional[datetime] = None


class SurveySyncRequest(BaseModel):
    surveys: List[SurveySyncItem] = Field(..., min_length=1, max_length=500)


class SyncItemResult(BaseModel):
    client_uuid: str
    status: str  # created, updated, error
    survey_id: Optional[int] = None
    household_id: Optional[int] = None
    message: Optional[str] = None


class SurveySyncResponse(BaseModel):
    total_received: int
    inserted_count: int
    updated_count: int
    failed_count: int
    results: List[SyncItemResult]


class SurveyResponse(SurveyBase):
    id: int
    client_uuid: str
    household_id: Optional[int] = None
    volunteer_id: Optional[int] = None
    synced_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
