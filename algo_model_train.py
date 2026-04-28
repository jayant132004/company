import numpy as np
import random
import time
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
import pickle
from collections import Counter
import math

import sys
sys.setrecursionlimit(3000)

# ==========================================================
# 1. FEATURE EXTRACTION FUNCTIONS
# ==========================================================


def count_inversions(arr):
    inv = 0
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] > arr[j]:
                inv += 1
    return inv


def sortedness_score(arr):
    """Ratio of correct adjacent order."""
    total_pairs = len(arr) - 1
    if total_pairs <= 0:
        return 1.0
    correct = sum(1 for i in range(total_pairs) if arr[i] <= arr[i + 1])
    return correct / total_pairs


def randomness_score(arr):
    """Approx randomness through adjacent jumps."""
    diffs = [abs(arr[i] - arr[i + 1]) for i in range(len(arr) - 1)]
    if len(diffs) == 0:
        return 0.0
    diffs = np.array(diffs, dtype=float)
    return float(diffs.std() / (diffs.mean() + 1e-9))


def duplicate_ratio(arr):
    counts = Counter(arr)
    dup = sum(1 for v in counts.values() if v > 1)
    return dup / len(arr) if arr else 0.0


def calculate_entropy(arr):
    """Calculate Shannon entropy of the data distribution."""
    if not arr:
        return 0.0
    counts = Counter(arr)
    probs = [count / len(arr) for count in counts.values()]
    return -sum(p * math.log2(p) for p in probs)


def calculate_variance(arr):
    """Calculate variance of the data."""
    if not arr:
        return 0.0
    return np.var(arr)


# ==========================================================
# 2. SORTING ALGORITHMS WITH METRICS
# ==========================================================


def bubble_sort(arr):
    arr = arr.copy()
    n = len(arr)
    comp = swaps = 0
    start = time.time()
    for i in range(n):
        for j in range(0, n - i - 1):
            comp += 1
            if arr[j] > arr[j + 1]:
                swaps += 1
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    end = time.time()
    return end - start, comp, swaps


def insertion_sort(arr):
    arr = arr.copy()
    comp = swaps = 0
    start = time.time()
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0:
            comp += 1
            if arr[j] > key:
                arr[j + 1] = arr[j]
                swaps += 1
                j -= 1
            else:
                break
        arr[j + 1] = key
    end = time.time()
    return end - start, comp, swaps


def merge_sort(arr):
    arr = arr.copy()
    comp = swaps = 0

    def merge(left, right):
        nonlocal comp, swaps
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            comp += 1
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
                swaps += 1
        result.extend(left[i:])
        result.extend(right[j:])
        return result

    def divide(lst):
        if len(lst) <= 1:
            return lst
        mid = len(lst) // 2
        left = divide(lst[:mid])
        right = divide(lst[mid:])
        return merge(left, right)

    start = time.time()
    divide(arr)
    end = time.time()
    return end - start, comp, swaps


def quick_sort(arr):
    arr = arr.copy()
    comp = swaps = 0

    def partition(low, high):
        nonlocal comp, swaps
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            comp += 1
            if arr[j] < pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                swaps += 1
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        swaps += 1
        return i + 1

    def quick(low, high):
        if low < high:
            pi = partition(low, high)
            quick(low, pi - 1)
            quick(pi + 1, high)

    start = time.time()
    quick(0, len(arr) - 1)
    end = time.time()
    return end - start, comp, swaps


