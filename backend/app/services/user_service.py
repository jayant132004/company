import time
from typing import Dict, Any, Optional
from app.core.firebase import get_firestore_client

# Local memory store for offline runs
_local_users: Dict[str, Dict[str, Any]] = {}

def create_user_if_not_exists(user_data: dict) -> Dict[str, Any]:
    """
    Checks if a user exists in Firestore 'users' collection.
    If not, creates a new document with initial learning stats (level 1, 0 XP, etc.).
    Falls back to local memory if Firestore credentials are not present.
    """
    uid = user_data.get("uid")
    if not uid:
        raise ValueError("User UID is required.")
        
    db = get_firestore_client()
    
    # Template structure for a standard student profile
    default_profile = {
        "uid": uid,
        "email": user_data.get("email"),
        "displayName": user_data.get("displayName") or user_data.get("name") or "AlgoVerse Student",
        "photoURL": user_data.get("photoURL") or user_data.get("picture"),
        "provider": user_data.get("firebase", {}).get("sign_in_provider") or user_data.get("provider") or "google",
        "createdAt": time.time(),
        "lastLogin": time.time(),
        "level": 1,
        "xp": 0,
        "streak": 0,
        "premium": False,
        "learningPreferences": {"theme": "dark", "preferredLanguage": "python"},
        "favoriteTopics": [],
        "weakTopics": [],
        "strongTopics": []
    }
    
    if db:
        try:
            doc_ref = db.collection("users").document(uid)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            else:
                doc_ref.set(default_profile)
                print(f"[User Service] Created Firestore profile for user: {uid}")
                return default_profile
        except Exception as e:
            print(f"[User Service] Firestore create user error: {e}. Falling back to memory.")
            
    # Local fallback
    if uid not in _local_users:
        _local_users[uid] = default_profile
    return _local_users[uid]

def update_last_login(uid: str):
    """Updates the lastLogin timestamp for the given user."""
    db = get_firestore_client()
    now = time.time()
    if db:
        try:
            db.collection("users").document(uid).update({"lastLogin": now})
            print(f"[User Service] Updated lastLogin in Firestore for user: {uid}")
            return
        except Exception as e:
            print(f"[User Service] Firestore update lastLogin error: {e}.")
            
    if uid in _local_users:
        _local_users[uid]["lastLogin"] = now

def update_profile(uid: str, updates: dict) -> Optional[Dict[str, Any]]:
    """Applies updates to a user profile and returns the modified dict."""
    db = get_firestore_client()
    if db:
        try:
            doc_ref = db.collection("users").document(uid)
            doc_ref.update(updates)
            return doc_ref.get().to_dict()
        except Exception as e:
            print(f"[User Service] Firestore update profile error: {e}.")
            
    if uid in _local_users:
        _local_users[uid].update(updates)
        return _local_users[uid]
    return None

def get_user(uid: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user profile by UID."""
    db = get_firestore_client()
    if db:
        try:
            doc = db.collection("users").document(uid).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            print(f"[User Service] Firestore get user error: {e}.")
            
    return _local_users.get(uid)
