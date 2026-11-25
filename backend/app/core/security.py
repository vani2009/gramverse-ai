import os
from typing import Optional, List, Dict, Any, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import firebase_admin
from firebase_admin import auth, credentials

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User

# HTTP Bearer scheme
bearer_scheme = HTTPBearer(auto_error=False)

# Initialize Firebase Admin SDK
_firebase_initialized = False

def init_firebase():
    global _firebase_initialized
    if not _firebase_initialized:
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
        elif not firebase_admin._apps:
            # Initialize with default application credentials if running in GCP Cloud Run
            try:
                firebase_admin.initialize_app()
                _firebase_initialized = True
            except Exception:
                # In development without GCP/credentials, we allow dev fallback tokens
                _firebase_initialized = False

init_firebase()


# Development test token mapping (enables local dev & automated testing without Firebase keys)
DEV_MOCK_USERS: Dict[str, Dict[str, Any]] = {
    "dev-admin-token": {
        "uid": "dev_admin_uid_001",
        "email": "admin@gramverse.gov.in",
        "name": "District Collector Gwalior",
        "role": "admin"
    },
    "dev-panchayat-token": {
        "uid": "dev_panchayat_uid_002",
        "email": "sarpanch@shivpura.org",
        "name": "Ramesh Patel (Sarpanch)",
        "role": "panchayat"
    },
    "dev-citizen-token": {
        "uid": "dev_citizen_uid_003",
        "email": "citizen@shivpura.org",
        "name": "Sunita Devi",
        "role": "citizen"
    },
    "dev-survey-token": {
        "uid": "dev_survey_uid_004",
        "email": "surveyor@uba.ac.in",
        "name": "Amit Sharma (UBA Volunteer)",
        "role": "survey"
    }
}


async def verify_firebase_token(token: str) -> Dict[str, Any]:
    """Verifies Firebase ID token or resolves development test token."""
    # 1. Check development mock tokens
    if settings.DEBUG and token in DEV_MOCK_USERS:
        return DEV_MOCK_USERS[token]

    # 2. Verify with Firebase Admin SDK
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    auth_creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Extracts Bearer token, verifies it, and retrieves (or provisions) the User record.
    """
    if not auth_creds:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided in Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_creds.credentials
    decoded = await verify_firebase_token(token)
    firebase_uid = decoded.get("uid")

    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing Firebase user ID (uid).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Lookup user in database
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()

    # If user does not exist in DB yet, auto-provision from token claims
    if not user:
        email = decoded.get("email", f"{firebase_uid}@gramverse.local")
        name = decoded.get("name", decoded.get("email", "Citizen User"))
        # Check custom claims for role, default to decoded role or "citizen"
        role = decoded.get("role", "citizen")

        user = User(
            firebase_uid=firebase_uid,
            email=email,
            name=name,
            role=role,
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact administrator."
        )

    return user


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Role-Based Access Control (RBAC) dependency factory.
    Example: Depends(require_role(["admin", "panchayat"]))
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of the following roles: {allowed_roles}. Current role: '{current_user.role}'."
            )
        return current_user

    return role_checker
