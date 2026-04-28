import time
from sortmentor import compare_algorithms, analyze_data
from efficient_sorts import bubble_sort, insertion_sort, selection_sort, merge_sort, quick_sort, heap_sort
import random

def test_large_array():
    data = [random.randint(1, 10000) for _ in range(1500)]
    print(f"Testing array of length: {len(data)}")
    
    start_time = time.time()
    
    print("Testing individual sorts natively:")
    
    try:
        t0 = time.time()
        merge_sort(data.copy())
        print(f"Merge Sort: {time.time() - t0:.2f}s")
        
        t0 = time.time()
        quick_sort(data.copy())
        print(f"Quick Sort: {time.time() - t0:.2f}s")
        
        t0 = time.time()
        bubble_sort(data.copy())
        print(f"Bubble Sort: {time.time() - t0:.2f}s")
        
        t0 = time.time()
        insertion_sort(data.copy())
        print(f"Insertion Sort: {time.time() - t0:.2f}s")
        
        t0 = time.time()
        selection_sort(data.copy())
        print(f"Selection Sort: {time.time() - t0:.2f}s")
    except Exception as e:
        print(f"Failed during individual testing: {e}")
        
    print("\nTesting compare_algorithms pipeline:")
    
    try:
        t0 = time.time()
        algorithms = ['bubble', 'quick', 'merge', 'insertion', 'selection', 'heap']
        features = analyze_data(data)
        results = compare_algorithms(data, algorithms, features)
        print(f"Compare Algorithms Total Pipeline: {time.time() - t0:.2f}s")
    except Exception as e:
        print(f"Failed during compare_algorithms: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_large_array()
