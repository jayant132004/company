"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSortStore, SortStep } from "../../context/useSortStore";
import { useAuthStore } from "../../context/useAuthStore";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  BrainCircuit,
  Swords,
  Sliders,
  Zap,
  Send,
  HelpCircle,
  GraduationCap,
  X,
  Plus,
  Trash2,
  Edit2,
  Download,
  Search,
  Pin,
  Maximize2,
  Minimize2,
  AlertCircle,
  Sparkle,
  ZoomIn,
  ZoomOut,
  Ghost,
  BookOpen,
  Layers,
  Eye,
  Code2,
  CheckCircle2,
  ListOrdered,
  ShieldCheck,
  Scale,
  Lightbulb,
  Compass,
  Keyboard,
  History,
  MessageSquare,
  Check,
  Info,
  Activity,
} from "lucide-react";
import UserDropdown from "../../components/auth/UserDropdown";
import ShareButton from "../../components/ui/ShareButton";
import VisualizerFactory from "./components/visualizers/VisualizerFactory";
import { ALGO_LAYOUTS, getAlgorithmLayout } from "./components/visualizers/BaseVisualizer";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AlgoVisualStepGuide {
  event: string;
  colorClass: string;
  badge: string;
  title: string;
  meaning: string;
  why: string;
}

export interface AlgoVisualStepGuide {
  event: string;
  colorClass: string;
  badge: string;
  title: string;
  meaning: string;
  why: string;
}

export interface AlgoProcessStep {
  num: number;
  title: string;
  desc: string;
}

export interface AlgoGuide {
  name: string;
  category: string;
  tagline: string;
  description: string;
  realWorldAnalogy: string;
  // Step 1: Goal & Mini Preview
  step1_goal: string;
  step1_analogy: string;
  step1_miniBefore: number[];
  step1_miniAction: string;
  step1_miniAfter: number[];
  // Step 2: Decision Engine (Swaps vs Shifts)
  step2_decisionTitle: string;
  step2_decisionRule: string;
  step2_actionType: string;
  step2_howItDecides: string;
  // Step 3: Best & Worst Case Scenarios
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  stable: boolean;
  inPlace: boolean;
  step3_bestTitle: string;
  step3_bestDetails: string;
  step3_worstTitle: string;
  step3_worstDetails: string;
  whySpace: string;
  whyBest: string;
  whyWorst: string;
  processSteps: AlgoProcessStep[];
  visualizerGuide: AlgoVisualStepGuide[];
  invariants: string[];
  pseudocode: string[];
}

