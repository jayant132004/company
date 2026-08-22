# Bubble Sort
Bubble Sort is a simple, comparison-based sorting algorithm. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. 
- Time Complexity: O(n) best case (with optimization), O(n^2) average and worst case.
- Space Complexity: O(1) auxiliary space (in-place).
- Stability: Stable.
[Source: bubblesort.md]

# Selection Sort
Selection Sort divides the input list into two parts: a sorted sublist at the front and an unsorted sublist at the back. It repeatedly finds the minimum element from the unsorted sublist and moves it to the end of the sorted sublist.
- Time Complexity: O(n^2) in all cases (best, average, worst).
- Space Complexity: O(1) auxiliary space (in-place).
- Stability: Unstable.
[Source: selectionsort.md]

# Insertion Sort
Insertion Sort builds the final sorted array one element at a time. It consumes one input element each repetition and grows a sorted output list by inserting the element in its correct place.
- Time Complexity: O(n) best case (already sorted), O(n^2) average and worst case.
- Space Complexity: O(1) auxiliary space (in-place).
- Stability: Stable.
[Source: insertionsort.md]

# Merge Sort
Merge Sort is an efficient, stable, comparison-based, divide-and-conquer sorting algorithm. It divides the unsorted list into n sublists, each containing one element, and repeatedly merges sublists to produce new sorted sublists until there is only one sublist remaining.
- Time Complexity: O(n log n) in all cases (best, average, worst).
- Space Complexity: O(n) auxiliary space (due to temporary merging arrays).
- Stability: Stable.
[Source: mergesort.md]

# Heap Sort
Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure. It divides its input into a sorted and an unsorted region, and it iteratively shrinks the unsorted region by extracting the largest element from it and inserting it into the sorted region.
- Time Complexity: O(n log n) in all cases (best, average, worst).
- Space Complexity: O(1) auxiliary space (in-place).
- Stability: Unstable.
[Source: heapsort.md]

# Counting Sort
Counting Sort is a non-comparison-based sorting algorithm that works by counting the number of objects having each distinct key value, then using arithmetic to calculate their output positions. It requires keys to be integers within a specific range.
- Time Complexity: O(n + k) where k is the range of non-negative input keys.
- Space Complexity: O(n + k) auxiliary space.
- Stability: Stable.
[Source: countingsort.md]

# Radix Sort
Radix Sort is a non-comparison-based sorting algorithm that sorts integer keys by grouping keys by individual digits that share the same significant position and value. It uses a stable sorting algorithm (often counting sort) as a subroutine.
- Time Complexity: O(d * (n + k)) where d is the number of digits and k is the base of the numbers.
- Space Complexity: O(n + k) auxiliary space.
- Stability: Stable.
[Source: radixsort.md]

# Bucket Sort
Bucket Sort is a distribution-based sorting algorithm that works by partitioning an array into a number of buckets. Each bucket is then sorted individually, either using a different sorting algorithm or recursively applying bucket sort.
- Time Complexity: O(n + k) best/average case (if elements are uniformly distributed), O(n^2) worst case.
- Space Complexity: O(n + k) auxiliary space.
- Stability: Stable (if underlying sort is stable).
[Source: bucketsort.md]

# Shell Sort
Shell Sort is an extension of insertion sort that allows the exchange of far apart elements. It compares elements separated by a gap of several positions, which is gradually decreased until it becomes 1 (which is standard insertion sort).
- Time Complexity: O(n log n) best case, O(n^1.5) or O(n log^2 n) average/worst case depending on the gap sequence.
- Space Complexity: O(1) auxiliary space.
- Stability: Unstable.
[Source: shellsort.md]

# Tim Sort
Tim Sort is a hybrid, stable sorting algorithm derived from Merge Sort and Insertion Sort. It identifies runs (subarrays already sorted) and sorts small partitions using Insertion Sort before merging them using a modified Merge Sort.
- Time Complexity: O(n) best case (natural runs), O(n log n) average and worst case.
- Space Complexity: O(n) auxiliary space.
- Stability: Stable.
[Source: timsort.md]
