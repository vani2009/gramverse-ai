from typing import Optional, Dict, Any
from sqlalchemy import String, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin
from app.models.types import SafeGeometry


class Infrastructure(Base, TimestampMixin):
    """Civic infrastructure asset record with PostGIS spatial coordinates."""
    __tablename__ = "infrastructure"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    # Types: water_tank, school, health_center, road, streetlight, sanitation_block, community_hall
    condition_status: Mapped[str] = mapped_column(String(50), default="operational")
    # Status: operational, needs_repair, critical, under_construction

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(SafeGeometry("POINT", srid=4326), nullable=True)

    capacity_or_size: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    extra_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    village: Mapped["Village"] = relationship("Village", back_populates="infrastructure")