export const ALGO_GUIDES: Record<string, AlgoGuide> = {
  bubble: {
    name: "Bubble Sort",
    category: "Comparison-Based Exchange Sort",
    tagline: "Repeatedly steps through adjacent pairs, bubbling larger values to the right end like bubbles rising in water.",
    description:
      "Bubble Sort is an elementary comparison-based algorithm. It works by making repeated linear passes across the array from left to right. In each pass, it compares consecutive adjacent elements (A[j] and A[j+1]). If the elements are in inverted order (A[j] > A[j+1]), they are immediately swapped. Over n-1 passes, all elements settle into their final sorted positions.",
    realWorldAnalogy:
      "Physical bubbles of air in water: larger, heavier buoyant forces drive bigger bubbles up to the surface first until all bubbles settle in ascending order from deepest to shallowest.",
    step1_goal:
      "Bubble the single largest unsorted element to the far-right boundary on every linear pass by testing consecutive pairs.",
    step1_analogy:
      "Like physical air bubbles rising through water: on every pass, the biggest element is continuously carried rightward until it settles in its permanent position.",
    step1_miniBefore: [45, 12, 88, 34],
    step1_miniAction:
      "12 and 45 compare & swap ➔ 45 and 88 stay in place ➔ 88 and 34 swap ➔ 88 settles at the end!",
    step1_miniAfter: [12, 45, 34, 88],
    step2_decisionTitle: "Adjacent Pair Inversion Test",
    step2_decisionRule: "If array[j] > array[j + 1]  ➔  swap(array[j], array[j + 1])",
    step2_actionType: "Adjacent In-Place Swaps",
    step2_howItDecides:
      "Bubble Sort only inspects immediate neighbors (j and j+1). If the left element is strictly greater than the right element, it executes a swap. If they are equal or already in order, it leaves them untouched to preserve stability.",
    timeBest: "O(n) - Linear Time",
    timeAvg: "O(n²) - Quadratic Time",
    timeWorst: "O(n²) - Quadratic Time",
    space: "O(1) - Constant Auxiliary Space",
    stable: true,
    inPlace: true,
    step3_bestTitle: "Already Sorted Array (0 Swaps)",
    step3_bestDetails:
      "A single pass of n - 1 comparisons confirms 0 inversions exist. The early-exit boolean flag halts execution in optimal O(n) time.",
    step3_worstTitle: "Reverse-Sorted Array (Max Inversions)",
    step3_worstDetails:
      "Every single pair comparison finds an inversion, requiring (n - 1) + (n - 2) + ... + 1 = n*(n-1)/2 comparisons and swaps (O(n²)).",
    whyBest:
      "When the array is already sorted, the algorithm makes a single linear pass of n - 1 comparisons. Because no swaps occur, the boolean 'swapped' flag remains false, allowing the algorithm to terminate immediately in O(n) time.",
    whyWorst:
      "When the array is reverse-sorted, every single comparison finds an inversion, requiring n*(n-1)/2 comparisons and swaps.",
    whySpace:
      "Operates directly on the input array in place using a single temporary scalar variable (O(1) aux space).",
    processSteps: [
      {
        num: 1,
        title: "Initialize Pass & Flag",
        desc: "Begin pass i = 0 from left. Set boolean flag 'swapped = false'.",
      },
      {
        num: 2,
        title: "Adjacent Scan & Compare",
        desc: "Iterate j from 0 up to n - 1 - i. Test if array[j] > array[j + 1].",
      },
      {
        num: 3,
        title: "Conditional Exchange",
        desc: "If inverted, swap the elements and mark swapped = true.",
      },
      {
        num: 4,
        title: "Lock Suffix Element",
        desc: "The largest element in the unsorted range is locked at index n - 1 - i.",
      },
      {
        num: 5,
        title: "Early Termination Check",
        desc: "If no swaps occurred throughout the pass, halt immediately.",
      },
    ],
    visualizerGuide: [
      {
        event: "comparison",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Highlight",
        title: "Adjacent Pair Evaluation (j vs j+1)",
        meaning: "The visualizer highlights the two adjacent bars currently being tested by the CPU comparator.",
        why: "To evaluate whether array[j] > array[j+1]. If true, an inversion exists that violates ascending order.",
      },
      {
        event: "swap",
        colorClass: "bg-rose-500 text-white",
        badge: "Rose Swap Animation",
        title: "Exchanging Inverted Elements",
        meaning: "The two bars slide horizontally and exchange array indices.",
        why: "The left element was strictly greater than the right element. Swapping them brings both elements closer to their correct positions.",
      },
      {
        event: "locked",
        colorClass: "bg-emerald-500 text-white",
        badge: "Green Settled",
        title: "Permanent Sorted Lock",
        meaning: "The bar at the rightmost boundary turns solid green.",
        why: "The maximum value of this pass has reached its immutable sorted position and will never be moved or compared again.",
      },
    ],
    invariants: [
      "Loop Invariant: After pass k, suffix array[n-k..n-1] contains the k largest elements in sorted ascending order.",
      "Stability Guarantee: Equal elements are never swapped, preserving original relative order.",
    ],
    pseudocode: [
      "procedure bubbleSort(A : list of sortable items)",
      "  n = length(A)",
      "  repeat",
      "    swapped = false",
      "    for i from 1 to n - 1 inclusive do:",
      "      if A[i - 1] > A[i] then",
      "        swap(A[i - 1], A[i])",
      "        swapped = true",
      "      end if",
      "    end for",
      "    n = n - 1",
      "  until not swapped",
      "end procedure",
    ],
  },
  selection: {
    name: "Selection Sort",
    category: "Comparison-Based Selection Sort",
    tagline: "Scans the unsorted region to find the global minimum and locks it into place with minimal swaps.",
    description:
      "Selection Sort divides the array into a sorted subarray on the left and an unsorted subarray on the right. In each pass, it systematically scans the entire unsorted region to find the absolute minimum value, then performs a single swap with the element at the sorted boundary. It minimizes total memory writes (exactly n - 1 swaps).",
    realWorldAnalogy:
      "Organizing cards by looking through all unsorted cards on the table, picking out the single smallest card, placing it at the front of your hand, and repeating.",
    step1_goal:
      "Find the absolute minimum item in the unsorted suffix and lock it into the current sorted boundary index.",
    step1_analogy:
      "Scanning an entire catalog of items, picking the single cheapest item, placing it into slot 1, and repeating for slot 2, slot 3...",
    step1_miniBefore: [64, 25, 12, 22],
    step1_miniAction:
      "Scans [64, 25, 12, 22] ➔ Minimum is 12 ➔ Swaps 64 with 12 ➔ 12 is locked at index 0!",
    step1_miniAfter: [12, 25, 64, 22],
    step2_decisionTitle: "Global Minimum Candidate Search",
    step2_decisionRule: "If array[j] < array[min_idx]  ➔  min_idx = j  (Swap once at pass end)",
    step2_actionType: "Selective Single Swaps (Minimal Writes)",
    step2_howItDecides:
      "Unlike Bubble Sort which swaps repeatedly, Selection Sort only observes. It tracks the lowest candidate index during its scan, and performs exactly ONE swap at the end of each pass.",
    timeBest: "O(n²) - Quadratic Time",
    timeAvg: "O(n²) - Quadratic Time",
    timeWorst: "O(n²) - Quadratic Time",
    space: "O(1) - Constant Auxiliary Space",
    stable: false,
    inPlace: true,
    step3_bestTitle: "All Inputs (Even Sorted)",
    step3_bestDetails:
      "Selection Sort has no early-exit capability because it must scan the entire unsorted suffix to verify that no smaller element exists (always n*(n-1)/2 comparisons).",
    step3_worstTitle: "All Inputs (Worst = Best)",
    step3_worstDetails:
      "Always makes exactly n*(n-1)/2 comparisons and at most n - 1 memory writes, making it ideal when write operations are physically expensive (e.g. Flash EEPROM).",
    whyBest:
      "Even if the array is already sorted, Selection Sort has no way to know without scanning the entire unsorted suffix in each pass.",
    whyWorst:
      "Always scans every element in the remaining unsorted subarray to guarantee the absolute minimum is found.",
    whySpace:
      "In-place sorting using two index pointers (min_idx, j) in O(1) space.",
    processSteps: [
      {
        num: 1,
        title: "Define Sorted Boundary",
        desc: "Start with index i = 0 as boundary between sorted (left) and unsorted (right).",
      },
      {
        num: 2,
        title: "Initialize Min Candidate",
        desc: "Set min_idx = i, assuming first unsorted element is smallest.",
      },
      {
        num: 3,
        title: "Linear Scan of Suffix",
        desc: "Iterate j from i + 1 to n - 1. If array[j] < array[min_idx], update min_idx = j.",
      },
      {
        num: 4,
        title: "Strategic Single Swap",
        desc: "If min_idx != i, swap array[i] with array[min_idx].",
      },
      {
        num: 5,
        title: "Advance Boundary",
        desc: "Increment i by 1 and repeat until array is sorted.",
      },
    ],
    visualizerGuide: [
      {
        event: "comparison",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Scanner",
        title: "Testing Unsorted Candidate (j vs min_idx)",
        meaning: "The amber bar shows the scanner inspecting each unsorted item in sequence.",
        why: "To check if array[j] is smaller than the current minimum candidate found in this pass.",
      },
      {
        event: "min_candidate",
        colorClass: "bg-rose-500 text-white",
        badge: "Rose Min Badge",
        title: "Smallest Value Found So Far",
        meaning: "The rose bar marks the lowest value identified in the current pass.",
        why: "Holds the reference to the smallest element until the end of the pass scan.",
      },
      {
        event: "locked",
        colorClass: "bg-emerald-500 text-white",
        badge: "Green Sorted Boundary",
        title: "Sorted Prefix Extension",
        meaning: "The leftmost bars turn green sequentially from index 0 to n-1.",
        why: "Confirms that the smallest elements have been placed in strictly ascending order.",
      },
    ],
    invariants: [
      "Subarray array[0..i-1] contains the i smallest elements in sorted ascending order.",
      "Executes exactly n - 1 swaps across the entire sorting lifecycle.",
    ],
    pseudocode: [
      "procedure selectionSort(A : list of sortable items)",
      "  n = length(A)",
      "  for i = 0 to n - 2 do:",
      "    min_idx = i",
      "    for j = i + 1 to n - 1 do:",
      "      if A[j] < A[min_idx] then",
      "        min_idx = j",
      "      end if",
      "    end for",
      "    if min_idx != i then",
      "      swap(A[i], A[min_idx])",
      "    end if",
      "  end for",
      "end procedure",
    ],
  },
  insertion: {
    name: "Insertion Sort",
    category: "Incremental Insertion Sort",
    tagline: "Builds a sorted array one element at a time by sliding each key backward into its precise slot.",
    description:
      "Insertion Sort iterates from left to right, lifting element array[i] as the active 'KEY'. It compares the KEY backwards against the sorted subarray on the left, shifting larger elements one position to the right to open a gap, and inserts the KEY into its correct slot.",
    realWorldAnalogy:
      "Sorting cards in your hand: take the next card dealt, scan backwards through the cards you're holding, slide larger ones over, and slot the new card in.",
    step1_goal:
      "Lift the next incoming element as a 'KEY' and slide it backward into its sorted slot in the sorted prefix.",
    step1_analogy:
      "Inserting a new playing card into an already sorted hand: you shift larger cards to the right to open a gap, then drop the new card into place.",
    step1_miniBefore: [12, 25, 64, 22],
    step1_miniAction:
      "Sorted prefix is [12, 25, 64]. KEY is 22 ➔ 64 and 25 shift right ➔ 22 inserts after 12!",
    step1_miniAfter: [12, 22, 25, 64],
    step2_decisionTitle: "Backward Inversion & Displacement",
    step2_decisionRule: "While j >= 0 and array[j] > key  ➔  array[j + 1] = array[j] (Shift right)",
    step2_actionType: "Rightward Shifts (Not Swaps)",
    step2_howItDecides:
      "Insertion Sort does not swap pairs back and forth. It holds the KEY in a temporary register and shifts larger elements one position rightward, inserting the KEY in one final write.",
    timeBest: "O(n) - Linear Time",
    timeAvg: "O(n²) - Quadratic Time",
    timeWorst: "O(n²)",
    space: "O(1) - Constant Auxiliary Space",
    stable: true,
    inPlace: true,
    step3_bestTitle: "Nearly Sorted or Sorted Input",
    step3_bestDetails:
      "Each key is compared only once with its immediate left neighbor and requires 0 shifts, giving optimal linear O(n) performance.",
    step3_worstTitle: "Reverse-Sorted Input",
    step3_worstDetails:
      "Each element at index i must be compared and shifted past all i preceding elements, totaling n*(n-1)/2 shifts.",
    whyBest:
      "On already sorted data, each key requires 1 comparison and 0 shifts.",
    whyWorst:
      "On reverse-sorted arrays, each element must shift past all preceding elements.",
    whySpace:
      "Shifting occurs directly in the array buffer with O(1) scalar temporary variable for the key.",
    processSteps: [
      {
        num: 1,
        title: "Assume Base Prefix",
        desc: "Consider index 0 as a trivially sorted subarray of size 1.",
      },
      {
        num: 2,
        title: "Extract Active Key",
        desc: "Lift array[i] out of array as the floating 'KEY' element.",
      },
      {
        num: 3,
        title: "Backward Scan & Shift",
        desc: "While j >= 0 and array[j] > KEY, shift array[j] to j + 1 and decrement j.",
      },
      {
        num: 4,
        title: "Insert Key",
        desc: "Place KEY into vacated slot array[j + 1].",
      },
      {
        num: 5,
        title: "Expand Sorted Segment",
        desc: "Increment i from 1 to n - 1 until all elements are sorted.",
      },
    ],
    visualizerGuide: [
      {
        event: "key_extract",
        colorClass: "bg-purple-500 text-white",
        badge: "Purple Floating Key",
        title: "Active Key Lifted",
        meaning: "The current item is elevated above the baseline with a purple KEY badge.",
        why: "To visually hold the value in memory while shifting larger elements underneath.",
      },
      {
        event: "shift",
        colorClass: "bg-rose-500 text-white",
        badge: "Rose Shifted Bar",
        title: "Rightward Element Displacement",
        meaning: "Bars in the sorted prefix slide right by one position.",
        why: "Because they are strictly greater than the KEY and must vacate space.",
      },
      {
        event: "insert",
        colorClass: "bg-indigo-500 text-white",
        badge: "Indigo Insertion",
        title: "Key Placement in Sorted Slot",
        meaning: "The purple key drops into its verified sorted slot.",
        why: "All elements to its left are now <= KEY, and all elements to its right are > KEY.",
      },
    ],
    invariants: [
      "At iteration i, subarray array[0..i-1] is fully sorted.",
      "Number of operations is directly proportional to number of inversions.",
    ],
    pseudocode: [
      "procedure insertionSort(A : list of sortable items)",
      "  for i = 1 to length(A) - 1 do:",
      "    key = A[i]",
      "    j = i - 1",
      "    while j >= 0 and A[j] > key do:",
      "      A[j + 1] = A[j]",
      "      j = j - 1",
      "    end while",
      "    A[j + 1] = key",
      "  end for",
      "end procedure",
    ],
  },
  quick: {
    name: "Quick Sort",
    category: "Divide & Conquer Partitioning",
    tagline: "Selects a pivot, partitions elements into smaller and larger subsets, and sorts recursively.",
    description:
      "Quick Sort selects a reference 'pivot' element and partitions the array such that all elements smaller than the pivot are placed to its left, and all elements larger are placed to its right. The pivot locks into its final position, and Quick Sort recurses on both partitions.",
    realWorldAnalogy:
      "Organizing people by height: pick one reference person (pivot), have everyone shorter move left and everyone taller move right. The reference person is in their final spot.",
    step1_goal:
      "Pick a pivot element, divide the array into values smaller and larger than the pivot, and sort both halves recursively.",
    step1_analogy:
      "Sorting people by height relative to a reference benchmark: shorter people move to the left group, taller to the right group, locking the benchmark in place.",
    step1_miniBefore: [38, 27, 43, 10],
    step1_miniAction:
      "Pivot chosen as 10 ➔ Values <= 10 move left, > 10 move right ➔ 10 locks in final sorted slot!",
    step1_miniAfter: [10, 27, 43, 38],
    step2_decisionTitle: "Pivot-Based Partition Condition",
    step2_decisionRule: "If array[j] <= pivot  ➔  i++; swap(array[i], array[j])",
    step2_actionType: "Partition Swaps & Pivot Lock",
    step2_howItDecides:
      "Quick Sort scans with pointer j. Whenever it finds an element <= pivot, it increments boundary pointer i and swaps the smaller element into the left partition.",
    timeBest: "O(n log n) - Linearithmic",
    timeAvg: "O(n log n) - Linearithmic",
    timeWorst: "O(n²) - Degenerate Partitioning",
    space: "O(log n) - Recursion Stack",
    stable: false,
    inPlace: true,
    step3_bestTitle: "Balanced Partitioning (50/50 Splits)",
    step3_bestDetails:
      "When the pivot divides the subarray into roughly equal halves at each recursion level, the tree depth is log2(n), yielding O(n log n) time.",
    step3_worstTitle: "Unbalanced Partitioning on Sorted Data",
    step3_worstDetails:
      "When the chosen pivot is always the extreme smallest/largest element, recursion depth degrades to n, producing T(n) = T(n-1) + O(n) = O(n²).",
    whyBest:
      "Recurrence tree depth is log2(n) when partitions are balanced.",
    whyWorst:
      "Degrades into a linked list of depth n when pivot divides into 0 and n-1 items.",
    whySpace:
      "In-place partitioning with O(log n) recursion call stack depth.",
    processSteps: [
      {
        num: 1,
        title: "Select Reference Pivot",
        desc: "Choose an element (e.g. array[high]) to serve as reference pivot.",
      },
      {
        num: 2,
        title: "Two-Pointer Partition Scan",
        desc: "Set boundary i = low - 1. Iterate j from low to high - 1.",
      },
      {
        num: 3,
        title: "Partition Exchange",
        desc: "If array[j] <= pivot, increment i and swap array[i] with array[j].",
      },
      {
        num: 4,
        title: "Lock Pivot",
        desc: "Swap array[i + 1] with array[high]. Pivot is permanently sorted.",
      },
      {
        num: 5,
        title: "Recursive Subdivision",
        desc: "Recurse on left [low..pi-1] and right [pi+1..high] partitions.",
      },
    ],
    visualizerGuide: [
      {
        event: "pivot_selection",
        colorClass: "bg-cyan-400 text-slate-950",
        badge: "Cyan Pivot Badge",
        title: "Pivot Element Selected",
        meaning: "The visualizer highlights the reference value with a glowing Cyan indicator and arrow.",
        why: "This value establishes the dividing line: values < pivot move left, values > pivot move right.",
      },
      {
        event: "pointer_scan",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Pointers (i, j)",
        title: "Active Partition Pointers",
        meaning: "Displays boundary pointer i and scanning pointer j.",
        why: "To maintain the partitioning invariant and find elements needing exchange.",
      },
      {
        event: "partition_swap",
        colorClass: "bg-rose-500 text-white",
        badge: "Rose Swap",
        title: "Partition Exchange",
        meaning: "Swaps smaller item into the left partition.",
        why: "To ensure all items to the left of pointer i remain smaller than the pivot.",
      },
    ],
    invariants: [
      "Partition Invariant: For all k <= i, A[k] <= pivot; for all k > i, A[k] > pivot.",
      "The pivot never moves again after its partition step completes.",
    ],
    pseudocode: [
      "procedure quickSort(A, low, high)",
      "  if low < high then",
      "    pi = partition(A, low, high)",
      "    quickSort(A, low, pi - 1)",
      "    quickSort(A, pi + 1, high)",
      "  end if",
      "end procedure",
      "",
      "procedure partition(A, low, high)",
      "  pivot = A[high]",
      "  i = low - 1",
      "  for j = low to high - 1 do:",
      "    if A[j] <= pivot then",
      "      i = i + 1",
      "      swap(A[i], A[j])",
      "    end if",
      "  end for",
      "  swap(A[i + 1], A[high])",
      "  return i + 1",
      "end procedure",
    ],
  },
  merge: {
    name: "Merge Sort",
    category: "Divide & Conquer Merging",
    tagline: "Guaranteed O(n log n) divide-and-conquer merging of sorted sub-arrays.",
    description:
      "Merge Sort recursively splits the array into two equal halves until reaching single-element base cases. It then systematically merges adjacent sorted subarrays back together in linear time using an auxiliary buffer, guaranteeing strict O(n log n) time.",
    realWorldAnalogy:
      "Splitting a massive pile of exams into smaller piles, then repeatedly merging pairs of sorted piles by looking at the top two papers.",
    step1_goal:
      "Divide the array into single-element halves, then systematically merge pairs of sorted subarrays into a combined sorted list.",
    step1_analogy:
      "Merging two sorted decks of cards: you compare the top card of each deck and place the smaller one into the new pile.",
    step1_miniBefore: [12, 45, 22, 64],
    step1_miniAction:
      "Left half [12, 45] + Right half [22, 64] ➔ Compares heads (12 vs 22, 45 vs 22) ➔ Merges into [12, 22, 45, 64]!",
    step1_miniAfter: [12, 22, 45, 64],
    step2_decisionTitle: "Two-Pointer Head Comparison",
    step2_decisionRule: "If Left[p1] <= Right[p2]  ➔  Buffer.push(Left[p1++])  else  Buffer.push(Right[p2++])",
    step2_actionType: "Auxiliary Buffer Merging",
    step2_howItDecides:
      "Merge Sort compares the front elements of two pre-sorted subarrays. It always picks the smaller item to append to the merged output buffer, ensuring stability.",
    timeBest: "O(n log n) - Deterministic",
    timeAvg: "O(n log n) - Deterministic",
    timeWorst: "O(n log n) - Guaranteed Upper Bound",
    space: "O(n) - Auxiliary Merge Buffer",
    stable: true,
    inPlace: false,
    step3_bestTitle: "Deterministic O(n log n)",
    step3_bestDetails:
      "Always divides array into exact halves (log2 n levels) and performs O(n) merge comparisons per level, guaranteeing O(n log n) in all cases.",
    step3_worstTitle: "Guaranteed Upper Bound O(n log n)",
    step3_worstDetails:
      "Cannot degrade on any input pattern. Recurrence T(n) = 2*T(n/2) + O(n) strictly resolves to O(n log n).",
    whyBest:
      "Always executes exact log2(n) division levels and O(n) merge comparisons.",
    whyWorst:
      "Immune to adversarial input data distributions.",
    whySpace:
      "Requires temporary auxiliary buffer of size n during merge operations.",
    processSteps: [
      {
        num: 1,
        title: "Midpoint Split",
        desc: "Split array into left [low..mid] and right [mid+1..high] subproblems.",
      },
      {
        num: 2,
        title: "Base-Case Reach",
        desc: "Continue splitting until subarrays reach size 1.",
      },
      {
        num: 3,
        title: "Sorted Merge",
        desc: "Compare front heads of both subarrays and write smaller to buffer.",
      },
      {
        num: 4,
        title: "Drain Leftovers",
        desc: "Copy remaining elements from non-empty subarray to buffer.",
      },
      {
        num: 5,
        title: "Copy to Target",
        desc: "Write buffer back into original array range [low..high].",
      },
    ],
    visualizerGuide: [
      {
        event: "tree_node",
        colorClass: "bg-indigo-500/30 text-indigo-200 border-indigo-500",
        badge: "Binary Split Tree",
        title: "Subarray Recursion Nodes",
        meaning: "Visualizes the binary subdivision tree dividing larger array ranges into smaller blocks.",
        why: "Demonstrates the divide-and-conquer hierarchy and depth levels.",
      },
      {
        event: "merge_compare",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Front Compare",
        title: "Comparing Subarray Heads",
        meaning: "Highlights the active front items of the left and right subarrays.",
        why: "To pick the smallest available value in O(1) per step.",
      },
      {
        event: "merge_write",
        colorClass: "bg-rose-500 text-white",
        badge: "Rose Merged Output",
        title: "Merged Buffer Output",
        meaning: "Elements collected into the combined sorted subarray.",
        why: "Forms a larger sorted array from two smaller sorted inputs.",
      },
    ],
    invariants: [
      "Every merged subarray is guaranteed to be completely sorted internally.",
      "Pulls from left subarray first on equal keys to guarantee stability.",
    ],
    pseudocode: [
      "procedure mergeSort(A, left, right)",
      "  if left < right then",
      "    mid = left + (right - left) / 2",
      "    mergeSort(A, left, mid)",
      "    mergeSort(A, mid + 1, right)",
      "    merge(A, left, mid, right)",
      "  end if",
      "end procedure",
    ],
  },
  heap: {
    name: "Heap Sort",
    category: "Binary Heap Tree Selection",
    tagline: "Builds a Max-Heap binary tree to extract the maximum element iteratively in O(1) space.",
    description:
      "Heap Sort organizes the array into a complete binary Max-Heap structure in O(n) time. It repeatedly extracts the maximum root element by swapping it with the last element of the heap, reduces the active heap size, and calls maxHeapify to restore heap order in O(1) auxiliary space.",
    realWorldAnalogy:
      "A tournament playoff bracket: the champion (maximum) is at the top of the pyramid. Once crowned, they leave the tournament, the runner-up climbs to the top, and playoffs repeat.",
    step1_goal:
      "Transform the array into a Max-Heap binary tree, extract the maximum root to the end, and sift down in O(1) space.",
    step1_analogy:
      "A tournament playoff pyramid: the strongest competitor always sits at the top (root). Extract them to the podium, promote the next best, and repeat.",
    step1_miniBefore: [45, 88, 12, 34],
    step1_miniAction:
      "Builds Max-Heap [88, 45, 12, 34] ➔ Extracts root 88 to end ➔ Sifts down 34 to restore heap!",
    step1_miniAfter: [45, 34, 12, 88],
    step2_decisionTitle: "Parent vs Child Dominance Test",
    step2_decisionRule: "If Child > Parent  ➔  swap(Parent, LargestChild)  and sift down",
    step2_actionType: "Tree Sifts & Root Extractions",
    step2_howItDecides:
      "Heap Sort navigates binary tree indices (left child = 2i+1, right child = 2i+2). If any child exceeds the parent, it swaps the parent with the largest child to maintain the Max-Heap invariant.",
    timeBest: "O(n log n) - Linearithmic",
    timeAvg: "O(n log n) - Linearithmic",
    timeWorst: "O(n log n) - Guaranteed Upper Bound",
    space: "O(1) - In-Place Tree",
    stable: false,
    inPlace: true,
    step3_bestTitle: "Heap Construction & Sift-Down",
    step3_bestDetails:
      "Building the heap takes O(n), and extracting n elements takes n * log2(n) operations in all scenarios.",
    step3_worstTitle: "Guaranteed O(n log n) Bound",
    step3_worstDetails:
      "Tree height is bounded by log2(n). Sifting down an element takes at most log2(n) swaps, guaranteeing O(n log n) upper bound.",
    whyBest:
      "Heap construction takes O(n) and extraction takes n * log2(n).",
    whyWorst:
      "Height of a binary heap of size n is strictly floor(log2 n).",
    whySpace:
      "Heap is mapped directly onto original array indices in O(1) space.",
    processSteps: [
      {
        num: 1,
        title: "Build Max-Heap",
        desc: "Convert array into Max-Heap in O(n) time from n/2 - 1 down to 0.",
      },
      {
        num: 2,
        title: "Extract Root",
        desc: "Swap root maximum array[0] with last unsorted element array[i].",
      },
      {
        num: 3,
        title: "Shrink Boundary",
        desc: "Reduce active heap size by 1 to lock maximum in sorted suffix.",
      },
      {
        num: 4,
        title: "MaxHeapify",
        desc: "Sift down the displaced root to restore heap property.",
      },
      {
        num: 5,
        title: "Repeat Extraction",
        desc: "Repeat until heap size shrinks to 1.",
      },
    ],
    visualizerGuide: [
      {
        event: "heap_tree",
        colorClass: "bg-indigo-600 text-white",
        badge: "Binary Heap Tree",
        title: "Max-Heap Binary Tree Graph",
        meaning: "Visualizes array indices mapped onto binary tree nodes with parent-child links.",
        why: "Gives structural insight into heap hierarchy and parent dominance.",
      },
      {
        event: "heapify_compare",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Sift Compare",
        title: "Comparing Parent vs Children",
        meaning: "Compares node i with left child (2i+1) and right child (2i+2).",
        why: "To verify if a child exceeds parent value and identify the largest node to swap.",
      },
      {
        event: "root_extract",
        colorClass: "bg-rose-500 text-white",
        badge: "Rose Root Extract",
        title: "Extracting Max Root to End",
        meaning: "Swaps root maximum into the end of array.",
        why: "Accumulates sorted elements from right to left in strictly O(1) extra memory.",
      },
    ],
    invariants: [
      "For every node i > 0, array[(i-1)/2] >= array[i].",
      "Extracted suffix array[i..n-1] is always sorted in ascending order.",
    ],
    pseudocode: [
      "procedure heapSort(A)",
      "  n = length(A)",
      "  for i = n / 2 - 1 down to 0 do: maxHeapify(A, n, i)",
      "  for i = n - 1 down to 1 do:",
      "    swap(A[0], A[i])",
      "    maxHeapify(A, i, 0)",
      "  end for",
      "end procedure",
    ],
  },
  counting: {
    name: "Counting Sort",
    category: "Non-Comparison Linear Time Sort",
    tagline: "Counts key frequencies and maps them directly into output indices using prefix sums.",
    description:
      "Counting Sort is a non-comparison integer sorting algorithm. It counts the frequencies of each unique value within a bounded integer range, computes cumulative prefix sums to determine the exact output index for each key, and writes elements directly to output in linear O(n + k) time.",
    realWorldAnalogy:
      "Sorting people by birth month: tally how many people were born in each month, calculate row offsets, and direct everyone straight to their designated seats without comparisons.",
    step1_goal:
      "Count occurrences of each integer value and use running prefix sums to write elements directly into their sorted destination index.",
    step1_analogy:
      "Sorting students by birth month: you count total students per month, designate row start numbers, and send everyone straight to their row.",
    step1_miniBefore: [3, 1, 2, 3],
    step1_miniAction:
      "Frequency counts: 1:1, 2:1, 3:2 ➔ Prefix sums calculate exact slots ➔ Directly writes [1, 2, 3, 3]!",
    step1_miniAfter: [1, 2, 3, 3],
    step2_decisionTitle: "Direct Prefix Index Mapping",
    step2_decisionRule: "Output[count[x - min] - 1] = x  and  count[x - min]--",
    step2_actionType: "Direct Output Writes (No Comparisons)",
    step2_howItDecides:
      "Counting Sort makes ZERO comparisons between elements. It uses arithmetic index math on key frequencies to place items directly into output memory.",
    timeBest: "O(n + k) - Linear Time",
    timeAvg: "O(n + k) - Linear Time",
    timeWorst: "O(n + k) - Linear Time",
    space: "O(n + k) - Count Array & Output Buffer",
    stable: true,
    inPlace: false,
    step3_bestTitle: "Linear Time on Bounded Keys",
    step3_bestDetails:
      "Takes O(n + k) time where k = max - min + 1 is the range of unique integer values.",
    step3_worstTitle: "Large Key Range Penalty",
    step3_worstDetails:
      "If range k is much larger than n (e.g. 10 numbers between 1 and 1,000,000), space and time overhead is dominated by k.",
    whyBest:
      "Linear time proportional to array length n plus integer key range k.",
    whyWorst:
      "Dominated by range k when keys are sparsely distributed.",
    whySpace:
      "Requires auxiliary count array of size k and output array of size n.",
    processSteps: [
      {
        num: 1,
        title: "Determine Range",
        desc: "Scan array to find min and max values (range k = max - min + 1).",
      },
      {
        num: 2,
        title: "Tally Frequencies",
        desc: "Increment count[x - min] for each element in input array.",
      },
      {
        num: 3,
        title: "Compute Prefix Sums",
        desc: "Set count[i] += count[i - 1] to calculate exact slot offsets.",
      },
      {
        num: 4,
        title: "Stable Backward Write",
        desc: "Iterate input from n - 1 down to 0, write to output, decrement count.",
      },
      {
        num: 5,
        title: "Copy to Result",
        desc: "Copy sorted output array back into original storage.",
      },
    ],
    visualizerGuide: [
      {
        event: "tally",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Tally",
        title: "Frequency Counting Pass",
        meaning: "Increments bucket count[x - min] as each input value is scanned.",
        why: "Measures exact occurrences of every unique integer in O(n) time.",
      },
      {
        event: "prefix_sum",
        colorClass: "bg-indigo-500 text-white",
        badge: "Indigo Prefix Accumulator",
        title: "Running Prefix Sums",
        meaning: "Sums adjacent counts to find slot boundaries.",
        why: "Calculates the starting/ending offset where each value must be placed.",
      },
      {
        event: "write_output",
        colorClass: "bg-emerald-500 text-white",
        badge: "Green Output Slot",
        title: "Direct Placement into Output",
        meaning: "Places values into their calculated output indices.",
        why: "Achieves sorted order without comparing any elements against each other.",
      },
    ],
    invariants: [
      "Requires discrete integer keys with bounded range k.",
      "Backwards iteration preserves stability for duplicate values.",
    ],
    pseudocode: [
      "procedure countingSort(A, min, max)",
      "  k = max - min + 1",
      "  count = array of zeros of size k",
      "  for each x in A do: count[x - min]++",
      "  for i = 1 to k - 1 do: count[i] += count[i - 1]",
      "  for i = length(A) - 1 down to 0 do:",
      "    output[count[A[i] - min] - 1] = A[i]",
      "    count[A[i] - min]--",
      "  end for",
      "end procedure",
    ],
  },
  radix: {
    name: "Radix Sort",
    category: "Positional Non-Comparison Sort",
    tagline: "Sorts integers digit-by-digit from least to most significant using stable counting passes.",
    description:
      "Radix Sort processes integers digit-by-digit from the Least Significant Digit (LSD) to the Most Significant Digit (MSD). At each positional digit (1s, 10s, 100s...), it distributes numbers into 10 buckets using a stable Counting Sort subroutine.",
    realWorldAnalogy:
      "Sorting punch cards: first sort cards into 10 bins by the last digit, gather them in order, then sort by second digit, and so on until the first digit is sorted.",
    step1_goal:
      "Sort numbers digit-by-digit starting from the 1s place up to the highest digit place using stable bucket distribution.",
    step1_analogy:
      "Sorting postal mail by ZIP code: first sort into bins by the 5th digit, gather in order, sort by 4th digit, then 3rd, 2nd, and 1st.",
    step1_miniBefore: [170, 45, 75, 90],
    step1_miniAction:
      "Sort by 1s digit ➔ [170, 90, 45, 75] ➔ Sort by 10s digit ➔ [45, 170, 75, 90] ➔ Fully sorted!",
    step1_miniAfter: [45, 75, 90, 170],
    step2_decisionTitle: "Base-10 Digit Extraction",
    step2_decisionRule: "Digit = (value / exponent) % 10  ➔  Distribute into Bucket[Digit]",
    step2_actionType: "Positional Radix Bucketing",
    step2_howItDecides:
      "Radix Sort extracts the mathematical digit at position exp = 10^k and places the number into base-10 bucket bins, gathering them back stably.",
    timeBest: "O(d · (n + k)) - Linearithmic / Linear",
    timeAvg: "O(d · (n + k))",
    timeWorst: "O(d · (n + k))",
    space: "O(n + k) - Bucket Storage",
    stable: true,
    inPlace: false,
    step3_bestTitle: "Deterministic Digit Passes",
    step3_bestDetails:
      "Performs exactly d passes of Counting Sort, where d is the number of digits in the maximum value and k = 10 is base 10.",
    step3_worstTitle: "Guaranteed O(d · (n + k))",
    step3_worstDetails:
      "Immune to bad initial data ordering because each digit place is processed uniformly.",
    whyBest:
      "Performs d passes of Counting Sort where d is maximum digit length.",
    whyWorst:
      "Always runs in d passes regardless of data ordering.",
    whySpace:
      "Requires temporary bucket storage of size n and frequency array of size 10.",
    processSteps: [
      {
        num: 1,
        title: "Find Maximum",
        desc: "Determine total digit places d = floor(log10(max)) + 1.",
      },
      {
        num: 2,
        title: "Extract Digit",
        desc: "Extract digit = (x / exp) % 10 for active exponent exp (1, 10, 100...).",
      },
      {
        num: 3,
        title: "Stable Bucketing",
        desc: "Distribute numbers into 0-9 buckets using stable Counting Sort.",
      },
      {
        num: 4,
        title: "Gather & Advance",
        desc: "Collect items from buckets in order and multiply exp by 10.",
      },
      {
        num: 5,
        title: "Complete Result",
        desc: "After highest digit is processed, array is fully sorted.",
      },
    ],
    visualizerGuide: [
      {
        event: "digit_scan",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Digit Scan",
        title: "Scanning Positional Digit",
        meaning: "Highlights the active digit (1s, 10s, 100s) being evaluated.",
        why: "Isolates the current radix key for this distribution pass.",
      },
      {
        event: "bucket_dist",
        colorClass: "bg-indigo-500 text-white",
        badge: "Indigo 0-9 Buckets",
        title: "Distribution into Base-10 Buckets",
        meaning: "Places items into bucket bins labeled 0 through 9.",
        why: "Groups numbers by their current positional magnitude.",
      },
      {
        event: "collect",
        colorClass: "bg-emerald-500 text-white",
        badge: "Green Array Assembly",
        title: "Gathering Intermediate State",
        meaning: "Collects items back into flat array for next pass.",
        why: "Array is now stably sorted up to the current digit position.",
      },
    ],
    invariants: [
      "After pass with exp = 10^k, array is stably sorted by lowest k + 1 digits.",
      "Strict stability in intermediate passes is mandatory.",
    ],
    pseudocode: [
      "procedure radixSort(A)",
      "  max = getMax(A)",
      "  for exp = 1; max / exp > 0; exp *= 10 do: countingSortByDigit(A, exp)",
      "end procedure",
    ],
  },
  bucket: {
    name: "Bucket Sort",
    category: "Scatter-Gather Distribution Sort",
    tagline: "Distributes elements into range buckets, sorts each bucket individually, and concatenates them.",
    description:
      "Bucket Sort partitions the numerical range into k contiguous interval buckets. It scatters input elements into their corresponding buckets, sorts each individual bucket using an inner sort (like Insertion Sort), and concatenates the sorted buckets sequentially.",
    realWorldAnalogy:
      "Sorting letters by postal code: letters are distributed into regional bins, each bin's mail is sorted locally, and bins are combined in regional sequence.",
    step1_goal:
      "Scatter values into contiguous interval buckets, sort each bucket locally, and concatenate the buckets in order.",
    step1_analogy:
      "Sorting mail by postal code into regional bins, sorting each bin locally by street address, and placing bins in delivery order.",
    step1_miniBefore: [78, 17, 39, 26],
    step1_miniAction:
      "Buckets [0-33], [34-66], [67-100] ➔ Scatter ➔ Local sort ➔ Concatenate [17, 26, 39, 78]!",
    step1_miniAfter: [17, 26, 39, 78],
    step2_decisionTitle: "Interval Bucket Mapping",
    step2_decisionRule: "BucketIndex = floor((x - min) / range * k)",
    step2_actionType: "Scatter-Gather Distribution",
    step2_howItDecides:
      "Calculates a normalized bucket index proportional to the element's numerical value, placing it in a local linked list bucket.",
    timeBest: "O(n + k) - Uniform Distribution",
    timeAvg: "O(n + k) - Linear Expected Time",
    timeWorst: "O(n²) - Clustered Input",
    space: "O(n + k) - Dynamic Buckets",
    stable: true,
    inPlace: false,
    step3_bestTitle: "Uniformly Distributed Data",
    step3_bestDetails:
      "When data is evenly spread across buckets, each bucket contains O(1) items, achieving linear O(n + k) sorting time.",
    step3_worstTitle: "Severe Clustering in 1 Bucket",
    step3_worstDetails:
      "If all input elements fall into the exact same bucket, performance degrades to the inner sort algorithm (O(n²) with Insertion Sort).",
    whyBest:
      "Each bucket contains O(1) elements on average when data is uniform.",
    whyWorst:
      "All elements cluster into a single bucket.",
    whySpace:
      "Requires memory for k bucket containers and linked nodes.",
    processSteps: [
      {
        num: 1,
        title: "Create Buckets",
        desc: "Initialize k empty bucket lists across interval [min..max].",
      },
      {
        num: 2,
        title: "Scatter Items",
        desc: "Map each item to bucket index floor((x - min) / range * k).",
      },
      {
        num: 3,
        title: "Sort Buckets",
        desc: "Sort each individual bucket using Insertion Sort.",
      },
      {
        num: 4,
        title: "Gather & Join",
        desc: "Concatenate all sorted buckets sequentially.",
      },
    ],
    visualizerGuide: [
      {
        event: "scatter",
        colorClass: "bg-indigo-500 text-white",
        badge: "Indigo Distribution",
        title: "Scatter into Range Buckets",
        meaning: "Distributes numbers into their interval buckets.",
        why: "Divides the global value domain into smaller contiguous numerical intervals.",
      },
      {
        event: "bucket_sort",
        colorClass: "bg-pink-500 text-white",
        badge: "Pink Inner Sort",
        title: "Sorting Local Bucket",
        meaning: "Sorts the elements inside an individual bucket.",
        why: "Because buckets contain few elements on average, inner sort is extremely fast.",
      },
      {
        event: "gather",
        colorClass: "bg-emerald-500 text-white",
        badge: "Green Concatenation",
        title: "Concatenating Sorted Buckets",
        meaning: "Joins sorted buckets into the final array.",
        why: "Since bucket ranges are disjoint and ordered, simple concatenation yields a sorted list.",
      },
    ],
    invariants: [
      "For all i < j, every element in Bucket[i] is <= every element in Bucket[j].",
      "Runs in O(n) average linear time on uniform distributions.",
    ],
    pseudocode: [
      "procedure bucketSort(A, k)",
      "  buckets = array of k empty lists",
      "  for each x in A do: insert x into buckets[floor(k * (x - min) / range)]",
      "  for each bucket in buckets do: sort(bucket)",
      "  return concatenate(buckets)",
      "end procedure",
    ],
  },
  shell: {
    name: "Shell Sort",
    category: "Diminishing Gap Insertion Sort",
    tagline: "Optimized insertion sort comparing distant elements across decreasing gap intervals.",
    description:
      "Shell Sort compares and swaps elements separated by a decreasing gap sequence (such as floor(n/2), floor(n/4)... down to 1). This allows distant inversions to be eliminated early with massive leaps. By the time gap = 1 is reached, standard insertion sort finishes in nearly linear time.",
    realWorldAnalogy:
      "Raking a gravel driveway: use a coarse rake to move big rocks first, then a medium rake, and finish with a smooth broom.",
    step1_goal:
      "Eliminate large inversions early by comparing elements separated by decreasing gap distances before doing a final gap=1 pass.",
    step1_analogy:
      "Raking gravel: first use a wide-toothed rake to move large rocks into general regions, then switch to fine-toothed rakes to finish.",
    step1_miniBefore: [89, 45, 68, 12],
    step1_miniAction:
      "Gap = 2 ➔ Compares distant elements (89 vs 68, 45 vs 12) ➔ Swaps leap over neighbors ➔ Reduces gap to 1!",
    step1_miniAfter: [68, 12, 89, 45],
    step2_decisionTitle: "Interleaved Gapped Comparator",
    step2_decisionRule: "While j >= gap and array[j - gap] > temp  ➔  array[j] = array[j - gap]",
    step2_actionType: "Long-Range Gapped Shifts",
    step2_howItDecides:
      "Performs insertion sort across interleaved sub-sequences separated by the active gap distance, allowing elements to take huge leaps across the array.",
    timeBest: "O(n log n) - Gap Dependent",
    timeAvg: "O(n^1.3 - n^1.5)",
    timeWorst: "O(n²)",
    space: "O(1) - In-Place Exchange",
    stable: false,
    inPlace: true,
    step3_bestTitle: "Optimal Gap Sequences",
    step3_bestDetails:
      "Using Sedgewick or Ciura gap sequences yields Best & Average case times of O(n log n) to O(n^1.25).",
    step3_worstTitle: "Adversarial Patterns with N/2^k",
    step3_worstDetails:
      "With Shell's original N/2^k sequence, worst case is O(n²) when even and odd positions remain uncompared until gap = 1.",
    whyBest:
      "Optimal gap sequences prevent repeated comparisons of same elements.",
    whyWorst:
      "Occurs on adversarial patterns with power-of-two gap sequences.",
    whySpace:
      "Operates directly in the input array in O(1) space.",
    processSteps: [
      {
        num: 1,
        title: "Initialize Gap",
        desc: "Set initial gap distance (typically gap = floor(n / 2)).",
      },
      {
        num: 2,
        title: "Gapped Insertion",
        desc: "Perform insertion sort on elements separated by gap distance.",
      },
      {
        num: 3,
        title: "Diminish Gap",
        desc: "Reduce gap sequence (gap = floor(gap / 2)) and repeat passes.",
      },
      {
        num: 4,
        title: "Final Pass (gap = 1)",
        desc: "Complete standard insertion sort on nearly-sorted array in linear time.",
      },
    ],
    visualizerGuide: [
      {
        event: "gap_arch",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Arch Curve",
        title: "Distant Gap Arch Comparison",
        meaning: "Draws an arch curve connecting indices separated by the active gap.",
        why: "Visualizes comparisons leaping over distant elements to eliminate large inversions.",
      },
      {
        event: "gap_group",
        colorClass: "bg-pink-500 text-white",
        badge: "Colored Gap Groups",
        title: "Interleaved Gap Subarrays",
        meaning: "Bars belonging to the same modulo group share distinct colors.",
        why: "Shows how the array is partitioned into independent interleaved sequences.",
      },
      {
        event: "gap_swap",
        colorClass: "bg-rose-500 text-white",
        badge: "Rose Swap",
        title: "Long-Range Shift",
        meaning: "Swaps distant elements separated by gap.",
        why: "Moves misplaced elements across large distances in a single operation.",
      },
    ],
    invariants: [
      "An array that is k-sorted remains k-sorted after subsequent h-sorting passes.",
      "The final gap=1 pass is guaranteed to fully sort the array.",
    ],
    pseudocode: [
      "procedure shellSort(A)",
      "  n = length(A)",
      "  for gap = floor(n/2) down to 1 by gap/2 do:",
      "    for i = gap to n - 1 do:",
      "      temp = A[i]",
      "      j = i",
      "      while j >= gap and A[j - gap] > temp do: A[j] = A[j - gap]; j -= gap",
      "      A[j] = temp",
      "    end for",
      "  end for",
      "end procedure",
    ],
  },
  timsort: {
    name: "Tim Sort",
    category: "Adaptive Natural Merge Hybrid",
    tagline: "Production hybrid finding natural sorted runs, extending them with insertion sort, and merging.",
    description:
      "TimSort is a real-world hybrid algorithm derived from Merge Sort and Insertion Sort. It scans for preexisting sorted sequences ('natural runs'), extends short runs with Binary Insertion Sort up to minRun size, pushes runs onto a merge stack, and merges them using balanced stack invariants in optimal O(n log n) time.",
    realWorldAnalogy:
      "Organizing cards that were already partly sorted: recognize the existing sorted streaks, fix small imperfections with insertion sort, and merge the streaks together.",
    step1_goal:
      "Exploit natural sorted runs in real-world data, extend short runs with Insertion Sort, and merge them with a balanced stack.",
    step1_analogy:
      "Sorting cards that already have small sorted sequences: instead of shuffling, you preserve the streaks and merge them efficiently.",
    step1_miniBefore: [10, 20, 30, 5, 15, 25],
    step1_miniAction:
      "Identifies Run A [10, 20, 30] and Run B [5, 15, 25] ➔ Merges them using galloping mode ➔ [5, 10, 15, 20, 25, 30]!",
    step1_miniAfter: [5, 10, 15, 20, 25, 30],
    step2_decisionTitle: "Stack Balance & Galloping Comparator",
    step2_decisionRule: "Enforce Run[i-2] > Run[i-1] + Run[i]  and  Run[i-1] > Run[i]",
    step2_actionType: "Natural Run Merging & Galloping",
    step2_howItDecides:
      "TimSort inspects natural run directions. When merging, if one run consistently wins comparisons, it switches to exponential galloping mode to leap over elements.",
    timeBest: "O(n) - Linear on Partially Sorted Data",
    timeAvg: "O(n log n) - Guaranteed",
    timeWorst: "O(n log n) - Optimal Comparison Bound",
    space: "O(n) - Merge Buffer & Stack",
    stable: true,
    inPlace: false,
    step3_bestTitle: "Partially or Fully Sorted Input",
    step3_bestDetails:
      "Detects sorted runs in a single linear scan of n comparisons and finishes in O(n) time.",
    step3_worstTitle: "Guaranteed O(n log n) Bound",
    step3_worstDetails:
      "Maintains strict O(n log n) comparisons through balanced stack invariants that prevent unbalanced merge cascades.",
    whyBest:
      "Single linear scan detects natural runs in O(n) time.",
    whyWorst:
      "Balanced stack invariants guarantee O(n log n) comparisons.",
    whySpace:
      "Requires temporary merge buffer of size min(len(A), len(B)).",
    processSteps: [
      {
        num: 1,
        title: "Compute MinRun",
        desc: "Calculate minRun size such that n/minRun is slightly less than a power of 2.",
      },
      {
        num: 2,
        title: "Scan Natural Runs",
        desc: "Scan array for contiguous increasing or strictly decreasing runs.",
      },
      {
        num: 3,
        title: "Binary Insertion Extend",
        desc: "If run is shorter than minRun, extend it with Binary Insertion Sort.",
      },
      {
        num: 4,
        title: "Push to Merge Stack",
        desc: "Push run to stack and enforce balanced merge stack invariants.",
      },
      {
        num: 5,
        title: "Galloping Merge",
        desc: "Merge adjacent runs using galloping exponential search.",
      },
    ],
    visualizerGuide: [
      {
        event: "run_segment",
        colorClass: "bg-pink-500 text-white",
        badge: "Pink Run Tracker",
        title: "Detected Natural Run",
        meaning: "Highlights contiguous run chunks and their start/end indices.",
        why: "Exploits existing sorted patterns in real-world data for O(n) performance.",
      },
      {
        event: "run_insertion",
        colorClass: "bg-amber-400 text-slate-950",
        badge: "Amber Insertion Sort",
        title: "Short Run Padding",
        meaning: "Performs insertion sort within the active run segment.",
        why: "Brings short runs up to minimum size with low constant overhead.",
      },
      {
        event: "run_merge",
        colorClass: "bg-violet-500 text-white",
        badge: "Violet Merge Pass",
        title: "Two-Way Run Merging",
        meaning: "Merges two adjacent runs together.",
        why: "Combines sorted segments into larger sorted chunks.",
      },
    ],
    invariants: [
      "Stack Balance: Run[i-2] > Run[i-1] + Run[i] and Run[i-1] > Run[i].",
      "Switches to galloping mode after 7 consecutive wins from one subarray.",
    ],
    pseudocode: [
      "procedure timSort(A)",
      "  n = length(A)",
      "  minRun = computeMinRun(n)",
      "  for i = 0 to n - 1 by minRun do: insertionSort(A, i, min(i + minRun - 1, n - 1))",
      "  for size = minRun; size < n; size = 2 * size do:",
      "    for left = 0 to n - 1 by 2 * size do:",
      "      mid = min(left + size - 1, n - 1)",
      "      right = min(left + 2 * size - 1, n - 1)",
      "      if mid < right then merge(A, left, mid, right)",
      "    end for",
      "  end for",
      "end procedure",
    ],
  },
};

