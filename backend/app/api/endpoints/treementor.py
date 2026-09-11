from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import time
from app.api.deps import get_current_user_optional
from app.services.algorithms.trees import (
    bst_operations_with_steps,
    avl_operations_with_steps,
    red_black_with_steps,
    trie_operations_with_steps,
    segment_tree_with_steps,
    fenwick_tree_with_steps,
)

router = APIRouter()

class TreeExecuteRequest(BaseModel):
    tree_type: str = Field("bst", description="Tree structure: bst, avl, redblack, trie, segment, fenwick")
    operation: str = Field("insert", description="Operation: insert, delete, search, query, autocomplete, prefix_sum")
    value: Optional[int] = Field(None, description="Numeric value for BST/AVL/RB insert, delete, search")
    word: Optional[str] = Field(None, description="String word or prefix for Trie operations")
    initial_data: Optional[List[Any]] = Field(None, description="Initial array/words to build tree from")
    query_range: Optional[List[int]] = Field(None, description="[qL, qR] for Segment Tree RMQ")
    index: Optional[int] = Field(None, description="Index for Fenwick / Segment point update/query")

@router.post("/execute")
def execute_tree_op(req: TreeExecuteRequest, user_data: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    tree_type = req.tree_type.lower().replace("-", "").replace("_", "")

    try:
        if tree_type == "bst":
            init_vals = req.initial_data or [50, 30, 70, 20, 40, 60, 80]
            steps, metrics = bst_operations_with_steps(init_vals, req.operation, req.value)
            return {"success": True, "tree_type": "bst", "steps": steps, "metrics": metrics}

        elif tree_type == "avl":
            init_vals = req.initial_data or [30, 20, 40, 10, 25]
            steps, metrics = avl_operations_with_steps(init_vals, req.operation, req.value)
            return {"success": True, "tree_type": "avl", "steps": steps, "metrics": metrics}

        elif tree_type in ["redblack", "rb"]:
            init_vals = req.initial_data or [20, 10, 30, 5, 15, 25, 35]
            steps, metrics = red_black_with_steps(init_vals, req.operation, req.value)
            return {"success": True, "tree_type": "redblack", "steps": steps, "metrics": metrics}

        elif tree_type == "trie":
            words = req.initial_data or ["cat", "car", "card", "care", "bat", "ball", "app", "apple"]
            steps, metrics = trie_operations_with_steps(words, req.operation, req.word)
            return {"success": True, "tree_type": "trie", "steps": steps, "metrics": metrics}

        elif tree_type in ["segment", "segmenttree"]:
            arr = req.initial_data or [5, 2, 8, 6, 3, 7]
            qL = req.query_range[0] if req.query_range and len(req.query_range) >= 1 else 1
            qR = req.query_range[1] if req.query_range and len(req.query_range) >= 2 else 4
            steps, metrics = segment_tree_with_steps(arr, req.operation, qL=qL, qR=qR)
            return {"success": True, "tree_type": "segment", "steps": steps, "metrics": metrics}

        elif tree_type in ["fenwick", "bit"]:
            arr = req.initial_data or [3, 2, -1, 6, 5, 4, -3, 3]
            idx = req.index if req.index is not None else 5
            steps, metrics = fenwick_tree_with_steps(arr, req.operation, idx=idx)
            return {"success": True, "tree_type": "fenwick", "steps": steps, "metrics": metrics}

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported tree type '{req.tree_type}'. Supported: bst, avl, redblack, trie, segment, fenwick")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tree execution engine error: {str(e)}")
