"""
SortMentor - Agentic AI System for Sorting Algorithm Visualization
This module implements an autonomous teaching assistant that analyzes data,
recommends algorithms, executes them, and learns from results.
"""

from flask import Blueprint, request, jsonify, Response
from flask_sqlalchemy import SQLAlchemy
import time
import json
import copy
import random
import os
import pickle
from typing import Dict, List, Tuple, Any
from datetime import datetime
from collections import Counter
import math
import sys
from functools import wraps
from flask import session
from efficient_sorts import bubble_sort, insertion_sort, selection_sort, merge_sort, quick_sort, heap_sort
import os
from groq import Groq

# Configure Groq API (using provided key as default if env is not set)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
else:
    groq_client = None


# Import db from app.py (will be passed in)
db = None

sortmentor_bp = Blueprint('sortmentor', __name__)

# Database Models for Learning
# These will be created when db is set (models are defined conditionally)
SortRun = None
PolicyWeights = None

# Optional ML model for algorithm recommendation (loaded from algo_model.pkl)
ml_model = None


def load_ml_model():
    """
    Load pre-trained ML model (RandomForest) from algo_model.pkl if available.
    This model predicts the best algorithm based on dataset features.
    """
    global ml_model
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, "algo_model.pkl")
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                ml_model = pickle.load(f)
            print(f"[SortMentor] Loaded ML model from {model_path}")
            print(f"[SortMentor] Model type: {type(ml_model)}")
            if hasattr(ml_model, 'n_features_in_'):
                print(f"[SortMentor] Model expects {ml_model.n_features_in_} features")
        else:
            print(f"[SortMentor] algo_model.pkl not found at {model_path}; using rule-based recommendations.")
    except Exception as e:
        ml_model = None
        print(f"[SortMentor] Error loading ML model: {e}")


# Try to load the ML model at import time
load_ml_model()

def init_models():
    """Initialize database models after db is set"""
    global SortRun, PolicyWeights
    
    if db is None:
        return
    
    # Define models using the db instance
    class SortRunModel(db.Model):
        """Stores performance results for continuous learning"""
        __tablename__ = 'sort_runs'
        
        id = db.Column(db.Integer, primary_key=True)
        timestamp = db.Column(db.DateTime, default=datetime.utcnow)
        n = db.Column(db.Integer, nullable=False)  # Data size
        sortedness = db.Column(db.Float, nullable=False)  # 0-1, how sorted the data is
        duplicates_ratio = db.Column(db.Float, nullable=False)  # 0-1, ratio of duplicates
        data_range = db.Column(db.Float, nullable=False)  # max - min
        algorithm = db.Column(db.String(50), nullable=False)
        time_ms = db.Column(db.Float, nullable=False)
        swaps = db.Column(db.Integer, nullable=False)
        comparisons = db.Column(db.Integer, nullable=False)
        user_level = db.Column(db.String(20), default='intermediate')
        was_best = db.Column(db.Boolean, default=False)  # Was this the best algorithm for this data?

    class PolicyWeightsModel(db.Model):
        """Stores learned weights for algorithm recommendation"""
        __tablename__ = 'policy_weights'
        
        id = db.Column(db.Integer, primary_key=True)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow)
        feature_ranges = db.Column(db.Text)  # JSON: feature buckets
        algorithm_weights = db.Column(db.Text)  # JSON: weights per algorithm per bucket
        notes = db.Column(db.Text)
    
    # Assign to global variables
    SortRun = SortRunModel
    PolicyWeights = PolicyWeightsModel


# ==================== SECURITY & API MANAGEMENT ====================

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        return f(*args, **kwargs)
    return decorated_function

def check_rate_limit():
    """Simple session-based rate limiter: 1 request per 2 seconds"""
    now = time.time()
    last_request = session.get('last_api_request', 0)
    if now - last_request < 2:
        return False
    session['last_api_request'] = now
    return True


# ==================== TOOL FUNCTIONS ====================

def _compute_randomness(data: List[int]) -> float:
    """
    Approximate randomness through adjacent jumps, similar to the training script.
    randomness = std(|a[i] - a[i+1]|) / (mean(|a[i] - a[i+1]|) + 1e-9)
    """
    if len(data) < 2:
        return 0.0
    diffs = [abs(data[i] - data[i + 1]) for i in range(len(data) - 1)]
    if not diffs:
        return 0.0
    mean_val = sum(diffs) / len(diffs)
    var = sum((d - mean_val) ** 2 for d in diffs) / len(diffs)
    std = math.sqrt(var)
    return std / (mean_val + 1e-9)


def analyze_data(data: List[int]) -> Dict[str, Any]:
    """
    Analyze dataset structure: size, sortedness, duplicates, range, etc.
    Returns a dictionary with all analyzed features.
    Includes extra features used by the ML model (inversions, randomness).
    """
    if not data:
        return {
            'n': 0,
            'sortedness': 0.0,
            'duplicates_ratio': 0.0,
            'data_range': 0.0,
            'is_nearly_sorted': False,
            'min': 0,
            'max': 0,
            'unique_count': 0,
            'inversions': 0,
            'randomness': 0.0,
            'std_dev': 0.0,
            'presorted_segments': 0
        }
    
    n = len(data)
    min_val = min(data)
    max_val = max(data)
    data_range = max_val - min_val if max_val != min_val else 1
    
    # Calculate inversion count (for ML feature) - O(n^2) like in training
    inversions = 0
    for i in range(n):
        for j in range(i + 1, n):
            if data[i] > data[j]:
                inversions += 1

    # Calculate sortedness to match training-time definition (adjacent correct order ratio)
    # This MUST mirror sortedness_score() in algo_model_train.py to keep the ML feature space consistent.
    total_pairs = n - 1
    if total_pairs <= 0:
        sortedness = 1.0
    else:
        correct_pairs = sum(1 for i in range(total_pairs) if data[i] <= data[i + 1])
        sortedness = correct_pairs / total_pairs
    
    # Check if nearly sorted (sortedness > 0.9)
    is_nearly_sorted = sortedness > 0.9
    
    # Calculate duplicates ratio
    unique_count = len(set(data))
    duplicates_ratio = 1.0 - (unique_count / n) if n > 0 else 0.0

    # Randomness score (same idea as training script)
    randomness = _compute_randomness(data)
    
    # Calculate entropy
    counts = Counter(data)
    probs = [count / n for count in counts.values()]
    entropy = -sum(p * math.log2(p) for p in probs) if probs else 0.0

    # Calculate variance and std_dev
    mean_val = sum(data) / n if n > 0 else 0
    variance = sum((x - mean_val) ** 2 for x in data) / n if n > 0 else 0.0
    std_dev = math.sqrt(variance)

    # Count presorted segments (runs)
    presorted_segments = 1 if n > 0 else 0
    for i in range(n - 1):
        if data[i] > data[i+1]:
            presorted_segments += 1

    return {
        'n': n,
        'sortedness': sortedness,
        'duplicates_ratio': duplicates_ratio,
        'data_range': data_range,
        'is_nearly_sorted': is_nearly_sorted,
        'min': min_val,
        'max': max_val,
        'unique_count': unique_count,
        'inversions': inversions,
        'randomness': randomness,
        'entropy': entropy,
        'variance': variance,
        'std_dev': std_dev,
        'presorted_segments': presorted_segments
    }


