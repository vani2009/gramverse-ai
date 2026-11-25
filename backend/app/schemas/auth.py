from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "citizen"
    phone: Optional[str] = None
    village_id: Optional[int] = None


class UserCreate(UserBase):
    firebase_uid: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    village_id: Optional[int] = None
    role: Optional[str] = None


class UserResponse(UserBase):
    id: int
    firebase_uid: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoleInfo(BaseModel):
    role: str
    title: str
    description: str
    portal: str
    permissions: List[str]


class UserSyncRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    village_id: Optional[int] = None
    requested_role: Optional[str] = None
