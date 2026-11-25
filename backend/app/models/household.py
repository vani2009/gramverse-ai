from typing import Optional, List
from sqlalchemy import String, Float, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Household(Base, TimestampMixin):
    """Household profile entity used for welfare scheme eligibility and census tracking."""
    __tablename__ = "households"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id"), nullable=False, index=True)
    household_head: Mapped[str] = mapped_column(String(255), nullable=False)
    family_size: Mapped[int] = mapped_column(Integer, default=1)
    monthly_income: Mapped[float] = mapped_column(Float, default=0.0)
    housing_type: Mapped[str] = mapped_column(String(50), default="kutcha")  # kutcha, semi_pucca, pucca
    pucca_house: Mapped[bool] = mapped_column(Boolean, default=False)
    land_holding_acres: Mapped[float] = mapped_column(Float, default=0.0)
    water_tap_available: Mapped[bool] = mapped_column(Boolean, default=False)
    electricity_available: Mapped[bool] = mapped_column(Boolean, default=False)
    toilet_available: Mapped[bool] = mapped_column(Boolean, default=False)
    caste_category: Mapped[str] = mapped_column(String(50), default="General")  # General, OBC, SC, ST
    qr_code_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True)

    # GPS coordinates
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Relationships
    village: Mapped["Village"] = relationship("Village", back_populates="households", lazy="selectin")
    surveys: Mapped[List["Survey"]] = relationship("Survey", back_populates="household", lazy="selectin")
    scheme_recommendations: Mapped[List["SchemeRecommendation"]] = relationship("SchemeRecommendation", back_populates="household", lazy="selectin")
