from typing import Optional, List
from sqlalchemy import String, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin
from app.models.types import SafeGeometry


class Village(Base, TimestampMixin):
    """Village master record with demographic baseline metrics."""
    __tablename__ = "villages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    block: Mapped[str] = mapped_column(String(255), nullable=False)
    district: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str] = mapped_column(String(255), default="Madhya Pradesh", nullable=False)
    population: Mapped[int] = mapped_column(Integer, default=0)
    literacy_rate: Mapped[float] = mapped_column(Float, default=0.0)

    # Spatial coordinates
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(SafeGeometry("POINT", srid=4326), nullable=True)

    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="village")
    households: Mapped[List["Household"]] = relationship("Household", back_populates="village")
    infrastructure: Mapped[List["Infrastructure"]] = relationship("Infrastructure", back_populates="village")
    complaints: Mapped[List["Complaint"]] = relationship("Complaint", back_populates="village")
    priorities: Mapped[List["DevelopmentPriority"]] = relationship("DevelopmentPriority", back_populates="village")
