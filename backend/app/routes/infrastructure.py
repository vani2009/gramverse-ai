import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.core.security import require_role
from app.models.infrastructure import Infrastructure
from app.models.complaint import Complaint
from app.models.village import Village
from app.models.user import User
from app.schemas.gis import (
    InfrastructureCreate,
    InfrastructureUpdate,
    InfrastructureResponse,
    GeoJSONFeatureCollection,
    GeoJSONFeature,
    GeoJSONGeometry,
)

router = APIRouter(tags=["Infrastructure & Spatial GIS"])


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS points in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


# -------------------------------------------------------------
# Standard Infrastructure CRUD Endpoints
# -------------------------------------------------------------

@router.post("/infrastructure", response_model=InfrastructureResponse, status_code=status.HTTP_201_CREATED)
async def create_infrastructure_asset(
    payload: InfrastructureCreate,
    current_user: User = Depends(require_role(["panchayat", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Register a civic infrastructure asset. Restricted to Panchayat officials and Admins.
    """
    # Verify village exists
    v_res = await db.execute(select(Village).where(Village.id == payload.village_id))
    if not v_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Village with ID {payload.village_id} does not exist."
        )

    asset = Infrastructure(**payload.model_dump())
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset


@router.get("/infrastructure", response_model=List[InfrastructureResponse])
async def list_infrastructure(
    village_id: Optional[int] = Query(None, description="Filter by village ID"),
    type: Optional[str] = Query(None, description="Filter by asset type: water_tank, school, health_center, etc."),
    condition_status: Optional[str] = Query(None, description="Filter by status: operational, needs_repair, critical"),
    db: AsyncSession = Depends(get_db)
):
    """
    List civic infrastructure assets with optional category and condition filters.
    """
    query = select(Infrastructure)
    if village_id is not None:
        query = query.where(Infrastructure.village_id == village_id)
    if type:
        query = query.where(Infrastructure.type == type)
    if condition_status:
        query = query.where(Infrastructure.condition_status == condition_status)

    query = query.order_by(Infrastructure.name)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/infrastructure/{asset_id}", response_model=InfrastructureResponse)
async def get_infrastructure_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve single infrastructure asset by ID.
    """
    res = await db.execute(select(Infrastructure).where(Infrastructure.id == asset_id))
    asset = res.scalar_one_or_none()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Infrastructure asset with ID {asset_id} not found."
        )
    return asset


@router.patch("/infrastructure/{asset_id}", response_model=InfrastructureResponse)
async def update_infrastructure_asset(
    asset_id: int,
    payload: InfrastructureUpdate,
    current_user: User = Depends(require_role(["panchayat", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update infrastructure asset status, condition, or details.
    """
    res = await db.execute(select(Infrastructure).where(Infrastructure.id == asset_id))
    asset = res.scalar_one_or_none()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Infrastructure asset with ID {asset_id} not found."
        )

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(asset, field, val)

    await db.commit()
    await db.refresh(asset)
    return asset


# -------------------------------------------------------------
# Spatial GIS Endpoints for Leaflet Maps (RFC 7946 GeoJSON)
# -------------------------------------------------------------

@router.get("/gis/assets", response_model=GeoJSONFeatureCollection)
async def get_gis_assets(
    village_id: Optional[int] = Query(None, description="Filter by village ID"),
    type: Optional[str] = Query(None, description="Filter by asset type"),
    condition_status: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns map-ready GeoJSON FeatureCollection of infrastructure assets for Leaflet.
    Note: GeoJSON RFC 7946 coordinates are formatted as [longitude, latitude].
    """
    query = select(Infrastructure)
    if village_id is not None:
        query = query.where(Infrastructure.village_id == village_id)
    if type:
        query = query.where(Infrastructure.type == type)
    if condition_status:
        query = query.where(Infrastructure.condition_status == condition_status)

    result = await db.execute(query)
    assets = result.scalars().all()

    features = []
    for a in assets:
        features.append(GeoJSONFeature(
            type="Feature",
            geometry=GeoJSONGeometry(
                type="Point",
                coordinates=[a.longitude, a.latitude]  # [lon, lat]
            ),
            properties={
                "id": a.id,
                "village_id": a.village_id,
                "name": a.name,
                "type": a.type,
                "condition_status": a.condition_status,
                "capacity_or_size": a.capacity_or_size,
                "photo_url": a.photo_url,
                "extra_data": a.extra_data,
                "updated_at": a.updated_at.isoformat()
            }
        ))

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)


@router.get("/gis/complaints", response_model=GeoJSONFeatureCollection)
async def get_gis_complaints(
    village_id: Optional[int] = Query(None, description="Filter by village ID"),
    status: Optional[str] = Query(None, description="Filter by status: submitted, under_review, resolved"),
    category: Optional[str] = Query(None, description="Filter by AI or official category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns map-ready GeoJSON FeatureCollection of complaints with GPS coordinates for spatial hotspot visualization.
    """
    query = select(Complaint).where(
        Complaint.latitude.isnot(None),
        Complaint.longitude.isnot(None)
    )
    if village_id is not None:
        query = query.where(Complaint.village_id == village_id)
    if status:
        query = query.where(Complaint.status == status)
    if category:
        query = query.where(
            (Complaint.official_override_category == category) |
            (Complaint.ai_category == category)
        )

    result = await db.execute(query)
    complaints = result.scalars().all()

    features = []
    for c in complaints:
        features.append(GeoJSONFeature(
            type="Feature",
            geometry=GeoJSONGeometry(
                type="Point",
                coordinates=[c.longitude, c.latitude]  # [lon, lat]
            ),
            properties={
                "id": c.id,
                "village_id": c.village_id,
                "description": c.description,
                "status": c.status,
                "category": c.official_override_category or c.ai_category or "Unclassified",
                "ai_confidence": c.ai_confidence,
                "created_at": c.created_at.isoformat()
            }
        ))

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)


@router.get("/gis/nearby", response_model=GeoJSONFeatureCollection)
async def get_nearby_assets(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    radius_meters: float = Query(1000.0, ge=10.0, le=50000.0, description="Search radius in meters"),
    type: Optional[str] = Query(None, description="Filter by asset type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Spatial radius search: Finds all infrastructure assets within R meters of the given GPS coordinates.
    """
    query = select(Infrastructure)
    if type:
        query = query.where(Infrastructure.type == type)

    result = await db.execute(query)
    all_assets = result.scalars().all()

    features = []
    for a in all_assets:
        dist = haversine_distance_meters(latitude, longitude, a.latitude, a.longitude)
        if dist <= radius_meters:
            features.append(GeoJSONFeature(
                type="Feature",
                geometry=GeoJSONGeometry(
                    type="Point",
                    coordinates=[a.longitude, a.latitude]
                ),
                properties={
                    "id": a.id,
                    "village_id": a.village_id,
                    "name": a.name,
                    "type": a.type,
                    "condition_status": a.condition_status,
                    "distance_meters": round(dist, 1)
                }
            ))

    # Sort features by distance ascending
    features.sort(key=lambda f: f.properties["distance_meters"])

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)
