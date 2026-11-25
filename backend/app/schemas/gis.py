from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude] per RFC 7946


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


class InfrastructureBase(BaseModel):
    name: str
    type: str  # water_tank, school, health_center, road, streetlight, sanitation_block
    condition_status: str = "operational"  # operational, needs_repair, critical, under_construction
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    capacity_or_size: Optional[str] = None
    photo_url: Optional[str] = None
    extra_data: Dict[str, Any] = Field(default_factory=dict)


class InfrastructureCreate(InfrastructureBase):
    village_id: int


class InfrastructureUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    condition_status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_or_size: Optional[str] = None
    photo_url: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None


class InfrastructureResponse(InfrastructureBase):
    id: int
    village_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
