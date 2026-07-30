import copy
import time
from typing import List, Tuple, Dict, Any

# ==================== 1. BUBBLE SORT ====================
def bubble_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
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
                'message': f'Comparing index {j} ({arr[j]}) and index {j+1} ({arr[j+1]})'
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
                    'message': f'Found {arr[j+1]} > {arr[j]}, swapping elements'
                })
        
        locked_indices.append(n - i - 1)
        steps.append({
            'step': len(steps),
            'event_type': 'lock_element',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'pivot': n - i - 1,
            'locked_indices': list(locked_indices),
            'message': f'Element {arr[n-i-1]} at index {n-i-1} is locked in its final sorted position'
        })
        
        if not swapped_in_pass:
            # All remaining elements are sorted
            remaining = [idx for idx in range(n) if idx not in locked_indices]
            locked_indices.extend(remaining)
            steps.append({
                'step': len(steps),
                'event_type': 'all_sorted',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': None,
                'locked_indices': list(locked_indices),
                'message': 'No swaps occurred this pass; entire array is sorted!'
            })
            break
            
    return arr, steps, swaps, comparisons

# ==================== 2. SELECTION SORT ====================
def selection_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
    arr = copy.deepcopy(data)
    steps = []
    swaps = 0
    comparisons = 0
    n = len(arr)
    locked_indices = []
    
    for i in range(n):
        min_idx = i
        steps.append({
            'step': len(steps),
            'event_type': 'set_min',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'pivot': min_idx,
            'locked_indices': list(locked_indices),
            'message': f'Setting search index {i} as current minimum ({arr[i]})'
        })
        
        for j in range(i + 1, n):
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'array': copy.deepcopy(arr),
                'compare': [min_idx, j],
                'swap': None,
                'locked_indices': list(locked_indices),
                'message': f'Comparing current minimum {arr[min_idx]} with element at index {j} ({arr[j]})'
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
                    'locked_indices': list(locked_indices),
                    'message': f'New minimum element found: {arr[min_idx]} at index {min_idx}'
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
                'locked_indices': list(locked_indices),
                'message': f'Swapping index {i} ({arr[min_idx]}) with index {min_idx} ({arr[i]})'
            })
        
        locked_indices.append(i)
        steps.append({
            'step': len(steps),
            'event_type': 'lock_element',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'pivot': i,
            'locked_indices': list(locked_indices),
            'message': f'Locking index {i} as sorted'
        })
            
    return arr, steps, swaps, comparisons

# ==================== 3. INSERTION SORT ====================
def insertion_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
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
            'message': f'Storing key element {key} from index {i}'
        })
        
        while j >= 0:
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'array': copy.deepcopy(arr),
                'compare': [j, j + 1],
                'swap': None,
                'message': f'Comparing key {key} with sorted element {arr[j]} at index {j}'
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
                    'message': f'Shifting element {arr[j]} right to index {j+1}'
                })
                j -= 1
            else:
                break
        
        arr[j + 1] = key
        steps.append({
            'step': len(steps),
            'event_type': 'insertion_end',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'pivot': j + 1,
            'message': f'Inserting key {key} back into sorted position index {j + 1}'
        })
        
    return arr, steps, shifts, comparisons

# ==================== 4. MERGE SORT ====================
def merge_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
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
                'message': f'Comparing left partition element {left[i]} with right partition {right[j]}'
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
                'message': f'Merging value {val} into index {start + k_idx}'
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