def bubble_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict], int, int]:
    """Bubble Sort with step-by-step tracking"""
    arr = copy.deepcopy(data)
    steps = []
    swaps = 0
    comparisons = 0
    n = len(arr)
    locked_indices = []
    
    for i in range(n):
        swapped_in_pass = False
        for j in range(0, n - i - 1):
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'array': copy.deepcopy(arr),
                'compare': [j, j + 1],
                'swap': None,
                'locked_indices': list(locked_indices),
                'message': f'Comparing {arr[j]} and {arr[j+1]}'
            })
            
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swaps += 1
                swapped_in_pass = True
                steps.append({
                    'step': len(steps),
                    'event_type': 'swap',
                    'array': copy.deepcopy(arr),
                    'compare': None,
                    'swap': [j, j + 1],
                    'locked_indices': list(locked_indices),
                    'message': f'Found {arr[j+1]} > {arr[j]}, swapping them'
                })
        
        # Mark the end element as "Locked" (Sorted)
        locked_indices.append(n - i - 1)
        steps.append({
            'step': len(steps),
            'event_type': 'lock_element',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'pivot': n - i - 1,
            'locked_indices': list(locked_indices),
            'message': f'Element {arr[n-i-1]} formally locked in its final position'
        })
        
        if not swapped_in_pass:
            locked_indices.extend([idx for idx in range(n - i - 1) if idx not in locked_indices])
            steps.append({
                'step': len(steps),
                'event_type': 'all_sorted',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': None,
                'locked_indices': list(locked_indices),
                'message': 'No swaps occurred during the pass; the entire array is sorted!'
            })
            break
    
    return arr, steps, swaps, comparisons


def insertion_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict], int, int]:
    """Insertion Sort with step-by-step tracking of shifts and comparisons."""
    arr = copy.deepcopy(data)
    steps = []
    shifts = 0
    comparisons = 0
    n = len(arr)
    
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        
        steps.append({
            'step': len(steps),
            'event_type': 'insertion_start',
            'array': copy.deepcopy(arr),
            'compare': [i, j],
            'swap': None,
            'message': f'Picked key {key} at index {i}'
        })
        
        while j >= 0:
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'array': copy.deepcopy(arr),
                'compare': [j, j + 1],
                'swap': None,
                'message': f'Comparing key {key} with {arr[j]}'
            })
            
            if arr[j] > key:
                arr[j + 1] = arr[j]
                shifts += 1
                
                steps.append({
                    'step': len(steps),
                    'event_type': 'shift',
                    'array': copy.deepcopy(arr),
                    'compare': None,
                    'swap': [j + 1, j],
                    'message': f'Value {arr[j]} shifted from {j} to {j + 1}'
                })
                j -= 1
            else:
                break
        
        arr[j + 1] = key
        
        if j + 1 != i:
            shifts += 1
            
        steps.append({
            'step': len(steps),
            'event_type': 'insertion_end',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'pivot': j + 1,
            'message': f'Inserted key {key} into index {j + 1}'
        })
    
    return arr, steps, shifts, comparisons


def selection_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict], int, int]:
    """Selection Sort with step-by-step tracking"""
    arr = copy.deepcopy(data)
    steps = []
    swaps = 0
    comparisons = 0
    n = len(arr)
    
    for i in range(n):
        min_idx = i
        steps.append({
            'step': len(steps),
            'event_type': 'set_min',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'pivot': min_idx,
            'message': f'Assuming index {i} as the current minimum'
        })
        
        for j in range(i + 1, n):
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'array': copy.deepcopy(arr),
                'compare': [min_idx, j],
                'swap': None,
                'message': f'Checking if {arr[j]} is smaller than the current minimum {arr[min_idx]}'
            })
            
            if arr[j] < arr[min_idx]:
                min_idx = j
                steps.append({
                    'step': len(steps),
                    'event_type': 'new_min',
                    'array': copy.deepcopy(arr),
                    'compare': None,
                    'swap': None,
                    'pivot': min_idx,
                    'message': f'New minimum found: {arr[min_idx]}'
                })
        
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'swap',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [i, min_idx],
                'message': f'Swapping minimum {arr[i]} into its final sorted position at index {i}'
            })
            
    return arr, steps, swaps, comparisons


def merge_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict], int, int]:
    """Merge Sort with step-by-step tracking"""
    full_arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    swaps = 0

    def merge(start, mid, end):
        nonlocal comparisons, swaps
        left = full_arr[start:mid]
        right = full_arr[mid:end]
        
        i = j = 0
        temp = []
        
        while i < len(left) and j < len(right):
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'array': copy.deepcopy(full_arr),
                'compare': [start + i, mid + j],
                'swap': None,
                'message': f'Comparing left half ({left[i]}) with right half ({right[j]})'
            })
            
            if left[i] <= right[j]:
                temp.append(left[i])
                i += 1
            else:
                temp.append(right[j])
                j += 1

        while i < len(left):
            temp.append(left[i])
            i += 1
            
        while j < len(right):
            temp.append(right[j])
            j += 1
            
        for k_idx, val in enumerate(temp):
            full_arr[start + k_idx] = val
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'merge',
                'array': copy.deepcopy(full_arr),
                'compare': None,
                'swap': [start + k_idx, start + k_idx],
                'message': f'Placed {val} into the merged subarray'
            })

    def sort(start, end):
        if end - start <= 1:
            return
        mid = (start + end) // 2
        sort(start, mid)
        sort(mid, end)
        merge(start, mid, end)

    sort(0, len(full_arr))
    return full_arr, steps, swaps, comparisons


def quick_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict], int, int]:
    """Quick Sort with step-by-step tracking"""
    arr = copy.deepcopy(data)
    steps = []
    swaps = 0
    comparisons = 0
    
    def partition(low, high):
        nonlocal swaps, comparisons
        
        mid = (low + high) // 2
        steps.append({
            'step': len(steps),
            'event_type': 'pivot_selection',
            'array': copy.deepcopy(arr),
            'compare': [low, high],
            'swap': None,
            'pivot': mid,
            'message': f'Choosing pivot from candidates at indices {low}, {mid}, {high}'
        })
        
        indices = [low, mid, high]
        indices.sort(key=lambda x: arr[x])
        pivot_idx = indices[1]
        pivot_val = arr[pivot_idx]

        if pivot_idx != high:
            arr[pivot_idx], arr[high] = arr[high], arr[pivot_idx]
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'pivot_move',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [pivot_idx, high],
                'pivot': high,
                'message': f'Moved median value {pivot_val} to the end to serve as pivot'
            })

        pivot = arr[high]
        i = low - 1
        
        for j in range(low, high):
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'array': copy.deepcopy(arr),
                'compare': [j, high],
                'swap': None,
                'pivot': high,
                'message': f'Comparing {arr[j]} with pivot {pivot}'
            })
            
            if arr[j] <= pivot:
                i += 1
                if i != j:
                    arr[i], arr[j] = arr[j], arr[i]
                    swaps += 1
                    steps.append({
                        'step': len(steps),
                        'event_type': 'swap',
                        'array': copy.deepcopy(arr),
                        'compare': None,
                        'swap': [i, j],
                        'pivot': high,
                        'message': f'Swapped {arr[i]} and {arr[j]} (found element <= pivot)'
                    })
        
        if i + 1 != high:
            arr[i + 1], arr[high] = arr[high], arr[i + 1]
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'pivot_final',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [i + 1, high],
                'pivot': i + 1,
                'message': f'Placed pivot {pivot} in its final sorted position at index {i + 1}'
            })
        else:
            steps.append({
                'step': len(steps),
                'event_type': 'pivot_final',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': None,
                'pivot': i + 1,
                'message': f'Pivot {pivot} is already in its final sorted position at index {i + 1}'
            })
        
        return i + 1
    
    def quick_sort_rec(low, high):
        if low < high:
            pi = partition(low, high)
            quick_sort_rec(low, pi - 1)
            quick_sort_rec(pi + 1, high)
    
    quick_sort_rec(0, len(arr) - 1)
    return arr, steps, swaps, comparisons


