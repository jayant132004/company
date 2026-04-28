"""
Test script for the trained sorting algorithm ML model
Tests the model with various input arrays
"""

import pickle
import numpy as np
from collections import Counter

# Feature extraction functions (same as training)
def count_inversions(arr):
    inv = 0
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] > arr[j]:
                inv += 1
    return inv

def sortedness_score(arr):
    """Ratio of correct adjacent order."""
    total_pairs = len(arr) - 1
    if total_pairs <= 0: 
        return 1
    correct = sum(1 for i in range(total_pairs) if arr[i] <= arr[i+1])
    return correct / total_pairs

def randomness_score(arr):
    """Approx randomness through adjacent jumps."""
    diffs = [abs(arr[i] - arr[i+1]) for i in range(len(arr)-1)]
    if len(diffs) == 0:
        return 0
    return np.std(diffs) / (np.mean(diffs) + 1e-9)

def duplicate_ratio(arr):
    counts = Counter(arr)
    dup = sum(1 for v in counts.values() if v > 1)
    return dup / len(arr) if len(arr) > 0 else 0

def extract_features(arr):
    """Extract features from array for ML model"""
    return {
        "size": len(arr),
        "sortedness": sortedness_score(arr),
        "inversions": count_inversions(arr),
        "randomness": randomness_score(arr),
        "duplicate_ratio": duplicate_ratio(arr),
        "data_range": max(arr) - min(arr) if arr else 0,
        "n_unique": len(set(arr))
    }

# Load the trained model
print("=" * 60)
print("Loading ML Model...")
print("=" * 60)
try:
    with open("algo_model.pkl", "rb") as f:
        model = pickle.load(f)
    print("✓ Model loaded successfully!\n")
except FileNotFoundError:
    print("✗ Error: algo_model.pkl not found!")
    print("Please run algo_model_train.py first to train the model.")
    exit(1)

# Test cases
test_cases = [
    {
        "name": "Small nearly sorted array",
        "array": [1, 2, 3, 5, 4, 6, 7, 8, 9, 10]
    },
    {
        "name": "Large random array",
        "array": [64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42, 33, 21, 15, 8, 99, 77, 66, 55, 44]
    },
    {
        "name": "Small array (optimal for insertion)",
        "array": [5, 2, 8, 1, 9]
    },
    {
        "name": "Large sorted array",
        "array": list(range(1, 101))
    },
    {
        "name": "Array with many duplicates",
        "array": [5, 2, 5, 1, 5, 3, 5, 4, 5, 2, 5, 1, 5, 3, 5]
    },
    {
        "name": "Reverse sorted array",
        "array": [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    },
    {
        "name": "Medium random array",
        "array": [42, 15, 8, 23, 4, 16, 19, 11, 31, 7, 25, 3, 9, 18, 22, 6, 14, 28, 1, 12]
    }
]

print("=" * 60)
print("TESTING MODEL WITH VARIOUS INPUT ARRAYS")
print("=" * 60)
print()

for i, test in enumerate(test_cases, 1):
    arr = test["array"]
    features = extract_features(arr)
    
    X = [[
        features["size"],
        features["sortedness"],
        features["inversions"],
        features["randomness"],
        features["duplicate_ratio"],
        features["data_range"],
        features["n_unique"]
    ]]
    
    # Predict
    prediction = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0]
    algo_names = model.classes_
    
    # Get confidence (probability of predicted class)
    confidence = max(probabilities)
    
    print(f"Test {i}: {test['name']}")
    print(f"  Array: {arr[:15]}{'...' if len(arr) > 15 else ''} (size: {len(arr)})")
    print(f"  Features:")
    print(f"    - Size: {features['size']}")
    print(f"    - Sortedness: {features['sortedness']:.3f}")
    print(f"    - Inversions: {features['inversions']}")
    print(f"    - Randomness: {features['randomness']:.3f}")
    print(f"    - Duplicate Ratio: {features['duplicate_ratio']:.3f}")
    print(f"  → Predicted Best Algorithm: {prediction.upper()} Sort")
    print(f"  → Confidence: {confidence*100:.1f}%")
    print(f"  → All Probabilities:")
    for algo, prob in zip(algo_names, probabilities):
        marker = "★" if algo == prediction else " "
        print(f"      {marker} {algo.upper():12s}: {prob*100:5.1f}%")
    print()

print("=" * 60)
print("TESTING COMPLETE!")
print("=" * 60)
print("\nThe model is ready to use in your Flask app!")
print("When you run app.py, it will automatically load this model.")
print("Visit http://127.0.0.1:8000/sortmentor to use it with the web interface.")

