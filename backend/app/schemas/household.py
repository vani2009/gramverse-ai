from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class HouseholdBase(BaseModel):
    village_id: int
    household_head: str
    family_size: int = Field(default=1, ge=1)
    monthly_income: float = Field(default=0.0, ge=0.0)
    housing_type: str = "kutcha"  # kutcha, semi_pucca, pucca
    pucca_house: bool = False
    land_holding_acres: float = Field(default=0.0, ge=0.0)
    water_tap_available: bool = False
    electricity_available: bool = False
    toilet_available: bool = False
    caste_category: str = "General"  # General, OBC, SC, ST
    qr_code_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class HouseholdCreate(HouseholdBase):
    pass


class HouseholdUpdate(BaseModel):
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
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class HouseholdResponse(HouseholdBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedHouseholds(BaseModel):
    items: List[HouseholdResponse]
    total: int
    page: int
    limit: int
    total_pages: int