def heap_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict], int, int]:
    """Heap Sort with step-by-step tracking"""
    arr = copy.deepcopy(data)
    steps = []
    swaps = 0
    comparisons = 0
    n = len(arr)
    
    def heapify(arr, n, i, phase):
        nonlocal swaps, comparisons
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        steps.append({
            'step': len(steps),
            'event_type': 'heapify_start',
            'phase': phase,
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'pivot': i,
            'message': f'Maintaining heap property at index {i}'
        })
        
        if left < n:
            comparisons += 1
            if arr[left] > arr[largest]:
                largest = left
            
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'phase': phase,
                'array': copy.deepcopy(arr),
                'compare': [i, left],
                'swap': None,
                'pivot': i,
                'message': f'Comparing parent {arr[i]} with left child {arr[left]}'
            })
        
        if right < n:
            comparisons += 1
            if arr[right] > arr[largest]:
                largest = right
                
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'phase': phase,
                'array': copy.deepcopy(arr),
                'compare': [largest, right],
                'swap': None,
                'pivot': i,
                'message': f'Comparing current largest with right child {arr[right]}'
            })
        
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'swap',
                'phase': phase,
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [i, largest],
                'pivot': i,
                'message': f'Swapping index {i} and {largest} to restore Max-Heap'
            })
            heapify(arr, n, largest, phase)
    
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i, 'build')
    
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        swaps += 1
        steps.append({
            'step': len(steps),
            'event_type': 'extract_max',
            'phase': 'extract',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': [0, i],
            'pivot': 0,
            'message': f'Extracting max {arr[i]} to position {i}'
        })
        heapify(arr, i, 0, 'extract')
    
    return arr, steps, swaps, comparisons


def _infer_event_type(step: Dict[str, Any]) -> str:
    """
    Infer a generic event_type for legacy steps that might not have one.
    This keeps the reasoning engine robust even if some algorithms
    don't explicitly label events.
    """
    if 'event_type' in step and step['event_type']:
        return step['event_type']
    if step.get('swap'):
        return 'swap'
    if step.get('compare'):
        return 'comparison'
    if step.get('pivot') is not None:
        return 'pivot'
    return 'state'


def _reason_about_step(algorithm: str, step: Dict[str, Any], features: Dict[str, Any], state: Dict[str, Any]) -> str:
    """
    Core rule-based reasoning engine for a single algorithm step.
    Observes:
      - algorithm type
      - event type
      - input features (size, sortedness, duplicates, randomness, etc.)
      - simple running state (e.g., pass_index, step index)
    Produces:
      - Explicit action + Conceptual explanation.
    """
    alg = algorithm.lower()
    event_type = _infer_event_type(step)
    n = features.get('n', 0)
    sortedness = features.get('sortedness', 0.0)
    duplicates = features.get('duplicates_ratio', 0.0)
    randomness = features.get('randomness', 0.0)
    
    # Get the explicit action message generated by the algorithm (e.g., "Swapping 5 and 2")
    explicit_action = step.get('message', '')
    if explicit_action:
        explicit_action += ". "

    # Generic explanations for very small arrays
    if n <= 1:
        return explicit_action + "The array has one or zero elements, so it is already sorted."

    # ===== Bubble Sort =====
    if alg == 'bubble':
        if event_type == 'lock_element':
            return explicit_action + "The largest element has bubbled to the end of the unsorted partition and is now locked in place."
        if event_type == 'all_sorted':
            return explicit_action + "The array is completely sorted, no more passes are needed!"
        if event_type == 'swap':
            inverse_sortedness = 1.0 - sortedness # Assuming sortedness is 0 for fully unsorted, 1 for fully sorted
            if inverse_sortedness > 0.8:
                return explicit_action + "The data is mostly reversed, causing Bubble Sort to blindly swap almost every adjacent pair it sees."
            return explicit_action + "Bubble Sort swaps adjacent elements to push the largest values to the end."
        if event_type == 'comparison':
            if sortedness > 0.8:
                return explicit_action + "Checking neighbors even though the array is mostly sorted (extra comparisons)."
            return explicit_action + "Comparing adjacent elements to see if they are out of order."

    # ===== Insertion Sort =====
    if alg == 'insertion':
        if event_type == 'insertion_start':
            if sortedness > 0.8:
                return explicit_action + "Inserting into a mostly sorted prefix, which is very fast."
            return explicit_action + "Insertion Sort takes the current element and finds its correct place in the already-sorted left part."
        if event_type == 'shift':
            if sortedness > 0.8:
                return explicit_action + "A few elements are shifted to the right to open a spot, which is cheap when the data is nearly sorted."
            return explicit_action + "Insertion Sort shifts larger elements to the right, making room to insert the current value in the correct position."
        if event_type == 'comparison':
            return explicit_action + "Checking if the current element is smaller than the sorted element to its left."
        if event_type == 'insertion_end':
            return explicit_action + "The element has found its correct spot in the sorted portion."

    # ===== Selection Sort =====
    if alg == 'selection':
        if event_type == 'set_min':
            return explicit_action + "Marking the first unsorted element as the initial minimum."
        if event_type == 'new_min':
            return explicit_action + "Found a smaller element! Updating the target minimum."
        if event_type == 'swap_min' or event_type == 'swap':
            if duplicates > 0.3:
                return explicit_action + "Selection Sort places one occurrence of the smallest remaining value."
            return explicit_action + "Selection Sort has finished scanning the unsorted part and now swaps the smallest found value into its final position."
        if event_type == 'comparison':
            return explicit_action + "Selection Sort is scanning the unsorted part to find the smallest element, doing the same amount of work no matter how ordered the data is."

    # ===== Merge Sort =====
    if alg == 'merge':
        if event_type == 'merge':
            if n > 1 and randomness < 0.3:
                return "Merge Sort is combining two almost ordered halves, guaranteeing O(n log n) time even though the data already looks quite regular."
            return "Merge Sort merges two sorted subarrays into a larger sorted segment, which is why it keeps a consistent O(n log n) pattern of work."

    # ===== Quick Sort =====
    if alg == 'quick':
        if event_type == 'pivot_selection':
            return explicit_action + "Quick Sort selects the median of the first, middle, and last elements to try to pick a balanced pivot."
        if event_type == 'pivot_move':
            return explicit_action + "The chosen pivot is temporarily moved to the end of the partition so it stays out of the way during the sorting loop."
        if event_type == 'comparison':
            return explicit_action + "Comparing the current element to the pivot. If it's smaller, it will be moved to the left side of the partition."
        if event_type == 'swap':
            return explicit_action + "Swapping a smaller element to the left side of the partition so it ultimately ends up before the pivot."
        if event_type == 'pivot_final':
            return explicit_action + "The partitioning is complete for this section. The pivot is placed exactly where it belongs in the final sorted array."

    # ===== Heap Sort =====
    if alg == 'heap':
        if event_type == 'heapify_start':
            return explicit_action + "Looking at a specific sub-tree to ensure the parent is larger than both its children (Max-Heap property)."
        if event_type == 'comparison':
            return explicit_action + "Heap Sort compares a parent with its children to decide whether the heap property is violated at this node."
        if event_type == 'swap':
            return explicit_action + "Heap Sort swaps a parent with a larger child to restore the heap property, pushing smaller elements down the tree."
        if event_type == 'extract_max':
            return explicit_action + "The absolute maximum remaining value is popped from the root of the heap and moved to its final sorted spot at the end."

    # ===== Fallback generic explanations =====
    if event_type == 'comparison':
        return "The algorithm is comparing two elements to decide whether they are in the correct relative order."
    if event_type == 'swap':
        return "The algorithm swaps two elements to move them closer to their correct positions in the sorted order."
    if event_type == 'merge':
        return "The algorithm merges smaller sorted pieces into a larger sorted segment."
    if event_type == 'partition_swap':
        return "The algorithm is rearranging elements around a pivot to divide the array into smaller and larger parts."

    # If nothing matched, provide a neutral explanation
    return "The algorithm updates its internal structure in this step to move the array closer to being fully sorted."