# ==================== 5. QUICK SORT ====================
def quick_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
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
            'compare': [low, mid, high],
            'swap': None,
            'pivot': mid,
            'message': f'Selecting median pivot candidate from indices {low}, {mid}, {high}'
        })
        
        candidates = [(arr[low], low), (arr[mid], mid), (arr[high], high)]
        candidates.sort(key=lambda x: x[0])
        pivot_idx = candidates[1][1]
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
                'message': f'Swapping median pivot {pivot_val} to high index {high} to start partitioning'
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
                'message': f'Comparing index {j} ({arr[j]}) with pivot ({pivot})'
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
                        'message': f'Swapping index {i} ({arr[i]}) with index {j} ({arr[j]}) (element <= pivot)'
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
                'message': f'Placing pivot {pivot} back in final position at index {i + 1}'
            })
        else:
            steps.append({
                'step': len(steps),
                'event_type': 'pivot_final',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': None,
                'pivot': i + 1,
                'message': f'Pivot {pivot} is already at its sorted position index {i + 1}'
            })
        
        return i + 1
    
    def quick(low, high):
        if low < high:
            pi = partition(low, high)
            quick(low, pi - 1)
            quick(pi + 1, high)
    
    quick(0, len(arr) - 1)
    return arr, steps, swaps, comparisons

# ==================== 6. HEAP SORT ====================
def heap_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
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
            'message': f'Maintaining Max-Heap property at root index {i}'
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
                'message': f'Comparing parent index {i} ({arr[i]}) with left child index {left} ({arr[left]})'
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
                'message': f'Comparing current largest with right child index {right} ({arr[right]})'
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
                'message': f'Swapping root {arr[largest]} with child {arr[i]} to maintain Max-Heap'
            })
            heapify(arr, n, largest, phase)
    
    # Build Max-Heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i, 'build')
    
    # Extract elements one by one
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
            'message': f'Extracting maximum element {arr[i]} to index {i}'
        })
        heapify(arr, i, 0, 'extract')
        
    return arr, steps, swaps, comparisons

# ==================== 7. COUNTING SORT ====================
def counting_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    swaps = 0
    n = len(arr)
    if n == 0:
        return arr, steps, swaps, comparisons
    
    min_val = min(arr)
    max_val = max(arr)
    range_of_elements = max_val - min_val + 1
    count_arr = [0] * range_of_elements
    output_arr = [0] * n
    
    steps.append({
        'step': len(steps),
        'event_type': 'init_count',
        'array': copy.deepcopy(arr),
        'compare': None,
        'swap': None,
        'message': f'Initializing counting array of size {range_of_elements} (min: {min_val}, max: {max_val})'
    })
    
    for i in range(n):
        val = arr[i]
        count_arr[val - min_val] += 1
        steps.append({
            'step': len(steps),
            'event_type': 'count_increment',
            'array': copy.deepcopy(arr),
            'compare': [i],
            'swap': None,
            'message': f'Logging element {val}: Incrementing frequency index {val - min_val}'
        })
        
    for i in range(1, len(count_arr)):
        count_arr[i] += count_arr[i - 1]
        
    steps.append({
        'step': len(steps),
        'event_type': 'accumulate_counts',
        'array': copy.deepcopy(arr),
        'compare': None,
        'swap': None,
        'message': 'Accumulating frequency counts to determine output placement mapping'
    })
    
    for i in range(n - 1, -1, -1):
        val = arr[i]
        pos = count_arr[val - min_val] - 1
        output_arr[pos] = val
        count_arr[val - min_val] -= 1
        
        # Merge-like step indicating placement in output state
        steps.append({
            'step': len(steps),
            'event_type': 'write_output',
            'array': copy.deepcopy(output_arr),
            'compare': [i],
            'swap': [pos],
            'message': f'Placing element {val} from original index {i} into output index {pos}'
        })
        
    return output_arr, steps, swaps, comparisons

# ==================== 8. RADIX SORT ====================
def radix_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    swaps = 0
    n = len(arr)
    if n == 0:
        return arr, steps, swaps, comparisons
        
    max_val = max(arr)
    exp = 1
    
    while max_val // exp > 0:
        steps.append({
            'step': len(steps),
            'event_type': 'radix_pass_start',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'message': f'Beginning sorting pass for digit position {exp}'
        })
        
        output = [0] * n
        count = [0] * 10
        
        for i in range(n):
            index = (arr[i] // exp) % 10
            count[index] += 1
            
        for i in range(1, 10):
            count[i] += count[i - 1]
            
        for i in range(n - 1, -1, -1):
            index = (arr[i] // exp) % 10
            pos = count[index] - 1
            output[pos] = arr[i]
            count[index] -= 1
            
        for i in range(n):
            arr[i] = output[i]
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'write_back',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [i],
                'message': f'Writing sorted value {arr[i]} into index {i} for digit base {exp}'
            })
            
        exp *= 10
        
    return arr, steps, swaps, comparisons

