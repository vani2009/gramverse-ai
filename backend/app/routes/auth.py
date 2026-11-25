from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import UserResponse, RoleInfo, UserSyncRequest

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


SYSTEM_ROLES: List[RoleInfo] = [
    RoleInfo(
        role="admin",
        title="District / Block Administrator",
        description="Multi-village oversight, comparative analytics, development rankings, and district reports.",
        portal="Admin Dashboard",
        permissions=["read:all", "write:reports", "manage:villages", "manage:users"]
    ),
    RoleInfo(
        role="panchayat",
        title="Panchayat Official (Sarpanch / Secretary)",
        description="Village demographic management, spatial GIS map, complaint triaging, category override, and development priority planning.",
        portal="Panchayat Dashboard",
        permissions=["read:village", "manage:complaints", "manage:households", "manage:priorities"]
    ),
    RoleInfo(
        role="citizen",
        title="Villager / Citizen",
        description="Lodge grievances with photo/location, track complaint lifecycle, explore eligible welfare schemes, and interact with GramBot AI.",
        portal="Citizen Jan Seva Portal",
        permissions=["create:complaint", "read:own_complaints", "read:schemes", "chat:grambot"]
    ),
    RoleInfo(
        role="survey",
        title="Field Survey Volunteer",
        description="Offline-first household & civic infrastructure surveys, GPS geotagging, photo evidence, and background sync.",
        portal="Field Survey PWA",
        permissions=["create:survey", "sync:offline_queue", "create:household"]
    ),
]


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the verified user profile, email, and permitted role after Firebase token verification.
    """
    return current_user


@router.get("/roles", response_model=List[RoleInfo])
async def list_system_roles():
    """
    Returns metadata for all 4 role interfaces supported by GramVerse AI.
    """
    return SYSTEM_ROLES


@router.post("/sync", response_model=UserResponse)
async def sync_user_profile(
    payload: UserSyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates profile details (e.g. village assignment or phone) after frontend Firebase sign-in.
    """
    if payload.name:
        current_user.name = payload.name
    if payload.phone:
        current_user.phone = payload.phone
    if payload.village_id is not None:
        current_user.village_id = payload.village_id
    if payload.requested_role and payload.requested_role in ["citizen", "survey", "panchayat", "admin"]:
        # In development, allow setting requested role
        current_user.role = payload.requested_role

    await db.commit()
    await db.refresh(current_user)
    return current_user