def _get_feature_explanation(features: Dict[str, Any]) -> str:
    """
    Translates raw technical metrics into student-friendly narrative segments.
    """
    n = features.get('n', 0)
    sortedness = features.get('sortedness', 0.0)
    entropy = features.get('entropy', 0.0)
    duplicates = features.get('duplicates_ratio', 0.0)

    # Size explanation
    size_desc = f"a moderate size of {n} elements"
    if n <= 15:
        size_desc = f"a very small size ({n} elements)"
    elif n > 1000:
        size_desc = f"a large scale ({n} elements)"

    # Sortedness explanation
    sort_desc = "is currently in a random order"
    if sortedness > 0.9:
        sort_desc = "is already nearly sorted"
    elif sortedness > 0.7:
        sort_desc = "shows some existing order"
    elif sortedness < 0.2:
        sort_desc = "is highly disorganized or even reversed"

    # Entropy (Unpredictability) explanation
    # For a student, explain entropy as 'pattern strength' or 'unpredictability'
    entropy_desc = f"a moderate level of unpredictability (entropy: {entropy:.2f})"
    if entropy > 5.0:
        entropy_desc = f"very high unpredictability (entropy: {entropy:.2f}), meaning the values are spread out with no obvious clusters"
    elif entropy < 1.0:
        entropy_desc = f"low unpredictability (entropy: {entropy:.2f}), suggesting many repeating patterns or values"

    # Duplicate explanation
    dup_desc = "contains mostly unique values"
    if duplicates > 0.4:
        dup_desc = f"contains many duplicate values ({duplicates*100:.1f}%)"
    elif duplicates > 0.1:
        dup_desc = "has a few repeating values"

    return (f"Your dataset has {size_desc}. We observed that the data {sort_desc}. "
            f"Statistically, it carries {entropy_desc}, and {dup_desc}.")


def _get_algo_strengths(selected_algo: str, recommended_algo: str, features: Dict[str, Any]) -> str:
    """
    Provides the logical 'bridge' explaining why an algorithm fits certain data traits.
    Contrasts the selected algorithm with the AI recommended algorithm if they differ.
    """
    alg = selected_algo.lower()
    rec = recommended_algo.lower()
    n = features.get('n', 0)
    sortedness = features.get('sortedness', 0.0)
    
    strengths = {
        'insertion': "Insertion Sort is exceptionally efficient here because it excels at 'nearly sorted' data, where it can achieve near-linear performance with minimal overhead.",
        'bubble': "Bubble Sort was considered due to its simplicity, though it's typically only competitive on tiny, almost-sorted lists where its 'early exit' logic can kick in.",
        'selection': "Selection Sort is a 'steady' worker that performs exactly the same number of comparisons regardless of initial order, making it predictable but often slower than smarter alternatives.",
        'merge': "Merge Sort's 'Divide and Conquer' strategy ensures it never slows down, even on the messiest datasets. Its ability to handle large data consistently makes it a reliable champion.",
        'quick': "Quick Sort is often the fastest choice for large, random datasets like yours. It rapidly partitions the data into smaller chunks, avoiding the heavy memory costs of Merge Sort.",
        'heap': "Heap Sort provides guaranteed performance without using extra memory, making it a powerful choice when you need speed but have limited space."
    }
    
    # Reason for the RECOMMENDED algorithm
    reason = strengths.get(rec, f"{rec.capitalize()} Sort provides a balanced approach to sorting your specific data pattern.")
    
    # Specific logic bridge for current consensus on RECOMMENDED algorithm
    if n <= 15 and rec == 'insertion':
        reason = "Since your list is so small, the simplicity of Insertion Sort actually beats the complex overhead of 'faster' algorithms."
    elif sortedness > 0.8 and rec == 'insertion':
        reason = "Because your data was already mostly in order, Insertion Sort only needs to do a few 'checks' to finish the job, making it the fastest possible choice."
    elif n > 100 and rec in ['quick', 'merge']:
        reason = f"With {n} elements, the computationally efficient $O(n \log n)$ strategy of {rec.capitalize()} Sort is critical to avoid the massive slowdown that $O(n^2)$ algorithms would suffer."

    if alg == rec:
        return reason
    else:
        return f"While you selected {alg.capitalize()} Sort, the AI considered {rec.capitalize()} Sort to be the optimal choice. {reason}"


