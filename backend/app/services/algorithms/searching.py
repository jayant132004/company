import copy
import math
import time
from typing import List, Tuple, Dict, Any, Optional

# ==================== 1. LINEAR SEARCH ====================
def linear_search_with_steps(data: List[int], target: int) -> Tuple[List[int], List[Dict[str, Any]], Dict[str, Any]]:
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    n = len(arr)
    found_index = -1
    start_time = time.time()

    steps.append({
        'step': 0,
        'event_type': 'start',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {},
        'active_index': None,
        'discarded_ranges': [],
        'found_index': -1,
        'comparisons': 0,
        'message': f'Starting Linear Search for target {target} across {n} elements.'
    })

    discarded = []
    for i in range(n):
        comparisons += 1
        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'current': i},
            'active_index': i,
            'discarded_ranges': list(discarded),
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Step {i+1}: Checking index {i} (value: {arr[i]}) vs target {target}.'
        })

        if arr[i] == target:
            found_index = i
            steps.append({
                'step': len(steps),
                'event_type': 'found',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'found': i},
                'active_index': i,
                'discarded_ranges': list(discarded),
                'found_index': i,
                'comparisons': comparisons,
                'message': f'🎯 Target {target} found at index {i} in {comparisons} comparisons!'
            })
            break
        else:
            discarded.append([i, i])
            steps.append({
                'step': len(steps),
                'event_type': 'mismatch',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'current': i},
                'active_index': i,
                'discarded_ranges': list(discarded),
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'Element {arr[i]} != target {target}. Advancing to next index.'
            })

    if found_index == -1:
        steps.append({
            'step': len(steps),
            'event_type': 'not_found',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {},
            'active_index': None,
            'discarded_ranges': [[0, n - 1]] if n > 0 else [],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'❌ Target {target} not found in array after inspecting all {comparisons} elements.'
        })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    metrics = {
        'time_ms': elapsed_ms,
        'comparisons': comparisons,
        'steps_count': len(steps),
        'found': found_index != -1,
        'found_index': found_index
    }
    return arr, steps, metrics


# ==================== 2. BINARY SEARCH ====================
def binary_search_with_steps(data: List[int], target: int) -> Tuple[List[int], List[Dict[str, Any]], Dict[str, Any]]:
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    n = len(arr)
    found_index = -1
    start_time = time.time()

    low = 0
    high = n - 1

    steps.append({
        'step': 0,
        'event_type': 'start',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'low': low, 'high': high},
        'active_index': None,
        'discarded_ranges': [],
        'found_index': -1,
        'comparisons': 0,
        'message': f'Starting Binary Search for target {target} with search window [0 .. {high}].'
    })

    while low <= high:
        mid = (low + high) // 2
        comparisons += 1

        discarded = []
        if low > 0:
            discarded.append([0, low - 1])
        if high < n - 1:
            discarded.append([high + 1, n - 1])

        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'low': low, 'mid': mid, 'high': high},
            'active_index': mid,
            'discarded_ranges': copy.deepcopy(discarded),
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Calculate mid = ⌊({low} + {high}) / 2⌋ = {mid}. Inspecting array[{mid}] = {arr[mid]}.'
        })

        if arr[mid] == target:
            found_index = mid
            steps.append({
                'step': len(steps),
                'event_type': 'found',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'mid': mid, 'high': high, 'found': mid},
                'active_index': mid,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': mid,
                'comparisons': comparisons,
                'message': f'🎯 Target {target} found at mid index {mid} in {comparisons} comparisons!'
            })
            break
        elif arr[mid] < target:
            # Target is in right half, discard left half [low .. mid]
            old_low = low
            low = mid + 1
            new_discarded = copy.deepcopy(discarded)
            new_discarded.append([old_low, mid])
            steps.append({
                'step': len(steps),
                'event_type': 'discard_left',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high},
                'active_index': mid,
                'discarded_ranges': new_discarded,
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'Since array[{mid}] = {arr[mid]} < target {target}, discard left half [{old_low}..{mid}]. Shift low to {low}.'
            })
        else:
            # Target is in left half, discard right half [mid .. high]
            old_high = high
            high = mid - 1
            new_discarded = copy.deepcopy(discarded)
            new_discarded.append([mid, old_high])
            steps.append({
                'step': len(steps),
                'event_type': 'discard_right',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high},
                'active_index': mid,
                'discarded_ranges': new_discarded,
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'Since array[{mid}] = {arr[mid]} > target {target}, discard right half [{mid}..{old_high}]. Shift high to {high}.'
            })

    if found_index == -1:
        steps.append({
            'step': len(steps),
            'event_type': 'not_found',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'low': low, 'high': high},
            'active_index': None,
            'discarded_ranges': [[0, n - 1]] if n > 0 else [],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'❌ Search window exhausted (low > high). Target {target} is not present in array.'
        })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    metrics = {
        'time_ms': elapsed_ms,
        'comparisons': comparisons,
        'steps_count': len(steps),
        'found': found_index != -1,
        'found_index': found_index
    }
    return arr, steps, metrics


