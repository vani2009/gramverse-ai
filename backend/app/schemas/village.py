from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class VillageBase(BaseModel):
    name: str
    block: str
    district: str
    state: str = "Madhya Pradesh"
    population: int = 0
    literacy_rate: float = 0.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class VillageCreate(VillageBase):
    pass


class VillageUpdate(BaseModel):
    name: Optional[str] = None
    block: Optional[str] = None
    district: Optional[str] = None
    population: Optional[int] = None
    literacy_rate: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class VillageResponse(VillageBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VillageDetailResponse(VillageResponse):
    total_households: int = 0
    total_infrastructure: int = 0
    total_complaints: int = 0
    open_complaints: int = 0
