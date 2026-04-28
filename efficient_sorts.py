import time
import sys

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


def selection_sort(arr):
    arr = arr.copy()
    n = len(arr)
    comp = swaps = 0
    start = time.time()
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            comp += 1
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            swaps += 1
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
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
    sorted_arr = divide(arr)
    end = time.time()
    # Note: merge_sort internal logic returns sorted array, but wrapper returns metrics
    # Wait, the copied `merge_sort` returns metrics but `divide` returns list.
    # The variable `sorted_arr` captures it but we don't return it here.
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
    try:
        # Increase recursion limit for deep recursion in QuickSort
        sys.setrecursionlimit(max(2000, len(arr) * 2))
    except:
        pass
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
