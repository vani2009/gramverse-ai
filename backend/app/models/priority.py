from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class DevelopmentPriority(Base, TimestampMixin):
    """
    Transparent rule-based priority item computed from survey and complaint data.
    Formula: Score = (Severity [1-5] * Population Affected) / Cost in Lakhs
    """
    __tablename__ = "development_priorities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id"), nullable=False, index=True)
    issue: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # Road, Water, Sanitation, School, Health, Electricity
    severity: Mapped[int] = mapped_column(Integer, default=3)  # 1 to 5
    population_affected: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost_lakhs: Mapped[float] = mapped_column(Float, default=1.0)
    priority_score: Mapped[float] = mapped_column(Float, default=0.0)
    rank: Mapped[int] = mapped_column(Integer, default=1)
    matching_scheme: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="proposed")  # proposed, approved, in_progress, completed

    # Relationships
    village: Mapped["Village"] = relationship("Village", back_populates="priorities")