# ==================== 3. LOWER BOUND SEARCH ====================
def lower_bound_search_with_steps(data: List[int], target: int) -> Tuple[List[int], List[Dict[str, Any]], Dict[str, Any]]:
    """Finds the first index where array[i] >= target."""
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    n = len(arr)
    ans = n
    start_time = time.time()

    low = 0
    high = n - 1

    steps.append({
        'step': 0,
        'event_type': 'start',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'low': low, 'high': high},
        'active_index': None,
        'discarded_ranges': [],
        'found_index': -1,
        'comparisons': 0,
        'message': f'Starting Lower Bound Search for first element ≥ {target}.'
    })

    while low <= high:
        mid = (low + high) // 2
        comparisons += 1

        discarded = []
        if low > 0:
            discarded.append([0, low - 1])
        if high < n - 1:
            discarded.append([high + 1, n - 1])

        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'low': low, 'mid': mid, 'high': high, 'candidate': ans if ans < n else None},
            'active_index': mid,
            'discarded_ranges': copy.deepcopy(discarded),
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Evaluating mid = {mid} (value: {arr[mid]}) vs target {target}.'
        })

        if arr[mid] >= target:
            ans = mid
            high = mid - 1
            steps.append({
                'step': len(steps),
                'event_type': 'candidate_found',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high, 'candidate': ans},
                'active_index': mid,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': ans,
                'comparisons': comparisons,
                'message': f'array[{mid}] = {arr[mid]} ≥ {target}. Candidate lower bound = {ans}. Searching left for earlier occurrence.'
            })
        else:
            low = mid + 1
            steps.append({
                'step': len(steps),
                'event_type': 'discard_left',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high, 'candidate': ans if ans < n else None},
                'active_index': mid,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'array[{mid}] = {arr[mid]} < {target}. Discarding left half. Shift low to {low}.'
            })

    found = (ans < n)
    steps.append({
        'step': len(steps),
        'event_type': 'found' if found else 'not_found',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'found': ans if found else None},
        'active_index': ans if found else None,
        'discarded_ranges': [],
        'found_index': ans if found else -1,
        'comparisons': comparisons,
        'message': f'🎯 Lower Bound result: index {ans} (value: {arr[ans]}) is first element ≥ {target}.' if found else f'❌ All elements in array are strictly < {target}.'
    })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    metrics = {
        'time_ms': elapsed_ms,
        'comparisons': comparisons,
        'steps_count': len(steps),
        'found': found,
        'found_index': ans if found else -1
    }
    return arr, steps, metrics


