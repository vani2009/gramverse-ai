from typing import Optional, List, Dict, Any
from sqlalchemy import String, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin
from app.models.types import SafeGeometry


class Complaint(Base, TimestampMixin):
    """Citizen grievance record with AI category predictions and official workflow status."""
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    citizen_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id"), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="submitted", index=True)
    # Status: submitted, under_review, resolved, rejected

    # Spatial coordinates
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(SafeGeometry("POINT", srid=4326), nullable=True)

    # AI NLP Output Metadata
    ai_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    # Categories: Road, Water, Sanitation, Electricity, School, Health
    ai_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Authorized Panchayat Review Override
    official_override_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    official_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships with selectin lazy loading for clean async access
    citizen: Mapped[Optional["User"]] = relationship("User", back_populates="complaints", lazy="selectin")
    village: Mapped["Village"] = relationship("Village", back_populates="complaints", lazy="selectin")
    images: Mapped[List["ComplaintImage"]] = relationship(
        "ComplaintImage",
        back_populates="complaint",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class ComplaintImage(Base, TimestampMixin):
    """Uploaded evidence photograph linked to a complaint with Computer Vision defect metadata."""
    __tablename__ = "complaint_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(512), nullable=False)

    # Computer Vision Output Metadata
    cv_detected_labels: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    # e.g., [{"label": "pothole", "confidence": 0.89}, {"label": "waterlogging", "confidence": 0.72}]
    cv_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="images")
