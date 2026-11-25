from typing import Optional, Any, Dict
from datetime import datetime
from sqlalchemy import String, Float, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Survey(Base, TimestampMixin):
    """Survey submission record captured by field surveyors (supports offline sync)."""
    __tablename__ = "surveys"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    client_uuid: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    household_id: Mapped[Optional[int]] = mapped_column(ForeignKey("households.id"), nullable=True, index=True)
    volunteer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    survey_type: Mapped[str] = mapped_column(String(50), default="household")  # household, infrastructure, health
    survey_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    household: Mapped[Optional["Household"]] = relationship("Household", back_populates="surveys")
    volunteer: Mapped[Optional["User"]] = relationship("User", back_populates="surveys")
