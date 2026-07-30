from typing import Dict, List, Any
from app.services.knowledge.graph_engine import get_all_concepts
from app.services.knowledge.mastery_engine import get_user_mastery

def generate_recommendations(user_id: str) -> Dict[str, Any]:
    """
    Analyzes user concept mastery graph and outputs:
    1. recommended_next: Unlocked concept with met prerequisites.
    2. recommended_revisions: Started concepts with mastery < 60%.
    3. explanation: Detail explaining 'why' the recommendation was made.
    """
    concepts = get_all_concepts()
    masteries = {c["id"]: get_user_mastery(user_id, c["id"]) for c in concepts}

    revisions = []
    next_lessons = []

    # 1. Identify revision candidates
    for c in concepts:
        cid = c["id"]
        score = masteries.get(cid, 0.0)
        if 0.0 < score < 60.0:
            revisions.append({
                "concept_id": cid,
                "name": c["name"],
                "mastery_score": score,
                "reason": f"Your mastery of {c['name']} is at {score}%. Revisiting this concept will consolidate your learning."
            })

    # 2. Identify next lesson candidates (prerequisites met and unstarted)
    for c in concepts:
        cid = c["id"]
        score = masteries.get(cid, 0.0)
        if score == 0.0:
            prereqs = c.get("prerequisites", [])
            met = True
            for p in prereqs:
                if masteries.get(p, 0.0) < 60.0:
                    met = False
                    break
            if met:
                next_lessons.append({
                    "concept_id": cid,
                    "name": c["name"],
                    "reason": f"Prerequisites complete. You are ready to start {c['name']}."
                })

    # Fallback defaults
    if not next_lessons:
        next_lessons.append({
            "concept_id": "arrays",
            "name": "Arrays Basics",
            "reason": "Let's establish core Foundations starting with Arrays."
        })

    return {
        "recommended_next": next_lessons[0],
        "recommended_revisions": revisions[:2],
        "challenge": {
            "name": f"Assessment - {next_lessons[0]['name']}",
            "reason": "Test your retention to increase your mastery score."
        }
    }
