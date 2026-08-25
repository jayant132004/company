from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Tuple, Optional
import time
from app.api.deps import get_current_user_optional
from app.services.rag.context_orchestrator import build_tutor_context
from app.services.rag.conversation_memory import save_message, get_chat_history_str
from app.services.rag.semantic_cache import check_cache, set_cache
from app.services.observability.observability_logger import log_ai_transaction
from app.services.rag_engine import call_gemini, call_groq, generate_offline_fallback
from app.services.algorithms.sorting import (
    bubble_sort_with_steps, selection_sort_with_steps, insertion_sort_with_steps,
    merge_sort_with_steps, quick_sort_with_steps, heap_sort_with_steps,
    counting_sort_with_steps, radix_sort_with_steps, bucket_sort_with_steps,
    shell_sort_with_steps, tim_sort_with_steps
)

router = APIRouter()

ALGO_MAPPING = {
    "bubble": bubble_sort_with_steps,
    "bubblesort": bubble_sort_with_steps,
    "selection": selection_sort_with_steps,
    "selectionsort": selection_sort_with_steps,
    "insertion": insertion_sort_with_steps,
    "insertionsort": insertion_sort_with_steps,
    "merge": merge_sort_with_steps,
    "mergesort": merge_sort_with_steps,
    "quick": quick_sort_with_steps,
    "quicksort": quick_sort_with_steps,
    "heap": heap_sort_with_steps,
    "heapsort": heap_sort_with_steps,
    "counting": counting_sort_with_steps,
    "countingsort": counting_sort_with_steps,
    "radix": radix_sort_with_steps,
    "radixsort": radix_sort_with_steps,
    "bucket": bucket_sort_with_steps,
    "bucketsort": bucket_sort_with_steps,
    "shell": shell_sort_with_steps,
    "shellsort": shell_sort_with_steps,
    "timsort": tim_sort_with_steps,
}

class ExecuteRequest(BaseModel):
    data: List[int]
    algorithm: str

class CompareRequest(BaseModel):
    data: List[int]
    algorithms: List[str]

class AnalyzeRequest(BaseModel):
    data: List[int]

def compute_sortedness(data: List[int]) -> float:
    n = len(data)
    if n <= 1:
        return 1.0
    correct_pairs = sum(1 for i in range(n - 1) if data[i] <= data[i + 1])
    return correct_pairs / (n - 1)

def compute_inversions(data: List[int]) -> int:
    n = len(data)
    inversions = 0
    for i in range(n):
        for j in range(i + 1, n):
            if data[i] > data[j]:
                inversions += 1
    return inversions

@router.post("/execute")
def execute_sorting(payload: ExecuteRequest):
    algo_name = payload.algorithm.lower().replace(" ", "").replace("_", "")
    if algo_name not in ALGO_MAPPING:
        raise HTTPException(status_code=400, detail=f"Algorithm '{payload.algorithm}' is not supported.")
        
    func = ALGO_MAPPING[algo_name]
    start_time = time.perf_counter()
    sorted_array, steps, swaps, comparisons = func(payload.data)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    
    if len(steps) == 0:
        steps = [{
            "step": 0,
            "event_type": "lock_element",
            "array": list(sorted_array),
            "compare": None,
            "swap": None,
            "locked_indices": list(range(len(sorted_array))),
            "message": f"{payload.algorithm} completed: array is fully sorted."
        }]
    
    return {
        "algorithm": payload.algorithm,
        "sorted_array": sorted_array,
        "steps": steps,
        "metrics": {
            "time_ms": elapsed_ms,
            "swaps": swaps,
            "comparisons": comparisons,
            "steps_count": len(steps)
        }
    }

@router.post("/compare")
def compare_sorting(payload: CompareRequest):
    results = {}
    for algo_raw in payload.algorithms:
        algo_name = algo_raw.lower().replace(" ", "").replace("_", "")
        if algo_name in ALGO_MAPPING:
            func = ALGO_MAPPING[algo_name]
            start_time = time.perf_counter()
            _, steps, swaps, comparisons = func(payload.data)
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            
            results[algo_raw] = {
                "time_ms": elapsed_ms,
                "swaps": swaps,
                "comparisons": comparisons,
                "steps_count": len(steps)
            }
    return results

@router.post("/analyze")
def analyze_dataset(payload: AnalyzeRequest):
    data = payload.data
    n = len(data)
    if n == 0:
        return {"n": 0}
        
    unique_count = len(set(data))
    duplicates_ratio = 1.0 - (unique_count / n)
    sortedness = compute_sortedness(data)
    inversions = compute_inversions(data)
    min_val = min(data)
    max_val = max(data)
    
    return {
        "n": n,
        "min": min_val,
        "max": max_val,
        "range": max_val - min_val,
        "duplicates_ratio": duplicates_ratio,
        "sortedness": sortedness,
        "inversions": inversions,
        "is_nearly_sorted": sortedness > 0.8
    }