# ==================== 4. JUMP SEARCH ====================
def jump_search_with_steps(data: List[int], target: int) -> Tuple[List[int], List[Dict[str, Any]], Dict[str, Any]]:
    """Jump Search with optimal block jump m = floor(sqrt(n))."""
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    n = len(arr)
    found_index = -1
    start_time = time.time()

    if n == 0:
        return arr, [], {'time_ms': 0, 'comparisons': 0, 'steps_count': 0, 'found': False, 'found_index': -1}

    step_size = max(1, int(math.floor(math.sqrt(n))))
    prev = 0

    steps.append({
        'step': 0,
        'event_type': 'start',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'step_size': step_size},
        'active_index': None,
        'discarded_ranges': [],
        'found_index': -1,
        'comparisons': 0,
        'message': f'Starting Jump Search with block jump size m = ⌊√{n}⌋ = {step_size}.'
    })

    current = min(step_size, n) - 1
    discarded = []

    # Block hopping phase
    while arr[current] < target:
        comparisons += 1
        steps.append({
            'step': len(steps),
            'event_type': 'jump',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'prev': prev, 'current': current},
            'active_index': current,
            'discarded_ranges': list(discarded),
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Block end array[{current}] = {arr[current]} < target {target}. Jumping ahead by {step_size}.'
        })
        discarded.append([prev, current])
        prev = current + 1
        current = min(prev + step_size - 1, n - 1)
        if prev >= n:
            break

    # Linear scan within the identified block
    if prev < n:
        comparisons += 1
        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'prev': prev, 'current': current},
            'active_index': current,
            'discarded_ranges': list(discarded),
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Target bounded in block [{prev} .. {current}]. Commencing linear scan.'
        })

        for i in range(prev, min(current + 1, n)):
            comparisons += 1
            steps.append({
                'step': len(steps),
                'event_type': 'linear_probe',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'current': i, 'block_start': prev, 'block_end': current},
                'active_index': i,
                'discarded_ranges': list(discarded),
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'Linear probe at index {i} (value: {arr[i]}) vs target {target}.'
            })

            if arr[i] == target:
                found_index = i
                steps.append({
                    'step': len(steps),
                    'event_type': 'found',
                    'array': copy.deepcopy(arr),
                    'target': target,
                    'pointers': {'found': i},
                    'active_index': i,
                    'discarded_ranges': list(discarded),
                    'found_index': i,
                    'comparisons': comparisons,
                    'message': f'🎯 Target {target} found at index {i} via Jump Search in {comparisons} comparisons!'
                })
                break
            elif arr[i] > target:
                # Array is sorted; if arr[i] > target, cannot exist in this block
                break

    if found_index == -1:
        steps.append({
            'step': len(steps),
            'event_type': 'not_found',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {},
            'active_index': None,
            'discarded_ranges': [[0, n - 1]],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'❌ Target {target} not found in array after Jump Search.'
        })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    metrics = {
        'time_ms': elapsed_ms,
        'comparisons': comparisons,
        'steps_count': len(steps),
        'found': found_index != -1,
        'found_index': found_index
    }
    return arr, steps, metrics


