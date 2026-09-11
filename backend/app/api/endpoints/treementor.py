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
    tree_type: str = Field("avl", description="Tree structure: bst, avl, redblack, trie, segment, fenwick")
    operation: str = Field("insert", description="Operation: insert, delete, search, query, autocomplete, prefix_sum, init")
    value: Optional[int] = Field(None, description="Numeric value for BST/AVL/RB insert, delete, search")
    word: Optional[str] = Field(None, description="String word or prefix for Trie operations")
    tree_snapshot: Optional[Dict[str, Any]] = Field(None, description="Current serialized tree state / root node")
    operation_history: Optional[List[Dict[str, Any]]] = Field(None, description="Operation log for history replaying")
    initial_data: Optional[List[Any]] = Field(None, description="Initial array/words to build tree from")
    query_range: Optional[List[int]] = Field(None, description="[qL, qR] for Segment Tree RMQ")
    index: Optional[int] = Field(None, description="Index for Fenwick / Segment point update/query")

@router.post("/execute")
def execute_tree_op(req: TreeExecuteRequest, user_data: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    tree_type = req.tree_type.lower().replace("-", "").replace("_", "")

    try:
        if tree_type == "bst":
            steps, metrics, current_tree = bst_operations_with_steps(
                initial_values=req.initial_data,
                op=req.operation,
                value=req.value,
                tree_snapshot=req.tree_snapshot,
                operation_history=req.operation_history,
            )
            return {"success": True, "tree_type": "bst", "steps": steps, "metrics": metrics, "current_tree": current_tree}

        elif tree_type == "avl":
            steps, metrics, current_tree = avl_operations_with_steps(
                initial_values=req.initial_data,
                op=req.operation,
                value=req.value,
                tree_snapshot=req.tree_snapshot,
                operation_history=req.operation_history,
            )
            return {"success": True, "tree_type": "avl", "steps": steps, "metrics": metrics, "current_tree": current_tree}

        elif tree_type in ["redblack", "rb"]:
            steps, metrics, current_tree = red_black_with_steps(
                initial_values=req.initial_data,
                op=req.operation,
                value=req.value,
                tree_snapshot=req.tree_snapshot,
                operation_history=req.operation_history,
            )
            return {"success": True, "tree_type": "redblack", "steps": steps, "metrics": metrics, "current_tree": current_tree}

        elif tree_type == "trie":
            steps, metrics, current_tree = trie_operations_with_steps(
                words=req.initial_data,
                op=req.operation,
                query=req.word,
                tree_snapshot=req.tree_snapshot,
                operation_history=req.operation_history,
            )
            return {"success": True, "tree_type": "trie", "steps": steps, "metrics": metrics, "current_tree": current_tree}

        elif tree_type in ["segment", "segmenttree"]:
            qL = req.query_range[0] if req.query_range and len(req.query_range) >= 1 else 1
            qR = req.query_range[1] if req.query_range and len(req.query_range) >= 2 else 4
            steps, metrics, current_tree = segment_tree_with_steps(
                arr=req.initial_data,
                op=req.operation,
                qL=qL,
                qR=qR,
                operation_history=req.operation_history,
            )
            return {"success": True, "tree_type": "segment", "steps": steps, "metrics": metrics, "current_tree": current_tree}

        elif tree_type in ["fenwick", "bit"]:
            idx = req.index if req.index is not None else 5
            steps, metrics, current_tree = fenwick_tree_with_steps(
                arr=req.initial_data,
                op=req.operation,
                idx=idx,
                operation_history=req.operation_history,
            )
            return {"success": True, "tree_type": "fenwick", "steps": steps, "metrics": metrics, "current_tree": current_tree}

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported tree type '{req.tree_type}'. Supported: bst, avl, redblack, trie, segment, fenwick")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tree execution engine error: {str(e)}")
