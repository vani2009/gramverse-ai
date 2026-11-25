from typing import Optional, List, Dict, Any
from sqlalchemy import String, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Scheme(Base, TimestampMixin):
    """Government welfare scheme master definition with eligibility rules."""
    __tablename__ = "schemes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    benefit_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    application_deadline: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Configurable rule-set and requirements stored as JSON
    eligibility_rules: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    required_documents: Mapped[List[str]] = mapped_column(JSON, default=list)

    # Relationships
    recommendations: Mapped[List["SchemeRecommendation"]] = relationship("SchemeRecommendation", back_populates="scheme", lazy="selectin")


class SchemeRecommendation(Base, TimestampMixin):
    """Rule-based scheme matching evaluation result for a household."""
    __tablename__ = "scheme_recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    scheme_id: Mapped[int] = mapped_column(ForeignKey("schemes.id"), nullable=False, index=True)
    match_status: Mapped[str] = mapped_column(String(50), default="eligible")  # eligible, potential, ineligible
    matching_criteria: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    household: Mapped["Household"] = relationship("Household", back_populates="scheme_recommendations", lazy="selectin")
    scheme: Mapped["Scheme"] = relationship("Scheme", back_populates="recommendations", lazy="selectin")
