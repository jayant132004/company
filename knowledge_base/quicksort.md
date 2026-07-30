# Quick Sort

Quick Sort is a highly efficient, comparison-based, in-place sorting algorithm that uses the **Divide and Conquer** paradigm.

## How it Works

1. **Pivot Selection**: Choose an element from the array to act as the pivot.
2. **Partitioning**: Reorder the array so that all elements smaller than the pivot go to its left, and all elements larger than the pivot go to its right.
3. **Recurse**: Recursively apply the same steps to the left and right sub-arrays.

## Pivot Selection Strategies

- **Median-of-three**: Choose the median of the first, middle, and last elements. This prevents the worst-case $O(n^2)$ complexity on pre-sorted or nearly-sorted arrays.
- **Randomized**: Choose a random element as pivot.
- **Fixed**: Always pick the first or last element (susceptible to $O(n^2)$ worst-case).

## Complexity
- Best Case: $O(n \log n)$
- Average Case: $O(n \log n)$
- Worst Case: $O(n^2)$ (when the partition is highly unbalanced, e.g., already sorted array with first element pivot).
- Space Complexity: $O(\log n)$ auxiliary space for call stack.