class ExplainStateRequest(BaseModel):
    question: str
    algorithm: str
    array_state: List[int]
    step_index: int
    total_steps: int
    visualizer_event: str
    step_message: str
    visualization_mode: str = "single"
    pointers: List[int] = []
    comparisons: List[int] = []
    swaps: List[int] = []
    queue: List[int] = []
    stack: List[int] = []
    complexity: str = "O(n log n)"
    speed: int = 150
    model: Optional[str] = "Gemini 2.5 Flash"
    persona: Optional[str] = "Tutor"

class ExplainStepRequest(BaseModel):
    algorithm: str
    event_type: str
    compare: Optional[List[int]] = None
    swap: Optional[List[int]] = None
    array: List[int]
    message: str

def query_llm(prompt: str, question: str, payload: dict) -> Tuple[str, float, bool]:
    # Check cache first
    cached_resp = check_cache(prompt)
    if cached_resp:
        return cached_resp, 0.0, True
        
    start_time = time.perf_counter()
    response_text = ""
    
    # Try Gemini, then Groq, then fallback
    from app.core.config import settings
    model_pref = payload.get("model", "Gemini 2.5 Flash")
    try:
        if "Groq" in model_pref and settings.GROQ_API_KEY:
            response_text = call_groq(prompt, question)
        elif settings.GEMINI_API_KEY:
            response_text = call_gemini(prompt, question)
        elif settings.GROQ_API_KEY:
            response_text = call_groq(prompt, question)
        else:
            from app.services.qdrant_service import search_knowledge
            docs = search_knowledge(payload.get("algorithm", "sorting"), limit=2)
            response_text = generate_offline_fallback(
                question,
                payload.get("algorithm", "sorting"),
                payload.get("array_state", []),
                payload.get("step_index", 0),
                payload.get("visualizer_event", "initial"),
                payload.get("step_message", "Visualizer state loaded."),
                docs
            )
    except Exception as e:
        print(f"[LLM query failed] {e}. Falling back to offline generator.")
        from app.services.qdrant_service import search_knowledge
        docs = search_knowledge(payload.get("algorithm", "sorting"), limit=2)
        response_text = generate_offline_fallback(
            question,
            payload.get("algorithm", "sorting"),
            payload.get("array_state", []),
            payload.get("step_index", 0),
            payload.get("visualizer_event", "initial"),
            payload.get("step_message", "Visualizer state loaded."),
            docs
        )
        
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    set_cache(prompt, response_text)
    return response_text, elapsed_ms, False

@router.post("/explain_state")
def explain_state(payload: ExplainStateRequest, current_user: dict = Depends(get_current_user_optional)):
    uid = current_user.get("uid", "guest_student_id")
    algo = payload.algorithm
    
    # Get recent conversation history
    history_str = get_chat_history_str(uid, algo)
    
    # Compile prompt context via Context Orchestrator
    prompt = build_tutor_context(payload.dict(), payload.question, history_str)
    
    # Process LLM with semantic cache lookup
    response_text, elapsed_ms, cache_hit = query_llm(prompt, payload.question, payload.dict())
    
    # Log dialogue messages in history memory
    save_message(uid, algo, "user", payload.question)
    save_message(uid, algo, "ai", response_text)
    
    # Log stats for AI observability auditing
    log_ai_transaction({
        "model": payload.model if not cache_hit else "cache",
        "latency_ms": elapsed_ms,
        "cache_hit": cache_hit,
        "prompt_size": len(prompt),
        "response_size": len(response_text)
    })
    
    return {"explanation": response_text}

@router.post("/explain_step")
def explain_step(payload: ExplainStepRequest, current_user: dict = Depends(get_current_user_optional)):
    uid = current_user.get("uid", "guest_student_id")
    algo = payload.algorithm
    
    payload_dict = {
        "algorithm": payload.algorithm,
        "visualizer_event": payload.event_type,
        "pointers": payload.compare or [],
        "comparisons": payload.compare or [],
        "swaps": payload.swap or [],
        "array_state": payload.array,
        "step_message": payload.message,
        "step_index": 0,
        "total_steps": 1
    }
    
    question = f"Explain what is happening in this step: {payload.message}"
    prompt = build_tutor_context(payload_dict, question, "")
    
    response_text, elapsed_ms, cache_hit = query_llm(prompt, question, payload_dict)
    
    log_ai_transaction({
        "model": "gemini-1.5-flash" if not cache_hit else "cache",
        "latency_ms": elapsed_ms,
        "cache_hit": cache_hit,
        "prompt_size": len(prompt),
        "response_size": len(response_text)
    })
    
    return {"explanation": response_text}