// Backwards compatibility alias for ALGO_METADATA and CONCEPTUAL_WALKTHROUGHS
const ALGO_METADATA: Record<
  string,
  {
    name: string;
    timeBest: string;
    timeAvg: string;
    timeWorst: string;
    space: string;
    description: string;
    pseudocode: string[];
  }
> = Object.fromEntries(
  Object.entries(ALGO_GUIDES).map(([k, v]) => [
    k,
    {
      name: v.name,
      timeBest: v.timeBest,
      timeAvg: v.timeAvg,
      timeWorst: v.timeWorst,
      space: v.space,
      description: v.description,
      pseudocode: v.pseudocode,
    },
  ])
);

const CONCEPTUAL_WALKTHROUGHS: Record<string, string> = Object.fromEntries(
  Object.entries(ALGO_GUIDES).map(([k, v]) => [k, v.tagline])
);

const ALGO_LEGENDS: Record<string, Array<{ color: string; label: string }>> = {
  bubble: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Swapping" },
    { color: "bg-indigo-500/20 border-indigo-500/40", label: "Active" },
  ],
  selection: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Min Candidate" },
    { color: "bg-emerald-500/20 border-emerald-500/40", label: "Sorted" },
  ],
  insertion: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Displaced" },
    { color: "bg-purple-500 border-purple-500", label: "Key Element" },
  ],
  merge: [
    { color: "bg-amber-400/30 border-amber-400/40 text-amber-300", label: "Comparing" },
    { color: "bg-rose-500/30 border-rose-500/40 text-rose-300", label: "Merged" },
    { color: "border-pink-500 bg-pink-500/10 text-pink-300", label: "Active Bounds" },
  ],
  quick: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Swapping" },
    { color: "bg-cyan-400 border-cyan-400 text-slate-950", label: "Pivot" },
    { color: "border-indigo-500 bg-indigo-500/10", label: "Partition Bounds" },
  ],
  heap: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Swapping" },
    { color: "bg-emerald-500/20 border-emerald-500/40", label: "Sorted Region" },
    { color: "bg-slate-900 border-indigo-500/50", label: "Heap Root" },
  ],
  counting: [
    { color: "bg-amber-400/20 border-amber-400", label: "Frequency Tally" },
    { color: "bg-indigo-500/20 border-indigo-500", label: "Prefix Accumulator" },
    { color: "bg-emerald-500/20 border-emerald-500", label: "Sorted Output" },
  ],
  radix: [
    { color: "bg-amber-400/20 border-amber-400", label: "Digit Scan" },
    { color: "bg-indigo-500/20 border-indigo-500", label: "Bucket Dist" },
  ],
  bucket: [
    { color: "bg-indigo-500/20 border-indigo-500/40", label: "Raw Range" },
    { color: "bg-pink-500/20 border-pink-500/40", label: "Distributed Buckets" },
  ],
  shell: [
    { color: "border-pink-500/50 text-pink-300", label: "Active Gap Group" },
    { color: "bg-amber-400 border-amber-400", label: "Interleaved Compares" },
  ],
  timsort: [
    { color: "border-pink-500 bg-pink-500/10 text-pink-300", label: "Run Bounds" },
    { color: "bg-amber-400 border-amber-400", label: "Insertion Compare" },
    { color: "bg-rose-500 border-rose-500", label: "Insertion Shift" },
  ],
};


