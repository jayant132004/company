from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import json
import os
from app.api.deps import get_current_user_optional

router = APIRouter()

FEEDBACK_LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "logs", "feedback.jsonl")

class FeedbackSubmission(BaseModel):
    category: str = Field(default="General", description="Category of feedback: Feature Request, Bug Report, Learning Experience, Visualizer, General")
    rating: int = Field(default=5, ge=1, le=5, description="1 to 5 star rating")
    title: Optional[str] = Field(default="", description="Short summary title")
    message: str = Field(..., min_length=3, description="Detailed feedback content")
    algorithm: Optional[str] = Field(default=None, description="Related algorithm if submitted from visualizer")
    page_url: Optional[str] = Field(default="", description="Source page URL")
    email: Optional[str] = Field(default=None, description="Optional user contact email")

@router.post("", tags=["Feedback"])
def submit_feedback(payload: FeedbackSubmission, current_user: dict = Depends(get_current_user_optional)):
    uid = current_user.get("uid", "guest_student") if current_user else "guest_student"
    user_email = current_user.get("email") if current_user else payload.email

    record = {
        "id": f"fb_{int(datetime.utcnow().timestamp() * 1000)}",
        "timestamp": datetime.utcnow().isoformat(),
        "uid": uid,
        "email": user_email,
        "category": payload.category,
        "rating": payload.rating,
        "title": payload.title,
        "message": payload.message,
        "algorithm": payload.algorithm,
        "page_url": payload.page_url,
    }

    # Ensure logs directory exists
    try:
        os.makedirs(os.path.dirname(FEEDBACK_LOG_PATH), exist_ok=True)
        with open(FEEDBACK_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception as e:
        print(f"[Feedback Logging Error] {e}")

    # If Firebase Admin is configured, also persist to Firestore
    try:
        from app.core.firebase import db
        if db:
            db.collection("feedbacks").document(record["id"]).set(record)
    except Exception as e:
        print(f"[Firestore Feedback Write Fallback] {e}")

    return {
        "status": "success",
        "message": "Thank you! Your feedback has been received and will help improve AlgoVerse.",
        "id": record["id"]
    }