# ==================== 5. INTERPOLATION SEARCH ====================
def interpolation_search_with_steps(data: List[int], target: int) -> Tuple[List[int], List[Dict[str, Any]], Dict[str, Any]]:
    """Interpolation Search for uniformly distributed sorted data with probe formula."""
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    n = len(arr)
    found_index = -1
    start_time = time.time()

    if n == 0:
        return arr, [], {'time_ms': 0, 'comparisons': 0, 'steps_count': 0, 'found': False, 'found_index': -1}

    low = 0
    high = n - 1

    steps.append({
        'step': 0,
        'event_type': 'start',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'low': low, 'high': high},
        'active_index': None,
        'discarded_ranges': [],
        'found_index': -1,
        'comparisons': 0,
        'message': f'Starting Interpolation Search for target {target} across range [0 .. {high}].'
    })

    while low <= high and target >= arr[low] and target <= arr[high]:
        comparisons += 1
        if low == high:
            if arr[low] == target:
                found_index = low
            break

        # Probe formula: pos = low + ⌊((target - arr[low]) * (high - low)) / (arr[high] - arr[low])⌋
        numerator = (target - arr[low]) * (high - low)
        denominator = (arr[high] - arr[low])
        if denominator == 0:
            pos = low
        else:
            pos = low + int(numerator / denominator)

        pos = max(low, min(high, pos))

        discarded = []
        if low > 0:
            discarded.append([0, low - 1])
        if high < n - 1:
            discarded.append([high + 1, n - 1])

        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'low': low, 'pos': pos, 'high': high},
            'active_index': pos,
            'discarded_ranges': copy.deepcopy(discarded),
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Calculated interpolation probe pos = {pos} (value: {arr[pos]}).'
        })

        if arr[pos] == target:
            found_index = pos
            steps.append({
                'step': len(steps),
                'event_type': 'found',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'pos': pos, 'high': high, 'found': pos},
                'active_index': pos,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': pos,
                'comparisons': comparisons,
                'message': f'🎯 Target {target} found at calculated probe index {pos} in {comparisons} comparisons!'
            })
            break
        elif arr[pos] < target:
            old_low = low
            low = pos + 1
            new_discarded = copy.deepcopy(discarded)
            new_discarded.append([old_low, pos])
            steps.append({
                'step': len(steps),
                'event_type': 'discard_left',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high},
                'active_index': pos,
                'discarded_ranges': new_discarded,
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'arr[{pos}] = {arr[pos]} < {target}. Target lies to the right. Adjust low to {low}.'
            })
        else:
            old_high = high
            high = pos - 1
            new_discarded = copy.deepcopy(discarded)
            new_discarded.append([pos, old_high])
            steps.append({
                'step': len(steps),
                'event_type': 'discard_right',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high},
                'active_index': pos,
                'discarded_ranges': new_discarded,
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'arr[{pos}] = {arr[pos]} > {target}. Target lies to the left. Adjust high to {high}.'
            })

    if found_index == -1:
        steps.append({
            'step': len(steps),
            'event_type': 'not_found',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {},
            'active_index': None,
            'discarded_ranges': [[0, n - 1]],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'❌ Target {target} out of range or not present in array.'
        })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    metrics = {
        'time_ms': elapsed_ms,
        'comparisons': comparisons,
        'steps_count': len(steps),
        'found': found_index != -1,
        'found_index': found_index
    }
    return arr, steps, metrics


# ==================== 6. EXPONENTIAL SEARCH ====================
def exponential_search_with_steps(data: List[int], target: int) -> Tuple[List[int], List[Dict[str, Any]], Dict[str, Any]]:
    """Exponential Search (Doubling index then Binary Search)."""
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    n = len(arr)
    found_index = -1
    start_time = time.time()

    if n == 0:
        return arr, [], {'time_ms': 0, 'comparisons': 0, 'steps_count': 0, 'found': False, 'found_index': -1}

    steps.append({
        'step': 0,
        'event_type': 'start',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'index': 0},
        'active_index': 0,
        'discarded_ranges': [],
        'found_index': -1,
        'comparisons': 0,
        'message': f'Starting Exponential Search: Check index 0 first.'
    })

    comparisons += 1
    if arr[0] == target:
        found_index = 0
        steps.append({
            'step': 1,
            'event_type': 'found',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'found': 0},
            'active_index': 0,
            'discarded_ranges': [],
            'found_index': 0,
            'comparisons': comparisons,
            'message': f'🎯 Target {target} found immediately at index 0!'
        })
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return arr, steps, {'time_ms': elapsed_ms, 'comparisons': comparisons, 'steps_count': len(steps), 'found': True, 'found_index': 0}

    # Exponential doubling phase
    i = 1
    while i < n and arr[i] <= target:
        comparisons += 1
        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'bound_i': i},
            'active_index': i,
            'discarded_ranges': [[0, i - 1]] if i > 1 else [],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Doubling bound: arr[{i}] = {arr[i]} <= target {target}. Next index = {i * 2}.'
        })
        i *= 2

    low = i // 2
    high = min(i, n - 1)

    steps.append({
        'step': len(steps),
        'event_type': 'binary_search_range',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'low': low, 'high': high},
        'active_index': None,
        'discarded_ranges': [[0, max(0, low - 1)]] if low > 0 else [],
        'found_index': -1,
        'comparisons': comparisons,
        'message': f'Target bounded in sub-range [{low} .. {high}]. Commencing Binary Search.'
    })

    # Binary search within bounded slice [low .. high]
    while low <= high:
        mid = (low + high) // 2
        comparisons += 1
        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'low': low, 'mid': mid, 'high': high},
            'active_index': mid,
            'discarded_ranges': [[0, max(0, low - 1)]],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Binary Search in exponential slice: Inspecting mid = {mid} (value: {arr[mid]}).'
        })

        if arr[mid] == target:
            found_index = mid
            steps.append({
                'step': len(steps),
                'event_type': 'found',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'found': mid},
                'active_index': mid,
                'discarded_ranges': [],
                'found_index': mid,
                'comparisons': comparisons,
                'message': f'🎯 Target {target} found at index {mid} via Exponential Search!'
            })
            break
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    if found_index == -1:
        steps.append({
            'step': len(steps),
            'event_type': 'not_found',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {},
            'active_index': None,
            'discarded_ranges': [[0, n - 1]],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'❌ Target {target} not present in array.'
        })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    metrics = {
        'time_ms': elapsed_ms,
        'comparisons': comparisons,
        'steps_count': len(steps),
        'found': found_index != -1,
        'found_index': found_index
    }
    return arr, steps, metrics


