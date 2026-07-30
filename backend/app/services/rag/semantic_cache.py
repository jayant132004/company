from typing import Optional, List, Tuple
import numpy as np
from app.services.qdrant_service import get_embedding

# Cache registry: List of tuples containing (prompt, embedding_vector, response)
_cache: List[Tuple[str, List[float], str]] = []

def check_cache(prompt: str) -> Optional[str]:
    """
    Compares embedding of new prompt with cached items.
    Returns the cached response string if similarity exceeds 0.96.
    """
    if not prompt.strip():
        return None
    try:
        new_vec = np.array(get_embedding(prompt))
        for cached_prompt, cached_vec, response in _cache:
            dot = np.dot(new_vec, np.array(cached_vec))
            similarity = dot / (np.linalg.norm(new_vec) * np.linalg.norm(cached_vec) + 1e-9)
            
            if similarity > 0.96:
                print(f"[Semantic Cache] HIT! Cosine similarity: {similarity:.4f}")
                return response
    except Exception as e:
        print(f"[Semantic Cache] Query failed: {e}")
    return None

def set_cache(prompt: str, response: str):
    """Indexes a prompt and its response in the cache registry."""
    try:
        vec = get_embedding(prompt)
        _cache.append((prompt, vec, response))
        # Keep memory bounds capped
        if len(_cache) > 100:
            _cache.pop(0)
        print(f"[Semantic Cache] Entry cached. Registry size: {len(_cache)}")
    except Exception as e:
        print(f"[Semantic Cache] Storage failed: {e}")
