import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AlgoVerse API"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins (Next.js client)
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://algoverse-flame.vercel.app"
        ).split(",")
        if origin.strip()
    ]
    
    # Firebase settings
    FIREBASE_SERVICE_ACCOUNT_PATH: str = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "service-account.json")
    
    # Qdrant Vector DB settings
    QDRANT_HOST: str = os.environ.get("QDRANT_HOST", "http://localhost:6333")
    QDRANT_API_KEY: str = os.environ.get("QDRANT_API_KEY", "")
    
    # LLM Settings
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.environ.get("GROQ_API_KEY", "")
    
    # Security Settings
    MOCK_AUTH_ENABLED: bool = os.environ.get("MOCK_AUTH_ENABLED", "true").lower() in ("true", "1", "yes")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