def heap_sort(arr):
    arr = arr.copy()
    comp = swaps = 0

    def heapify(n, i):
        nonlocal comp, swaps
        largest = i
        l = 2 * i + 1
        r = 2 * i + 2

        if l < n:
            comp += 1
            if arr[l] > arr[largest]:
                largest = l

        if r < n:
            comp += 1
            if arr[r] > arr[largest]:
                largest = r

        if largest != i:
            swaps += 1
            arr[i], arr[largest] = arr[largest], arr[i]
            heapify(n, largest)

    n = len(arr)

    start = time.time()

    for i in range(n // 2 - 1, -1, -1):
        heapify(n, i)

    for i in range(n - 1, 0, -1):
        swaps += 1
        arr[i], arr[0] = arr[0], arr[i]
        heapify(i, 0)

    end = time.time()
    return end - start, comp, swaps


# ==========================================================
# 3. GENERATE DATASET
# ==========================================================


def generate_array():
    # Force a more uniform distribution of sizes to ensure small arrays (where O(N^2) wins) are represented.
    # We will pick a size category: small (10-50), medium (50-500), large (500-2000)
    category = random.choices(["small", "medium", "large"], weights=[0.4, 0.3, 0.3])[0]
    
    if category == "small":
        size = random.randint(10, 50)
    elif category == "medium":
        size = random.randint(51, 500)
    else:
        size = random.randint(501, 2000)

    choice = random.choice(["sorted", "near", "random", "reverse", "dups", "gaussian"])

    if choice == "sorted":
        arr = sorted(random.sample(range(1, size * 2), size))
    elif choice == "near":
        arr = sorted(random.sample(range(1, size * 2), size))
        # introduce disordered pairs (approx 10%)
        for _ in range(max(1, size // 10)):
            i, j = random.randrange(size), random.randrange(size)
            arr[i], arr[j] = arr[j], arr[i]
    elif choice == "random":
        arr = random.sample(range(1, size * 5), size)
    elif choice == "reverse":
        arr = sorted(random.sample(range(1, size * 2), size), reverse=True)
    elif choice == "dups":
        # High duplicates: pick from a small range relative to size
        unique_vals = max(5, size // 5)
        arr = [random.randint(1, unique_vals) for _ in range(size)]
    elif choice == "gaussian":
        # Gaussian distribution centered at size/2
        arr = [int(random.gauss(size / 2, size / 6)) for _ in range(size)]
    else:
        arr = [random.randint(1, size) for _ in range(size)]

    return arr, choice


def benchmark(arr):
    """
    Run all algorithms & find best based on runtime.
    """
    results = {}

    for algo, func in {
        "bubble": bubble_sort,
        "insertion": insertion_sort,
        "merge": merge_sort,
        "quick": quick_sort,
        "heap": heap_sort,
    }.items():
        # Optimization: Skip O(N^2) algorithms for large N (> 500)
        # They will never be the fastest, so just assign a large penalty time.
        if len(arr) > 500 and algo in ["bubble", "insertion"]:
            # Selection sort not in list but logic applies too. 
            # 10.0 seconds penalty, effectively infinity here
            results[algo] = 10.0 
            continue
            
        t, comp, swaps = func(arr)
        results[algo] = t  # use runtime only for best selection

    best_algo = min(results, key=results.get)
    return best_algo, results


def main():
    print("Generating dataset...")
    # Build final dataset
    data = []
    N = 2000  # Increased samples for better training coverage

    for i in range(N):
        if i % 100 == 0:
            print(f"Generated {i}/{N} samples...")
        arr, pat = generate_array()

        best, performance = benchmark(arr)

        features = {
            "size": len(arr),
            "sortedness": sortedness_score(arr),
            "inversions": count_inversions(arr),
            "randomness": randomness_score(arr),
            "duplicate_ratio": duplicate_ratio(arr),
            "entropy": calculate_entropy(arr),
            "variance": calculate_variance(arr),
            "best_algo": best,
        }

        data.append(features)

    df = pd.DataFrame(data)
    df.to_csv("algo_dataset.csv", index=False)
    print("Dataset created as algo_dataset.csv")

    # ==========================================================
    # 4. TRAIN & COMPARE ML MODELS
    # ==========================================================

    X = df[["size", "sortedness", "inversions", "randomness", "duplicate_ratio", "entropy", "variance"]]
    y = df["best_algo"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Models to compare
    models = {
        "RandomForest": RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced"),
        "DecisionTree": DecisionTreeClassifier(random_state=42, class_weight="balanced"),
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")
    }
    
    best_model = None
    best_score = 0
    best_name = ""
    
    print("\nModel Comparison Results:")
    print("-" * 40)
    print(f"{'Model':<20} | {'Accuracy':<10} | {'F1 Score (Weighted)':<10}")
    print("-" * 40)

    for name, model in models.items():
        try:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            acc = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='weighted')
            
            print(f"{name:<20} | {acc:.4f}     | {f1:.4f}")
            
            if acc > best_score:
                best_score = acc
                best_model = model
                best_name = name
        except Exception as e:
            print(f"{name:<20} | Failed: {str(e)}")

    print("-" * 40)
    print(f"Best Model: {best_name} with Accuracy: {best_score:.4f}")

    # Save the best model
    with open("algo_model.pkl", "wb") as f:
        pickle.dump(best_model, f)
    print(f"Best model ({best_name}) saved as algo_model.pkl")

    # ==========================================================
    # 5. SAMPLE PREDICTION
    # ==========================================================
    # Must include all features: size, sortedness, inversions, randomness, duplicate_ratio, entropy, variance
    # Example: nearly sorted small array
    test_features = [50, 0.95, 10, 0.1, 0, 3.5, 200.0] 
    print("\nSample prediction for test vector:", best_model.predict([test_features]))


if __name__ == "__main__":
    main()
