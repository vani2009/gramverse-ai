from typing import Optional, List
from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """Application user profile and role-based access entity."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="citizen", nullable=False)  # admin, panchayat, citizen, survey
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    village_id: Mapped[Optional[int]] = mapped_column(ForeignKey("villages.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    village: Mapped[Optional["Village"]] = relationship("Village", back_populates="users", lazy="selectin")
    complaints: Mapped[List["Complaint"]] = relationship("Complaint", back_populates="citizen", lazy="selectin")
    surveys: Mapped[List["Survey"]] = relationship("Survey", back_populates="volunteer", lazy="selectin")
