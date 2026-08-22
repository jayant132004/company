from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from app.core.firebase import init_firebase
from app.core.config import settings
from app.services.user_service import create_user_if_not_exists, update_last_login
from typing import Optional
import time

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    """
    Strict dependency requiring a valid Firebase ID Token or local mock bypass token.
    Decodes user details, provisions them in Firestore if new, and returns profile.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = credentials.credentials
    
    # Enable local mock verification bypass for frontend testing convenience
    if token == "mock_token_value":
        if not settings.MOCK_AUTH_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mock authentication is disabled in this environment.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        mock_user = {
            "uid": "guest_student_id",
            "email": "guest@algoverse.io",
            "displayName": "Guest Student",
            "photoURL": None,
            "provider": "google"
        }
        return create_user_if_not_exists(mock_user)
        
    try:
        init_firebase()
        decoded_token = auth.verify_id_token(token)
        # Create profile in Firestore if first login
        user_profile = create_user_if_not_exists(decoded_token)
        # Update last active login timestamp
        update_last_login(user_profile["uid"])
        return user_profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    """
    Flexible dependency validating Firebase ID Token if provided,
    otherwise falling back to a guest user profile inside Firestore/Memory.
    """
    mock_guest = {
        "uid": "guest_student_id",
        "email": "guest@algoverse.io",
        "displayName": "Guest Student",
        "photoURL": None,
        "provider": "google"
    }
    
    if not credentials:
        return create_user_if_not_exists(mock_guest)
        
    token = credentials.credentials
    if token == "mock_token_value":
        if settings.MOCK_AUTH_ENABLED:
            return create_user_if_not_exists(mock_guest)
        
    try:
        init_firebase()
        decoded_token = auth.verify_id_token(token)
        user_profile = create_user_if_not_exists(decoded_token)
        update_last_login(user_profile["uid"])
        return user_profile
    except Exception as e:
        print(f"[Auth] Optional token verification failed: {e}. Falling back to guest.")
        return create_user_if_not_exists(mock_guest)
