from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import time
from app.api.deps import get_current_user_optional
from app.services.algorithms.searching import (
    linear_search_with_steps,
    binary_search_with_steps,
    lower_bound_search_with_steps,
    jump_search_with_steps,
    interpolation_search_with_steps,
    exponential_search_with_steps,
    ternary_search_with_steps,
    two_pointers_search_with_steps,
)

router = APIRouter()

SEARCH_ALGO_MAPPING = {
    "linear": linear_search_with_steps,
    "linearsearch": linear_search_with_steps,
    "binary": binary_search_with_steps,
    "binarysearch": binary_search_with_steps,
    "lowerbound": lower_bound_search_with_steps,
    "lower_bound": lower_bound_search_with_steps,
    "jump": jump_search_with_steps,
    "jumpsearch": jump_search_with_steps,
    "interpolation": interpolation_search_with_steps,
    "interpolationsearch": interpolation_search_with_steps,
    "exponential": exponential_search_with_steps,
    "exponentialsearch": exponential_search_with_steps,
    "ternary": ternary_search_with_steps,
    "ternarysearch": ternary_search_with_steps,
    "twopointers": two_pointers_search_with_steps,
    "two_pointers": two_pointers_search_with_steps,
    "twopointer": two_pointers_search_with_steps,
}

class SearchExecuteRequest(BaseModel):
    data: List[int] = Field(..., description="Array of numbers to search within")
    target: int = Field(..., description="Target value to search for")
    algorithm: str = Field("binary", description="Algorithm identifier (linear, binary, jump, interpolation, exponential, ternary, lowerbound, twopointers)")

class SearchBenchmarkRequest(BaseModel):
    data: List[int]
    target: int
    algorithms: Optional[List[str]] = None

@router.post("/execute")
def execute_search(req: SearchExecuteRequest, user_data: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    algo_key = req.algorithm.lower().replace("-", "").replace(" ", "").replace("_", "")
    func = SEARCH_ALGO_MAPPING.get(algo_key)

    if not func:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported searching algorithm '{req.algorithm}'. Supported algorithms: {list(SEARCH_ALGO_MAPPING.keys())}"
        )

    if len(req.data) > 100:
        raise HTTPException(
            status_code=400,
            detail="Array size capped at 100 elements for real-time visual simulation."
        )

    try:
        arr, steps, metrics = func(req.data, req.target)
        return {
            "success": True,
            "algorithm": req.algorithm,
            "target": req.target,
            "array": arr,
            "steps": steps,
            "metrics": metrics,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search simulation error: {str(e)}")

@router.post("/benchmark")
def benchmark_search(req: SearchBenchmarkRequest, user_data: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    algos_to_run = req.algorithms or ["linear", "binary", "jump", "interpolation", "exponential", "ternary"]
    results = {}

    for algo_name in algos_to_run:
        algo_key = algo_name.lower().replace("-", "").replace(" ", "").replace("_", "")
        func = SEARCH_ALGO_MAPPING.get(algo_key)
        if func:
            try:
                _, steps, metrics = func(req.data, req.target)
                results[algo_name] = {
                    "comparisons": metrics["comparisons"],
                    "steps_count": metrics["steps_count"],
                    "found": metrics["found"],
                    "found_index": metrics["found_index"],
                    "time_ms": metrics["time_ms"]
                }
            except Exception as e:
                results[algo_name] = {"error": str(e)}

    return {
        "success": True,
        "target": req.target,
        "array_size": len(req.data),
        "results": results
    }