def _enrich_steps_with_explanations(algorithm: str, steps: List[Dict[str, Any]], features: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Event listener + state tracker + explanation generator.
    Takes raw steps from an algorithm and adds:
      - event_type (if missing)
      - explanation (human-friendly, conceptual)
    """
    state: Dict[str, Any] = {
        'steps_seen': 0
    }
    enriched: List[Dict[str, Any]] = []
    for step in steps:
        state['steps_seen'] += 1
        # Ensure event_type exists
        event_type = _infer_event_type(step)
        step['event_type'] = event_type
        # Generate explanation
        explanation = _reason_about_step(algorithm, step, features, state)
        step['explanation'] = explanation
        enriched.append(step)
    return enriched


def run_algorithm(algorithm_name: str, data: List[int], features: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Execute a sorting algorithm and return results with metrics.
    """
    start_time = time.time()
    
    algorithm_map = {
        'bubble': bubble_sort_with_steps,
        'insertion': insertion_sort_with_steps,
        'selection': selection_sort_with_steps,
        'merge': merge_sort_with_steps,
        'quick': quick_sort_with_steps,
        'heap': heap_sort_with_steps
    }
    
    if algorithm_name.lower() not in algorithm_map:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")
    
    sorted_arr, steps, swaps, comparisons = algorithm_map[algorithm_name.lower()](data)
    time_ms = (time.time() - start_time) * 1000

    # Theoretical Complexity Mapping
    theoretical_complexity = {
        'bubble': {'time': 'O(n²)', 'space': 'O(1)', 'best': 'O(n)', 'worst': 'O(n²)'},
        'insertion': {'time': 'O(n²)', 'space': 'O(1)', 'best': 'O(n)', 'worst': 'O(n²)'},
        'selection': {'time': 'O(n²)', 'space': 'O(1)', 'best': 'O(n²)', 'worst': 'O(n²)'},
        'merge': {'time': 'O(n log n)', 'space': 'O(n)', 'best': 'O(n log n)', 'worst': 'O(n log n)'},
        'quick': {'time': 'O(n log n)', 'space': 'O(log n)', 'best': 'O(n log n)', 'worst': 'O(n²)'},
        'heap': {'time': 'O(n log n)', 'space': 'O(1)', 'best': 'O(n log n)', 'worst': 'O(n log n)'}
    }
    
    comp = theoretical_complexity.get(algorithm_name.lower(), {'time': 'Unknown', 'space': 'Unknown', 'best': 'Unknown', 'worst': 'Unknown'})
    
    CODE_SNIPPETS = {
        'bubble': '''def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr''',
        'insertion': '''def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr''',
        'selection': '''def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr''',
        'merge': '''def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L, R = arr[:mid], arr[mid:]
        merge_sort(L)
        merge_sort(R)
        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] <= R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1
        while i < len(L): arr[k] = L[i]; i += 1; k += 1
        while j < len(R): arr[k] = R[j]; j += 1; k += 1
    return arr''',
        'quick': '''def quick_sort(arr, low, high):
    if low < high:
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            if arr[j] <= pivot:
                i = i + 1
                arr[i], arr[j] = arr[j], arr[i]
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        pi = i + 1
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr''',
        'heap': '''def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2
    if l < n and arr[i] < arr[l]: largest = l
    if r < n and arr[largest] < arr[r]: largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
def heap_sort(arr):
    n = len(arr)
    for i in range(n//2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n-1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)
    return arr'''
    }

    # Ensure we have input features for reasoning
    if features is None:
        features = analyze_data(data)

    n_val = features['n']
    max_comp = (n_val * (n_val - 1)) // 2 if 'O(n²)' in comp['worst'] else int(n_val * math.log2(n_val + 1))
    max_swaps = max_comp if algorithm_name.lower() != 'selection' else n_val

    # Enrich steps with event types and explanations
    enriched_steps = _enrich_steps_with_explanations(algorithm_name, steps, features)
    
    return {
        'algorithm': algorithm_name,
        'sorted_array': sorted_arr,
        'steps': enriched_steps,
        'time_ms': time_ms,
        'swaps': swaps,
        'comparisons': comparisons,
        'is_stable': algorithm_name.lower() in ['bubble', 'insertion', 'merge'],
        'theoretical_complexity': comp,
        'theoretical_max_comparisons': max_comp,
        'theoretical_max_swaps': max_swaps,
        'code_snippet': CODE_SNIPPETS.get(algorithm_name.lower(), "# Code unavailable")
    }


def compare_algorithms(data: List[int], algorithms: List[str] = None, features: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Run multiple algorithms and compare their performance.
    """
    if algorithms is None:
        algorithms = ['bubble', 'insertion', 'selection', 'merge', 'quick', 'heap']
    if features is None:
        features = analyze_data(data)

    results = []
    for alg in algorithms:
        try:
            # For comparison, we don't need steps, so we call the optimized versions
            # Assuming these optimized versions exist and return (time_taken, comparisons, swaps)
            time_taken, comparisons, swaps = 0, 0, 0
            if alg == 'bubble':
                time_taken, comparisons, swaps = bubble_sort(data.copy())
            elif alg == 'insertion':
                time_taken, comparisons, swaps = insertion_sort(data.copy())
            elif alg == 'selection':
                time_taken, comparisons, swaps = selection_sort(data.copy())
            elif alg == 'merge':
                time_taken, comparisons, swaps = merge_sort(data.copy())
            elif alg == 'quick':
                time_taken, comparisons, swaps = quick_sort(data.copy())
            elif alg == 'heap':
                time_taken, comparisons, swaps = heap_sort(data.copy())
            
            results.append({
                'algorithm': alg,
                'sorted_array': sorted(data), # Just return sorted
                'steps': [], # No steps for comparison runs
                'time_ms': time_taken * 1000,
                'swaps': swaps,
                'comparisons': comparisons,
                'is_stable': alg.lower() in ['bubble', 'insertion', 'merge']
            })
        except Exception as e:
            print(f"Error running {alg} for comparison: {e}")
    
    # Sort by time
    results.sort(key=lambda x: x['time_ms'])
    return results


def generate_explanation(algorithm: str, context: Dict, user_level: str = 'intermediate') -> Dict[str, str]:
    """
    Generate educational explanations based on algorithm and context, adapted by user level.
    """
    features = context.get('features', {})
    why = context.get('why', '')
    
    # Check if we should use AI
    if groq_client:
        ai_result = generate_ai_explanation(algorithm, context, user_level)
        if ai_result:
            return ai_result
               # Fallback Rule-Based Generation
    n = features.get('n', 0)
    
    # 1. Start with the "Educational Concept"
    bases = {
        'beginner': {
            'bubble': "Imagine Bubble Sort as a series of pairs in a line. It swaps adjacent people until the 'heaviest' (largest) value naturally floats to the end, just like a bubble.",
            'insertion': "Think of Insertion Sort like sorting a hand of cards. You take one card at a time and slide it into its correct spot among the cards you're already holding.",
            'selection': "Selection Sort is like scanning a shelf for the smallest book, putting it first, and then repeating that scan for the rest of the shelf.",
            'merge': "Merge Sort is a 'Divide and Conquer' strategy. It splits the work into tiny, easy-to-manage pieces, sorts them, and then zips them back together.",
            'quick': "Quick Sort picks a 'pivot' element to act as a divider. It puts everything smaller on one side and everything larger on the other, then repeats the process.",
            'heap': "Heap Sort organizes data into a 'priority heap' (a tree structure) where the largest value is always at the root, making it easy to pick and move to the end."
        },
        'intermediate': {
            'bubble': "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
            'insertion': "Insertion Sort builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into the correct position.",
            'selection': "Selection Sort divides the list into sorted and unsorted parts, repeatedly finding the minimum element to append to the sorted segment.",
            'merge': "Merge Sort uses a recursive divide-and-conquer approach, splitting the array in half until individual elements are reached, then merging them back in order.",
            'quick': "Quick Sort partitions the array around a pivot element so that elements smaller than the pivot are on the left and larger ones are on the right.",
            'heap': "Heap Sort utilizes a binary heap data structure to find the maximum element and move it to the end, iteratively rebuilding the heap."
        },
        'advanced': {
            'bubble': "Bubble Sort is an $O(n^2)$ stable, in-place sort. It is generally avoided for serious work due to its inefficiency compared to $O(n \log n)$ alternatives.",
            'insertion': "Insertion Sort is $O(n^2)$ worst-case but $O(n)$ best-case. Its low constant factors make it excellent for small $N$ or nearly sorted datasets.",
            'selection': "Selection Sort is $O(n^2)$ and unstable. It minimizes writes ($O(n)$ swaps), which is useful in hardware with expensive write operations.",
            'merge': "Merge Sort is a stable $O(n \log n)$ sort. While it requires $O(n)$ auxiliary space, it provides consistent, predictable performance regardless of data order.",
            'quick': "Quick Sort is $O(n \log n)$ on average with excellent cache locality. While pivot choice can degrade it to $O(n^2)$, median-of-three usually prevents this.",
            'heap': "Heap Sort is $O(n \log n)$ and in-place. It lacks the stable overhead of Merge Sort but is typically slower than Quick Sort due to poorer cache locality."
        }
    }
    
    level_dict = bases.get(user_level.lower(), bases['intermediate'])
    concept_text = level_dict.get(algorithm.lower(), f"{algorithm.capitalize()} Sort is a foundational sorting method.")

    ai_recommended = context.get('ai_recommended', algorithm)
    
    # If the user selected a different algorithm than recommended, explain both!
    if algorithm.lower() != ai_recommended.lower():
        rec_concept_text = level_dict.get(ai_recommended.lower(), f"{ai_recommended.capitalize()} Sort is a foundational sorting method.")
        concept_text = f"**{algorithm.capitalize()} Sort (Selected):** {concept_text}\n\n**{ai_recommended.capitalize()} Sort (Recommended):** {rec_concept_text}"

    # 2. Add the "Data Context" narrative
    context_text = _get_feature_explanation(features)

    # 3. Add the "Logical Verdict" (Why this algorithm won)
    verdict_text = _get_algo_strengths(algorithm, ai_recommended, features)

    # 4. Integrate ML Context if present
    ml_context = ""
    if "ML Context:" in why:
        ml_context = f"\n\n**AI Insight:** {why.split('ML Context:')[1].strip()}"

    # Construct the final cohesive narrative
    full_reasoning = (
        f"{concept_text}\n\n"
        f"**Analyzing Your Data:** {context_text}\n\n"
        f"**The Verdict:** {verdict_text}{ml_context}"
    )

    # Generate learning tip
    tips = {
        'bubble': "Try Bubble Sort on a nearly sorted array—it can finish very quickly if no swaps are needed!",
        'insertion': "Insertion Sort is the 'gold standard' for small lists; even Java and Python use it for small sub-arrays!",
        'selection': "Notice that Selection Sort takes the same time regardless of how sorted your data is—it's very predictable.",
        'merge': "Merge Sort is 'stable,' meaning it keeps identical numbers in their original relative order.",
        'quick': "Quick Sort's speed comes from its 'pivot.' If you pick a bad pivot, it can slow down significantly!",
        'heap': "Heap Sort is like a tournament where the winner (largest number) is removed and the bracket is updated."
    }
    
    tip = tips.get(algorithm.lower(), "Experiment with different levels of 'Sortedness' to see how it changes the AI's choice!")
    
    return {
        'explanation': concept_text,
        'reasoning': full_reasoning,
        'tip': tip
    }


def generate_ai_explanation(algorithm: str, context: Dict, user_level: str) -> Dict[str, str]:
    """
    Generate explanation using Groq API.
    """
    if not groq_client:
        return None

    features = context.get('features', {})
        
    # PERFORMANCE EMERGENCY: Large datasets crash or timeout the Gemini prompt
    # Fallback immediately to the rule-based logic to preserve UI flow
    if features.get('n', 0) > 1000:
        return None

    try:
        why_context = context.get('why', 'No specific context provided.')
        comp_ctx = context.get('comparison', {})
        winner = comp_ctx.get('winner', 'unknown')
        winner_time = comp_ctx.get('winner_time', 0)
        selected_time = comp_ctx.get('selected_time', 0)
        
        level_instructions = {
            "beginner": "Use simple analogies (like sorting cards or books). Avoid complex math or Big O notation. Keep the tone encouraging, easy to understand, and fun.",
            "intermediate": "Introduce basic algorithmic concepts. Mention Big O notation briefly without deep mathematical proofs. Use standard computer science terminology like 'pointers' and 'arrays'.",
            "advanced": "Provide deeply technical explanations. Focus heavily on Big O time and space complexity, memory access patterns, cache locality, and algorithmic constants. Use rigorous CS language and mathematical justification."
        }
        
        specific_instruction = level_instructions.get(user_level.lower(), level_instructions["intermediate"])

        prompt = f"""
        Act as an expert Computer Science tutor teaching a {user_level} level student.
        
        CRITICAL INSTRUCTION FOR LEVEL '{user_level.upper()}':
        {specific_instruction}
        
        Task: You are analyzing a sorting algorithm execution. You must provide a structured, educational evaluation of the Selected Algorithm ({algorithm}) against the optimal Recommended Algorithm ({winner}).
        
        The JSON response MUST include these exact keys:
        1. `conceptual_overview`: Define how the Selected Algorithm works according to the {user_level} instructions above.
        2. `data_analysis`: Quote and explain the dataset features: size (N = {features.get('n')}), sortedness ({features.get('sortedness', 0):.2f}), entropy ({features.get('entropy', 0.0):.2f}). Explain these metrics appropriately for a {user_level} student.
        3. `performance_verdict`: Explicitly state why {winner} is better than {algorithm} for THIS specific data. Use the metrics above to justify (e.g., 'With {features.get('presorted_segments')} sorted segments, Insertion Sort is faster than Quick Sort...'). Format the complexity of this explanation for a {user_level} student.
        4. `optimization_advice`: Suggest a way to improve the data or choose a better algorithm for similar cases.
        5. `tip`: A one-sentence actionable learning tip tailored for a {user_level} student.

        Real-time Performance Results:
        - Actual Winner/Recommended: {winner} Sort ({winner_time:.2f}ms)
        - Selected Algorithm ({algorithm}): {selected_time:.2f}ms
        
        Provide the response in strict JSON format. Do not include markdown formatting like ```json ... ```. Just the raw JSON string.
        """

        chat_completion = groq_client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": prompt,
            }],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
        )
        
        text = chat_completion.choices[0].message.content.replace('```json', '').replace('```', '').strip()
        result = json.loads(text)
        
        return result
        
    except Exception as e:
        print(f"GenAI Error: {e}")
        return None



def record_results(algorithm: str, metrics: Dict, features: Dict, user_level: str, was_best: bool = False):
    """
    Store performance results in database for continuous learning.
    """
    try:
        if SortRun is None:
            return  # Models not initialized yet
        run = SortRun(
            n=features.get('n', 0),
            sortedness=features.get('sortedness', 0),
            duplicates_ratio=features.get('duplicates_ratio', 0),
            data_range=features.get('data_range', 0),
            algorithm=algorithm,
            time_ms=metrics.get('time_ms', 0),
            swaps=metrics.get('swaps', 0),
            comparisons=metrics.get('comparisons', 0),
            user_level=user_level,
            was_best=was_best
        )
        db.session.add(run)
        db.session.commit()
    except Exception as e:
        print(f"Error recording results: {e}")
        db.session.rollback()


def load_policy_weights() -> Dict:
    """
    Load learned weights from database for algorithm recommendation.
    """
    try:
        if PolicyWeights is None:
            return {'feature_ranges': {}, 'algorithm_weights': {}}
        policy = PolicyWeights.query.order_by(PolicyWeights.updated_at.desc()).first()
        if policy:
            return {
                'feature_ranges': json.loads(policy.feature_ranges) if policy.feature_ranges else {},
                'algorithm_weights': json.loads(policy.algorithm_weights) if policy.algorithm_weights else {}
            }
    except Exception as e:
        print(f"Error loading policy weights: {e}")
    
    return {'feature_ranges': {}, 'algorithm_weights': {}}


@sortmentor_bp.route('/session', methods=['POST'])
@login_required
def run_session():
    """
    Unified endpoint for the entire SortMentor session:
    1. Analyze Data
    2. Recommend Algorithm
    3. Run Selected (or Recommended) Algorithm
    4. Compare with Others
    5. Generate Explainable AI Output
    """
    if not check_rate_limit():
        return jsonify({'error': 'Rate limit exceeded. Please wait a moment.'}), 429
    try:
        req_data = request.get_json()
        if not req_data or 'data' not in req_data:
            return jsonify({'error': 'No data provided'}), 400
            
        data = req_data['data']
        user_level = req_data.get('userLevel', 'intermediate')
        selected_algo = req_data.get('algorithm')  # User might pre-select one
        
        # 1. Feature Extraction
        features = analyze_data(data)
        
        # 2. Recommendation (ML or Rule-based)
        recommendation = None
        confidence = 0.0
        prediction = {'algorithm': 'unknown', 'confidence': 0.0, 'reason': 'No ML model or rule matched.'}
        
        # Try ML prediction first
        if ml_model:
            try:
                # Must match training feature vector order:
                # size, sortedness, inversions, randomness, duplicate_ratio, entropy, variance
                feature_vector = [[
                    features['n'],
                    features['sortedness'],
                    features['inversions'],
                    features['randomness'],
                    features['duplicates_ratio'],
                    features.get('entropy', 0.0),
                    features.get('variance', 0.0)
                ]]
                predicted_algo = ml_model.predict(feature_vector)[0]
                confidence = max(ml_model.predict_proba(feature_vector)[0])
                prediction = {
                    'algorithm': predicted_algo,
                    'confidence': confidence,
                    'reason': f'ML model (RandomForest) predicted {predicted_algo} as best for this dataset'
                }
            except Exception as e:
                print(f"ML prediction failed: {e}")

        
        # --- HEURISTICS & SANITY CHECKS ---
        # Override ML if there's a strong rule-based reason
        if features['n'] <= 15:
            prediction = {'algorithm': 'insertion', 'confidence': 0.85, 'reason': f'Small dataset (n={features["n"]}) - Insertion Sort is optimal'}
        elif features['is_nearly_sorted']:
            prediction = {'algorithm': 'insertion', 'confidence': 0.90, 'reason': f'Nearly sorted data (sortedness={features["sortedness"]:.2f}) - Insertion Sort excels with O(n) performance.'}
        elif features['n'] > 100 and prediction['algorithm'] in ['bubble', 'insertion', 'selection'] and not features['is_nearly_sorted']:
            # Prevent "bad" ML predictions for large, unsorted arrays
            prediction = {
                'algorithm': 'quick',
                'confidence': 0.95, 
                'reason': f"Override: ML suggested {prediction['algorithm']}, but for N={features['n']}, Quick Sort is significantly faster."
            }
        elif features['duplicates_ratio'] > 0.4 and prediction['algorithm'] not in ['merge', 'bubble']:
            # Not strictly overriding everything, but a good heuristic if stability is needed.
            # We will gently nudge to merge if many duplicates
            prediction = {'algorithm': 'merge', 'confidence': 0.80, 'reason': f'Many duplicates ({features["duplicates_ratio"]*100:.1f}%) - Merge Sort maintains stability'}

        recommendation = prediction['algorithm']
        confidence = prediction['confidence']

        # If user didn't select, use recommendation
        algo_to_run = selected_algo if selected_algo else recommendation
        
        # 3. Execution (Run the chosen algorithm)
        # PERFORMANCE OPTIMIZATION: If the dataset is massive, the step-by-step element tracking
        # generates too many json objects (tens of thousands) and crashes the browser.
        # We downsample the array to a representative 20 elements just for the step-by-step visualizer.
        visualization_downsampled = False
        vis_data = data
        
        if len(data) > 100:
            visualization_downsampled = True
            target_size = 20
            step_size = max(1, len(data) // target_size)
            vis_data = [data[i] for i in range(0, len(data), step_size)][:target_size]
            
        execution_result = run_algorithm(algo_to_run, vis_data, features)
        
        # 4. Comparison (Run all algorithms, including the chosen one, to get fair and equal timings)
        # We run the comparison algorithms on the ORIGINAL FULL array to get exact timings.
        all_algorithms = ['bubble', 'quick', 'merge', 'insertion', 'selection', 'heap']
        
        all_results = compare_algorithms(data, all_algorithms, features)
        
        # Replace the `execution_result`'s slow time/swaps/comparisons with the "real" fast metrics
        # computed from the full, non-downsampled array.
        actual_primary_result = next(r for r in all_results if r['algorithm'] == algo_to_run)
        execution_result['time_ms'] = actual_primary_result['time_ms']
        execution_result['swaps'] = actual_primary_result['swaps']
        execution_result['comparisons'] = actual_primary_result['comparisons']
        
        # Find the actual winner
        actual_winner = all_results[0]
        
        # Add rank
        rank = 1
        for res in all_results:
            if res['algorithm'] == algo_to_run:
                break
            rank += 1

        # 5. Explainable AI
        # Enhanced context with actual results
        explanation_ctx = {
            'features': features,
            'why': f"ML Context: {prediction['reason']}",
            'ai_recommended': recommendation,
            'comparison': {
                'winner': actual_winner['algorithm'],
                'winner_time': actual_winner['time_ms'],
                'selected_time': execution_result['time_ms']
            }
        }
        
        explanation = generate_explanation(algo_to_run, explanation_ctx, user_level)
        
        # 6. Log to DB (Learning)
        record_results(
            algo_to_run, 
            execution_result, 
            features, 
            user_level, 
            was_best=(rank == 1)
        )
        
        # Construct final response
        response = {
            "session_id": str(time.time()),
            "features": features,
            "recommendation": {
                "algorithm": recommendation,
                "confidence": confidence,
                "source": "ML" if ml_model else "Rule-Based"
            },
            "selected_execution": execution_result,
            "comparison": all_results,
            "explanation": explanation,
            "rank": rank,
            "total_algorithms": len(all_results),
            "visualization_downsampled": visualization_downsampled
        }
        
        return jsonify(response)

    except Exception as e:
        print(f"Session Error: {e}")
        return jsonify({'error': str(e)}), 500

# Keep existing endpoints for backward compatibility if needed, 
# or they can be deprecated. To be safe, we leave them.
@sortmentor_bp.route('/analyze', methods=['POST'])
@login_required
def analyze_endpoint():
    data = request.get_json().get('data', [])
    return jsonify({'features': analyze_data(data)})

@sortmentor_bp.route('/execute', methods=['POST'])
@login_required
def execute_endpoint():
    req = request.get_json()
    return jsonify(run_algorithm(req.get('algorithm'), req.get('data')))

@sortmentor_bp.route('/compare', methods=['POST'])
@login_required
def compare_endpoint():
    req = request.get_json()
    results = compare_algorithms(req.get('data'), req.get('algorithms'))
    return jsonify({'results': results})

@sortmentor_bp.route('/explain', methods=['POST'])
@login_required
def explain_endpoint():
    req = request.get_json()
    return jsonify(generate_explanation(req.get('algorithm'), req.get('context'), req.get('user_level', 'intermediate')))



def recommend_algorithm(features: Dict, policy_weights: Dict = None) -> Dict[str, Any]:
    """
    Recommend the best algorithm based on data features.
    Priority:
      1. If an ML model (algo_model.pkl) is loaded, use it to predict the best algorithm.
      2. Otherwise, fall back to the rule-based approach.
    """
    n = features.get('n', 0)
    sortedness = features.get('sortedness', 0)
    duplicates = features.get('duplicates_ratio', 0)
    is_nearly_sorted = features.get('is_nearly_sorted', False)

    # 1) Try ML-based recommendation if model is available
    if ml_model is not None and n > 0:
        try:
            size = n
            inv = features.get('inversions', 0)
            randomness = features.get('randomness', 0.0)
            dup_ratio = duplicates
            entropy = features.get('entropy', 0.0)
            variance = features.get('variance', 0.0)

            # Order must match training: [size, sortedness, inversions, randomness, duplicate_ratio, entropy, variance]
            X = [[size, sortedness, inv, randomness, dup_ratio, entropy, variance]]
            predicted_algo = ml_model.predict(X)[0]

            return {
                'algorithm': str(predicted_algo),
                'confidence': 0.92,
                'why': f'ML model (RandomForest) predicted {predicted_algo} as best for this dataset'
            }
        except Exception as e:
            # If anything goes wrong, fall back to rule-based
            print(f"[SortMentor] ML recommendation failed, using rules instead: {e}")

    # 2) Rule-based recommendation (cold start)
    if n == 0:
        return {'algorithm': 'insertion', 'confidence': 0.5, 'why': 'Empty dataset'}
    
    if n <= 15:
        return {'algorithm': 'insertion', 'confidence': 0.95, 'why': f'Small dataset (n={n}) - Insertion Sort is optimal'}
    
    if is_nearly_sorted or sortedness > 0.9:
        return {'algorithm': 'insertion', 'confidence': 0.92, 'why': f'Nearly sorted data (sortedness={sortedness:.2f}) - Insertion Sort achieves O(n)'}
    
    if duplicates > 0.3:
        return {'algorithm': 'merge', 'confidence': 0.88, 'why': f'Many duplicates ({duplicates*100:.1f}%) - Merge Sort maintains stability'}
    
    if n > 1000:
        # For large datasets, prefer Quick or Merge
        if sortedness < 0.3:  # Very unsorted
            return {'algorithm': 'quick', 'confidence': 0.90, 'why': f'Large, random dataset (n={n}) - Quick Sort excels'}
        else:
            return {'algorithm': 'merge', 'confidence': 0.87, 'why': f'Large dataset (n={n}) - Merge Sort provides stable O(n log n)'}
    
    # Medium-sized, moderately sorted data
    if sortedness < 0.5:
        return {'algorithm': 'quick', 'confidence': 0.85, 'why': f'Moderately unsorted data - Quick Sort performs well on average'}
    else:
        return {'algorithm': 'merge', 'confidence': 0.82, 'why': f'Moderately sorted data - Merge Sort provides consistent performance'}


def compute_confidence(primary_result: Dict, rival_results: List[Dict]) -> float:
    """
    Compute confidence level based on how much better primary is than rivals.
    """
    if not rival_results:
        return 0.7
    
    primary_time = primary_result.get('time_ms', float('inf'))
    rival_times = [r.get('time_ms', float('inf')) for r in rival_results if r.get('algorithm') != primary_result.get('algorithm')]
    
    if not rival_times:
        return 0.7
    
    avg_rival_time = sum(rival_times) / len(rival_times)
    
    if primary_time == 0:
        return 0.95
    
    ratio = primary_time / avg_rival_time if avg_rival_time > 0 else 1.0
    
    # Confidence increases as primary performs better relative to rivals
    if ratio < 0.7:
        return 0.95
    elif ratio < 0.9:
        return 0.85
    elif ratio < 1.1:
        return 0.75
    else:
        return 0.65


# ==================== AGENTIC CONTROLLER ====================

def run_sortmentor_session(data: List[int], user_level: str = 'intermediate') -> Dict[str, Any]:
    """
    Main agentic controller that autonomously:
    1. Analyzes data
    2. Recommends algorithm
    3. Executes and compares
    4. Visualizes
    5. Explains
    6. Learns
    """
    # Step 1: Analyze data
    features = analyze_data(data)
    
    # Step 2: Load policy weights (for future learning enhancements)
    policy_weights = load_policy_weights()
    
    # Step 3: Recommend algorithm
    recommendation = recommend_algorithm(features, policy_weights)
    recommended_alg = recommendation['algorithm']
    
    # Step 4: Execute recommended algorithm
    primary_result = run_algorithm(recommended_alg, data)
    
    # Step 5: Compare with 2-3 rival algorithms for verification
    rival_algorithms = []
    all_algorithms = ['bubble', 'insertion', 'selection', 'merge', 'quick', 'heap']
    for alg in all_algorithms:
        if alg != recommended_alg:
            rival_algorithms.append(alg)
            if len(rival_algorithms) >= 3:  # Compare with 3 rivals
                break
    
    rival_results = compare_algorithms(data, rival_algorithms)
    
    # Determine best algorithm
    all_results = [primary_result] + rival_results
    best_result = min(all_results, key=lambda x: x['time_ms'])
    was_best = (best_result['algorithm'] == recommended_alg)
    
    # Step 6: Generate explanation
    context = {
        'features': features,
        'why': recommendation['why'],
        'ai_recommended': recommended_alg
    }
    explanation = generate_explanation(best_result['algorithm'], context, user_level)
    
    # Step 7: Record results for learning
    record_results(
        best_result['algorithm'],
        {
            'time_ms': best_result['time_ms'],
            'swaps': best_result['swaps'],
            'comparisons': best_result['comparisons']
        },
        features,
        user_level,
        was_best
    )
    
    # Step 8: Compute confidence
    confidence = compute_confidence(primary_result, rival_results)
    if was_best:
        confidence = max(confidence, recommendation.get('confidence', 0.7))
    
    # Step 9: Format performance summary
    perf_summary_parts = []
    for result in all_results[:4]:  # Show top 4
        perf_summary_parts.append(
            f"{result['algorithm'].capitalize()}: {result['time_ms']:.2f}ms, "
            f"swaps={result['swaps']}, comps={result['comparisons']}"
        )
    performance_summary = " | ".join(perf_summary_parts)
    
    return {
        "Recommended Algorithm": best_result['algorithm'].capitalize() + " Sort",
        "Confidence Level": f"{confidence:.2f}",
        "Reasoning": explanation['reasoning'],
        "Performance Summary": performance_summary,
        "Learning Tip": explanation['tip'],
        "visualization_data": {
            'algorithm': best_result['algorithm'],
            'steps': best_result['steps'],
            'initial_array': data,
            'sorted_array': best_result['sorted_array']
        },
        "all_results": all_results
    }


# API Endpoints below here are duplicates and unused
# We have removed the duplicate endpoints that were causing confusion

