import sys
import os

# Add backend directory to PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.algorithms.sorting import (
    bubble_sort_with_steps,
    selection_sort_with_steps,
    insertion_sort_with_steps,
    merge_sort_with_steps,
    quick_sort_with_steps,
    heap_sort_with_steps,
    counting_sort_with_steps,
    radix_sort_with_steps,
    bucket_sort_with_steps,
    shell_sort_with_steps,
    tim_sort_with_steps
)

# Test cases mapping
TEST_CASES = {
    "positive_integers": [3, 8, 2, 9, 1],
    "negative_integers": [-5, -1, -9, -3],
    "zero_elements": [0, 0, 0],
    "duplicate_values": [4, 2, 4, 1, 2, 4],
    "already_sorted": [1, 2, 3, 4, 5],
    "reverse_sorted": [5, 4, 3, 2, 1],
    "single_element": [7],
    "two_elements": [9, 2],
    "very_large_numbers": [1000000, 20, 50000000],
    "mixed_pos_neg": [100, -50, 0, 20, -5],
    "empty_input": [],
    "max_allowed_length": [9, 3, 2, 5, 6, 8, 1, 4, 7, 0, 11, -3, 15, 2, 9, 8]
}

ALGORITHMS = {
    "bubble": bubble_sort_with_steps,
    "selection": selection_sort_with_steps,
    "insertion": insertion_sort_with_steps,
    "merge": merge_sort_with_steps,
    "quick": quick_sort_with_steps,
    "heap": heap_sort_with_steps,
    "counting": counting_sort_with_steps,
    "radix": radix_sort_with_steps,
    "bucket": bucket_sort_with_steps,
    "shell": shell_sort_with_steps,
    "tim": tim_sort_with_steps
}

def run_tests():
    print("==================================================")
    print("       ALGOVERSE ALGORITHMS CORRECTNESS TEST")
    print("==================================================")
    
    passed_count = 0
    failed_count = 0
    
    for algo_name, algo_func in ALGORITHMS.items():
        print(f"\nTesting Algorithm: {algo_name.upper()} SORT")
        print("-" * 40)
        
        for case_name, input_array in TEST_CASES.items():
            # Counting sort and radix sort do not natively support negative values without offsets
            # so we skip negative test cases for them as per the standard non-negative definition
            if algo_name in ("counting", "radix") and any(x < 0 for x in input_array):
                print(f"Skipping {case_name} (contains negative elements unsupported by standard {algo_name})")
                continue
                
            try:
                sorted_arr, steps, swaps, compares = algo_func(input_array)
                expected_arr = sorted(input_array)
                
                assert sorted_arr == expected_arr, f"Expected {expected_arr}, got {sorted_arr}"
                print(f"✓ Case '{case_name}': PASS (steps: {len(steps)}, comparisons: {compares}, swaps: {swaps})")
                passed_count += 1
            except AssertionError as err:
                print(f"❌ Case '{case_name}': FAIL - {err}")
                failed_count += 1
            except Exception as e:
                print(f"❌ Case '{case_name}': CRASHED - {e}")
                failed_count += 1

    print("\n==================================================")
    print("                  TEST SUMMARY")
    print("==================================================")
    print(f"Total Tests Run: {passed_count + failed_count}")
    print(f"PASSED:          {passed_count}")
    print(f"FAILED:          {failed_count}")
    print("==================================================")
    
    if failed_count > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
