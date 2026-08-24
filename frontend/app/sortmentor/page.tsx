"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSortStore, SortStep } from "../../context/useSortStore";
import { useAuthStore } from "../../context/useAuthStore";
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  ArrowLeft, BrainCircuit, Swords, Sliders, Zap,
  Sparkles, Send, HelpCircle, GraduationCap, X,
  Plus, Trash2, Edit2, Download, Search, Pin,
  Volume2, Maximize2, Minimize2, Check, AlertCircle, Sparkle,
  ZoomIn, ZoomOut
} from "lucide-react";
import UserDropdown from "../../components/auth/UserDropdown";
import ShareButton from "../../components/ui/ShareButton";
import VisualizerFactory from "./components/visualizers/VisualizerFactory";
import { ALGO_LAYOUTS } from "./components/visualizers/BaseVisualizer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const CONCEPTUAL_WALKTHROUGHS: Record<string, string> = {
  bubble: "Compares adjacent elements side-by-side and swaps them if they are out of order, repeating this pass until the largest unsorted value 'bubbles up' to the end. Ideal for understanding the basic swap logic.",
  selection: "Repeatedly scans the unsorted region of the array to select the minimum element, and swaps it directly with the first unsorted element. This builds up the sorted region one element at a time from left to right.",
  insertion: "Builds a sorted section from left to right. It takes the next unsorted element and slides it backward into its correct position among the already sorted items, similar to how people sort playing cards in hand.",
  quick: "Uses a divide-and-conquer strategy: it chooses a 'pivot' element, partitions the array so smaller values go to the left and larger values go to the right, and then recursively sorts the sub-arrays.",
  merge: "Recursively splits the array in half until individual elements remain, then merges those sorted sub-arrays back together in order. This division is represented as a tree structure in the visualizer.",
  heap: "Converts the array into a Max Heap binary tree structure where the largest value is at the top root. It swaps the root to the end, shrinks the active heap, and rebuilds the heap order until fully sorted.",
  shell: "An optimization over Insertion Sort. It compares elements that are far apart using a dynamic 'gap' distance, then shrinks the gap and performs a final standard insertion sort when the gap reaches 1.",
  counting: "A non-comparison sorting algorithm. It counts the number of occurrences of each unique value, calculates their starting index offset, and places each element directly into its correct index in a temporary output array.",
  radix: "Sorts numbers digit-by-digit, starting from the least significant digit (ones place) up to the most significant digit (tens/hundreds place), using a stable sorting algorithm like Counting Sort at each digit step.",
  bucket: "Distributes the array elements into several sub-containers (buckets) based on their value ranges. Each bucket is then sorted individually using Insertion Sort, and the buckets are merged back together.",
  timsort: "A hybrid sorting algorithm derived from Merge Sort and Insertion Sort. It identifies small segments that are already sorted (runs), sorts remaining small chunks with Insertion Sort, and merges them using Merge Sort."
};

// CS Education Metadata & Pseudocode definitions
const ALGO_METADATA: Record<string, {
  name: string;
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  description: string;
  pseudocode: string[];
}> = {
  bubble: {
    name: "Bubble Sort",
    timeBest: "O(n)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    pseudocode: [
      "for i from 0 to n-1:",
      "  for j from 0 to n-i-2:",
      "    if arr[j] > arr[j+1]:",
      "      swap(arr[j], arr[j+1])"
    ]
  },
  selection: {
    name: "Selection Sort",
    timeBest: "O(n²)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    description: "Divides the input list into two parts: a sorted sublist of items built up from left to right and a sublist of the remaining unsorted items.",
    pseudocode: [
      "for i from 0 to n-1:",
      "  min_idx = i",
      "  for j from i+1 to n:",
      "    if arr[j] < arr[min_idx]: min_idx = j",
      "  swap(arr[i], arr[min_idx])"
    ]
  },
  insertion: {
    name: "Insertion Sort",
    timeBest: "O(n)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    description: "Builds the final sorted array one item at a time by inserting each new element into its proper position relative to previously sorted elements.",
    pseudocode: [
      "for i from 1 to n:",
      "  key = arr[i]",
      "  j = i - 1",
      "  while j >= 0 and arr[j] > key:",
      "    arr[j+1] = arr[j]",
      "    j = j - 1",
      "  arr[j+1] = key"
    ]
  },
  quick: {
    name: "Quick Sort",
    timeBest: "O(n log n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n²)",
    space: "O(log n)",
    description: "Divides the array into smaller sub-arrays around a pivot, then recursively sorts the sub-arrays.",
    pseudocode: [
      "quickSort(arr, low, high):",
      "  if low < high:",
      "    pi = partition(arr, low, high)",
      "    quickSort(arr, low, pi - 1)",
      "    quickSort(arr, pi + 1, high)"
    ]
  },
  merge: {
    name: "Merge Sort",
    timeBest: "O(n log n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
    description: "A divide-and-conquer algorithm that recursively splits the array in half, sorts each half, and merges the sorted halves back together.",
    pseudocode: [
      "mergeSort(arr, l, r):",
      "  if l < r:",
      "    m = l + (r-l)\u002f2",
      "    mergeSort(arr, l, m)",
      "    mergeSort(arr, m+1, r)",
      "    merge(arr, l, m, r)"
    ]
  },
  heap: {
    name: "Heap Sort",
    timeBest: "O(n log n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(1)",
    description: "Visualizes the array as a binary tree heap structure. Repeatedly extracts the maximum element from the heap and maintains the heap structure.",
    pseudocode: [
      "heapSort(arr):",
      "  buildMaxHeap(arr)",
      "  for i from n-1 down to 1:",
      "    swap(arr[0], arr[i])",
      "    maxHeapify(arr, 0, i)"
    ]
  },
  counting: {
    name: "Counting Sort",
    timeBest: "O(n+k)",
    timeAvg: "O(n+k)",
    timeWorst: "O(n+k)",
    space: "O(n+k)",
    description: "An integer sorting algorithm that counts the occurrences of each unique value to map their sorted positions without direct comparisons.",
    pseudocode: [
      "countingSort(arr):",
      "  count = array of zeros size max-min+1",
      "  for x in arr: count[x - min]++",
      "  for i from 1 to count.length: count[i] += count[i-1]",
      "  for x in arr from right to left:",
      "    output[count[x - min] - 1] = x",
      "    count[x - min]--"
    ]
  },
  radix: {
    name: "Radix Sort",
    timeBest: "O(nk)",
    timeAvg: "O(nk)",
    timeWorst: "O(nk)",
    space: "O(n+k)",
    description: "Sorts numbers digit by digit, from the least significant digit to the most significant digit using counting sort as a subroutine.",
    pseudocode: [
      "radixSort(arr):",
      "  max = getMax(arr)",
      "  for exp = 1; max \u002f exp > 0; exp *= 10:",
      "    countingSortByDigit(arr, exp)"
    ]
  },
  bucket: {
    name: "Bucket Sort",
    timeBest: "O(n+k)",
    timeAvg: "O(n+k)",
    timeWorst: "O(n²)",
    space: "O(n+k)",
    description: "Distributes elements into interval buckets, sorts each bucket individually (e.g. using insertion sort), and concatenates them.",
    pseudocode: [
      "bucketSort(arr):",
      "  buckets = list of empty buckets",
      "  for x in arr: insert x into bucket[f(x)]",
      "  for b in buckets: sort(b)",
      "  concatenate(buckets) into arr"
    ]
  },
  shell: {
    name: "Shell Sort",
    timeBest: "O(n log n)",
    timeAvg: "O(n^1.5)",
    timeWorst: "O(n²)",
    space: "O(1)",
    description: "An extension of insertion sort that allows comparing and swapping elements that are far apart using a diminishing gap size.",
    pseudocode: [
      "shellSort(arr):",
      "  for gap = n\u002f2 down to 1:",
      "    for i from gap to n-1:",
      "      temp = arr[i]",
      "      for j = i down to gap by step gap:",
      "        if arr[j-gap] > temp: arr[j] = arr[j-gap]",
      "        else: break",
      "      arr[j] = temp"
    ]
  },
  tim: {
    name: "Tim Sort",
    timeBest: "O(n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
    description: "A hybrid sorting algorithm derived from Merge Sort and Insertion Sort. It finds runs of elements that are already sorted, and sorts them further using Insertion Sort, then merges them using Merge Sort.",
    pseudocode: [
      "timSort(arr):",
      "  for i from 0 to n by RUN_SIZE:",
      "    insertionSort(arr, i, min(i+RUN_SIZE, n))",
      "  for size = RUN_SIZE; size < n; size = 2*size:",
      "    for left from 0 to n by 2*size:",
      "      merge(arr, left, left+size, min(left+2*size, n))"
    ]
  },
  timsort: {
    name: "Tim Sort",
    timeBest: "O(n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
    description: "A hybrid sorting algorithm derived from Merge Sort and Insertion Sort. It finds runs of elements that are already sorted, and sorts them further using Insertion Sort, then merges them using Merge Sort.",
    pseudocode: [
      "timSort(arr):",
      "  for i from 0 to n by RUN_SIZE:",
      "    insertionSort(arr, i, min(i+RUN_SIZE, n))",
      "  for size = RUN_SIZE; size < n; size = 2*size:",
      "    for left from 0 to n by 2*size:",
      "      merge(arr, left, left+size, min(left+2*size, n))"
    ]
  }
};