# ==================== 9. BUCKET SORT ====================
def bucket_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    swaps = 0
    n = len(arr)
    if n <= 1:
        return arr, steps, swaps, comparisons
        
    min_val = min(arr)
    max_val = max(arr)
    
    bucket_count = max(2, n)
    buckets = [[] for _ in range(bucket_count)]
    
    steps.append({
        'step': len(steps),
        'event_type': 'init_buckets',
        'array': copy.deepcopy(arr),
        'compare': None,
        'swap': None,
        'message': f'Creating {bucket_count} sorting buckets ranging from {min_val} to {max_val}'
    })
    
    for i in range(n):
        val = arr[i]
        diff = max_val - min_val
        bucket_idx = 0 if diff == 0 else int((val - min_val) / diff * (bucket_count - 1))
        buckets[bucket_idx].append(val)
        
        steps.append({
            'step': len(steps),
            'event_type': 'distribute_bucket',
            'array': copy.deepcopy(arr),
            'compare': [i],
            'swap': None,
            'message': f'Distributing element {val} from index {i} into bucket {bucket_idx}'
        })
        
    sorted_arr = []
    for bucket_idx in range(bucket_count):
        bucket = buckets[bucket_idx]
        if len(bucket) > 0:
            steps.append({
                'step': len(steps),
                'event_type': 'sort_bucket_start',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': None,
                'message': f'Sorting elements in bucket {bucket_idx} using insertion sort'
            })
            
            # Simple insertion sort inside the bucket
            for i in range(1, len(bucket)):
                key = bucket[i]
                j = i - 1
                while j >= 0:
                    comparisons += 1
                    if bucket[j] > key:
                        bucket[j + 1] = bucket[j]
                        swaps += 1
                        j -= 1
                    else:
                        break
                bucket[j + 1] = key
            
            for val in bucket:
                sorted_arr.append(val)
                # Build mock active state visualization
                temp_arr = sorted_arr + arr[len(sorted_arr):]
                steps.append({
                    'step': len(steps),
                    'event_type': 'bucket_collect',
                    'array': copy.deepcopy(temp_arr),
                    'compare': None,
                    'swap': [len(sorted_arr) - 1],
                    'message': f'Collecting sorted value {val} from bucket {bucket_idx}'
                })
                
    return sorted_arr, steps, swaps, comparisons

# ==================== 10. SHELL SORT ====================
def shell_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    swaps = 0
    n = len(arr)
    
    gap = n // 2
    while gap > 0:
        steps.append({
            'step': len(steps),
            'event_type': 'gap_update',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'message': f'Updating Shell partition gap interval to {gap}'
        })
        
        for i in range(gap, n):
            temp = arr[i]
            j = i
            
            steps.append({
                'step': len(steps),
                'event_type': 'shell_insert_start',
                'array': copy.deepcopy(arr),
                'compare': [i],
                'swap': None,
                'message': f'Sorting index {i} ({temp}) at current gap level'
            })
            
            while j >= gap:
                comparisons += 1
                steps.append({
                    'step': len(steps),
                    'event_type': 'comparison',
                    'array': copy.deepcopy(arr),
                    'compare': [j - gap, j],
                    'swap': None,
                    'message': f'Comparing interval key {temp} with index {j - gap} ({arr[j - gap]})'
                })
                
                if arr[j - gap] > temp:
                    arr[j] = arr[j - gap]
                    swaps += 1
                    steps.append({
                        'step': len(steps),
                        'event_type': 'swap',
                        'array': copy.deepcopy(arr),
                        'compare': None,
                        'swap': [j, j - gap],
                        'message': f'Shifting element {arr[j - gap]} forward by {gap} positions'
                    })
                    j -= gap
                else:
                    break
            arr[j] = temp
            steps.append({
                'step': len(steps),
                'event_type': 'shell_insert_end',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [j],
                'message': f'Inserted element {temp} at final gap position {j}'
            })
        gap //= 2
        
    return arr, steps, swaps, comparisons