# ==================== 7. TERNARY SEARCH ====================
def ternary_search_with_steps(data: List[int], target: int) -> Tuple[List[int], List[Dict[str, Any]], Dict[str, Any]]:
    """Ternary Search dividing search space into three equal segments."""
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    n = len(arr)
    found_index = -1
    start_time = time.time()

    low = 0
    high = n - 1

    steps.append({
        'step': 0,
        'event_type': 'start',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'low': low, 'high': high},
        'active_index': None,
        'discarded_ranges': [],
        'found_index': -1,
        'comparisons': 0,
        'message': f'Starting Ternary Search with search bounds [0 .. {high}].'
    })

    while low <= high:
        mid1 = low + (high - low) // 3
        mid2 = high - (high - low) // 3
        comparisons += 2

        discarded = []
        if low > 0:
            discarded.append([0, low - 1])
        if high < n - 1:
            discarded.append([high + 1, n - 1])

        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'low': low, 'mid1': mid1, 'mid2': mid2, 'high': high},
            'active_index': mid1,
            'discarded_ranges': copy.deepcopy(discarded),
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Trisection: mid1 = {mid1} (arr[{mid1}]={arr[mid1]}), mid2 = {mid2} (arr[{mid2}]={arr[mid2]}).'
        })

        if arr[mid1] == target:
            found_index = mid1
            steps.append({
                'step': len(steps),
                'event_type': 'found',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'found': mid1},
                'active_index': mid1,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': mid1,
                'comparisons': comparisons,
                'message': f'🎯 Target {target} found at mid1 index {mid1}!'
            })
            break

        if arr[mid2] == target:
            found_index = mid2
            steps.append({
                'step': len(steps),
                'event_type': 'found',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'found': mid2},
                'active_index': mid2,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': mid2,
                'comparisons': comparisons,
                'message': f'🎯 Target {target} found at mid2 index {mid2}!'
            })
            break

        if target < arr[mid1]:
            # Discard middle and right segment [mid1 .. high]
            high = mid1 - 1
            steps.append({
                'step': len(steps),
                'event_type': 'discard_right',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high},
                'active_index': mid1,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'target < arr[{mid1}]({arr[mid1]}). Discarding middle & right 2/3 partitions. Search in [{low}..{high}].'
            })
        elif target > arr[mid2]:
            # Discard left and middle segment [low .. mid2]
            low = mid2 + 1
            steps.append({
                'step': len(steps),
                'event_type': 'discard_left',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high},
                'active_index': mid2,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'target > arr[{mid2}]({arr[mid2]}). Discarding left & middle 2/3 partitions. Search in [{low}..{high}].'
            })
        else:
            # Target lies strictly between mid1 and mid2
            low = mid1 + 1
            high = mid2 - 1
            steps.append({
                'step': len(steps),
                'event_type': 'probe',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'low': low, 'high': high},
                'active_index': None,
                'discarded_ranges': copy.deepcopy(discarded),
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'Target lies in middle partition [{low}..{high}]. Discarding outer boundaries.'
            })

    if found_index == -1:
        steps.append({
            'step': len(steps),
            'event_type': 'not_found',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {},
            'active_index': None,
            'discarded_ranges': [[0, n - 1]],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'❌ Target {target} not found in array.'
        })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    metrics = {
        'time_ms': elapsed_ms,
        'comparisons': comparisons,
        'steps_count': len(steps),
        'found': found_index != -1,
        'found_index': found_index
    }
    return arr, steps, metrics