const ALGO_LEGENDS: Record<string, Array<{ color: string; label: string }>> = {
  bubble: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Swapping" },
    { color: "bg-indigo-500/20 border-indigo-500/40", label: "Active" },
  ],
  bubblesort: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Swapping" },
    { color: "bg-indigo-500/20 border-indigo-500/40", label: "Active" },
  ],
  selection: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Min Candidate" },
    { color: "bg-emerald-500/20 border-emerald-500/40", label: "Sorted" },
  ],
  selectionsort: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Min Candidate" },
    { color: "bg-emerald-500/20 border-emerald-500/40", label: "Sorted" },
  ],
  insertion: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Displaced" },
    { color: "bg-purple-500 border-purple-500", label: "Key Element" },
  ],
  insertionsort: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Displaced" },
    { color: "bg-purple-500 border-purple-500", label: "Key Element" },
  ],
  merge: [
    { color: "bg-amber-400/30 border-amber-400/40 text-amber-300", label: "Comparing" },
    { color: "bg-rose-500/30 border-rose-500/40 text-rose-300", label: "Swapped/Merged" },
    { color: "border-pink-500 bg-pink-500/10 text-pink-300", label: "Active Bounds" },
    { color: "border-indigo-500 bg-indigo-500/5 text-indigo-300", label: "Stack" },
  ],
  mergesort: [
    { color: "bg-amber-400/30 border-amber-400/40 text-amber-300", label: "Comparing" },
    { color: "bg-rose-500/30 border-rose-500/40 text-rose-300", label: "Swapped/Merged" },
    { color: "border-pink-500 bg-pink-500/10 text-pink-300", label: "Active Bounds" },
    { color: "border-indigo-500 bg-indigo-500/5 text-indigo-300", label: "Stack" },
  ],
  quick: [
    { color: "bg-amber-400 border-amber-400", label: "Comparing" },
    { color: "bg-rose-500 border-rose-500", label: "Swapping" },
    { color: "bg-cyan-400 border-cyan-400 text-slate-950", label: "Pivot" },
    { color: "border-indigo-500 bg-indigo-500/10", label: "Partition Bounds" },
  ],
  quicksort: [
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
  heapsort: [
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
  countingsort: [
    { color: "bg-amber-400/20 border-amber-400", label: "Frequency Tally" },
    { color: "bg-indigo-500/20 border-indigo-500", label: "Prefix Accumulator" },
    { color: "bg-emerald-500/20 border-emerald-500", label: "Sorted Output" },
  ],
  radix: [
    { color: "bg-amber-400/20 border-amber-400", label: "Digit Scan" },
    { color: "bg-indigo-500/20 border-indigo-500", label: "Bucket Dist" },
  ],
  radixsort: [
    { color: "bg-amber-400/20 border-amber-400", label: "Digit Scan" },
    { color: "bg-indigo-500/20 border-indigo-500", label: "Bucket Dist" },
  ],
  bucket: [
    { color: "bg-indigo-500/20 border-indigo-500/40", label: "Raw Range" },
    { color: "bg-pink-500/20 border-pink-500/40", label: "Distributed Buckets" },
  ],
  bucketsort: [
    { color: "bg-indigo-500/20 border-indigo-500/40", label: "Raw Range" },
    { color: "bg-pink-500/20 border-pink-500/40", label: "Distributed Buckets" },
  ],
  shell: [
    { color: "border-pink-500/50 text-pink-300", label: "Active Gap Group" },
    { color: "bg-amber-400 border-amber-400", label: "Interleaved Compares" },
  ],
  shellsort: [
    { color: "border-pink-500/50 text-pink-300", label: "Active Gap Group" },
    { color: "bg-amber-400 border-amber-400", label: "Interleaved Compares" },
  ],
  tim: [
    { color: "border-pink-500 bg-pink-500/10 text-pink-300", label: "Active Run Bounds" },
    { color: "bg-amber-400 border-amber-400", label: "Insertion Compare" },
    { color: "bg-rose-500 border-rose-500", label: "Insertion Swap/Shift" },
    { color: "border-indigo-500 bg-indigo-500/10 text-indigo-300", label: "Merge Active" }
  ],
  timsort: [
    { color: "border-pink-500 bg-pink-500/10 text-pink-300", label: "Active Run Bounds" },
    { color: "bg-amber-400 border-amber-400", label: "Insertion Compare" },
    { color: "bg-rose-500 border-rose-500", label: "Insertion Swap/Shift" },
    { color: "border-indigo-500 bg-indigo-500/10 text-indigo-300", label: "Merge Active" }
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

  // Zustand State
  const {
    array, originalArray, algorithm, steps, currentStepIndex, isPlaying, speed, metrics,
    battleMode, algorithm2, steps2, currentStepIndex2, metrics2,
    setArray, setOriginalArray, setAlgorithm, setAlgorithm2, setSteps, setSteps2,
    setCurrentStepIndex, setCurrentStepIndex2, setIsPlaying, setSpeed, setMetrics, setMetrics2,
    setBattleMode, resetPlayback
  } = useSortStore();

  // Core Configurations
  const [arraySize, setArraySize] = useState(12);
  const [presetType, setPresetType] = useState("random");
  const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Visualizer Layout state
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"intro" | "visualizer">("intro");
  const [isConfigCollapsed, setIsConfigCollapsed] = useState<boolean>(false);
  const visualizerCardRef = useRef<HTMLDivElement>(null);
  const [hoveredStepIdx, setHoveredStepIdx] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState<number>(0);

  // Chat Panel State
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(380);
  const [tutorMessage, setTutorMessage] = useState("");
  const [isTutorThinking, setIsTutorThinking] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");

  // Custom User Input Array State
  const [customArrayText, setCustomArrayText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Drag resizing ref
  const resizerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speed mapping (display vs logic delay)
  const displaySpeed = 1550 - speed;

  const algoParam = searchParams ? searchParams.get("algorithm") : null;

  // Save conversations to LocalStorage
  const saveConversations = (updated: Conversation[]) => {
    setConversations(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("sortmentor_conversations", JSON.stringify(updated));
    }
  };

  const createEmptyChat = () => {
    const newChat: Conversation = {
      id: Math.random().toString(36).substring(7),
      title: `Session: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      messages: [
        {
          sender: "ai",
          text: "Welcome! I am SortMentor. Choose an algorithm, generate a dataset, and let's explore how it performs step-by-step!",
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      isPinned: false,
      lastUpdated: new Date().toISOString()
    };
    const list = [newChat, ...conversations];
    saveConversations(list);
    setActiveChatId(newChat.id);
  };

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeChatId);
  }, [conversations, activeChatId]);

  // Generation presets helpers
  const generateNewArray = () => {
    setIsPlaying(false);
    resetPlayback();

    let newArr: number[] = [];
    if (presetType === "random") {
      newArr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 80) + 10);
    } else if (presetType === "sorted") {
      newArr = Array.from({ length: arraySize }, (_, i) => Math.floor((i / arraySize) * 80) + 15);
    } else if (presetType === "reversed") {
      newArr = Array.from({ length: arraySize }, (_, i) => Math.floor(((arraySize - i) / arraySize) * 80) + 15);
    } else if (presetType === "duplicates") {
      const base = [15, 30, 45, 60, 75];
      newArr = Array.from({ length: arraySize }, () => base[Math.floor(Math.random() * base.length)]);
    } else if (presetType === "nearly_sorted") {
      newArr = Array.from({ length: arraySize }, (_, i) => Math.floor((i / arraySize) * 80) + 15);
      // Swap 1 or 2 adjacent pairs
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
  };

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

  const jumpToStep = (idx: number) => {
    setIsPlaying(false);
    if (idx >= 0 && idx < steps.length) {
      setCurrentStepIndex(idx);
    }
    if (battleMode && idx >= 0 && idx < steps2.length) {
      setCurrentStepIndex2(idx);
    }
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (steps.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    const stepIdx = Math.round(progress * (steps.length - 1));
    setHoveredStepIdx(stepIdx);
    setTooltipX(x);
  };

  // --- EFFECT HOOKS ---

  // Handle URL Query Parameter sync (e.g. ?algorithm=quick)
  useEffect(() => {
    if (algoParam) {
      const sanitized = algoParam.replace("-sort", "").toLowerCase();
      const validAlgos = ["bubble", "selection", "insertion", "merge", "quick", "heap", "counting", "radix", "bucket", "shell", "tim"];
      if (validAlgos.includes(sanitized)) {
        setTimeout(() => {
          setAlgorithm(sanitized);
          setViewMode("visualizer");
        }, 0);
      }
    }
  }, [algoParam, setAlgorithm]);

  // Initialize or fetch conversation history from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sortmentor_conversations");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Conversation[];
          setTimeout(() => {
            setConversations(parsed);
            if (parsed.length > 0) {
              // Find active chat or default to first
              setActiveChatId(parsed[0].id);
            } else {
              createEmptyChat();
            }
          }, 0);
        } catch (e) {
          console.error("Failed parsing conversations", e);
          setTimeout(() => {
            createEmptyChat();
          }, 0);
        }
      } else {
        setTimeout(() => {
          createEmptyChat();
        }, 0);
      }
    }
  }, []);

  // Auth Protection
  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Reset viewMode when algorithm changes
  useEffect(() => {
    setTimeout(() => {
      setViewMode("intro");
    }, 0);
  }, [algorithm]);

  // Generate initial dataset when preset/size change
  useEffect(() => {
    setTimeout(() => {
      generateNewArray();
    }, 0);
  }, [arraySize, presetType]);

  // Sync default speed settings
  useEffect(() => {
    if (settings?.defaultSpeed) {
      const speedMap: Record<string, number> = {
        slow: 350,
        normal: 150,
        fast: 50
      };
      const targetSpeed = speedMap[settings.defaultSpeed];
      if (targetSpeed !== undefined) {
        setSpeed(targetSpeed);
      }
    }
  }, [settings?.defaultSpeed, setSpeed]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isTutorThinking]);

  // Synchronous auto-playback step loop
  useEffect(() => {
    if (isPlaying) {
      const runStep = () => {
        if (!battleMode) {
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            playTimerRef.current = setTimeout(runStep, speed);
          } else {
            setIsPlaying(false);
          }
        } else {
          const hasMore1 = currentStepIndex < steps.length - 1;
          const hasMore2 = currentStepIndex2 < steps2.length - 1;

          if (hasMore1 || hasMore2) {
            if (hasMore1) setCurrentStepIndex(currentStepIndex + 1);
            if (hasMore2) setCurrentStepIndex2(currentStepIndex2 + 1);
            playTimerRef.current = setTimeout(runStep, speed);
          } else {
            setIsPlaying(false);
          }
        }
      };
      playTimerRef.current = setTimeout(runStep, speed);
    } else {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
    }

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, currentStepIndex2, steps, steps2, speed, battleMode]);

  const applyCustomArray = () => {
    setValidationError(null);
    const cleaned = customArrayText.replace(/\s+/g, "");
    if (!cleaned) {
      setValidationError("Array input cannot be empty.");
      return;
    }

    const items = cleaned.split(",");
    const parsed: number[] = [];

    for (const val of items) {
      if (!/^-?\d+$/.test(val)) {
        setValidationError("Only integer numbers are allowed.");
        return;
      }
      parsed.push(Number(val));
    }

    if (parsed.length > 16) {
      setValidationError("Maximum array length is 16.");
      return;
    }
    if (parsed.length < 1) {
      setValidationError("Minimum array length is 1.");
      return;
    }

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

  const exportReplay = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        algorithm,
        array: originalArray,
        steps,
        metrics
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
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

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    try {
      // 1. Fetch main algorithm steps
      const res = await fetch(`${API_BASE}/sortmentor/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify({ data: originalArray, algorithm })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Server error");
      }

      setSteps(data.steps);
      setMetrics(data.metrics);
      setCurrentStepIndex(0);

      // 2. Fetch player 2 steps if in Battle Arena Mode
      if (battleMode) {
        const res2 = await fetch(`${API_BASE}/sortmentor/execute`, {
          method: "POST",
          headers,
          body: JSON.stringify({ data: originalArray, algorithm: algorithm2 })
        });
        const data2 = await res2.json();

        if (!res2.ok) {
          throw new Error(data2.detail || "Player 2 execution failed");
        }

        setSteps2(data2.steps);
        setMetrics2(data2.metrics);
        setCurrentStepIndex2(0);
      }

      setIsPlaying(true);
    } catch (err) {
      console.error("Sorting execution failed", err);
      setExecutionError("Connection failed. Please ensure backend sorting engine is active and reachable.");
    } finally {
      setIsLoadingVisuals(false);
    }
  };

  // Keyboard Shortcuts (Priority 11)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore keypress when typing in input/textarea fields
    if (
      document.activeElement?.tagName === "INPUT" ||
      document.activeElement?.tagName === "TEXTAREA" ||
      document.activeElement?.tagName === "SELECT"
    ) {
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
      case "Escape":
        e.preventDefault();
        setIsChatOpen(false);
        setIsExplanationOpen(false);
        break;
    }
  }, [isPlaying, steps, currentStepIndex, currentStepIndex2, battleMode, resetPlayback]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Chat Actions
  const appendMessage = (sender: "user" | "ai", text: string) => {
    if (!activeChatId) return;
    const list = conversations.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, { sender, text, timestamp: new Date().toLocaleTimeString() }],
          lastUpdated: new Date().toISOString()
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
        persona: settings?.preferredMentor || "Tutor"
      };

      const requestHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (idToken) {
        requestHeaders["Authorization"] = `Bearer ${idToken}`;
      }

      const res = await fetch(`${API_BASE}/sortmentor/explain_state`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      appendMessage("ai", data.explanation);
    } catch (err) {
      setTimeout(() => {
        appendMessage("ai", `I've analyzed the state of ${algorithm} at step ${currentStepIndex}. This state represents a ${steps[currentStepIndex]?.event_type || "initial"} event. Let me know if you need help debugging or understanding the pivot selection!`);
        setIsTutorThinking(false);
      }, 1000);
      return;
    }
    setIsTutorThinking(false);
  };

  const explainCurrentStep = async () => {
    const activeStep = steps[currentStepIndex];
    if (!activeStep) return;

    setIsTutorThinking(true);
    try {
      const requestHeaders: Record<string, string> = { "Content-Type": "application/json" };
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
          message: activeStep.message
        })
      });
      const data = await res.json();
      appendMessage("ai", data.explanation);
    } catch (err) {
      appendMessage("ai", `**Step ${currentStepIndex}**: ${activeStep.message}`);
    } finally {
      setIsTutorThinking(false);
    }
  };

  const clearChat = () => {
    if (!activeChatId) return;
    const list = conversations.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [
            {
              sender: "ai" as const,
              text: "Chat cleared. Welcome to SortMentor AI Tutor!",
              timestamp: new Date().toLocaleTimeString()
            }
          ],
          lastUpdated: new Date().toISOString()
        };
      }
      return c;
    });
    saveConversations(list);
  };

  const exportChat = () => {
    if (!activeConversation) return;
    const content = activeConversation.messages
      .map(m => `[${m.timestamp}] ${m.sender === "user" ? "You" : "SortMentor"}: ${m.text}`)
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat_export_${activeConversation.title.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = conversations.filter(c => c.id !== id);
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
    const list = conversations.map(c => {
      if (c.id === id) return { ...c, isPinned: !c.isPinned };
      return c;
    });
    saveConversations(list);
  };

  const startRenameConversation = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitleText(currentTitle);
  };

  const saveRenameConversation = () => {
    if (!editingChatId) return;
    const list = conversations.map(c => {
      if (c.id === editingChatId) return { ...c, title: editTitleText.trim() || c.title };
      return c;
    });
    saveConversations(list);
    setEditingChatId(null);
  };

  // Drag handle sizing for chat sidebar
  const handleMouseDown = () => {
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const newWidth = windowWidth - moveEvent.clientX;
      if (newWidth >= 300 && newWidth <= 600) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Helper for computing auto-scaled height (Priority 1)
  const getNormalizedHeight = (val: number) => {
    const minVal = Math.min(...originalArray, 0);
    const maxVal = Math.max(...originalArray, 1);
    const range = maxVal - minVal;
    if (range === 0) return "50%";
    const percentage = ((val - minVal) / range) * 82 + 18; // Keep at least 18% visible height
    return `${percentage}%`;
  };

  // Visual styling for array bars
  const getBarColorClass = (idx: number, activeStep: SortStep | undefined) => {
    if (!activeStep) return "bg-indigo-500/80";
    if (activeStep.swap && activeStep.swap.includes(idx)) return "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]";
    if (activeStep.compare && activeStep.compare.includes(idx)) return "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]";
    if (activeStep.pivot === idx) return "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]";
    if (activeStep.locked_indices && activeStep.locked_indices.includes(idx)) return "bg-emerald-500/80";
    return "bg-slate-700/50";
  };

  // Custom Markdown & Code block formatter
  const renderMarkdown = (text: string) => {
    if (!text || typeof text !== "string") return null;
    const parts = text.split("```");
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        // Code Block
        const lines = part.split("\n");
        const lang = lines[0].trim();
        const code = lines.slice(1).join("\n").trim();
        return (
          <div key={idx} className="my-2 rounded-lg bg-slate-950 border border-white/5 p-3 font-mono text-[11px] overflow-x-auto text-emerald-400">
            {lang && (
              <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase font-bold mb-1 border-b border-white/5 pb-1">
                <span>{lang}</span>
                <span className="normal-case text-gray-600">code block</span>
              </div>
            )}
            <pre><code>{code}</code></pre>
          </div>
        );
      }

      // Non-code block: split by lines to handle paragraphs and lists
      const lines = part.split("\n");
      return (
        <div key={idx} className="flex flex-col gap-1.5 my-1">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} className="h-1.5" />; // Spacer for empty lines

            // Format bold and inline code in a text segment
            const formatTextSegment = (txt: string) => {
              const boldParts = txt.split("**");
              return boldParts.map((bPart, bIdx) => {
                if (bIdx % 2 === 1) {
                  return (
                    <strong key={bIdx} className="font-bold text-white bg-white/10 px-1 rounded">
                      {bPart}
                    </strong>
                  );
                }
                const codeParts = bPart.split("`");
                return codeParts.map((cPart, cIdx) => {
                  if (cIdx % 2 === 1) {
                    return (
                      <code key={cIdx} className="bg-slate-950 border border-white/10 px-1.5 py-0.5 rounded font-mono text-[10px] text-rose-300">
                        {cPart}
                      </code>
                    );
                  }
                  return cPart;
                });
              });
            };

            // Check if it's a heading (e.g. ### Title)
            if (trimmed.startsWith("#")) {
              const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
              if (match) {
                const level = match[1].length;
                const content = match[2];
                const sizeClass = level === 1 
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

            // Check if it is a list item (starts with "-", "*", "+", or a number like "1.")
            const bulletMatch = trimmed.match(/^([\-\*\+]\s+|[0-9]+\.\s+)(.*)$/);
            if (bulletMatch) {
              const prefix = bulletMatch[1];
              const content = bulletMatch[2];
              const isNumbered = /^[0-9]/.test(prefix);

              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2 py-0.5 text-gray-300">
                  {isNumbered ? (
                    <span className="font-mono text-indigo-400 font-bold select-none text-[10px] mt-0.5">{prefix}</span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-xs leading-relaxed">{formatTextSegment(content)}</span>
                </div>
              );
            }

            // Normal text paragraph
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

  // Search filter for conversation history
  const filteredConversations = useMemo(() => {
    const term = chatSearchQuery.toLowerCase();
    return conversations
      .filter(c => c.title.toLowerCase().includes(term) || c.messages.some(m => m.text.toLowerCase().includes(term)))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
  }, [conversations, chatSearchQuery]);

  if (authLoading || !user) return null;

  // Active step values
  const activeStep = steps[currentStepIndex];
  const activeStep2 = steps2[currentStepIndex2];

  // Visualizer stats computation (Priority 8)
  const stats = {
    step: steps.length > 0 ? `${currentStepIndex + 1} / ${steps.length}` : "-",
    phase: activeStep?.event_type ? activeStep.event_type.toUpperCase() : "READY",
    compares: steps.length > 0 ? steps.slice(0, currentStepIndex + 1).filter(s => s.event_type === "compare").length : 0,
    swaps: steps.length > 0 ? steps.slice(0, currentStepIndex + 1).filter(s => s.event_type === "swap").length : 0,
    pivot: activeStep?.pivot !== undefined ? activeStep.pivot : "None",
    activeRange: activeStep?.compare ? activeStep.compare.join(", ") : "None",
  };

  const stats2 = {
    step: steps2.length > 0 ? `${currentStepIndex2 + 1} / ${steps2.length}` : "-",
    phase: activeStep2?.event_type ? activeStep2.event_type.toUpperCase() : "READY",
    compares: steps2.length > 0 ? steps2.slice(0, currentStepIndex2 + 1).filter(s => s.event_type === "compare").length : 0,
    swaps: steps2.length > 0 ? steps2.slice(0, currentStepIndex2 + 1).filter(s => s.event_type === "swap").length : 0,
    pivot: activeStep2?.pivot !== undefined ? activeStep2.pivot : "None",
  };

  return (
    <div className="h-screen bg-[#030712] flex flex-col font-sans select-none text-gray-100 overflow-hidden">
      
      {/* Top Header */}
      <header className={`glass-panel py-4 px-6 flex items-center justify-between border-b border-white/5 z-20 shrink-0 ${isFullscreen ? "hidden" : "flex"}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative overflow-hidden flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.png" alt="AlgoVerse" className="h-full w-full object-cover scale-110" />
            </div>
            <span className="font-bold text-lg text-white">SortMentor</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">AlgoVerse Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBattleMode(!battleMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs transition-all cursor-pointer border ${
              battleMode
                ? "bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border-indigo-500/50 text-indigo-200"
                : "bg-slate-900/60 border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10"
            }`}
          >
            <Swords className="h-4 w-4" />
            Battle Arena {battleMode ? "Active" : "OFF"}
          </button>
          <ShareButton />
          <UserDropdown />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side Workspace (Visualizer & Controls) */}
        <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-w-0 h-full overflow-hidden">
          
          {/* Main Visualizer Area */}
          <div className="w-full lg:w-[65%] flex flex-col gap-4 overflow-y-auto h-full min-w-0 pr-1 shrink-0">
          
          {/* Compact Settings Summary Row when collapsed */}
          <AnimatePresence initial={false}>
            {isConfigCollapsed && !isFullscreen && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 shrink-0"
              >
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Algorithm: <b className="text-white uppercase font-mono">{algorithm} Sort</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                    Size: <b className="text-white font-mono">{arraySize}</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Preset: <b className="text-white capitalize font-mono">{presetType}</b>
                  </span>
                  {battleMode && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      VS: <b className="text-white uppercase font-mono">{algorithm2} Sort</b>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsConfigCollapsed(false)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase cursor-pointer select-none transition-all flex items-center gap-1.5"
                >
                  <Sliders className="h-3 w-3" />
                  Edit Settings
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Algorithm Configurations Board & User Input (Collapsible) */}
          <AnimatePresence initial={false}>
            {!isConfigCollapsed && !isFullscreen && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                className="flex flex-col gap-4 shrink-0 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Primary Selector */}
                  <div className="glass-card p-4 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">Algorithm</span>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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

                  {/* Battle Arena Selector */}
                  {battleMode && (
                    <div className="glass-card p-4 flex flex-col gap-2 border-l-4 border-l-pink-500">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 font-bold">Opponent (Battle Arena)</span>
                      <select
                        value={algorithm2}
                        onChange={(e) => setAlgorithm2(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-pink-500 cursor-pointer"
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

                  {/* Presets */}
                  <div className="glass-card p-4 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold">Dataset Preset</span>
                    <select
                      value={presetType}
                      onChange={(e) => setPresetType(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="random">Randomize</option>
                      <option value="nearly_sorted">Nearly Sorted</option>
                      <option value="sorted">Best Case (Sorted)</option>
                      <option value="reversed">Worst Case (Reversed)</option>
                      <option value="duplicates">Many Duplicates</option>
                    </select>
                  </div>

                  {/* Size Configuration */}
                  <div className="glass-card p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold">
                      <span>Array Size</span>
                      <span className="text-white">{arraySize}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="16"
                      value={arraySize}
                      onChange={(e) => setArraySize(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* User Input & Validation Bar */}
                <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold">Custom Input Array</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={customArrayText}
                        onChange={(e) => setCustomArrayText(e.target.value)}
                        placeholder="e.g. 8, 3, -5, 1, 9, 2"
                        className="w-full glass-input text-xs font-mono pr-8"
                      />
                      {validationError && (
                        <div className="absolute right-2.5 top-2.5 text-rose-400" title={validationError}>
                          <AlertCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={applyCustomArray}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all"
                      >
                        Apply
                      </button>
                      <button
                        onClick={generateNewArray}
                        className="px-3 py-2 bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all"
                      >
                        Generate
                      </button>
                      <button
                        onClick={shuffleArray}
                        className="px-3 py-2 bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all"
                      >
                        Shuffle
                      </button>
                      <button
                        onClick={() => setIsConfigCollapsed(true)}
                        className="px-3 py-2 bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all flex items-center gap-1.5"
                        title="Collapse Settings"
                      >
                        <Minimize2 className="h-3.5 w-3.5" />
                        Collapse
                      </button>
                    </div>
                  </div>
                  {validationError && (
                    <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {validationError}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Visualizer Board Area (Priority 1) */}
          <div className="flex-grow flex flex-col relative w-full">
            <div className={`${battleMode ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : "flex flex-col w-full"}`}>
              
              {/* Visualizer 1 */}
              <div
                ref={visualizerCardRef}
                className={`glass-card p-5 flex flex-col relative justify-between transition-all w-full ${
                  isFullscreen 
                    ? "fixed inset-4 z-50 bg-slate-950/95 border-indigo-500/30" 
                    : ""
                }`}
                style={{
                  minHeight: isFullscreen ? "100%" : `${ALGO_LAYOUTS[algorithm]?.preferredHeight || 600}px`
                }}
              >
                
                {/* Header metrics */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-sm font-bold text-white uppercase font-mono">{algorithm} Sort</span>
                  </div>

                  {/* Control Actions (Zoom, Fullscreen, Export) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setViewMode(viewMode === "intro" ? "visualizer" : "intro")}
                      className={`p-1 rounded hover:bg-slate-900 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer ${
                        viewMode === "intro" ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" : ""
                      }`}
                      title="Toggle Algorithm Profile Definition"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
                      className="p-1 rounded hover:bg-slate-900 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] font-mono text-gray-500 select-none">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
                      className="p-1 rounded hover:bg-slate-900 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1 rounded hover:bg-slate-900 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer ml-1"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={exportReplay}
                      className="p-1 rounded hover:bg-slate-900 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="Export Replay JSON"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {metrics && (
                    <div className="hidden sm:flex gap-3 text-[10px] font-mono text-gray-400">
                      <span>Swaps: <b className="text-rose-400">{stats.swaps}</b></span>
                      <span>Compares: <b className="text-amber-400">{stats.compares}</b></span>
                      <span>Time: <b className="text-white">{metrics.time_ms.toFixed(1)}ms</b></span>
                    </div>
                  )}
                </div>

                {/* Dynamic Metrics display (Priority 8) */}
                <div className="grid grid-cols-5 gap-2 py-2 bg-slate-950/40 rounded-lg px-3 border border-white/5 my-2 text-[10px] font-mono shrink-0">
                  <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Step</span><span className="text-white font-bold">{stats.step}</span></div>
                  <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Phase</span><span className="text-indigo-400 font-bold truncate block">{stats.phase}</span></div>
                  <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Pivot</span><span className="text-cyan-400 font-bold">{stats.pivot}</span></div>
                  <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Compares</span><span className="text-amber-400 font-bold">{stats.compares}</span></div>
                  <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Swaps</span><span className="text-rose-400 font-bold">{stats.swaps}</span></div>
                </div>

                {/* Specialized Visualizer Integration */}
                <div className="flex-grow min-h-0 flex flex-col justify-end relative overflow-hidden py-2">
                  {viewMode === "intro" && !battleMode ? (
                    <div className="flex-grow flex flex-col justify-center items-center text-center p-6 gap-5 max-w-2xl mx-auto h-full min-h-[300px]">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 self-center uppercase tracking-widest font-mono">
                          Algorithm Profile
                        </span>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase font-sans">
                          {ALGO_METADATA[algorithm]?.name || algorithm}
                        </h2>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        {ALGO_METADATA[algorithm]?.description || "Choose an algorithm and dataset to begin learning."}
                      </p>

                      {/* Conceptual Walkthrough block */}
                      <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-left flex flex-col gap-1 w-full">
                        <span className="text-[8px] uppercase font-mono tracking-widest text-indigo-400 font-bold">Conceptual Walkthrough</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                          {CONCEPTUAL_WALKTHROUGHS[algorithm.toLowerCase()] || "Select an algorithm to view its visual concept description."}
                        </p>
                      </div>

                      {/* Complexity specs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full font-mono">
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-0.5">
                          <span className="text-[7px] text-gray-500 uppercase font-bold">Best Case</span>
                          <span className="text-[11px] font-bold text-emerald-400">{ALGO_METADATA[algorithm]?.timeBest || "-"}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-0.5">
                          <span className="text-[7px] text-gray-500 uppercase font-bold">Average</span>
                          <span className="text-[11px] font-bold text-indigo-400">{ALGO_METADATA[algorithm]?.timeAvg || "-"}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-0.5">
                          <span className="text-[7px] text-gray-500 uppercase font-bold">Worst Case</span>
                          <span className="text-[11px] font-bold text-rose-400">{ALGO_METADATA[algorithm]?.timeWorst || "-"}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-0.5">
                          <span className="text-[7px] text-gray-500 uppercase font-bold">Space</span>
                          <span className="text-[11px] font-bold text-amber-400">{ALGO_METADATA[algorithm]?.space || "-"}</span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          setViewMode("visualizer");
                          setIsConfigCollapsed(true);
                          if (steps.length === 0) {
                            await startSorting();
                          }
                          setTimeout(() => {
                            visualizerCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 100);
                        }}
                        className="mt-1 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/10 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5 select-none"
                      >
                        <Zap className="h-3.5 w-3.5 animate-pulse" />
                        See Interactive Visualization
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Context-Aware Color Legend */}
                      {ALGO_LEGENDS[algorithm.toLowerCase()] && (
                        <div className="flex flex-wrap items-center gap-3 py-1.5 px-3 rounded-lg bg-slate-950/20 border border-white/5 text-[9px] font-mono text-gray-400 mb-2 shrink-0 select-none">
                          <span className="text-gray-500 uppercase font-bold tracking-wider mr-1 font-sans">Legend:</span>
                          {ALGO_LEGENDS[algorithm.toLowerCase()].map((item, idx) => (
                            <span key={idx} className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${item.color.split(" ")[0]}`}></span>
                              <span>{item.label}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {executionError && (
                        <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between text-xs text-rose-300 font-medium">
                          <span className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                            {executionError}
                          </span>
                          <button
                            onClick={startSorting}
                            className="px-2.5 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold cursor-pointer transition-all"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      <VisualizerFactory
                        array={array}
                        originalArray={originalArray}
                        steps={steps}
                        currentStepIndex={currentStepIndex}
                        isPlaying={isPlaying}
                        speed={speed}
                        onPlayPause={() => setIsPlaying(!isPlaying)}
                        onNext={() => currentStepIndex < steps.length - 1 && setCurrentStepIndex(currentStepIndex + 1)}
                        onPrev={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)}
                        onRestart={resetPlayback}
                        onJump={setCurrentStepIndex}
                        onSpeedChange={setSpeed}
                        zoom={zoom}
                        fullscreen={isFullscreen}
                        algorithmName={algorithm}
                        battleId={1}
                      />

                      {/* Floating Explanation Hub toggle button */}
                      {!isExplanationOpen && !battleMode && !isFullscreen && (
                        <button
                          onClick={() => setIsExplanationOpen(true)}
                          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/10 hover:bg-slate-800 text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 shadow-lg cursor-pointer flex items-center gap-1.5 transition-all z-10"
                        >
                          <Sliders className="h-3 w-3" />
                          Open Explanation Hub
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Steps status log */}
                <div className="pt-3 text-center shrink-0 border-t border-white/5 mt-2">
                  <span className="text-xs text-gray-400 font-medium font-mono block truncate">
                    {steps[currentStepIndex]?.message || "Visualizer ready. Click run sorting to visualize."}
                  </span>
                </div>
              </div>

              {/* Visualizer 2 (Battle Arena) */}
              {battleMode && (
                <div 
                  className="glass-card p-5 flex flex-col relative justify-between border-t-2 border-t-pink-500 xl:border-t-0 xl:border-l-2 xl:border-l-pink-500"
                  style={{
                    minHeight: isFullscreen ? "100%" : `${ALGO_LAYOUTS[algorithm2]?.preferredHeight || 600}px`
                  }}
                >
                  
                  {/* Header metrics 2 */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
                      <span className="text-sm font-bold text-white uppercase font-mono">{algorithm2} Sort</span>
                    </div>
                    {metrics2 && (
                      <div className="flex gap-3 text-[10px] font-mono text-gray-400">
                        <span>Swaps: <b className="text-pink-400">{stats2.swaps}</b></span>
                        <span>Compares: <b className="text-amber-400">{stats2.compares}</b></span>
                        <span>Time: <b className="text-white">{metrics2.time_ms.toFixed(1)}ms</b></span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Metrics 2 */}
                  <div className="grid grid-cols-5 gap-2 py-2 bg-slate-950/40 rounded-lg px-3 border border-white/5 my-2 text-[10px] font-mono shrink-0">
                    <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Step</span><span className="text-white font-bold">{stats2.step}</span></div>
                    <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Phase</span><span className="text-pink-400 font-bold truncate block">{stats2.phase}</span></div>
                    <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Pivot</span><span className="text-cyan-400 font-bold">{stats2.pivot}</span></div>
                    <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Compares</span><span className="text-amber-400 font-bold">{stats2.compares}</span></div>
                    <div className="text-center"><span className="text-gray-500 block text-[8px] uppercase">Swaps</span><span className="text-pink-400 font-bold">{stats2.swaps}</span></div>
                  </div>

                  {/* Visualizer 2 Integration */}
                  <div className="flex-grow min-h-0 flex flex-col justify-end relative overflow-hidden py-2">
                    {/* Context-Aware Color Legend 2 */}
                    {ALGO_LEGENDS[algorithm2.toLowerCase()] && (
                      <div className="flex flex-wrap items-center gap-3 py-1.5 px-3 rounded-lg bg-slate-950/20 border border-white/5 text-[9px] font-mono text-gray-400 mb-2 shrink-0 select-none">
                        <span className="text-gray-500 uppercase font-bold tracking-wider mr-1 font-sans">Legend:</span>
                        {ALGO_LEGENDS[algorithm2.toLowerCase()].map((item, idx) => (
                          <span key={idx} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${item.color.split(" ")[0]}`}></span>
                            <span>{item.label}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <VisualizerFactory
                      array={steps2[currentStepIndex2]?.array || originalArray}
                      originalArray={originalArray}
                      steps={steps2}
                      currentStepIndex={currentStepIndex2}
                      isPlaying={isPlaying}
                      speed={speed}
                      onPlayPause={() => setIsPlaying(!isPlaying)}
                      onNext={() => currentStepIndex2 < steps2.length - 1 && setCurrentStepIndex2(currentStepIndex2 + 1)}
                      onPrev={() => currentStepIndex2 > 0 && setCurrentStepIndex2(currentStepIndex2 - 1)}
                      onRestart={resetPlayback}
                      onJump={setCurrentStepIndex2}
                      onSpeedChange={setSpeed}
                      zoom={zoom}
                      fullscreen={isFullscreen}
                      algorithmName={algorithm2}
                      battleId={2}
                    />
                  </div>

                  {/* Steps status log 2 */}
                  <div className="pt-3 text-center shrink-0 border-t border-white/5 mt-2">
                    <span className="text-xs text-gray-400 font-medium font-mono block truncate">
                      {steps2[currentStepIndex2]?.message || "Ready to compare."}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

            {/* Combined Playback Control Bar & Timeline (Priority 2 & 3) */}
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 shrink-0 mt-4">
              
              {/* Playback Controls & Settings Row */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={startSorting}
                    disabled={isLoadingVisuals}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white disabled:opacity-40 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all shrink-0"
                  >
                    {isLoadingVisuals ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    Run Sorting
                  </button>

                  {/* Reset Playback */}
                  <button
                    onClick={() => jumpToStep(0)}
                    disabled={steps.length === 0}
                    className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white cursor-pointer disabled:opacity-40"
                    title="Reset Playback"
                  >
                    <RotateCcw className="h-4.5 w-4.5" />
                  </button>

                  {/* Previous Step */}
                  <button
                    onClick={() => currentStepIndex > 0 && jumpToStep(currentStepIndex - 1)}
                    disabled={currentStepIndex <= 0}
                    className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white cursor-pointer disabled:opacity-40"
                    title="Previous Step"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>

                  {/* Play / Pause Toggle */}
                  <button
                    onClick={() => steps.length > 0 && setIsPlaying(!isPlaying)}
                    disabled={steps.length === 0}
                    className="p-3.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 cursor-pointer transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>

                  {/* Next Step */}
                  <button
                    onClick={() => currentStepIndex < steps.length - 1 && jumpToStep(currentStepIndex + 1)}
                    disabled={steps.length === 0 || currentStepIndex >= steps.length - 1}
                    className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white cursor-pointer disabled:opacity-40"
                    title="Next Step"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Speed Controller */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 font-bold">Speed</span>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    value={displaySpeed}
                    onChange={(e) => setSpeed(1550 - Number(e.target.value))}
                    disabled={steps.length === 0}
                    className="w-24 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-gray-400 min-w-[42px] text-right">{speed}ms</span>
                </div>

                {/* Zoom & Fullscreen Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(1)}
                    disabled={zoom === 1}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-[9px] font-mono text-gray-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                    title="Reset Zoom"
                  >
                    Reset Zoom
                  </button>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Interactive Playback Timeline Track */}
              <div className="border-t border-white/5 pt-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 select-none">
                    <span>Playback Timeline</span>
                    <span>Step {currentStepIndex + 1} / {Math.max(1, steps.length)}</span>
                  </div>
                  <div 
                    className="relative flex items-center w-full group py-2"
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
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                    />

                    {/* Hover Tooltip bubble */}
                    {hoveredStepIdx !== null && steps[hoveredStepIdx] && (
                      <div
                        className="absolute bottom-full mb-3 bg-slate-950/95 border border-indigo-500/20 text-gray-200 text-[10px] font-sans px-2.5 py-1.5 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] pointer-events-none select-none z-30 w-52 break-words -translate-x-1/2 backdrop-blur"
                        style={{ left: `${tooltipX}px` }}
                      >
                        <div className="font-bold text-indigo-400 mb-0.5 font-mono">Step {hoveredStepIdx + 1} ({steps[hoveredStepIdx].event_type}):</div>
                        <div className="leading-normal">{steps[hoveredStepIdx].message}</div>
                      </div>
                    )}

                    {steps.length > 0 && steps.length <= 30 && (
                      <div className="absolute inset-x-0 flex justify-between h-1.5 items-center pointer-events-none px-[3px]">
                        {steps.map((step, idx) => {
                          const isActive = idx === currentStepIndex;
                          const isSwap = step.event_type === "swap" || step.event_type === "merge";
                          const isCompare = step.event_type === "comparison";

                          let tickBg = "bg-slate-700";
                          if (isActive) tickBg = "bg-indigo-400 scale-125";
                          else if (isSwap) tickBg = "bg-rose-500/80";
                          else if (isCompare) tickBg = "bg-amber-400/80";

                          return (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${tickBg}`}
                              title={`Step ${idx + 1}: ${step.message}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Sticky Side Explanation Hub */}
          {isExplanationOpen && !battleMode && !isFullscreen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-[35%] flex flex-col glass-panel p-5 border border-white/5 rounded-2xl h-full min-w-[320px] max-w-[440px] overflow-y-auto shrink-0 bg-slate-900/40 gap-4 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsExplanationOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-white/5 text-gray-500 hover:text-white transition-all cursor-pointer z-10"
                title="Close Explanation Hub"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col gap-1 border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono uppercase font-semibold">Explanation Hub</span>
                  <span className="text-[10px] font-semibold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 font-mono">
                    Step {currentStepIndex + 1} / {steps.length}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-400 font-mono uppercase tracking-tight mt-1 gap-2">
                  <span>
                    Complexity: <span className="text-indigo-300 font-bold">Time {ALGO_METADATA[algorithm]?.timeAvg || "O(n²)"}</span> | <span className="text-emerald-300 font-bold">Space {ALGO_METADATA[algorithm]?.space || "O(1)"}</span>
                  </span>
                  
                  {/* Live SVG Complexity Sparkline */}
                  {steps.length > 0 && (
                    <div className="flex items-center gap-2 bg-slate-950/60 px-2 py-0.5 rounded border border-white/5" title="Live operation progress compared to theoretical curve">
                      <span className="text-[8px] text-gray-500 font-bold font-sans">Growth:</span>
                      <svg width="80" height="16" className="overflow-visible select-none">
                        {/* Draw base curve */}
                        <path
                          d={
                            ["bubble", "selection", "insertion", "shell"].includes(algorithm.toLowerCase())
                              ? "M 0,16 Q 40,16 80,2"
                              : ["merge", "quick", "heap", "timsort"].includes(algorithm.toLowerCase())
                                ? "M 0,16 C 30,12 50,6 80,2"
                                : "M 0,16 L 80,2"
                          }
                          fill="none"
                          stroke="rgba(99, 102, 241, 0.25)"
                          strokeWidth="1.5"
                        />
                        {/* Draw progress curve path */}
                        <path
                          d={
                            ["bubble", "selection", "insertion", "shell"].includes(algorithm.toLowerCase())
                              ? `M 0,16 Q ${40 * (currentStepIndex / (steps.length - 1 || 1))} ${16 - (14 * Math.pow(currentStepIndex / (steps.length - 1 || 1), 2))} ${80 * (currentStepIndex / (steps.length - 1 || 1))}, ${16 - (14 * Math.pow(currentStepIndex / (steps.length - 1 || 1), 2))}`
                              : `M 0,16 L ${80 * (currentStepIndex / (steps.length - 1 || 1))}, ${16 - (14 * (currentStepIndex / (steps.length - 1 || 1)))}`
                          }
                          fill="none"
                          stroke="rgba(99, 102, 241, 0.85)"
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                        {/* Tracer Dot */}
                        <circle
                          cx={80 * (currentStepIndex / (steps.length - 1 || 1))}
                          cy={
                            16 - (
                              ["bubble", "selection", "insertion", "shell"].includes(algorithm.toLowerCase())
                                ? Math.pow(currentStepIndex / (steps.length - 1 || 1), 2) * 14
                                : (currentStepIndex / (steps.length - 1 || 1)) * 14
                            )
                          }
                          r="2.5"
                          className="fill-indigo-400 shadow shadow-indigo-500/50 transition-all duration-300"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow flex flex-col gap-4 min-h-0 overflow-y-auto pt-1 pr-1 text-[11px] leading-relaxed">
                
                {/* Action Description */}
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col gap-1.5 shrink-0">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-indigo-400 font-mono block">Current Action</span>
                  <p className="text-gray-300 font-medium">
                    {steps[currentStepIndex]?.message || "No sorting operations running. Custom array loaded."}
                  </p>
                </div>

                {/* State variables */}
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col gap-1.5 font-mono text-[10px] shrink-0">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-rose-400 font-mono block">State Variables</span>
                  {steps[currentStepIndex] ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-gray-500">Event:</span><span className="text-white uppercase font-bold">{steps[currentStepIndex].event_type}</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-gray-500">Comparisons:</span><span className="text-amber-400 font-bold">{steps[currentStepIndex].compare?.join(', ') || 'None'}</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-gray-500">Swaps:</span><span className="text-rose-400 font-bold">{steps[currentStepIndex].swap?.join(', ') || 'None'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Pivot:</span><span className="text-cyan-400 font-bold">{steps[currentStepIndex].pivot !== undefined ? steps[currentStepIndex].pivot : 'None'}</span></div>
                    </div>
                  ) : (
                    <span className="text-gray-600">No active state variables</span>
                  )}
                </div>

                {/* Pseudocode Panel */}
                <div className="flex flex-col gap-1.5 bg-slate-950/40 rounded-xl p-3.5 border border-white/5 flex-grow min-h-[140px]">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-400 font-mono block shrink-0">Algorithm Pseudocode</span>
                  <div className="flex flex-col gap-0.5 select-none overflow-y-auto flex-grow">
                    {(ALGO_METADATA[algorithm]?.pseudocode || ALGO_METADATA.bubble.pseudocode).map((line, lineIdx) => {
                      const activeLine = getActivePseudocodeLine(algorithm, steps[currentStepIndex]?.event_type || "");
                      const isHighlighted = activeLine === lineIdx;
                      return (
                        <div
                          key={lineIdx}
                          className={`px-2 py-0.5 font-mono text-[9px] rounded transition-all whitespace-pre ${
                            isHighlighted
                              ? "bg-indigo-500/20 border-l-2 border-indigo-500 text-indigo-200 font-bold"
                              : "text-gray-500 font-medium"
                          }`}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Explain Current Step trigger */}
              <div className="flex justify-end pt-2 border-t border-white/5 shrink-0">
                <button
                  onClick={explainCurrentStep}
                  disabled={steps.length === 0}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold cursor-pointer disabled:opacity-40 select-none flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] w-full justify-center"
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Ask AI to Explain Step
                </button>
              </div>
            </motion.div>
          )}

          </div>

        <AnimatePresence>
          {isChatOpen && !isFullscreen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: chatWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="glass-panel border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col h-[480px] lg:h-auto shrink-0 relative overflow-hidden"
              style={{ width: `${chatWidth}px` }}
            >
              
              {/* Drag resizing handle */}
              <div
                ref={resizerRef}
                onMouseDown={handleMouseDown}
                className="hidden lg:block absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize bg-transparent hover:bg-indigo-500/20 active:bg-indigo-500/40 z-30 transition-colors"
              />

              {/* Sidebar Header: Chat Session Picker */}
              <div className="p-4 border-b border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-400" />
                    <span className="font-bold text-sm text-white">SortMentor Tutor</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={createEmptyChat}
                      className="p-1 hover:bg-slate-900 border border-transparent hover:border-white/5 rounded text-gray-400 hover:text-white"
                      title="New Chat Session"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="p-1 hover:bg-slate-900 border border-transparent hover:border-white/5 rounded text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Conversation History Drawer / Pinned Convers list */}
                <div className="flex flex-col gap-2 relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search sessions..."
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      className="w-full glass-input pl-8 py-1.5 text-xs font-mono"
                    />
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  </div>

                  {/* Chats list */}
                  <div className="max-h-[110px] overflow-y-auto flex flex-col gap-1 border border-white/5 rounded-lg p-1.5 bg-slate-950/40">
                    {filteredConversations.length === 0 ? (
                      <span className="text-[10px] text-gray-500 text-center font-mono py-2">No matching sessions</span>
                    ) : (
                      filteredConversations.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                          className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer font-mono group transition-colors ${
                            chat.id === activeChatId
                              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                              : "hover:bg-white/5 text-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
                            <button
                              onClick={(e) => togglePinConversation(chat.id, e)}
                              className={`p-0.5 rounded transition-all hover:bg-white/5 ${chat.isPinned ? "text-pink-400" : "text-gray-600 group-hover:text-gray-400"}`}
                            >
                              <Pin className="h-3 w-3 fill-current" />
                            </button>

                            {editingChatId === chat.id ? (
                              <input
                                type="text"
                                value={editTitleText}
                                onChange={(e) => setEditTitleText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && saveRenameConversation()}
                                onBlur={saveRenameConversation}
                                className="bg-slate-900 border border-white/10 text-xs px-1 text-white max-w-[120px] rounded focus:outline-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="truncate">{chat.title}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => startRenameConversation(chat.id, chat.title, e)}
                              className="p-0.5 rounded text-gray-500 hover:text-white"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => deleteConversation(chat.id, e)}
                              className="p-0.5 rounded text-gray-500 hover:text-rose-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Session Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {activeConversation?.messages.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1 max-w-[85%] ${
                      chat.sender === "user" ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500">
                      {chat.sender === "user" ? "You" : "SortMentor"}
                    </span>
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
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
                  <div className="self-start flex flex-col gap-1 max-w-[85%]">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500">SortMentor</span>
                    <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl rounded-tl-none flex items-center gap-2">
                      <div className="h-1.5 w-1.5 animate-bounce bg-indigo-400 rounded-full"></div>
                      <div className="h-1.5 w-1.5 animate-bounce bg-indigo-400 rounded-full delay-100"></div>
                      <div className="h-1.5 w-1.5 animate-bounce bg-indigo-400 rounded-full delay-200"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Controller Actions: Explain, Clear, Export */}
              <div className="px-4 py-2 border-t border-white/5 bg-slate-950/20 flex justify-between items-center gap-2">
                {steps.length > 0 && (
                  <button
                    onClick={explainCurrentStep}
                    disabled={isTutorThinking}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Sparkle className="h-3 w-3" />
                    Explain Step
                  </button>
                )}

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={exportChat}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-white/5 text-gray-400 hover:text-white text-[10px] cursor-pointer transition-all"
                    title="Export Chat Log"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </button>
                  <button
                    onClick={clearChat}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-white/5 text-rose-400 hover:text-rose-300 text-[10px] cursor-pointer transition-all"
                    title="Clear Chat Session"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Tutor Message input */}
              <div className="p-4 border-t border-white/5 bg-slate-950/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tutorMessage}
                    onChange={(e) => setTutorMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askAITutor()}
                    placeholder="Ask e.g. Why did this swap happen?"
                    className="flex-1 glass-input text-xs"
                  />
                  <button
                    onClick={askAITutor}
                    className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Chat Toggle Button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="absolute right-4 top-4 p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl hover:shadow-indigo-600/30 z-10 transition-all cursor-pointer"
            title="Open AI Tutor"
          >
            <GraduationCap className="h-5 w-5" />
          </button>
        )}

      </div>
    </div>
  );
}

export default function SortMentor() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-xs text-indigo-300/60 font-semibold tracking-wide animate-pulse">Loading SortMentor Workspace...</p>
        </div>
      </div>
    }>
      <SortMentorContent />
    </Suspense>
  );
}