# ==================== 11. TIM SORT ====================
def tim_sort_with_steps(data: List[int]) -> Tuple[List[int], List[Dict[str, Any]], int, int]:
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    swaps = 0
    n = len(arr)
    
    MIN_MERGE = 4
    
    def insertion_sort_run(left, right):
        nonlocal comparisons, swaps
        for i in range(left + 1, right + 1):
            temp = arr[i]
            j = i - 1
            while j >= left:
                comparisons += 1
                steps.append({
                    'step': len(steps),
                    'event_type': 'comparison',
                    'array': copy.deepcopy(arr),
                    'compare': [j, j + 1],
                    'swap': None,
                    'message': f'[TimSort Run] Comparing elements {arr[j]} and {temp}'
                })
                if arr[j] > temp:
                    arr[j + 1] = arr[j]
                    swaps += 1
                    steps.append({
                        'step': len(steps),
                        'event_type': 'swap',
                        'array': copy.deepcopy(arr),
                        'compare': None,
                        'swap': [j, j + 1],
                        'message': f'[TimSort Run] Shifting {arr[j]} right'
                    })
                    j -= 1
                else:
                    break
            arr[j + 1] = temp

    def merge(l, m, r):
        nonlocal comparisons, swaps
        len1, len2 = m - l + 1, r - m
        left = arr[l:m+1]
        right = arr[m+1:r+1]
        i = j = 0
        k = l
        
        while i < len1 and j < len2:
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'comparison',
                'array': copy.deepcopy(arr),
                'compare': [l + i, m + 1 + j],
                'swap': None,
                'message': f'[TimSort Merge] Comparing left element {left[i]} with right element {right[j]}'
            })
            if left[i] <= right[j]:
                arr[k] = left[i]
                i += 1
            else:
                arr[k] = right[j]
                j += 1
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'merge',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [k],
                'message': f'[TimSort Merge] Merging element into index {k}'
            })
            k += 1
            
        while i < len1:
            arr[k] = left[i]
            i += 1
            k += 1
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'merge',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [k-1],
                'message': '[TimSort Merge] Merging remaining left elements'
            })
            
        while j < len2:
            arr[k] = right[j]
            j += 1
            k += 1
            swaps += 1
            steps.append({
                'step': len(steps),
                'event_type': 'merge',
                'array': copy.deepcopy(arr),
                'compare': None,
                'swap': [k-1],
                'message': '[TimSort Merge] Merging remaining right elements'
            })

    # 1. Sort runs of size MIN_MERGE
    for i in range(0, n, MIN_MERGE):
        end = min(i + MIN_MERGE - 1, n - 1)
        steps.append({
            'step': len(steps),
            'event_type': 'timsort_run_start',
            'array': copy.deepcopy(arr),
            'compare': None,
            'swap': None,
            'message': f'[TimSort] Commencing run partition sorting from index {i} to {end}'
        })
        insertion_sort_run(i, end)
        
    # 2. Merge runs
    size = MIN_MERGE
    while size < n:
        for left in range(0, n, 2 * size):
            mid = min(left + size - 1, n - 1)
            right = min(left + 2 * size - 1, n - 1)
            if mid < right:
                steps.append({
                    'step': len(steps),
                    'event_type': 'timsort_merge_start',
                    'array': copy.deepcopy(arr),
                    'compare': None,
                    'swap': None,
                    'message': f'[TimSort] Merging runs from indices [{left}-{mid}] and [{mid+1}-{right}]'
                })
                merge(left, mid, right)
        size = 2 * size
        
    return arr, steps, swaps, comparisons
