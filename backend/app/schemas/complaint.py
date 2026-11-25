from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ComplaintImageResponse(BaseModel):
    id: int
    complaint_id: int
    image_url: str
    cv_detected_labels: List[Dict[str, Any]] = []
    cv_confidence: Optional[float] = None
    model_version: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintResponse(BaseModel):
    id: int
    citizen_id: Optional[int] = None
    village_id: int
    description: str
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None
    model_version: Optional[str] = None
    official_override_category: Optional[str] = None
    official_remarks: Optional[str] = None
    images: List[ComplaintImageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintStatusUpdate(BaseModel):
    status: Optional[str] = None  # submitted, under_review, resolved, rejected
    official_override_category: Optional[str] = None
    official_remarks: Optional[str] = None


class PaginatedComplaints(BaseModel):
    items: List[ComplaintResponse]
    total: int
    page: int
    limit: int
    total_pages: int
