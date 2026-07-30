# Introduction to Sorting Algorithms

Sorting is the process of arranging elements from a collection in a specific order (typically ascending or descending).

## Key Parameters & Classification

1. **Stability**:
   A sorting algorithm is **stable** if it preserves the relative order of equal elements. For example, if two elements have the same key and element $A$ originally appeared before element $B$, they will still be in that order in the sorted output.
   - Stable: Bubble Sort, Insertion Sort, Merge Sort, Tim Sort.
   - Unstable: Selection Sort, Quick Sort, Heap Sort.

2. **In-place vs. Out-of-place**:
   - **In-place**: Modifies the input array in-place, using $O(1)$ auxiliary space. Examples: Bubble Sort, Selection Sort, Insertion Sort, Quick Sort, Heap Sort.
   - **Out-of-place**: Allocates extra memory to construct the sorted result. Example: Merge Sort ($O(n)$ space).

3. **Time Complexity**:
   - Best Case: The minimum time required (e.g., $O(n)$ for Insertion Sort on pre-sorted arrays).
   - Average Case: The expected time across random inputs.
   - Worst Case: The maximum time required (e.g., $O(n^2)$ for Quick Sort with poor pivot choices).