const getActivePseudocodeLine = (algo: string, eventType: string): number => {
  const a = algo.toLowerCase();
  if (a.includes("bubble")) {
    if (eventType === "comparison") return 2;
    if (eventType === "swap") return 3;
    return 0;
  }
  if (a.includes("selection")) {
    if (eventType === "comparison") return 3;
    if (eventType === "swap") return 4;
    return 0;
  }
  if (a.includes("insertion")) {
    if (eventType === "comparison") return 3;
    if (eventType === "swap" || eventType === "shift") return 4;
    if (eventType === "insert") return 6;
    return 0;
  }
  if (a.includes("quick")) {
    if (eventType === "pivot_selection") return 2;
    if (eventType === "comparison") return 4;
    if (eventType === "swap") return 5;
    return 0;
  }
  if (a.includes("merge")) {
    if (eventType === "comparison" || eventType === "merge") return 5;
    return 0;
  }
  if (a.includes("heap")) {
    if (eventType === "heapify_start" || eventType === "comparison") return 4;
    if (eventType === "swap") return 3;
    return 0;
  }
  if (a.includes("counting")) {
    if (eventType === "count_increment") return 2;
    if (eventType === "accumulate_counts") return 3;
    if (eventType === "write_output") return 5;
    return 0;
  }
  if (a.includes("radix")) {
    if (eventType === "radix_pass_start") return 2;
    if (eventType === "write_back") return 3;
    return 0;
  }
  if (a.includes("bucket")) {
    if (eventType === "distribute_bucket") return 2;
    if (eventType === "sort_bucket_start") return 3;
    if (eventType === "bucket_collect") return 4;
    return 0;
  }
  if (a.includes("shell")) {
    if (eventType === "gap_update") return 1;
    if (eventType === "comparison" || eventType === "swap") return 5;
    return 0;
  }
  if (a.includes("tim")) {
    if (eventType === "timsort_run_start") return 1;
    if (eventType === "comparison" || eventType === "swap" || eventType === "shift") return 2;
    if (eventType === "timsort_merge_start") return 4;
    if (eventType === "merge") return 5;
    return 0;
  }
  return 0;
};

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  isPinned: boolean;
  lastUpdated: string;
}

function SortMentorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, idToken, loading: authLoading, settings } = useAuthStore();

  const {
    array,
    originalArray,
    algorithm,
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    metrics,
    battleMode,
    algorithm2,
    steps2,
    currentStepIndex2,
    metrics2,
    setArray,
    setOriginalArray,
    setAlgorithm,
    setAlgorithm2,
    setSteps,
    setSteps2,
    setCurrentStepIndex,
    setCurrentStepIndex2,
    setIsPlaying,
    setSpeed,
    setMetrics,
    setMetrics2,
    setBattleMode,
    resetPlayback,
  } = useSortStore();

  const [arraySize, setArraySize] = useState(12);
  const [presetType, setPresetType] = useState("random");
  const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [ghostTrails, setGhostTrails] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"intro" | "visualizer">("intro");
  const [guidedStep, setGuidedStep] = useState<1 | 2 | 3>(1);
  const [introTab, setIntroTab] = useState<"process" | "visualizer_guide" | "complexity" | "code">("process");
  const [isConfigCollapsed, setIsConfigCollapsed] = useState<boolean>(true);
  const visualizerCardRef = useRef<HTMLDivElement>(null);
  const [hoveredStepIdx, setHoveredStepIdx] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState<number>(0);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(380);
  const [tutorMessage, setTutorMessage] = useState("");
  const [isTutorThinking, setIsTutorThinking] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");

  const [chatDrawerTab, setChatDrawerTab] = useState<"chat" | "sessions">("chat");
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSpecsPopoverOpen, setIsSpecsPopoverOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const [customArrayText, setCustomArrayText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [arrayValidation, setArrayValidation] = useState<{
    isValid: boolean;
    message: string;
    count?: number;
    parsed?: number[];
  } | null>(null);

  const resizerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const algoParam = searchParams ? searchParams.get("algorithm") : null;

  const saveConversations = useCallback((updated: Conversation[]) => {
    setConversations(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("sortmentor_conversations", JSON.stringify(updated));
    }
  }, []);

  const createEmptyChat = useCallback(() => {
    const newChat: Conversation = {
      id: Math.random().toString(36).substring(7),
      title: `Session: ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      messages: [
        {
          sender: "ai",
          text: "Welcome! Ask any question about sorting states, comparisons, or algorithmic complexity.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      isPinned: false,
      lastUpdated: new Date().toISOString(),
    };
    setConversations((prev) => {
      const list = [newChat, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("sortmentor_conversations", JSON.stringify(list));
      }
      return list;
    });
    setActiveChatId(newChat.id);
  }, []);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId);
  }, [conversations, activeChatId]);

  const generateNewArray = useCallback(() => {
    setIsPlaying(false);
    resetPlayback();

    let newArr: number[] = [];
    if (presetType === "random") {
      newArr = Array.from(
        { length: arraySize },
        () => Math.floor(Math.random() * 80) + 10
      );
    } else if (presetType === "sorted") {
      newArr = Array.from(
        { length: arraySize },
        (_, i) => Math.floor((i / arraySize) * 80) + 15
      );
    } else if (presetType === "reversed") {
      newArr = Array.from(
        { length: arraySize },
        (_, i) => Math.floor(((arraySize - i) / arraySize) * 80) + 15
      );
    } else if (presetType === "duplicates") {
      const base = [15, 30, 45, 60, 75];
      newArr = Array.from(
        { length: arraySize },
        () => base[Math.floor(Math.random() * base.length)]
      );
    } else if (presetType === "nearly_sorted") {
      newArr = Array.from(
        { length: arraySize },
        (_, i) => Math.floor((i / arraySize) * 80) + 15
      );
      if (newArr.length > 5) {
        const swapIdx = Math.floor(newArr.length / 2);
        const temp = newArr[swapIdx];
        newArr[swapIdx] = newArr[swapIdx + 1];
        newArr[swapIdx + 1] = temp;
      }
    }

    setOriginalArray(newArr);
    setArray([...newArr]);
    setCustomArrayText(newArr.join(", "));
    setSteps([]);
    setSteps2([]);
    setMetrics(null);
    setMetrics2(null);
  }, [
    arraySize,
    presetType,
    resetPlayback,
    setArray,
    setMetrics,
    setMetrics2,
    setOriginalArray,
    setIsPlaying,
    setSteps,
    setSteps2,
  ]);

  const shuffleArray = () => {
    setIsPlaying(false);
    resetPlayback();
    const shuffled = [...originalArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOriginalArray(shuffled);
    setArray([...shuffled]);
    setCustomArrayText(shuffled.join(", "));
    setSteps([]);
    setSteps2([]);
    setMetrics(null);
    setMetrics2(null);
  };

  const jumpToStep = useCallback(
    (idx: number) => {
      setIsPlaying(false);
      if (idx >= 0 && idx < steps.length) {
        setCurrentStepIndex(idx);
      }
      if (battleMode && idx >= 0 && idx < steps2.length) {
        setCurrentStepIndex2(idx);
      }
    },
    [
      steps.length,
      steps2.length,
      battleMode,
      setCurrentStepIndex,
      setCurrentStepIndex2,
      setIsPlaying,
    ]
  );

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (steps.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    const stepIdx = Math.round(progress * (steps.length - 1));
    setHoveredStepIdx(stepIdx);
    setTooltipX(x);
  };

  useEffect(() => {
    if (algoParam) {
      const sanitized = algoParam.replace("-sort", "").toLowerCase();
      const validAlgos = [
        "bubble",
        "selection",
        "insertion",
        "merge",
        "quick",
        "heap",
        "counting",
        "radix",
        "bucket",
        "shell",
        "timsort",
      ];
      if (validAlgos.includes(sanitized)) {
        setAlgorithm(sanitized);
        setViewMode("intro");
        setIsPlaying(false);
        setSteps([]);
        setCurrentStepIndex(0);
      }
    }
  }, [algoParam, setAlgorithm, setSteps, setCurrentStepIndex, setIsPlaying]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sortmentor_conversations");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Conversation[];
          if (parsed && parsed.length > 0) {
            setConversations(parsed);
            setActiveChatId(parsed[0].id);
          } else {
            createEmptyChat();
          }
        } catch {
          createEmptyChat();
        }
      } else {
        createEmptyChat();
      }
    }
  }, [createEmptyChat]);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    generateNewArray();
  }, [arraySize, presetType, generateNewArray]);

  useEffect(() => {
    if (settings?.defaultSpeed) {
      const speedMap: Record<string, number> = {
        slow: 350,
        normal: 150,
        fast: 50,
      };
      const targetSpeed = speedMap[settings.defaultSpeed];
      if (targetSpeed !== undefined) {
        setSpeed(targetSpeed);
      }
    }
  }, [settings?.defaultSpeed, setSpeed]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isTutorThinking]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (!battleMode) {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      } else {
        const hasMore1 = currentStepIndex < steps.length - 1;
        const hasMore2 = currentStepIndex2 < steps2.length - 1;

        if (hasMore1 || hasMore2) {
          if (hasMore1) setCurrentStepIndex(currentStepIndex + 1);
          if (hasMore2) setCurrentStepIndex2(currentStepIndex2 + 1);
        } else {
          setIsPlaying(false);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    currentStepIndex,
    currentStepIndex2,
    steps.length,
    steps2.length,
    speed,
    battleMode,
    setCurrentStepIndex,
    setCurrentStepIndex2,
    setIsPlaying,
  ]);

  const validateArrayInput = (text: string, currentAlgo: string) => {
    const cleaned = text.replace(/\s+/g, "");
    if (!cleaned) {
      setArrayValidation(null);
      setValidationError(null);
      return null;
    }

    const items = cleaned.split(",").filter((s) => s.length > 0);
    const parsed: number[] = [];

    for (const val of items) {
      if (!/^-?\d+$/.test(val)) {
        const error = "Only integer numbers are allowed (e.g. 10, -5, 24).";
        setArrayValidation({ isValid: false, message: error });
        setValidationError(error);
        return null;
      }
      parsed.push(Number(val));
    }

    if (parsed.length === 0) {
      const error = "Array input cannot be empty.";
      setArrayValidation({ isValid: false, message: error });
      setValidationError(error);
      return null;
    }

    if (parsed.length > 16) {
      const error = `Length is ${parsed.length}. Maximum allowed size is 16 elements.`;
      setArrayValidation({ isValid: false, message: error });
      setValidationError(error);
      return null;
    }

    const isNonNegativeAlgo = currentAlgo === "counting" || currentAlgo === "radix";
    if (isNonNegativeAlgo && parsed.some((n) => n < 0)) {
      const error = `${currentAlgo === "counting" ? "Counting Sort" : "Radix Sort"} standard mode requires non-negative integers (≥ 0).`;
      setArrayValidation({ isValid: false, message: error });
      setValidationError(error);
      return null;
    }

    const successMsg = `Valid array: ${parsed.length} element${parsed.length > 1 ? "s" : ""}.`;
    setArrayValidation({ isValid: true, message: successMsg, count: parsed.length, parsed });
    setValidationError(null);
    return parsed;
  };

  const applyCustomArray = () => {
    const parsed = validateArrayInput(customArrayText, algorithm);
    if (!parsed) return;

    setIsPlaying(false);
    resetPlayback();
    setOriginalArray(parsed);
    setArray([...parsed]);
    setArraySize(parsed.length);
    setSteps([]);
    setSteps2([]);
    setMetrics(null);
    setMetrics2(null);
  };

  const applyPresetArray = (presetArr: number[]) => {
    setCustomArrayText(presetArr.join(", "));
    validateArrayInput(presetArr.join(", "), algorithm);
    setIsPlaying(false);
    resetPlayback();
    setOriginalArray(presetArr);
    setArray([...presetArr]);
    setArraySize(presetArr.length);
    setSteps([]);
    setSteps2([]);
    setMetrics(null);
    setMetrics2(null);
  };

  const exportReplay = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            algorithm,
            array: originalArray,
            steps,
            metrics,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${algorithm}_replay.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const startSorting = async () => {
    setIsPlaying(false);
    setIsLoadingVisuals(true);
    setExecutionError(null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    try {
      const res = await fetch(`${API_BASE}/sortmentor/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify({ data: originalArray, algorithm }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Server error");
      }

      setSteps(data.steps || []);
      setMetrics(data.metrics || null);
      setCurrentStepIndex(0);

      if (battleMode) {
        const res2 = await fetch(`${API_BASE}/sortmentor/execute`, {
          method: "POST",
          headers,
          body: JSON.stringify({ data: originalArray, algorithm: algorithm2 }),
        });
        const data2 = await res2.json();

        if (!res2.ok) {
          throw new Error(data2.detail || "Opponent execution failed");
        }

        setSteps2(data2.steps || []);
        setMetrics2(data2.metrics || null);
        setCurrentStepIndex2(0);
      }

      setIsPlaying(true);
    } catch (err) {
      console.error("Sorting execution failed", err);
      setExecutionError(
        "Could not connect to backend engine. Verify local backend service is active."
      );
    } finally {
      setIsLoadingVisuals(false);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (steps.length > 0) setIsPlaying(!isPlaying);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setIsPlaying(false);
          if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
            if (battleMode && currentStepIndex2 > 0) {
              setCurrentStepIndex2(currentStepIndex2 - 1);
            }
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          setIsPlaying(false);
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            if (battleMode && currentStepIndex2 < steps2.length - 1) {
              setCurrentStepIndex2(currentStepIndex2 + 1);
            }
          }
          break;
        case "KeyR":
          e.preventDefault();
          resetPlayback();
          break;
        case "KeyT":
          e.preventDefault();
          setGhostTrails((prev) => !prev);
          break;
        case "Escape":
          e.preventDefault();
          if (isShortcutsOpen) {
            setIsShortcutsOpen(false);
          } else if (confirmModal?.isOpen) {
            setConfirmModal(null);
          } else if (isChatOpen) {
            setIsChatOpen(false);
          } else if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
      }
    },
    [
      isPlaying,
      steps.length,
      steps2.length,
      currentStepIndex,
      currentStepIndex2,
      battleMode,
      resetPlayback,
      setCurrentStepIndex,
      setCurrentStepIndex2,
      setIsPlaying,
      isShortcutsOpen,
      confirmModal,
      isFullscreen,
      isChatOpen,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const appendMessage = (sender: "user" | "ai", text: string) => {
    if (!activeChatId) return;
    const list = conversations.map((c) => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            { sender, text, timestamp: new Date().toLocaleTimeString() },
          ],
          lastUpdated: new Date().toISOString(),
        };
      }
      return c;
    });
    saveConversations(list);
  };

  const askAITutor = async () => {
    if (!tutorMessage.trim()) return;

    const userQuery = tutorMessage;
    appendMessage("user", userQuery);
    setTutorMessage("");
    setIsTutorThinking(true);

    try {
      const activeStep = steps[currentStepIndex];
      const meta = ALGO_METADATA[algorithm] || ALGO_METADATA.bubble;
      const payload = {
        question: userQuery,
        algorithm,
        array_state: activeStep ? activeStep.array : originalArray,
        step_index: currentStepIndex,
        total_steps: steps.length,
        visualizer_event: activeStep ? activeStep.event_type : "initial",
        step_message: activeStep ? activeStep.message : "Visualizer ready.",
        visualization_mode: battleMode ? "battle" : "single",
        pointers: activeStep?.compare || [],
        comparisons: activeStep?.compare || [],
        swaps: activeStep?.swap || [],
        complexity: `${meta.timeAvg} time, ${meta.space} space`,
        speed: speed,
        model: settings?.defaultLlm || "Gemini 2.5 Flash",
        persona: settings?.preferredMentor || "Tutor",
      };

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) {
        requestHeaders["Authorization"] = `Bearer ${idToken}`;
      }

      const res = await fetch(`${API_BASE}/sortmentor/explain_state`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.explanation || data.answer || data.message) {
          appendMessage("ai", data.explanation || data.answer || data.message);
          setIsTutorThinking(false);
          return;
        }
      }
    } catch {
      setTimeout(() => {
        const guide = ALGO_GUIDES[algorithm.toLowerCase()] || ALGO_GUIDES.bubble;
        const activeStep = steps[currentStepIndex];
        const eventType = (activeStep?.event_type || "transition").toLowerCase();
        const msg = activeStep?.message || "Standard transition";
        const currArr = activeStep?.array || originalArray;

        let eventExplanation = "";
        const [c1, c2] = activeStep?.compare || [-1, -1];
        const [s1, s2] = activeStep?.swap || [-1, -1];

        switch (algorithm.toLowerCase()) {
          case "bubble":
            if (eventType.includes("compare") && c1 >= 0 && c2 >= 0) {
              eventExplanation = `Testing adjacent pair \`arr[${c1}]=${currArr[c1]}\` and \`arr[${c2}]=${currArr[c2]}\`. If \`${currArr[c1]} > ${currArr[c2]}\`, an inversion exists and they must swap.`;
            } else if (eventType.includes("swap") && s1 >= 0 && s2 >= 0) {
              eventExplanation = `Swapping \`arr[${s1}]\` and \`arr[${s2}]\` to move the larger value closer to its final rightmost position.`;
            } else {
              eventExplanation = `Locked element into its permanent sorted suffix position.`;
            }
            break;

          case "selection":
            if (eventType.includes("compare") && c1 >= 0 && c2 >= 0) {
              eventExplanation = `Scanning index \`${c2}\` (\`${currArr[c2]}\`) against current sub-array minimum at index \`${c1}\` (\`${currArr[c1]}\`).`;
            } else if (eventType.includes("swap") && s1 >= 0 && s2 >= 0) {
              eventExplanation = `Found the absolute minimum in the remaining unsorted subarray and placed it at index \`${s1}\`.`;
            }
            break;

          case "insertion":
            if (eventType.includes("compare") && c1 >= 0 && c2 >= 0) {
              eventExplanation = `Comparing key element \`${currArr[c1]}\` with sorted prefix element \`arr[${c2}]=${currArr[c2]}\`.`;
            } else if (eventType.includes("shift") || eventType.includes("swap")) {
              eventExplanation = `Shifting larger elements one position to the right to carve out the correct insertion slot.`;
            } else {
              eventExplanation = `Inserted key into its proper sorted prefix slot.`;
            }
            break;

          case "quick":
            if (activeStep?.pivot !== undefined) {
              eventExplanation = `Partitioning sub-array around pivot **${activeStep.pivot}**. Pointers \`i\` and \`j\` scan from both ends to group elements $< ${activeStep.pivot}$ to the left and $\\ge ${activeStep.pivot}$ to the right.`;
            } else if (s1 >= 0 && s2 >= 0) {
              eventExplanation = `Swapped cross-partition elements \`arr[${s1}]\` and \`arr[${s2}]\` to restore partition invariance.`;
            }
            break;

          case "merge":
            if (eventType.includes("split") || eventType.includes("divide")) {
              eventExplanation = `Dividing subarray into two halves to recursively conquer smaller subarrays.`;
            } else if (eventType.includes("merge") || eventType.includes("compare")) {
              eventExplanation = `Comparing heads of the two sorted sub-lists and merging the smaller element back into the primary buffer.`;
            }
            break;

          case "heap":
            if (eventType.includes("compare")) {
              eventExplanation = `Heapify comparison: checking root node against its left and right children in the binary max-heap.`;
            } else if (eventType.includes("swap")) {
              eventExplanation = `Sifting down larger child to maintain the Max-Heap property (Parent ≥ Children).`;
            } else {
              eventExplanation = `Extracted maximum root element and placed it at the current sorted end boundary.`;
            }
            break;

          case "counting":
            if (eventType.includes("count") || eventType.includes("frequency")) {
              eventExplanation = `Tallying element frequencies directly into the counting array index.`;
            } else {
              eventExplanation = `Writing elements back into the sorted array in stable order using cumulative frequency offsets.`;
            }
            break;

          case "radix":
            eventExplanation = `Distributing elements into 0–9 digit buckets based on the current exponent place value (LSD).`;
            break;

          case "bucket":
            if (eventType.includes("distribute") || eventType.includes("bucket")) {
              eventExplanation = `Mapping numbers into proportional bucket ranges and placing them into bucket cups.`;
            } else {
              eventExplanation = `Sorting each bucket individually with insertion sort and concatenating into the final array.`;
            }
            break;

          case "shell":
            eventExplanation = `Comparing elements separated by gap h. Interleaved insertion sort accelerates long-distance shifts.`;
            break;

          case "timsort":
            eventExplanation = `Detecting natural monotonic runs and extending them via binary insertion before merging runs on the stack.`;
            break;

          default:
            eventExplanation = `Performing ${eventType} operation at step ${currentStepIndex + 1}.`;
        }

        const optTimeBest = guide.timeBest.split("-")[0].trim().replace(/^O\(/, "Ω(");
        const optTimeAvg = guide.timeAvg.split("-")[0].trim().replace(/^O\(/, "Θ(");
        const optTimeWorst = guide.timeWorst.split("-")[0].trim();

        const fallback = `### Step ${currentStepIndex + 1} of ${steps.length}: ${guide.name} Analysis

**Active Event:** \`${eventType.toUpperCase()}\`
${activeStep?.message ? `> *"${activeStep.message}"*` : ""}

**Step Interpretation:**
${eventExplanation}

**Algorithmic Invariant:**
${guide.step1_goal}

* **Complexity:** Best \`${optTimeBest}\` · Average \`${optTimeAvg}\` · Worst \`${optTimeWorst}\`
* **Memory:** \`${guide.space.split("-")[0].trim()}\` (${guide.whySpace})
* **Stability:** ${guide.stable ? "✓ Guaranteed Stable" : "✗ Unstable"}

*Tip: Press **Space** to play/pause, or use **←** and **→** to manually step.*`;

        appendMessage("ai", fallback);
        setIsTutorThinking(false);
      }, 350);
      return;
    }
    setIsTutorThinking(false);
  };

  const explainCurrentStep = async () => {
    const activeStep = steps[currentStepIndex];
    if (!activeStep) return;

    setIsChatOpen(true);
    setIsTutorThinking(true);
    try {
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) {
        requestHeaders["Authorization"] = `Bearer ${idToken}`;
      }

      const res = await fetch(`${API_BASE}/sortmentor/explain_step`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          algorithm,
          event_type: activeStep.event_type,
          compare: activeStep.compare || [],
          swap: activeStep.swap || [],
          array: activeStep.array,
          message: activeStep.message,
        }),
      });
      const data = await res.json();
      appendMessage("ai", data.explanation);
    } catch {
      appendMessage(
        "ai",
        `**Step ${currentStepIndex + 1}**: ${activeStep.message}`
      );
    } finally {
      setIsTutorThinking(false);
    }
  };

  const clearChat = () => {
    if (!activeChatId) return;
    const list = conversations.map((c) => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [
            {
              sender: "ai" as const,
              text: "Chat cleared. Ask anything regarding the algorithm or array operations.",
              timestamp: new Date().toLocaleTimeString(),
            },
          ],
          lastUpdated: new Date().toISOString(),
        };
      }
      return c;
    });
    saveConversations(list);
  };

  const promptClearChat = () => {
    if (!activeChatId) return;
    setConfirmModal({
      isOpen: true,
      title: "Clear Chat Session?",
      message: "Are you sure you want to clear all messages in this tutoring session? This cannot be undone.",
      confirmLabel: "Clear Messages",
      onConfirm: () => {
        clearChat();
        setConfirmModal(null);
      },
    });
  };

  const promptDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = conversations.find((c) => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Tutoring Session?",
      message: `Are you sure you want to delete "${target?.title || "this session"}"? This will permanently remove its chat history.`,
      confirmLabel: "Delete Session",
      onConfirm: () => {
        deleteConversation(id, e);
        setConfirmModal(null);
      },
    });
  };

  const promptChangeAlgorithm = (newAlgo: string) => {
    if (steps.length > 0 && currentStepIndex > 0 && currentStepIndex < steps.length - 1) {
      setConfirmModal({
        isOpen: true,
        title: "Change Algorithm?",
        message: "You have an active visualization run in progress. Changing the algorithm will reset your current execution step. Do you want to continue?",
        confirmLabel: "Change & Reset",
        onConfirm: () => {
          setAlgorithm(newAlgo);
          setViewMode("intro");
          setGuidedStep(1);
          setIsPlaying(false);
          setSteps([]);
          setCurrentStepIndex(0);
          setConfirmModal(null);
        },
      });
    } else {
      setAlgorithm(newAlgo);
      setViewMode("intro");
      setGuidedStep(1);
      setIsPlaying(false);
      setSteps([]);
      setCurrentStepIndex(0);
    }
  };

  const exportChat = () => {
    if (!activeConversation) return;
    const content = activeConversation.messages
      .map(
        (m) =>
          `[${m.timestamp}] ${
            m.sender === "user" ? "You" : "SortMentor"
          }: ${m.text}`
      )
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat_export_${activeConversation.title.replace(
      /\s+/g,
      "_"
    )}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = conversations.filter((c) => c.id !== id);
    saveConversations(list);
    if (activeChatId === id) {
      if (list.length > 0) {
        setActiveChatId(list[0].id);
      } else {
        createEmptyChat();
      }
    }
  };

  const togglePinConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = conversations.map((c) => {
      if (c.id === id) return { ...c, isPinned: !c.isPinned };
      return c;
    });
    saveConversations(list);
  };

  const startRenameConversation = (
    id: string,
    currentTitle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitleText(currentTitle);
  };

  const saveRenameConversation = () => {
    if (!editingChatId) return;
    const list = conversations.map((c) => {
      if (c.id === editingChatId)
        return { ...c, title: editTitleText.trim() || c.title };
      return c;
    });
    saveConversations(list);
    setEditingChatId(null);
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const windowWidth = window.innerWidth;
      const newWidth = windowWidth - moveEvent.clientX;
      if (newWidth >= 280 && newWidth <= 640) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const renderMarkdown = (text: string) => {
    if (!text || typeof text !== "string") return null;
    const parts = text.split("```");
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        const lines = part.split("\n");
        const lang = lines[0].trim();
        const code = lines.slice(1).join("\n").trim();
        return (
          <div
            key={idx}
            className="my-2 rounded-lg bg-slate-950 border border-white/10 p-3 font-mono text-[11px] overflow-x-auto text-emerald-400"
          >
            {lang && (
              <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase font-bold mb-1 border-b border-white/5 pb-1">
                <span>{lang}</span>
                <span className="normal-case text-gray-600">code block</span>
              </div>
            )}
            <pre>
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split("\n");
      return (
        <div key={idx} className="flex flex-col gap-1.5 my-1">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} className="h-1.5" />;

            const formatTextSegment = (txt: string) => {
              const boldParts = txt.split("**");
              return boldParts.map((bPart, bIdx) => {
                if (bIdx % 2 === 1) {
                  return (
                    <strong
                      key={bIdx}
                      className="font-bold text-white bg-white/10 px-1 rounded"
                    >
                      {bPart}
                    </strong>
                  );
                }
                const codeParts = bPart.split("`");
                return codeParts.map((cPart, cIdx) => {
                  if (cIdx % 2 === 1) {
                    return (
                      <code
                        key={cIdx}
                        className="bg-slate-950 border border-white/10 px-1.5 py-0.5 rounded font-mono text-[10px] text-rose-300"
                      >
                        {cPart}
                      </code>
                    );
                  }
                  return cPart;
                });
              });
            };

            if (trimmed.startsWith("#")) {
              const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
              if (match) {
                const level = match[1].length;
                const content = match[2];
                const sizeClass =
                  level === 1
                    ? "text-sm font-extrabold text-white mt-1.5 mb-0.5 border-b border-white/5 pb-0.5"
                    : level === 2
                    ? "text-xs font-bold text-white mt-1.5 mb-0.5"
                    : "text-xs font-semibold text-indigo-300 mt-1";
                return (
                  <div key={lIdx} className={sizeClass}>
                    {formatTextSegment(content)}
                  </div>
                );
              }
            }

            const bulletMatch = trimmed.match(/^([-*+]\s+|\d+\.\s+)(.*)$/);
            if (bulletMatch) {
              const prefix = bulletMatch[1];
              const content = bulletMatch[2];
              const isNumbered = /^\d/.test(prefix);

              return (
                <div
                  key={lIdx}
                  className="flex items-start gap-2 pl-2 py-0.5 text-gray-300"
                >
                  {isNumbered ? (
                    <span className="font-mono text-indigo-400 font-bold select-none text-[10px] mt-0.5">
                      {prefix}
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-xs leading-relaxed">
                    {formatTextSegment(content)}
                  </span>
                </div>
              );
            }

            return (
              <p key={lIdx} className="text-xs leading-relaxed text-gray-300">
                {formatTextSegment(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const filteredConversations = useMemo(() => {
    const term = chatSearchQuery.toLowerCase();
    return conversations
      .filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.messages.some((m) => m.text.toLowerCase().includes(term))
      )
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      });
  }, [conversations, chatSearchQuery]);

  if (authLoading || !user) return null;

  const activeStep = steps[currentStepIndex];
  const activeStep2 = steps2[currentStepIndex2];

  const stats = {
    step: steps.length > 0 ? `${currentStepIndex + 1} / ${steps.length}` : "-",
    phase: activeStep?.event_type
      ? activeStep.event_type.toUpperCase()
      : "READY",
    compares:
      steps.length > 0
        ? steps
            .slice(0, currentStepIndex + 1)
            .filter((s) => s.event_type === "comparison" || s.event_type === "compare")
            .length
        : 0,
    swaps:
      steps.length > 0
        ? steps
            .slice(0, currentStepIndex + 1)
            .filter((s) => s.event_type === "swap" || s.event_type === "shift")
            .length
        : 0,
    pivot:
      activeStep?.pivot !== undefined ? String(activeStep.pivot) : "None",
  };

  const stats2 = {
    step:
      steps2.length > 0 ? `${currentStepIndex2 + 1} / ${steps2.length}` : "-",
    phase: activeStep2?.event_type
      ? activeStep2.event_type.toUpperCase()
      : "READY",
    compares:
      steps2.length > 0
        ? steps2
            .slice(0, currentStepIndex2 + 1)
            .filter((s) => s.event_type === "comparison" || s.event_type === "compare")
            .length
        : 0,
    swaps:
      steps2.length > 0
        ? steps2
            .slice(0, currentStepIndex2 + 1)
            .filter((s) => s.event_type === "swap" || s.event_type === "shift")
            .length
        : 0,
    pivot:
      activeStep2?.pivot !== undefined ? String(activeStep2.pivot) : "None",
  };

  const activeLayout = getAlgorithmLayout(algorithm);
  const activeLayout2 = battleMode ? getAlgorithmLayout(algorithm2) : null;
  const dynamicMinHeight = battleMode && activeLayout2
    ? Math.max(activeLayout.minHeight, activeLayout2.minHeight)
    : activeLayout.minHeight;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 font-sans select-none text-gray-100">
      {/* Top Main Navbar */}
      <header
        className={`h-14 shrink-0 bg-slate-900/60 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between border-b border-white/5 z-20 ${
          isFullscreen ? "hidden" : "flex"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative overflow-hidden flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon.png"
                alt="AlgoVerse"
                className="h-full w-full object-cover scale-110"
              />
            </div>
            <span className="font-bold text-base text-white">SortMentor</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hidden sm:inline">
              Visualizer & AI Tutor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const nextMode = !battleMode;
              setBattleMode(nextMode);
              if (nextMode && viewMode === "intro") {
                setViewMode("visualizer");
              }
            }}
            aria-label={battleMode ? "Disable Battle Arena (Switch to Solo Mode)" : "Enable Battle Arena (Compare 2 Algorithms Side-by-Side)"}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer border ${
              battleMode
                ? "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border-pink-500/40 text-pink-200 shadow-md shadow-pink-500/10 ring-1 ring-pink-500/30"
                : "bg-slate-900/80 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20"
            }`}
          >
            <Swords className={`h-3.5 w-3.5 transition-transform ${battleMode ? "text-pink-400 scale-110" : "text-gray-400"}`} />
            <span>{battleMode ? "Battle Arena Active" : "Battle Arena"}</span>
            <span className={`w-2 h-2 rounded-full ${battleMode ? "bg-pink-400 shadow-sm shadow-pink-400 animate-pulse" : "bg-gray-600"}`} />
          </button>
          <ShareButton />
          <UserDropdown />
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        <div
          className={`flex-1 flex flex-col min-w-0 p-2 sm:p-3 lg:p-4 gap-2 sm:gap-3 h-full ${
            viewMode === "intro" ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          {/* Top Quick Settings Bar (Collapsible - only in intro mode) */}
          <AnimatePresence initial={false}>
            {isConfigCollapsed && !isFullscreen && viewMode === "intro" && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -6 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -6 }}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/5 shrink-0"
              >
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Algorithm:{" "}
                    <b className="text-white uppercase font-mono">
                      {algorithm}
                    </b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                    Size: <b className="text-white font-mono">{arraySize}</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Preset:{" "}
                    <b className="text-white capitalize font-mono">
                      {presetType}
                    </b>
                  </span>
                  {battleMode && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Opponent:{" "}
                      <b className="text-white uppercase font-mono">
                        {algorithm2}
                      </b>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsConfigCollapsed(false)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase cursor-pointer select-none transition-all flex items-center gap-1"
                >
                  <Sliders className="h-3 w-3" />
                  Settings
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Configuration Control Strip */}
          <AnimatePresence initial={false}>
            {!isConfigCollapsed && !isFullscreen && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -6 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -6 }}
                className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-xl p-3 flex flex-col gap-2 shrink-0"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-400 font-bold">
                      Algorithm
                    </span>
                    <select
                      value={algorithm}
                      onChange={(e) => promptChangeAlgorithm(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="bubble">Bubble Sort</option>
                      <option value="selection">Selection Sort</option>
                      <option value="insertion">Insertion Sort</option>
                      <option value="merge">Merge Sort</option>
                      <option value="quick">Quick Sort</option>
                      <option value="heap">Heap Sort</option>
                      <option value="counting">Counting Sort</option>
                      <option value="radix">Radix Sort</option>
                      <option value="bucket">Bucket Sort</option>
                      <option value="shell">Shell Sort</option>
                      <option value="timsort">Tim Sort</option>
                    </select>
                  </div>

                  {battleMode && (
                    <div className="flex flex-col gap-1 border-l-2 border-l-pink-500 pl-2">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-pink-400 font-bold">
                        Opponent Algorithm
                      </span>
                      <select
                        value={algorithm2}
                        onChange={(e) => setAlgorithm2(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-xs text-gray-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                      >
                        <option value="bubble">Bubble Sort</option>
                        <option value="selection">Selection Sort</option>
                        <option value="insertion">Insertion Sort</option>
                        <option value="merge">Merge Sort</option>
                        <option value="quick">Quick Sort</option>
                        <option value="heap">Heap Sort</option>
                        <option value="counting">Counting Sort</option>
                        <option value="radix">Radix Sort</option>
                        <option value="bucket">Bucket Sort</option>
                        <option value="shell">Shell Sort</option>
                        <option value="timsort">Tim Sort</option>
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400 font-bold">
                      Dataset Preset
                    </span>
                    <select
                      value={presetType}
                      onChange={(e) => setPresetType(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="random">Randomize</option>
                      <option value="nearly_sorted">Nearly Sorted</option>
                      <option value="sorted">Best Case (Sorted)</option>
                      <option value="reversed">Worst Case (Reversed)</option>
                      <option value="duplicates">Many Duplicates</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] uppercase font-mono tracking-widest text-gray-400 font-bold">
                      <span>Array Size: {arraySize}</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="16"
                      value={arraySize}
                      onChange={(e) => setArraySize(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer mt-1"
                    />
                  </div>
                </div>

                {/* Custom Array Input & Quick Presets Strip */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={customArrayText}
                        onChange={(e) => {
                          setCustomArrayText(e.target.value);
                          validateArrayInput(e.target.value, algorithm);
                        }}
                        placeholder="e.g. 45, 12, 89, 34, 70, 23 (max 16 items)"
                        className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none transition-colors pr-8 ${
                          arrayValidation
                            ? arrayValidation.isValid
                              ? "border-emerald-500/50 focus:border-emerald-400"
                              : "border-rose-500/50 focus:border-rose-400"
                            : "border-white/10 focus:border-indigo-500"
                        }`}
                      />
                      {arrayValidation && (
                        <div className="absolute right-2.5 top-2">
                          {arrayValidation.isValid ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={applyCustomArray}
                        disabled={arrayValidation ? !arrayValidation.isValid : !customArrayText.trim()}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40 shrink-0 transition-all shadow-md shadow-indigo-600/30"
                      >
                        Apply Array
                      </button>
                      <button
                        onClick={generateNewArray}
                        className="px-2.5 py-1.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all"
                      >
                        Randomize
                      </button>
                      <button
                        onClick={shuffleArray}
                        className="px-2.5 py-1.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all"
                      >
                        Shuffle
                      </button>
                      <button
                        onClick={() => setIsConfigCollapsed(true)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all flex items-center gap-1"
                      >
                        <Minimize2 className="h-3 w-3" />
                        Collapse
                      </button>
                    </div>
                  </div>

                  {/* Inline Live Feedback & Validation Banner (Accessible with role=alert) */}
                  {arrayValidation && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-md flex items-center gap-1.5 border ${
                        arrayValidation.isValid
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                      }`}
                    >
                      {arrayValidation.isValid ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      )}
                      <span>{arrayValidation.message}</span>
                    </div>
                  )}

                  {/* Quick Edge-Case Test Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono pt-1 text-gray-400">
                    <span className="font-bold text-slate-500 uppercase">Test Presets:</span>
                    <button
                      onClick={() => applyPresetArray([95, 82, 71, 63, 50, 42, 33, 21, 10])}
                      aria-label="Load reverse-sorted worst-case array"
                      className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-800 border border-white/5 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      Reverse (Worst Case)
                    </button>
                    <button
                      onClick={() => applyPresetArray([10, 20, 25, 40, 35, 50, 60, 75, 90])}
                      aria-label="Load nearly-sorted array"
                      className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-800 border border-white/5 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      Nearly Sorted
                    </button>
                    <button
                      onClick={() => applyPresetArray([40, 10, 40, 25, 10, 80, 25, 40, 10])}
                      aria-label="Load array with multiple duplicates"
                      className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-800 border border-white/5 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      Duplicates (Stability)
                    </button>
                    <button
                      onClick={() => applyPresetArray([1, 0, 1, 1, 0, 0, 1, 0, 1])}
                      aria-label="Load binary 0 and 1 array"
                      className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-800 border border-white/5 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      Binary (0s & 1s)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unified Visualizer & Side-by-Side Explanation Area */}
          <div
            ref={visualizerCardRef}
            className={`flex-1 flex flex-col bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl transition-all duration-300 min-h-0 ${
              viewMode === "intro" ? "overflow-y-auto min-h-fit" : "overflow-hidden h-full"
            } ${
              isFullscreen
                ? "fixed inset-0 z-50 bg-slate-950 p-2 sm:p-4"
                : "relative"
            }`}
          >
              {/* Top Toolbar Header (Contains Playback Controls, Telemetry Pills, Timeline & Tools) */}
              {(viewMode === "visualizer" || battleMode) && (
                <div className="px-4 py-2.5 border-b border-white/5 bg-slate-950/70 backdrop-blur-md flex flex-col gap-2 shrink-0 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Algorithm Name & Live Telemetry Pills */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-sm font-black text-white uppercase font-mono tracking-tight">
                          {algorithm}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                          Step: <b className="text-white">{stats.step}</b>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                          Compares: <b className="text-amber-400">{stats.compares}</b>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                          Swaps: <b className="text-rose-400">{stats.swaps}</b>
                        </span>
                      </div>

                      {/* Live Telemetry Pills Inline */}
                      <div className="hidden xl:flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase">
                          {steps[currentStepIndex]?.event_type || "READY"}
                        </span>
                        {steps[currentStepIndex]?.compare && steps[currentStepIndex].compare.length > 0 && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
                            CMP: [{steps[currentStepIndex].compare.join(",")}]
                          </span>
                        )}
                        {steps[currentStepIndex]?.swap && steps[currentStepIndex].swap.length > 0 && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold">
                            SWP: [{steps[currentStepIndex].swap.join(",")}]
                          </span>
                        )}
                        {steps[currentStepIndex]?.pivot !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold">
                            PIV: {steps[currentStepIndex].pivot}
                          </span>
                        )}
                      </div>

                      {/* Dynamic Layout Badge */}
                      <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        {activeLayout.layoutLabel}
                      </span>

                      {/* Educational Complexity & Invariants HUD Badge (Large screens) */}
                      {(() => {
                        const guide = ALGO_GUIDES[algorithm.toLowerCase()] || ALGO_GUIDES.bubble;
                        const optBest = guide.timeBest.split("-")[0].trim().replace(/^O\(/, "Ω(");
                        const optAvg = guide.timeAvg.split("-")[0].trim().replace(/^O\(/, "Θ(");
                        const optWorst = guide.timeWorst.split("-")[0].trim();
                        const optSpace = guide.space.split("-")[0].trim();

                        return (
                          <>
                            <div className="hidden lg:flex items-center gap-2 font-mono text-[10.5px] bg-slate-900/90 border border-white/10 px-3 py-1 rounded-xl text-slate-300 shadow-inner">
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-500 font-bold uppercase text-[9px]">Complexity:</span>
                                <span className="text-emerald-400 font-bold" title="Best Case: Lower Bound Ω">{optBest}</span>
                                <span className="text-gray-600">·</span>
                                <span className="text-indigo-300 font-bold" title="Average Case: Tight Bound Θ">{optAvg}</span>
                                <span className="text-gray-600">·</span>
                                <span className="text-rose-400 font-bold" title="Worst Case: Upper Bound O">{optWorst}</span>
                              </div>
                              <span className="text-white/15">|</span>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 font-bold uppercase text-[9px]">Memory:</span>
                                <span className="text-amber-300 font-bold">{optSpace}</span>
                              </div>
                              <span className="text-white/15">|</span>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 font-bold uppercase text-[9px]">Stable:</span>
                                <span className={guide.stable ? "text-emerald-400 font-bold" : "text-gray-400"}>
                                  {guide.stable ? "✓ Yes" : "✗ No"}
                                </span>
                              </div>
                            </div>

                            {/* Compact Specs & Growth Popover for Mobile/Tablet (< lg) */}
                            <div className="relative lg:hidden">
                              <button
                                onClick={() => setIsSpecsPopoverOpen(!isSpecsPopoverOpen)}
                                aria-label="Toggle Algorithm Complexity & Specs"
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-indigo-300 font-mono text-[10px] font-bold cursor-pointer transition-all"
                              >
                                <Info className="h-3 w-3 text-indigo-400" />
                                <span>Specs</span>
                              </button>

                              <AnimatePresence>
                                {isSpecsPopoverOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute left-0 top-full mt-2 z-40 w-64 bg-slate-900 border border-white/15 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-2 text-xs font-mono text-slate-300"
                                  >
                                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-bold text-white">
                                      <span>{guide.name} Specs</span>
                                      <button
                                        onClick={() => setIsSpecsPopoverOpen(false)}
                                        className="text-gray-400 hover:text-white"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-1 text-[11px]">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Best Time (Ω):</span>
                                        <span className="text-emerald-400 font-bold">{optBest}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Avg Time (Θ):</span>
                                        <span className="text-indigo-300 font-bold">{optAvg}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Worst Time (O):</span>
                                        <span className="text-rose-400 font-bold">{optWorst}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Memory Space:</span>
                                        <span className="text-amber-300 font-bold">{optSpace}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Stability:</span>
                                        <span className={guide.stable ? "text-emerald-400 font-bold" : "text-gray-400"}>
                                          {guide.stable ? "✓ Guaranteed Stable" : "✗ Unstable"}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Center: Playback Controls */}
                    <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-white/10 shadow-inner">
                      <button
                        onClick={startSorting}
                        disabled={isLoadingVisuals}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white disabled:opacity-40 shadow-md shadow-indigo-600/30 cursor-pointer transition-all shrink-0"
                      >
                        {isLoadingVisuals ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        ) : (
                          <Zap className="h-3.5 w-3.5" />
                        )}
                        <span>Run</span>
                      </button>

                      <div className="w-[1px] h-4 bg-white/10 mx-1" />

                      <button
                        onClick={() => jumpToStep(0)}
                        disabled={steps.length === 0}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-gray-400 hover:text-white cursor-pointer disabled:opacity-40"
                        title="Reset to Start"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          currentStepIndex > 0 && jumpToStep(currentStepIndex - 1)
                        }
                        disabled={currentStepIndex <= 0}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-gray-400 hover:text-white cursor-pointer disabled:opacity-40"
                        title="Previous Step"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => steps.length > 0 && setIsPlaying(!isPlaying)}
                        disabled={steps.length === 0}
                        className="p-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 cursor-pointer transition-all shadow-sm"
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          currentStepIndex < steps.length - 1 &&
                          jumpToStep(currentStepIndex + 1)
                        }
                        disabled={
                          steps.length === 0 ||
                          currentStepIndex >= steps.length - 1
                        }
                        className="p-1.5 rounded-md hover:bg-slate-800 text-gray-400 hover:text-white cursor-pointer disabled:opacity-40"
                        title="Next Step"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />

                      {/* Speed Controls with Presets */}
                      <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <div className="flex items-center gap-1 bg-slate-950/60 px-1.5 py-0.5 rounded-lg border border-white/5">
                          <span className="w-12 text-center text-slate-200 font-bold">{speed}ms</span>
                          <input
                            type="range"
                            min="50"
                            max="1200"
                            step="50"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            title="Playback Speed (ms delay between steps)"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          {[
                            { label: "0.5x", val: 800 },
                            { label: "1x", val: 400 },
                            { label: "2x", val: 200 },
                          ].map((p) => (
                            <button
                              key={p.label}
                              onClick={() => setSpeed(p.val)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                                speed === p.val
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Explain, Settings Toggle, Tools & Zoom */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={explainCurrentStep}
                        disabled={steps.length === 0}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600/30 to-pink-600/30 hover:from-indigo-600 hover:to-pink-600 border border-indigo-500/40 text-indigo-200 hover:text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40 select-none flex items-center gap-1.5 transition-all shadow-sm"
                        title="Ask AI Tutor to explain current step"
                      >
                        <BrainCircuit className="h-3.5 w-3.5 text-indigo-300" />
                        <span className="hidden sm:inline">Explain</span>
                      </button>

                      <button
                        onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-400 hover:text-white text-xs cursor-pointer transition-all"
                        title="Customize Dataset & Settings"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setViewMode(viewMode === "intro" ? "visualizer" : "intro")}
                        aria-label={viewMode === "intro" ? "Switch to Interactive Visualizer" : "Switch to 3-Step Guided Learning"}
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-400 hover:text-white text-xs cursor-pointer transition-all"
                        title={viewMode === "intro" ? "Open Visualizer" : "Open 3-Step Theory Guide"}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setIsShortcutsOpen(true)}
                        aria-label="View Keyboard Shortcuts (?)"
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-400 hover:text-white text-xs cursor-pointer transition-all"
                        title="Keyboard Shortcuts (?)"
                      >
                        <Keyboard className="h-3.5 w-3.5" />
                      </button>

                      {/* Step Ghost Trails Toggle Button */}
                      <button
                        onClick={() => setGhostTrails(!ghostTrails)}
                        aria-label="Toggle Step Ghost Trails"
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-1 ${
                          ghostTrails
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25 shadow-sm shadow-rose-500/20"
                            : "bg-slate-900 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-slate-800"
                        }`}
                        title={ghostTrails ? "Ghost Trails: ON (Click to disable trajectory arcs)" : "Ghost Trails: OFF (Click to enable trajectory arcs)"}
                      >
                        <Ghost className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-mono font-bold hidden sm:inline">
                          {ghostTrails ? "Trails" : "No Trails"}
                        </span>
                      </button>

                      <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

                      {/* Zoom Controls with 100% Reset */}
                      <div className="flex items-center bg-slate-900 rounded-lg border border-white/5 p-0.5">
                        <button
                          onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
                          aria-label="Zoom Out"
                          className="p-1 text-gray-400 hover:text-white rounded hover:bg-slate-800"
                          title="Zoom Out"
                        >
                          <ZoomOut className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setZoom(1)}
                          aria-label="Reset zoom to 100%"
                          className="text-[10px] font-mono text-gray-300 hover:text-indigo-400 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Click to reset zoom to 100%"
                        >
                          {Math.round(zoom * 100)}%
                        </button>
                        <button
                          onClick={() => setZoom(Math.min(1.6, zoom + 0.1))}
                          aria-label="Zoom In"
                          className="p-1 text-gray-400 hover:text-white rounded hover:bg-slate-800"
                          title="Zoom In"
                        >
                          <ZoomIn className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        aria-label={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-400 hover:text-white text-xs cursor-pointer"
                        title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="h-3.5 w-3.5" />
                        ) : (
                          <Maximize2 className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        onClick={exportReplay}
                        disabled={steps.length === 0}
                        aria-label="Export Replay JSON"
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-400 hover:text-white text-xs cursor-pointer disabled:opacity-40"
                        title="Export Replay JSON"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Integrated Scrubber Bar directly under header buttons */}
                  <div
                    className="relative flex items-center w-full group pt-1"
                    onMouseMove={handleTimelineMouseMove}
                    onMouseLeave={() => setHoveredStepIdx(null)}
                  >
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, steps.length - 1)}
                      value={currentStepIndex}
                      onChange={(e) => jumpToStep(Number(e.target.value))}
                      disabled={steps.length === 0}
                      className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                    />

                    {hoveredStepIdx !== null && steps[hoveredStepIdx] && (
                      <div
                        className="absolute top-full mt-2 bg-slate-950/95 border border-indigo-500/20 text-gray-200 text-[10px] font-sans px-2.5 py-1.5 rounded-lg shadow-2xl pointer-events-none select-none z-30 w-52 break-words -translate-x-1/2 backdrop-blur-md"
                        style={{ left: `${tooltipX}px` }}
                      >
                        <div className="font-bold text-indigo-400 mb-0.5 font-mono">
                          Step {hoveredStepIdx + 1} ({steps[hoveredStepIdx].event_type}):
                        </div>
                        <div className="leading-normal">
                          {steps[hoveredStepIdx].message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Main Stage: Visualizer (Left) + Integrated Explanation (Right) */}
              <div
                className={`flex-1 min-h-0 p-2 sm:p-3 flex flex-col ${
                  viewMode === "intro" ? "overflow-y-auto" : "overflow-hidden"
                }`}
              >
                {viewMode === "intro" && !battleMode ? (
                  (() => {
                    const guide = ALGO_GUIDES[algorithm.toLowerCase()] || ALGO_GUIDES.bubble;
                    return (
                      <div className="flex-1 min-h-fit flex flex-col justify-start w-full max-w-7xl mx-auto gap-4 p-1 sm:p-2">
                        {/* TOP HEADER: Algorithm Profile, Quick Switcher & 3-Step Stepper Bar */}
                        <div className="flex flex-col gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 shrink-0 shadow-2xl">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 animate-pulse shadow-lg shadow-indigo-500/50" />
                              <div className="flex items-center gap-2">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight font-sans">
                                  {guide.name}
                                </h2>
                                <select
                                  value={algorithm}
                                  onChange={(e) => promptChangeAlgorithm(e.target.value)}
                                  className="bg-slate-950/80 hover:bg-slate-900 border border-indigo-500/30 rounded-xl px-2.5 py-1 text-xs font-bold text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all shadow-md ml-1"
                                  title="Switch Algorithm"
                                >
                                  <option value="bubble">Bubble Sort</option>
                                  <option value="selection">Selection Sort</option>
                                  <option value="insertion">Insertion Sort</option>
                                  <option value="merge">Merge Sort</option>
                                  <option value="quick">Quick Sort</option>
                                  <option value="heap">Heap Sort</option>
                                  <option value="counting">Counting Sort</option>
                                  <option value="radix">Radix Sort</option>
                                  <option value="bucket">Bucket Sort</option>
                                  <option value="shell">Shell Sort</option>
                                  <option value="timsort">Tim Sort</option>
                                </select>
                              </div>
                              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm">
                                {guide.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-xs font-mono">
                              <span
                                className={`px-3 py-1 rounded-full border font-bold ${
                                  guide.stable
                                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                    : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                                }`}
                              >
                                {guide.stable ? "✓ Stable Sort" : "⚠ Unstable Sort"}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full border font-bold ${
                                  guide.inPlace
                                    ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                                    : "bg-purple-500/15 border-purple-500/30 text-purple-300"
                                }`}
                              >
                                {guide.inPlace ? "In-Place O(1) Aux" : "Aux Memory Required"}
                              </span>
                            </div>
                          </div>

                          {/* Stepper Progress Tabs */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { num: 1, title: "1. The Goal & Analogy", subtitle: "Core purpose & mental model", icon: Lightbulb },
                              { num: 2, title: "2. How It Decides", subtitle: "Swaps, shifts & visual cues", icon: Compass },
                              { num: 3, title: "3. Complexity & Cases", subtitle: "Big-O & edge scenarios", icon: Scale },
                            ].map((st) => (
                              <button
                                key={st.num}
                                onClick={() => setGuidedStep(st.num as 1 | 2 | 3)}
                                className={`flex items-center justify-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none text-left ${
                                  guidedStep === st.num
                                    ? "bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-400/50"
                                    : guidedStep > st.num
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                                    : "bg-slate-950/70 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                }`}
                              >
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 shadow ${
                                    guidedStep === st.num
                                      ? "bg-white text-indigo-700 font-black shadow-md"
                                      : guidedStep > st.num
                                      ? "bg-emerald-500 text-slate-950 font-black"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {guidedStep > st.num ? "✓" : st.num}
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-bold truncate">{st.title}</span>
                                  <span className={`text-[11px] truncate ${guidedStep === st.num ? "text-indigo-200" : "text-slate-400"}`}>
                                    {st.subtitle}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* STEPPER BODY: Spacious Left & Right 2-Column Grid */}
                        <div className="flex-1 min-h-[320px] sm:min-h-[360px] flex flex-col justify-start bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 gap-5 overflow-y-auto shadow-2xl">
                          {/* STEP 1: The Goal & Analogy (Side-by-Side Left & Right) */}
                          {guidedStep === 1 && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                              {/* Left Column: Goal Statement & Real-World Mental Model */}
                              <div className="lg:col-span-5 flex flex-col gap-4">
                                {/* Mission Card */}
                                <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col gap-3 shadow-xl">
                                  <div className="flex items-center gap-2 text-indigo-400">
                                    <div className="p-1 rounded-md bg-indigo-500/20 border border-indigo-500/30">
                                      <Sparkle className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                                      The Core Mission & Objective
                                    </span>
                                  </div>
                                  <h3 className="text-lg sm:text-xl font-black text-slate-100 leading-snug">
                                    {guide.step1_goal}
                                  </h3>
                                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                                    {guide.description}
                                  </p>
                                </div>

                                {/* Real-World Analogy Card */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-indigo-500/10 to-slate-950/90 border border-amber-500/30 flex items-start gap-3.5 shadow-xl">
                                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 shrink-0 mt-0.5">
                                    <Lightbulb className="h-5 w-5 text-amber-400" />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                                      Real-World Mental Model (Analogy)
                                    </span>
                                    <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-medium">
                                      {guide.step1_analogy}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Mini Preview Graphic + Core Invariants */}
                              <div className="lg:col-span-7 flex flex-col gap-4">
                                {/* Mini Preview Graphic */}
                                <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col gap-4 shadow-xl">
                                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                    <span className="text-xs uppercase font-mono tracking-widest text-indigo-300 font-bold">
                                      Mini Preview: How It Begins on Sample Data
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400">
                                      Initial Pass Demonstration
                                    </span>
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/80 rounded-xl border border-white/5 shadow-inner">
                                    <div className="flex flex-col items-center gap-1.5">
                                      <span className="text-xs text-slate-400 font-mono font-bold">
                                        Unsorted Input
                                      </span>
                                      <div className="flex gap-2">
                                        {guide.step1_miniBefore.map((val, idx) => (
                                          <span
                                            key={idx}
                                            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-white/10 text-sm sm:text-base font-mono font-black text-slate-100 shadow-md"
                                          >
                                            {val}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-1 text-center max-w-xs">
                                      <span className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-wider">
                                        Algorithmic Action
                                      </span>
                                      <span className="text-xs sm:text-sm text-slate-200 font-medium leading-normal p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 shadow-sm">
                                        {guide.step1_miniAction}
                                      </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-1.5">
                                      <span className="text-xs text-emerald-400 font-mono font-bold">
                                        After Pass Result
                                      </span>
                                      <div className="flex gap-2">
                                        {guide.step1_miniAfter.map((val, idx) => (
                                          <span
                                            key={idx}
                                            className={`px-3.5 py-2 rounded-xl border text-sm sm:text-base font-mono font-black shadow-md ${
                                              idx === guide.step1_miniAfter.length - 1 || idx === 0
                                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10"
                                                : "bg-slate-800 border-white/10 text-slate-100"
                                            }`}
                                          >
                                            {val}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Invariants & Guarantees */}
                                <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/20 flex flex-col gap-3 shadow-xl">
                                  <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-indigo-400" />
                                    Core Invariants & Guarantees
                                  </span>
                                  <ul className="flex flex-col gap-2 pl-1">
                                    {guide.invariants.map((inv, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 font-medium leading-relaxed"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        <span>{inv}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* STEP 2: How the Algorithm Decides (Side-by-Side Left & Right) */}
                          {guidedStep === 2 && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                              {/* Left Column: Decision Comparator & Movement Logic */}
                              <div className="lg:col-span-5 flex flex-col gap-4">
                                <div className="p-5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 flex flex-col gap-3 shadow-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono uppercase font-bold tracking-wider text-indigo-400">
                                      Decision Comparator & Action
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-mono font-bold">
                                      {guide.step2_actionType}
                                    </span>
                                  </div>
                                  <h3 className="text-base sm:text-lg font-mono font-black text-emerald-400 p-3.5 bg-slate-900 rounded-xl border border-emerald-500/20 shadow-inner">
                                    {guide.step2_decisionRule}
                                  </h3>
                                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                                    {guide.step2_howItDecides}
                                  </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs sm:text-sm text-slate-200 flex items-start gap-3 shadow-xl">
                                  <Compass className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                                  <div>
                                    <b className="text-slate-100 block mb-1 text-sm">Visualizer Movement Clues:</b>
                                    <span>
                                      Yellow/amber highlights indicate elements currently being evaluated in CPU registers. Red/rose animations indicate in-place exchanges, shifts, or partition relocations.
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Visualizer Legend / Cue Cards */}
                              <div className="lg:col-span-7 flex flex-col gap-3">
                                <span className="text-xs uppercase font-mono tracking-widest text-indigo-300 font-bold">
                                  What to Watch in the Visualizer (Visual Legend)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  {guide.visualizerGuide.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col justify-between gap-3 shadow-xl hover:border-indigo-500/30 transition-all"
                                    >
                                      <div className="flex flex-col gap-2">
                                        <span
                                          className={`self-start text-[10px] font-mono font-bold px-2.5 py-1 rounded-md ${item.colorClass}`}
                                        >
                                          {item.badge}
                                        </span>
                                        <h4 className="text-sm sm:text-base font-bold text-slate-100">
                                          {item.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                          {item.meaning}
                                        </p>
                                      </div>
                                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300">
                                        <b className="text-indigo-300 block mb-1 font-mono uppercase text-[10px]">
                                          Why this step happens:
                                        </b>
                                        {item.why}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* STEP 3: Best & Worst Case Scenarios (Side-by-Side Left & Right) */}
                          {guidedStep === 3 && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                              {/* Left Column: 4 Big-O Complexity Badges + Memory Model */}
                              <div className="lg:col-span-5 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col gap-1 shadow-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">
                                      Best Case Time
                                    </span>
                                    <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                                      {guide.timeBest}
                                    </span>
                                  </div>
                                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col gap-1 shadow-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">
                                      Average Time
                                    </span>
                                    <span className="text-lg sm:text-xl font-black text-indigo-400 font-mono">
                                      {guide.timeAvg}
                                    </span>
                                  </div>
                                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col gap-1 shadow-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">
                                      Worst Case Time
                                    </span>
                                    <span className="text-lg sm:text-xl font-black text-rose-400 font-mono">
                                      {guide.timeWorst}
                                    </span>
                                  </div>
                                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col gap-1 shadow-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">
                                      Space Complexity
                                    </span>
                                    <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                                      {guide.space}
                                    </span>
                                  </div>
                                </div>

                                {/* Memory & Stability Breakdown */}
                                <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col gap-3 shadow-xl">
                                  <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-indigo-400" />
                                    Memory Architecture & Stability
                                  </span>
                                  <div className="text-xs sm:text-sm text-slate-300 flex flex-col gap-2 font-medium leading-relaxed">
                                    <p><b>Auxiliary Space:</b> {guide.whySpace}</p>
                                    <p>
                                      <b>Stability:</b>{" "}
                                      {guide.stable
                                        ? "Guaranteed stable — duplicate values preserve their original relative order."
                                        : "Unstable — duplicate values may change relative order due to distant swaps."}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Best vs Worst Case Explanations */}
                              <div className="lg:col-span-7 flex flex-col gap-4">
                                <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex flex-col gap-2.5 shadow-xl">
                                  <div className="flex items-center gap-2.5 border-b border-emerald-500/20 pb-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                                    <span className="text-xs sm:text-sm font-mono font-black text-emerald-400 uppercase tracking-wide">
                                      Best-Case Scenario: {guide.step3_bestTitle}
                                    </span>
                                  </div>
                                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                                    {guide.step3_bestDetails}
                                  </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-slate-950/90 border border-rose-500/30 flex flex-col gap-2.5 shadow-xl">
                                  <div className="flex items-center gap-2.5 border-b border-rose-500/20 pb-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-md shadow-rose-400/50" />
                                    <span className="text-xs sm:text-sm font-mono font-black text-rose-400 uppercase tracking-wide">
                                      Worst-Case Scenario: {guide.step3_worstTitle}
                                    </span>
                                  </div>
                                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                                    {guide.step3_worstDetails}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* STEPPER FOOTER NAVIGATION */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl shrink-0 shadow-2xl mt-auto">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            {guidedStep > 1 && (
                              <button
                                onClick={() => setGuidedStep((guidedStep - 1) as 1 | 2 | 3)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/10 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 shadow"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Previous Step</span>
                              </button>
                            )}
                            {guidedStep < 3 && (
                              <button
                                onClick={() => setGuidedStep((guidedStep + 1) as 1 | 2 | 3)}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                              >
                                <span>Next: Step {guidedStep + 1}</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <button
                              onClick={async () => {
                                setViewMode("visualizer");
                                setIsConfigCollapsed(true);
                                if (steps.length === 0) {
                                  await startSorting();
                                }
                                setIsPlaying(false);
                                setCurrentStepIndex(0);
                              }}
                              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/10 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 shadow-lg group hover:border-white/20"
                            >
                              <div className="flex items-center gap-2">
                                <RotateCcw className="h-4 w-4 text-indigo-400 group-hover:-rotate-45 transition-transform" />
                                <span>Interactive Step-by-Step</span>
                              </div>
                              <span className="text-[10px] font-normal text-gray-400">
                                Paused at Step 1 for manual navigation (← / →)
                              </span>
                            </button>

                            <button
                              onClick={async () => {
                                setViewMode("visualizer");
                                setIsConfigCollapsed(true);
                                if (steps.length === 0) {
                                  await startSorting();
                                }
                                setIsPlaying(true);
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/30 cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all transform hover:scale-[1.02]"
                            >
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 animate-pulse" />
                                <span>Autoplay Simulation</span>
                              </div>
                              <span className="text-[10px] font-normal text-indigo-200">
                                Full animated execution at chosen speed
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                <div
                  className={`flex-1 min-h-0 ${
                    battleMode
                      ? "grid grid-cols-1 xl:grid-cols-2 gap-3"
                      : "flex flex-col w-full"
                  } h-full overflow-hidden`}
                >
                  {/* Primary Visualizer Card */}
                  <div className="w-full flex-1 min-h-0 bg-slate-950/40 rounded-xl p-2 sm:p-3 border border-white/5 flex flex-col justify-between overflow-hidden">
                    {executionError && (
                      <div className="mb-2 p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300 font-medium shrink-0">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                          {executionError}
                        </span>
                        <button
                          onClick={startSorting}
                          className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer transition-all"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Canvas Stage */}
                    <div className="flex-1 min-h-0 flex flex-col justify-center relative overflow-hidden">
                      <VisualizerFactory
                        array={array}
                        originalArray={originalArray}
                        steps={steps}
                        currentStepIndex={currentStepIndex}
                        isPlaying={isPlaying}
                        speed={speed}
                        onPlayPause={() => setIsPlaying(!isPlaying)}
                        onNext={() =>
                          currentStepIndex < steps.length - 1 &&
                          setCurrentStepIndex(currentStepIndex + 1)
                        }
                        onPrev={() =>
                          currentStepIndex > 0 &&
                          setCurrentStepIndex(currentStepIndex - 1)
                        }
                        onRestart={resetPlayback}
                        onJump={setCurrentStepIndex}
                        onSpeedChange={setSpeed}
                        zoom={zoom}
                        fullscreen={isFullscreen}
                        algorithmName={algorithm}
                        battleId={1}
                        ghostTrails={ghostTrails}
                      />
                    </div>

                    {/* Live State Action Banner */}
                    <div className="px-3.5 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/10 shadow-lg flex items-center justify-between gap-3 shrink-0 mt-2 select-none">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-sm shadow-emerald-400/50" />
                        {steps[currentStepIndex]?.event_type && (
                          <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-white/10 shrink-0">
                            {steps[currentStepIndex].event_type}
                          </span>
                        )}
                        <span
                          className="text-xs sm:text-sm font-mono font-medium text-slate-200 truncate"
                          title={steps[currentStepIndex]?.message || "Ready. Click Run to start visual execution."}
                        >
                          {steps[currentStepIndex]?.message || "Ready. Click Run to start visual execution."}
                        </span>
                      </div>
                      {steps.length > 0 && (
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-indigo-400 bg-indigo-500/15 px-2.5 py-1 rounded-lg border border-indigo-500/30 shrink-0 shadow-sm">
                          {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Battle Arena Visualizer 2 if Battle Mode is Active */}
                  {battleMode && (
                    <div className="w-full flex-1 min-h-0 bg-slate-950/40 rounded-xl p-2 sm:p-3 border border-pink-500/30 flex flex-col justify-between overflow-hidden">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 shrink-0">
                        <span className="text-xs font-bold text-pink-400 uppercase font-mono">
                          {algorithm2} Sort (Opponent)
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          Step: {stats2.step} | Swaps: {stats2.swaps}
                        </span>
                      </div>

                      {/* Opponent Live State Variables */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-pink-500/20 font-mono text-[11px] my-1.5 shrink-0 select-none">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                            <span className="text-gray-400 text-[10px] uppercase font-bold">Event:</span>
                            <span className="text-pink-400 font-extrabold uppercase tracking-wide">
                              {steps2[currentStepIndex2]?.event_type || "READY"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                            <span className="text-gray-400 text-[10px] uppercase font-bold">Compare:</span>
                            <span className="text-amber-400 font-extrabold">
                              {steps2[currentStepIndex2]?.compare && steps2[currentStepIndex2].compare.length > 0
                                ? `[${steps2[currentStepIndex2].compare.join(", ")}]`
                                : "None"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                            <span className="text-gray-400 text-[10px] uppercase font-bold">Swap / Shift:</span>
                            <span className="text-rose-400 font-extrabold">
                              {steps2[currentStepIndex2]?.swap && steps2[currentStepIndex2].swap.length > 0
                                ? `[${steps2[currentStepIndex2].swap.join(", ")}]`
                                : "None"}
                            </span>
                          </div>
                          {steps2[currentStepIndex2]?.pivot !== undefined && (
                            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                              <span className="text-gray-400 text-[10px] uppercase font-bold">Pivot:</span>
                              <span className="text-cyan-400 font-extrabold">
                                {steps2[currentStepIndex2].pivot}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-h-0 flex flex-col justify-center relative overflow-hidden py-1">
                        <VisualizerFactory
                          array={
                            steps2[currentStepIndex2]?.array || originalArray
                          }
                          originalArray={originalArray}
                          steps={steps2}
                          currentStepIndex={currentStepIndex2}
                          isPlaying={isPlaying}
                          speed={speed}
                          onPlayPause={() => setIsPlaying(!isPlaying)}
                          onNext={() =>
                            currentStepIndex2 < steps2.length - 1 &&
                            setCurrentStepIndex2(currentStepIndex2 + 1)
                          }
                          onPrev={() =>
                            currentStepIndex2 > 0 &&
                            setCurrentStepIndex2(currentStepIndex2 - 1)
                          }
                          onRestart={resetPlayback}
                          onJump={setCurrentStepIndex2}
                          onSpeedChange={setSpeed}
                          zoom={zoom}
                          fullscreen={isFullscreen}
                          algorithmName={algorithm2}
                          battleId={2}
                          ghostTrails={ghostTrails}
                        />
                      </div>

                      {/* Opponent Live State Action Banner */}
                      <div className="px-3.5 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-pink-500/20 shadow-lg flex items-center justify-between gap-3 shrink-0 mt-2 select-none">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse shrink-0 shadow-sm shadow-pink-400/50" />
                          {steps2[currentStepIndex2]?.event_type && (
                            <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-pink-300 border border-white/10 shrink-0">
                              {steps2[currentStepIndex2].event_type}
                            </span>
                          )}
                          <span
                            className="text-xs sm:text-sm font-mono font-medium text-pink-200 truncate"
                            title={steps2[currentStepIndex2]?.message || "Ready."}
                          >
                            {steps2[currentStepIndex2]?.message || "Ready."}
                          </span>
                        </div>
                        {steps2.length > 0 && (
                          <span className="text-[10px] sm:text-xs font-mono font-bold text-pink-400 bg-pink-500/15 px-2.5 py-1 rounded-lg border border-pink-500/30 shrink-0 shadow-sm">
                            {Math.round(((currentStepIndex2 + 1) / steps2.length) * 100)}% Complete
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Tutor Chat Drawer (Slide-out) */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: chatWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`bg-slate-900/90 backdrop-blur-md border-l border-white/10 flex flex-col h-full shrink-0 relative overflow-hidden ${
                isFullscreen ? "fixed right-0 top-0 bottom-0 z-[60] shadow-2xl bg-slate-950/95" : ""
              }`}
              style={{ width: `min(100%, ${chatWidth}px)` }}
            >
              <div
                ref={resizerRef}
                onMouseDown={handleMouseDown}
                className="hidden lg:block absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize bg-transparent hover:bg-indigo-500/20 active:bg-indigo-500/40 z-30 transition-colors"
              />

              {/* Chat Header */}
              <div className="p-3 border-b border-white/5 flex flex-col gap-2.5 bg-slate-950/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-indigo-400" />
                    <span className="font-bold text-xs text-white">
                      SortMentor Tutor
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        createEmptyChat();
                        setChatDrawerTab("chat");
                      }}
                      aria-label="Create new chat session"
                      className="p-1 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="New Chat Session"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    {chatDrawerTab === "chat" && (
                      <>
                        <button
                          onClick={exportChat}
                          aria-label="Export conversation"
                          className="p-1 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                          title="Export Conversation"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={promptClearChat}
                          aria-label="Clear chat messages"
                          className="p-1 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Clear Messages"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsChatOpen(false)}
                      aria-label="Close AI tutor drawer"
                      className="p-1 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* View Switcher Tabs: Active Chat vs Sessions History */}
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-950 rounded-xl border border-white/5 text-xs font-mono">
                  <button
                    onClick={() => setChatDrawerTab("chat")}
                    className={`py-1 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      chatDrawerTab === "chat"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Active Chat</span>
                  </button>
                  <button
                    onClick={() => setChatDrawerTab("sessions")}
                    className={`py-1 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      chatDrawerTab === "sessions"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <History className="h-3 w-3" />
                    <span>Sessions ({conversations.length})</span>
                  </button>
                </div>

                {chatDrawerTab === "sessions" && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search sessions..."
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg pl-7 pr-2.5 py-1 text-[11px] font-mono text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <Search className="absolute left-2 top-2 h-3 w-3 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Sessions List View */}
              {chatDrawerTab === "sessions" ? (
                <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center gap-2 text-slate-500 text-xs font-mono">
                      <MessageSquare className="h-8 w-8 text-slate-700" />
                      <span>No matching sessions found.</span>
                      <button
                        onClick={() => {
                          createEmptyChat();
                          setChatDrawerTab("chat");
                        }}
                        className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Start New Chat
                      </button>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const isActive = conv.id === activeChatId;
                      const isEditing = editingChatId === conv.id;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setActiveChatId(conv.id);
                            setChatDrawerTab("chat");
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative group ${
                            isActive
                              ? "bg-indigo-950/40 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30"
                              : "bg-slate-950/60 border-white/5 hover:border-white/15 hover:bg-slate-900/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            {isEditing ? (
                              <div
                                className="flex items-center gap-1 flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editTitleText}
                                  onChange={(e) => setEditTitleText(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && saveRenameConversation()}
                                  className="flex-1 bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={saveRenameConversation}
                                  aria-label="Save title"
                                  className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {conv.isPinned && (
                                  <Pin className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                                )}
                                <span className="font-bold text-xs text-white truncate">
                                  {conv.title}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => togglePinConversation(conv.id, e)}
                                aria-label={conv.isPinned ? "Unpin session" : "Pin session"}
                                className={`p-1 rounded hover:bg-slate-800 ${
                                  conv.isPinned ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
                                }`}
                                title={conv.isPinned ? "Unpin session" : "Pin to top"}
                              >
                                <Pin className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => startRenameConversation(conv.id, conv.title, e)}
                                aria-label="Rename session"
                                className="p-1 rounded hover:bg-slate-800 text-gray-500 hover:text-gray-300"
                                title="Rename"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => promptDeleteConversation(conv.id, e)}
                                aria-label="Delete session"
                                className="p-1 rounded hover:bg-slate-800 text-gray-500 hover:text-rose-400"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                            <span className="truncate max-w-[200px]">
                              {conv.messages[conv.messages.length - 1]?.text.slice(0, 40) || "Empty session"}...
                            </span>
                            <span className="shrink-0 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                              {conv.messages.length} msgs
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Messages Feed */
                <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                  {activeConversation?.messages.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-0.5 max-w-[85%] ${
                        chat.sender === "user"
                          ? "self-end items-end"
                          : "self-start items-start"
                      }`}
                    >
                      <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500 font-semibold">
                        {chat.sender === "user" ? "You" : "SortMentor"}
                      </span>
                      <div
                        className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                          chat.sender === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-slate-900/60 border border-white/5 text-gray-300 rounded-tl-none"
                        }`}
                      >
                        {renderMarkdown(chat.text)}
                      </div>
                    </div>
                  ))}

                  {isTutorThinking && (
                    <div className="self-start flex flex-col gap-0.5 max-w-[85%]">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500 font-semibold">
                        SortMentor
                      </span>
                      <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-xl rounded-tl-none flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 animate-bounce bg-indigo-400 rounded-full"></div>
                        <div className="h-1.5 w-1.5 animate-bounce bg-indigo-400 rounded-full delay-100"></div>
                        <div className="h-1.5 w-1.5 animate-bounce bg-indigo-400 rounded-full delay-200"></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Chat Input */}
              {chatDrawerTab === "chat" && (
                <div className="p-3 border-t border-white/5 bg-slate-950/40">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tutorMessage}
                      onChange={(e) => setTutorMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && askAITutor()}
                      placeholder="Ask why this swap happened..."
                      className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={askAITutor}
                      aria-label="Send message to AI Tutor"
                      className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Chat Trigger Button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            aria-label="Open AI Tutor Chat Drawer"
            className={`p-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl hover:shadow-indigo-600/40 transition-all cursor-pointer ring-2 ring-indigo-400/30 ${
              isFullscreen ? "fixed right-4 bottom-4 z-50" : "absolute right-4 bottom-4 z-10"
            }`}
            title="Open AI Tutor (Ask anything)"
          >
            <BrainCircuit className="h-5 w-5" />
          </button>
        )}

        {/* Floating Exit Fullscreen Button */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            aria-label="Exit Fullscreen (Esc)"
            className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-white/20 rounded-full text-xs font-bold text-gray-200 hover:text-white hover:bg-slate-800 backdrop-blur-md shadow-2xl cursor-pointer transition-all"
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Exit Fullscreen</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-gray-400 font-mono">
              Esc
            </kbd>
          </button>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-base text-white">Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={() => setIsShortcutsOpen(false)}
                  aria-label="Close shortcuts modal"
                  className="p-1 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs font-mono">
                {[
                  { key: "Space", desc: "Play or Pause execution" },
                  { key: "← / →", desc: "Step Backward / Step Forward" },
                  { key: "R", desc: "Reset array to initial state" },
                  { key: "T", desc: "Toggle Step Ghost Trails (Arcs & Silhouettes)" },
                  { key: "Esc", desc: "Exit Fullscreen / Close Panels" },
                  { key: "?", desc: "Toggle this Shortcuts Guide" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5"
                  >
                    <span className="text-slate-300 font-sans font-medium">{item.desc}</span>
                    <kbd className="px-2.5 py-1 bg-slate-800 border border-white/15 rounded-lg text-indigo-300 font-bold shadow-inner">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsShortcutsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200"
            >
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <h3 className="font-bold text-base text-white">{confirmModal.title}</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmModal.message}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {confirmModal.cancelLabel || "Cancel"}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  {confirmModal.confirmLabel || "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SortMentor() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <p className="text-xs text-indigo-300/60 font-semibold tracking-wide animate-pulse">
              Loading SortMentor Workspace...
            </p>
          </div>
        </div>
      }
    >
      <SortMentorContent />
    </Suspense>
  );
}