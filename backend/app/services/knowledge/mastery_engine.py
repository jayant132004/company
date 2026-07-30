import time
from typing import Dict, Any
from app.core.firebase import get_firestore_client

# Local memory store fallback
_local_mastery: Dict[str, Dict[str, Any]] = {}

def get_mastery_key(user_id: str, concept_id: str) -> str:
    clean_user = user_id.replace(":", "_").replace("/", "_")
    clean_concept = concept_id.lower().replace(" ", "").replace("_", "")
    return f"{clean_user}_{clean_concept}"

def calculate_mastery(metrics: Dict[str, Any]) -> float:
    """
    Computes concept mastery score from 0 to 100:
    - accuracy (40%): Average quiz or assessment score.
    - confidence (20%): Practice count (1 practice = 20%, caps at 5 = 100%).
    - retention (20%): Lessons completed (1 lesson = 50%, caps at 2 = 100%).
    - understanding (20%): Time spent (caps at 30 mins).
    """
    accuracy = float(metrics.get("accuracy", 0.0))
    practice_count = int(metrics.get("practice_count", 0))
    lessons_completed = int(metrics.get("lessons_completed", 0))
    time_spent_mins = float(metrics.get("time_spent_mins", 0.0))

    accuracy_part = accuracy
    confidence_part = min(100.0, (practice_count / 5.0) * 100.0)
    retention_part = min(100.0, (lessons_completed * 50.0))
    understanding_part = min(100.0, (time_spent_mins / 30.0) * 100.0)

    score = (0.4 * accuracy_part) + (0.2 * confidence_part) + (0.2 * retention_part) + (0.2 * understanding_part)
    return min(100.0, round(score, 1))

def update_mastery(
    user_id: str,
    concept_id: str,
    accuracy_delta: float = None,
    practice_inc: int = 0,
    time_delta_mins: float = 0.0,
    lesson_done: bool = False
) -> float:
    """
    Applies incremental metric updates for a user/concept,
    recalculates, and stores the mastery score in Firestore (or local cache).
    """
    key = get_mastery_key(user_id, concept_id)
    metrics = {"accuracy": 0.0, "practice_count": 0, "lessons_completed": 0, "time_spent_mins": 0.0}

    # Fetch existing
    try:
        db = get_firestore_client()
        if db:
            doc = db.collection("user_knowledge_nodes").document(key).get()
            if doc.exists:
                data = doc.to_dict()
                metrics["accuracy"] = data.get("accuracy", 0.0)
                metrics["practice_count"] = data.get("practice_count", 0)
                metrics["lessons_completed"] = data.get("lessons_completed", 0)
                metrics["time_spent_mins"] = data.get("time_spent_mins", 0.0)
    except Exception as e:
        print(f"[Mastery] Firestore read failed: {e}. Checking local cache.")

    if not metrics["accuracy"] and key in _local_mastery:
        metrics = _local_mastery[key]

    # Perform updates
    if accuracy_delta is not None:
        metrics["accuracy"] = (metrics["accuracy"] + accuracy_delta) / 2.0 if metrics["accuracy"] > 0 else accuracy_delta
    metrics["practice_count"] += practice_inc
    metrics["time_spent_mins"] += time_delta_mins
    if lesson_done:
        metrics["lessons_completed"] += 1

    # Recalculate
    score = calculate_mastery(metrics)
    metrics["mastery_score"] = score

    # Persist
    try:
        db = get_firestore_client()
        if db:
            db.collection("user_knowledge_nodes").document(key).set({
                "user_id": user_id,
                "concept_id": concept_id,
                "mastery_score": score,
                "accuracy": metrics["accuracy"],
                "practice_count": metrics["practice_count"],
                "lessons_completed": metrics["lessons_completed"],
                "time_spent_mins": metrics["time_spent_mins"],
                "updated_at": time.time()
            })
            return score
    except Exception as e:
        print(f"[Mastery] Firestore write failed: {e}. Saving to local cache.")

    _local_mastery[key] = metrics
    return score

def get_user_mastery(user_id: str, concept_id: str) -> float:
    """Returns the user's mastery score (0-100) for a concept."""
    key = get_mastery_key(user_id, concept_id)
    try:
        db = get_firestore_client()
        if db:
            doc = db.collection("user_knowledge_nodes").document(key).get()
            if doc.exists:
                return float(doc.to_dict().get("mastery_score", 0.0))
    except Exception:
        pass
    
    return float(_local_mastery.get(key, {}).get("mastery_score", 0.0))
