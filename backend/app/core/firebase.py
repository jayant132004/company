import firebase_admin
from firebase_admin import credentials, firestore
import os
import google.auth
from app.core.config import settings

db_client = None
_firebase_initialized = False

def init_firebase():
    global db_client, _firebase_initialized
    if _firebase_initialized:
        return
    _firebase_initialized = True
    
    try:
        firebase_admin.get_app()
    except ValueError:
        try:
            if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
                cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
                firebase_admin.initialize_app(cred)
                print("[Firebase] Initialized with Service Account Key.")
            else:
                # Check for Application Default Credentials
                try:
                    google.auth.default()
                    firebase_admin.initialize_app()
                    print("[Firebase] Initialized with Application Default Credentials.")
                except Exception:
                    raise ValueError("Application Default Credentials not found on system.")
        except Exception as e:
            print(f"[Firebase] Offline Mode: {e}. Running with local memory caches.")
            db_client = None
            return

    try:
        db_client = firestore.client()
    except Exception as e:
        print(f"[Firebase] Firestore client error: {e}. Operating in memory cache fallback.")
        db_client = None

def get_firestore_client():
    global db_client
    if db_client is None and not _firebase_initialized:
        init_firebase()
    return db_client