# ==================== 8. TWO POINTERS PAIR SEARCH ====================
def two_pointers_search_with_steps(data: List[int], target: int) -> Tuple[List[int], List[Dict[str, Any]], Dict[str, Any]]:
    """Two Pointers Search for two elements that sum up to target in sorted array."""
    arr = copy.deepcopy(data)
    steps = []
    comparisons = 0
    n = len(arr)
    found_pair = None
    start_time = time.time()

    left = 0
    right = n - 1

    steps.append({
        'step': 0,
        'event_type': 'start',
        'array': copy.deepcopy(arr),
        'target': target,
        'pointers': {'left': left, 'right': right},
        'active_index': None,
        'discarded_ranges': [],
        'found_index': -1,
        'comparisons': 0,
        'message': f'Starting Two-Pointers Search for pair sum: arr[left] + arr[right] == {target}.'
    })

    while left < right:
        current_sum = arr[left] + arr[right]
        comparisons += 1

        steps.append({
            'step': len(steps),
            'event_type': 'probe',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {'left': left, 'right': right},
            'active_index': left,
            'discarded_ranges': [],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'Sum check: arr[{left}]({arr[left]}) + arr[{right}]({arr[right]}) = {current_sum} vs target {target}.'
        })

        if current_sum == target:
            found_pair = (left, right)
            steps.append({
                'step': len(steps),
                'event_type': 'found',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'left': left, 'right': right, 'pair_left': left, 'pair_right': right},
                'active_index': left,
                'discarded_ranges': [],
                'found_index': left,
                'comparisons': comparisons,
                'message': f'🎯 Pair found! arr[{left}]({arr[left]}) + arr[{right}]({arr[right]}) = {target} in {comparisons} checks.'
            })
            break
        elif current_sum < target:
            old_left = left
            left += 1
            steps.append({
                'step': len(steps),
                'event_type': 'pointer_move',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'left': left, 'right': right},
                'active_index': left,
                'discarded_ranges': [[0, old_left]],
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'Current sum {current_sum} < target {target}. Increment left pointer to index {left} to increase sum.'
            })
        else:
            old_right = right
            right -= 1
            steps.append({
                'step': len(steps),
                'event_type': 'pointer_move',
                'array': copy.deepcopy(arr),
                'target': target,
                'pointers': {'left': left, 'right': right},
                'active_index': right,
                'discarded_ranges': [[old_right, n - 1]],
                'found_index': -1,
                'comparisons': comparisons,
                'message': f'Current sum {current_sum} > target {target}. Decrement right pointer to index {right} to decrease sum.'
            })

    if not found_pair:
        steps.append({
            'step': len(steps),
            'event_type': 'not_found',
            'array': copy.deepcopy(arr),
            'target': target,
            'pointers': {},
            'active_index': None,
            'discarded_ranges': [[0, n - 1]],
            'found_index': -1,
            'comparisons': comparisons,
            'message': f'❌ No two elements in array sum up to target {target}.'
        })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    metrics = {
        'time_ms': elapsed_ms,
        'comparisons': comparisons,
        'steps_count': len(steps),
        'found': found_pair is not None,
        'found_index': found_pair[0] if found_pair else -1
    }
    return arr, steps, metrics
