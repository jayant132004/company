from fastapi import FastAPI, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.firebase import init_firebase
from app.api.deps import get_current_user, get_current_user_optional
from app.api.endpoints.sortmentor import router as sortmentor_router
from app.api.endpoints.searchmentor import router as searchmentor_router
from app.api.endpoints.treementor import router as treementor_router
from app.api.endpoints.feedback import router as feedback_router
from app.services.qdrant_service import index_knowledge_base
from app.services.knowledge.recommendation_engine import generate_recommendations

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize Firebase Admin SDK connection on startup
    init_firebase()
    # Build vector indexes/memory from knowledge base files
    index_knowledge_base()

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}

# Register the SortMentor endpoints router
app.include_router(
    sortmentor_router,
    prefix=f"{settings.API_V1_STR}/sortmentor",
    tags=["SortMentor"]
)

# Register the SearchMentor endpoints router
app.include_router(
    searchmentor_router,
    prefix=f"{settings.API_V1_STR}/searchmentor",
    tags=["SearchMentor"]
)

# Register the TreeMentor endpoints router
app.include_router(
    treementor_router,
    prefix=f"{settings.API_V1_STR}/treementor",
    tags=["TreeMentor"]
)

# Register the Feedback endpoints router
app.include_router(
    feedback_router,
    prefix=f"{settings.API_V1_STR}/feedback",
    tags=["Feedback"]
)

@app.get("/api/v1/auth/me", tags=["Auth"])
def verify_user(current_user: dict = Depends(get_current_user)):
    return {
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
        "name": current_user.get("name"),
        "picture": current_user.get("picture")
    }

@app.get("/api/v1/recommendations", tags=["Recommendations"])
def get_recommendations(response: Response, current_user: dict = Depends(get_current_user_optional)):
    response.headers["Cache-Control"] = "private, max-age=60"
    uid = current_user.get("uid", "guest_student_id")
    recs = generate_recommendations(uid)
    return recs
