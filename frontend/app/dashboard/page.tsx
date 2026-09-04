"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../context/useAuthStore";
import { 
  BrainCircuit, ArrowRight, Lock, SlidersHorizontal, Sparkles, 
  Code, ChevronRight, ArrowUpRight, CheckCircle2, HelpCircle, 
  Info, Terminal, BookOpen, Loader2, Play, RotateCcw, Activity,
  ArrowUpDown, ArrowUp, ArrowDown, Layers, X
} from "lucide-react";
import UserDropdown from "../../components/auth/UserDropdown";
import ShareButton from "../../components/ui/ShareButton";

interface AlgorithmData {
  id: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Intermediate" | "Hard";
  bestCase: string;
  avgCase: string;
  worstCase: string;
  spaceComplexity: string;
  stable: boolean;
  inPlace: boolean;
  adaptive: boolean;
  description: string;
  useCase: string;
}

const ALGORITHMS: AlgorithmData[] = [
  {
    id: "bubble",
    name: "Bubble Sort",
    category: "Comparison Based",
    difficulty: "Easy",
    bestCase: "O(n)",
    avgCase: "O(n²)",
    worstCase: "O(n²)",
    spaceComplexity: "O(1)",
    stable: true,
    inPlace: true,
    adaptive: true,
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    useCase: "Educational purposes, small datasets, or verifying nearly sorted lists."
  },
  {
    id: "selection",
    name: "Selection Sort",
    category: "Comparison Based",
    difficulty: "Easy",
    bestCase: "O(n²)",
    avgCase: "O(n²)",
    worstCase: "O(n²)",
    spaceComplexity: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: false,
    description: "Divides the array into sorted and unsorted parts, repeatedly finding the minimum element from the unsorted part.",
    useCase: "Memory-constrained environments where write operations are costly."
  },
  {
    id: "insertion",
    name: "Insertion Sort",
    category: "Comparison Based",
    difficulty: "Easy",
    bestCase: "O(n)",
    avgCase: "O(n²)",
    worstCase: "O(n²)",
    spaceComplexity: "O(1)",
    stable: true,
    inPlace: true,
    adaptive: true,
    description: "Builds the sorted array one item at a time by repeatedly inserting the current element into its correct position.",
    useCase: "Nearly sorted arrays, online data streams, or small datasets (n < 50)."
  },
  {
    id: "merge",
    name: "Merge Sort",
    category: "Divide & Conquer",
    difficulty: "Intermediate",
    bestCase: "O(n log n)",
    avgCase: "O(n log n)",
    worstCase: "O(n log n)",
    spaceComplexity: "O(n)",
    stable: true,
    inPlace: false,
    adaptive: false,
    description: "Divides the input array into two halves, calls itself recursively for the halves, and then merges the two sorted halves.",
    useCase: "Stable sorting of large datasets, external sorting (disk storage), linked lists."
  },
  {
    id: "quick",
    name: "Quick Sort",
    category: "Divide & Conquer",
    difficulty: "Intermediate",
    bestCase: "O(n log n)",
    avgCase: "O(n log n)",
    worstCase: "O(n²)",
    spaceComplexity: "O(log n)",
    stable: false,
    inPlace: true,
    adaptive: false,
    description: "Selects a pivot element and partitions the array, putting smaller elements to the left and larger to the right.",
    useCase: "General-purpose high-performance in-memory sorting."
  },
  {
    id: "heap",
    name: "Heap Sort",
    category: "Comparison Based",
    difficulty: "Intermediate",
    bestCase: "O(n log n)",
    avgCase: "O(n log n)",
    worstCase: "O(n log n)",
    spaceComplexity: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: false,
    description: "Visualizes the array as a binary heap structure, repeatedly extracts the maximum element and rebuilds the heap.",
    useCase: "Systems requiring guaranteed O(n log n) without auxiliary memory overhead."
  },
  {
    id: "counting",
    name: "Counting Sort",
    category: "Non-Comparison Based",
    difficulty: "Intermediate",
    bestCase: "O(n + k)",
    avgCase: "O(n + k)",
    worstCase: "O(n + k)",
    spaceComplexity: "O(n + k)",
    stable: true,
    inPlace: false,
    adaptive: false,
    description: "Counts occurrences of each unique element and uses prefix sums to place elements directly in their sorted index.",
    useCase: "Sorting integers with a small, limited range of keys (k)."
  },
  {
    id: "radix",
    name: "Radix Sort",
    category: "Non-Comparison Based",
    difficulty: "Intermediate",
    bestCase: "O(d * (n + k))",
    avgCase: "O(d * (n + k))",
    worstCase: "O(d * (n + k))",
    spaceComplexity: "O(n + k)",
    stable: true,
    inPlace: false,
    adaptive: false,
    description: "Sorts integers digit-by-digit from least significant to most significant digit using a stable sorting subroutine.",
    useCase: "Sorting large integers, strings, or fixed-length keys."
  },
  {
    id: "bucket",
    name: "Bucket Sort",
    category: "Non-Comparison Based",
    difficulty: "Intermediate",
    bestCase: "O(n + k)",
    avgCase: "O(n + k)",
    worstCase: "O(n²)",
    spaceComplexity: "O(n + k)",
    stable: true,
    inPlace: false,
    adaptive: false,
    description: "Distributes elements into buckets, sorts each bucket individually (e.g. via Insertion Sort), and concatenates them.",
    useCase: "Floating-point numbers uniformly distributed over a range [0, 1)."
  },
  {
    id: "shell",
    name: "Shell Sort",
    category: "Comparison Based",
    difficulty: "Intermediate",
    bestCase: "O(n log n)",
    avgCase: "O(n^(1.25))",
    worstCase: "O(n²)",
    spaceComplexity: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: true,
    description: "An extension of Insertion Sort that allows exchange of far apart elements, reducing gaps step-by-step.",
    useCase: "Medium-sized datasets when auxiliary memory is highly restricted."
  },
  {
    id: "tim",
    name: "Tim Sort",
    category: "Comparison Based",
    difficulty: "Hard",
    bestCase: "O(n)",
    avgCase: "O(n log n)",
    worstCase: "O(n log n)",
    spaceComplexity: "O(n)",
    stable: true,
    inPlace: false,
    adaptive: true,
    description: "A hybrid sorting algorithm derived from Merge Sort and Insertion Sort, designed to perform well on real-world datasets.",
    useCase: "Standard libraries of Python (list.sort) and Java (Arrays.sort)."}
];

interface SandboxStep {
  array: number[];
  activeIndices: number[];
  actionType: "compare" | "swap" | "pivot" | "sorted" | "insert";
  message: string;
}

const generateSandboxSteps = (algoId: string, base: number[]): SandboxStep[] => {
  const a = [...base];

  switch (algoId) {
    case "bubble":
      return [
        { array: [42, 12, 78, 23, 51], activeIndices: [0, 1], actionType: "compare", message: "Pass 1: Compare 42 & 12 (inversion detected)" },
        { array: [12, 42, 78, 23, 51], activeIndices: [0, 1], actionType: "swap", message: "Swapped 42 and 12 -> [12, 42, 78, 23, 51]" },
        { array: [12, 42, 78, 23, 51], activeIndices: [1, 2], actionType: "compare", message: "Compare 42 & 78 -> already in order" },
        { array: [12, 42, 23, 78, 51], activeIndices: [2, 3], actionType: "swap", message: "Compare 78 & 23 -> swapped 78 & 23" },
        { array: [12, 42, 23, 51, 78], activeIndices: [3, 4], actionType: "swap", message: "Compare 78 & 51 -> 78 settles at end index" },
        { array: [12, 23, 42, 51, 78], activeIndices: [1, 2], actionType: "swap", message: "Pass 2: Swapped 42 & 23 -> Array fully sorted!" },
        { array: [12, 23, 42, 51, 78], activeIndices: [0, 1, 2, 3, 4], actionType: "sorted", message: "✓ Bubble Sort Complete: All elements in non-decreasing order." }
      ];

    case "selection":
      return [
        { array: [42, 12, 78, 23, 51], activeIndices: [1], actionType: "compare", message: "Scan unsorted part: Found minimum value 12 at index 1" },
        { array: [12, 42, 78, 23, 51], activeIndices: [0, 1], actionType: "swap", message: "Swapped min 12 into locked prefix index 0" },
        { array: [12, 42, 78, 23, 51], activeIndices: [3], actionType: "compare", message: "Scan [42, 78, 23, 51]: Found minimum value 23 at index 3" },
        { array: [12, 23, 78, 42, 51], activeIndices: [1, 3], actionType: "swap", message: "Swapped 23 into prefix index 1" },
        { array: [12, 23, 42, 78, 51], activeIndices: [2, 3], actionType: "swap", message: "Scan [78, 42, 51]: Swapped min 42 into index 2" },
        { array: [12, 23, 42, 51, 78], activeIndices: [3, 4], actionType: "swap", message: "Scan [78, 51]: Swapped 51 into index 3" },
        { array: [12, 23, 42, 51, 78], activeIndices: [0, 1, 2, 3, 4], actionType: "sorted", message: "✓ Selection Sort Complete: All minimums positioned." }
      ];

    case "insertion":
      return [
        { array: [42, 12, 78, 23, 51], activeIndices: [1], actionType: "insert", message: "Extract key 12, shift 42 rightward" },
        { array: [12, 42, 78, 23, 51], activeIndices: [0], actionType: "swap", message: "Inserted 12 at sorted prefix head -> [12, 42]" },
        { array: [12, 42, 78, 23, 51], activeIndices: [2], actionType: "insert", message: "Extract key 78 > 42 -> already in place" },
        { array: [12, 23, 42, 78, 51], activeIndices: [1, 2, 3], actionType: "swap", message: "Extract key 23, shifted 78 & 42 right -> inserted 23" },
        { array: [12, 23, 42, 51, 78], activeIndices: [3, 4], actionType: "swap", message: "Extract key 51, shifted 78 right -> inserted 51" },
        { array: [12, 23, 42, 51, 78], activeIndices: [0, 1, 2, 3, 4], actionType: "sorted", message: "✓ Insertion Sort Complete: All keys positioned." }
      ];

    case "quick":
      return [
        { array: [42, 12, 78, 23, 51], activeIndices: [4], actionType: "pivot", message: "Selected pivot: 51. Partition into < 51 and ≥ 51" },
        { array: [42, 12, 23, 78, 51], activeIndices: [2, 3], actionType: "swap", message: "Moved elements < 51 ([42, 12, 23]) to the left" },
        { array: [42, 12, 23, 51, 78], activeIndices: [3, 4], actionType: "pivot", message: "Placed pivot 51 at boundary index 3" },
        { array: [12, 23, 42, 51, 78], activeIndices: [0, 1, 2], actionType: "swap", message: "Conquered left partition [42, 12, 23] around pivot 23" },
        { array: [12, 23, 42, 51, 78], activeIndices: [0, 1, 2, 3, 4], actionType: "sorted", message: "✓ Quick Sort Complete: Partitions sorted and combined." }
      ];

    case "merge":
      return [
        { array: [42, 12, 78, 23, 51], activeIndices: [0, 1, 2, 3, 4], actionType: "compare", message: "Divide into Left [42, 12] and Right [78, 23, 51]" },
        { array: [12, 42, 78, 23, 51], activeIndices: [0, 1], actionType: "swap", message: "Conquer Left half: Merged into sorted [12, 42]" },
        { array: [12, 42, 23, 51, 78], activeIndices: [2, 3, 4], actionType: "swap", message: "Conquer Right half: Merged into sorted [23, 51, 78]" },
        { array: [12, 23, 42, 51, 78], activeIndices: [0, 1, 2, 3, 4], actionType: "sorted", message: "✓ Merge Sort Complete: 2-way merge into final sorted array." }
      ];

    case "heap":
      return [
        { array: [78, 51, 42, 23, 12], activeIndices: [0, 1, 2], actionType: "pivot", message: "Build Max-Heap: Root node is maximum element 78" },
        { array: [51, 23, 42, 12, 78], activeIndices: [0, 4], actionType: "swap", message: "Extract root 78 to end boundary, sift down 51" },
        { array: [42, 23, 12, 51, 78], activeIndices: [0, 3], actionType: "swap", message: "Extract root 51 to index 3, sift down 42" },
        { array: [12, 23, 42, 51, 78], activeIndices: [0, 1, 2, 3, 4], actionType: "sorted", message: "✓ Heap Sort Complete: Extracted all elements in order." }
      ];

    default:
      return [
        { array: [42, 12, 78, 23, 51], activeIndices: [0, 1, 2, 3, 4], actionType: "compare", message: `Tallying frequencies and distributing keys...` },
        { array: [12, 23, 42, 51, 78], activeIndices: [0, 1, 2, 3, 4], actionType: "sorted", message: `✓ ${algoId.toUpperCase()} Sort Complete: Keys placed stably.` }
      ];
  }
};

export default function DashboardPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  // Active Category & Property Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");

  // Comparison Table Sorting
  const [tableSortKey, setTableSortKey] = useState<keyof AlgorithmData>("name");
  const [tableSortDir, setTableSortDir] = useState<"asc" | "desc">("asc");

  // Locked modules feedback toast
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // Interactive sandbox state
  const [previewArray, setPreviewArray] = useState<number[]>([42, 12, 78, 23, 51]);
  const [previewActiveIndices, setPreviewActiveIndices] = useState<number[]>([]);
  const [previewActionType, setPreviewActionType] = useState<"compare" | "swap" | "pivot" | "sorted" | "insert">("compare");
  const [previewMessage, setPreviewMessage] = useState<string>("Click 'Run Sandbox Sort' to watch real algorithmic step transitions.");
  const [previewAlgorithm, setPreviewAlgorithm] = useState<string>("quick");
  const [isPreviewSorting, setIsPreviewSorting] = useState<boolean>(false);
  const [isPreviewSorted, setIsPreviewSorted] = useState<boolean>(false);



  // Client-side filtering of algorithms with clean taxonomy
  const filteredAlgos = useMemo(() => {
    return ALGORITHMS.filter(algo => {
      // Category filter check
      if (categoryFilter === "comparison" && algo.category !== "Comparison Based" && algo.category !== "Divide & Conquer") return false;
      if (categoryFilter === "divide-conquer" && algo.category !== "Divide & Conquer") return false;
      if (categoryFilter === "non-comparison" && algo.category !== "Non-Comparison Based") return false;

      // Property filter check
      if (propertyFilter === "stable" && !algo.stable) return false;
      if (propertyFilter === "inplace" && !algo.inPlace) return false;
      if (propertyFilter === "adaptive" && !algo.adaptive) return false;

      return true;
    });
  }, [categoryFilter, propertyFilter]);

  // Sorted algorithms for comparison table
  const sortedTableAlgos = useMemo(() => {
    const list = [...ALGORITHMS];
    list.sort((a, b) => {
      const valA = a[tableSortKey];
      const valB = b[tableSortKey];

      if (typeof valA === "boolean") {
        const numA = valA ? 1 : 0;
        const numB = valB ? 1 : 0;
        return tableSortDir === "asc" ? numA - numB : numB - numA;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return tableSortDir === "asc" 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return 0;
    });
    return list;
  }, [tableSortKey, tableSortDir]);

  const handleTableSort = (key: keyof AlgorithmData) => {
    if (tableSortKey === key) {
      setTableSortDir(tableSortDir === "asc" ? "desc" : "asc");
    } else {
      setTableSortKey(key);
      setTableSortDir("asc");
    }
  };

  const showLockedFeedback = (domainName: string) => {
    setLockedNotice(`${domainName} module is currently in development — coming in our upcoming release!`);
    setTimeout(() => {
      setLockedNotice(null);
    }, 3500);
  };

  // Algorithm-specific sandbox sorting execution
  const runPreviewSort = () => {
    if (isPreviewSorting) return;
    setIsPreviewSorting(true);
    setIsPreviewSorted(false);

    const steps = generateSandboxSteps(previewAlgorithm, [42, 12, 78, 23, 51]);
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        const s = steps[currentIdx];
        setPreviewArray(s.array);
        setPreviewActiveIndices(s.activeIndices);
        setPreviewActionType(s.actionType);
        setPreviewMessage(s.message);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsPreviewSorting(false);
        setIsPreviewSorted(true);
      }
    }, 600);
  };

  const resetPreview = () => {
    setPreviewArray([42, 12, 78, 23, 51]);
    setPreviewActiveIndices([]);
    setPreviewActionType("compare");
    setPreviewMessage("Select an algorithm and click 'Run Sandbox Sort'.");
    setIsPreviewSorted(false);
    setIsPreviewSorting(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-indigo-300/60 font-medium">Loading AlgoVerse Dashboard...</p>
        </div>
      </div>
    );
  }

  const navigateToVisualizer = (algoId: string) => {
    router.push(`/sortmentor?algorithm=${algoId}`);
  };

  return (
    <div className="min-h-screen bg-[#030712] py-6 px-4 sm:px-6 lg:px-8 text-gray-300">
      
      {/* Top Main Navigation */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="relative overflow-hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 shadow-[0_0_10px_rgba(99,102,241,0.15)] bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.png" alt="AlgoVerse" className="h-full w-full object-cover scale-110" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              Algo<span className="text-gradient">Verse</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
            <span className="text-white border-b-2 border-indigo-500 pb-1 cursor-default">Sorting</span>
            <button
              onClick={() => showLockedFeedback("Searching")}
              className="text-gray-500 hover:text-gray-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Searching</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-gray-400 font-mono flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-gray-500" /> Soon
              </span>
            </button>
            <button
              onClick={() => showLockedFeedback("Trees")}
              className="text-gray-500 hover:text-gray-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Trees</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-gray-400 font-mono flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-gray-500" /> Soon
              </span>
            </button>
            <button
              onClick={() => showLockedFeedback("Graphs")}
              className="text-gray-500 hover:text-gray-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Graphs</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-gray-400 font-mono flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-gray-500" /> Soon
              </span>
            </button>
            <button
              onClick={() => showLockedFeedback("Dynamic Programming")}
              className="text-gray-500 hover:text-gray-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>DP</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-gray-400 font-mono flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-gray-500" /> Soon
              </span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ShareButton />
          <UserDropdown />
        </div>
      </header>

      <main className="max-w-6xl mx-auto flex flex-col gap-12 pt-8 pb-16">

        {/* 1. PROFESSIONAL HERO SECTION */}
        <section className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border border-white/5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500/30 via-pink-500/20 to-transparent"></div>
          <div className="flex-1 flex flex-col gap-4 text-left">
            <span className="text-xs uppercase font-mono tracking-widest font-bold text-indigo-400">Sorting Algorithms</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Understand how algorithms organize data.
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl">
              Explore 11+ sorting techniques through interactive visualization, complexity analysis, and practical examples.
            </p>
            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => document.getElementById("library")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all text-white shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Explore Sorting Library ↓
                <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => router.push("/sortmentor")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 border border-white/10 hover:border-white/20 font-semibold text-sm transition-all text-white cursor-pointer"
              >
                Launch SortMentor Workspace →
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex flex-col gap-3 p-5 rounded-2xl bg-slate-950/40 border border-white/5">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Active learning domain</span>
            <h2 className="text-lg font-bold text-white">Sorting Section Active</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Analyze swaps, partitioning boundaries, and pivots directly. Use interactive datasets to test efficiency.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">11 Algos Implemented</span>
              <span className="text-[10px] font-semibold bg-pink-500/10 text-pink-300 px-2 py-0.5 rounded">SortMentor AI Enabled</span>
            </div>
          </div>
        </section>

        {/* Locked Feature Toast Notice */}
        <AnimatePresence>
          {lockedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-indigo-200 text-xs font-mono flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                <span>{lockedNotice}</span>
              </div>
              <button
                onClick={() => setLockedNotice(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. DOMAIN SECTION INTRO */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-white/5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Sorting Algorithms Overview</h2>
            <p className="text-sm text-gray-400 max-w-2xl">
              Explore, compare, and visualize how sorting algorithms transform data step by step. Learn the theory, compare complexities, and launch the SortMentor interactive workspace.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => document.getElementById("library")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-2 text-xs font-bold text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-lg cursor-pointer"
            >
              Browse Library ↓
            </button>
            <button 
              onClick={() => router.push("/sortmentor")}
              className="px-4 py-2 text-xs font-bold text-pink-400 bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/20 rounded-lg cursor-pointer"
            >
              Launch SortMentor Workspace →
            </button>
          </div>
        </section>

        {/* 3. ALGORITHM LIBRARY & TAXONOMY FILTERS */}
        <section id="library" className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Sorting Algorithm Library</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">
                Showing <b className="text-white">{filteredAlgos.length}</b> of {ALGORITHMS.length} Algorithms
              </span>
            </div>
            
            {/* Structured Dual-Tier Taxonomy Filter */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-white/5">
              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase px-1">Category:</span>
                {[
                  { id: "all", label: "All Categories" },
                  { id: "comparison", label: "Comparison-Based" },
                  { id: "divide-conquer", label: "Divide & Conquer" },
                  { id: "non-comparison", label: "Non-Comparison" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setCategoryFilter(opt.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      categoryFilter === opt.id 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                        : "text-gray-400 hover:text-white bg-slate-900/40 border border-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Property Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase px-1">Properties:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "stable", label: "Stable Only" },
                  { id: "inplace", label: "In-Place O(1)" },
                  { id: "adaptive", label: "Adaptive" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPropertyFilter(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      propertyFilter === opt.id 
                        ? "bg-pink-600 text-white shadow-md shadow-pink-600/20" 
                        : "text-gray-400 hover:text-white bg-slate-900/40 border border-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Algorithm Grid with Uniform Card Heights and Differentiated Direct Linking */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlgos.map(algo => (
              <div
                key={algo.id}
                className="glass-card p-6 flex flex-col justify-between h-full border border-white/5 bg-slate-900/35 relative overflow-hidden group rounded-2xl"
              >
                {/* Category Accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500/20 group-hover:bg-indigo-500/50 transition-colors"></div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{algo.name}</h4>
                    <div className="flex gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        algo.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                        algo.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {algo.difficulty}
                      </span>
                      <span className="text-[9px] font-bold bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                        {algo.stable ? "Stable" : "Unstable"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[42px] line-clamp-2">{algo.description}</p>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/5 pt-3 my-2">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-500 block">Average Time:</span>
                      <code className="font-mono text-indigo-300">{algo.avgCase}</code>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Worst Time:</span>
                      <code className="font-mono text-indigo-300">{algo.worstCase}</code>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Space Complexity:</span>
                      <code className="font-mono text-pink-300">{algo.spaceComplexity}</code>
                    </div>
                    <div>
                      <span className="text-gray-500 block">In-Place:</span>
                      <span className="font-semibold text-gray-300">{algo.inPlace ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <div className="text-[11px] mt-1 border-t border-white/5 pt-2">
                    <span className="text-gray-500 block font-semibold">Typical Use Case:</span>
                    <p className="text-gray-400 text-xs italic min-h-[36px] line-clamp-2">{algo.useCase}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto border-t border-white/5 pt-3">
                  <button 
                    onClick={() => router.push(`/sortmentor?algorithm=${algo.id}&mode=intro`)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 hover:border-indigo-500/30 text-xs font-semibold text-center text-gray-300 hover:text-white bg-slate-900/60 transition-all cursor-pointer"
                    title={`Open 3-Step Guided Theory for ${algo.name}`}
                  >
                    3-Step Theory
                  </button>
                  <button 
                    onClick={() => navigateToVisualizer(algo.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-xs font-bold text-white transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
                    title={`Launch Visualizer for ${algo.name}`}
                  >
                    Visualize →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. ALGORITHM SPOTLIGHT */}
        <section className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-900 via-indigo-950/10 to-slate-900 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-pink-400" /> Featured Algorithm Spotlight
            </span>
            <h3 className="text-xl font-bold text-white">Merge Sort</h3>
            <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
              &ldquo;Understand divide-and-conquer sorting through recursive splitting and merging.&rdquo; Divide input array into halves, sort halves recursively, and join them stably.
            </p>
            <div className="flex gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500">Time Complexity:</span> <code className="text-indigo-300">O(n log n)</code>
              </div>
              <div>
                <span className="text-gray-500">Space Complexity:</span> <code className="text-pink-300">O(n)</code>
              </div>
              <div>
                <span className="text-gray-500">Stable:</span> <span className="text-emerald-400 font-semibold">Yes</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigateToVisualizer("merge")}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer self-stretch md:self-auto text-center"
          >
            Learn Merge Sort
          </button>
        </section>

        {/* 5. SORTING FUNDAMENTALS (THEORY) */}
        <section id="fundamentals" className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Sorting Fundamentals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white">What is Sorting?</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sorting is the process of arranging a collection of data in a specific order (ascending or descending). It is a foundational operation in computer science that accelerates search algorithms (like binary search) and improves database indexing.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-indigo-300">Comparison-Based Sorting</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                These algorithms compare elements using ordering operators (like `&lt;` or `&gt;`) to determine relations. The theoretical lower bound for comparison sorting is **O(n log n)** average/worst case.
                <br /><span className="text-[10px] text-gray-500 font-mono mt-1 block">Examples: Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Tim</span>
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-pink-300">Non-Comparison Sorting</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                By making assumptions about the input data properties (e.g. keys are integers in a bounded range), these algorithms sort without direct comparison, breaking the O(n log n) barrier down to linear complexity **O(n)**.
                <br /><span className="text-[10px] text-gray-500 font-mono mt-1 block">Examples: Counting, Radix, Bucket</span>
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white">Stability</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                A sorting algorithm is stable if it preserves the relative order of duplicate elements. If two records have identical keys, their relative order is guaranteed to be unchanged after sorting. This is critical for secondary sorting runs.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white">In-Place Sorting</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                An in-place algorithm sorts the input collection without using extra auxiliary memory relative to the input size. Typically, it requires only a constant amount **O(1)** of extra space.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white">Adaptive Sorting</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                An adaptive algorithm changes its behavioral execution to run faster when the input data is already partially or fully sorted. For instance, Insertion Sort executes in linear **O(n)** time on sorted arrays.
              </p>
            </div>
          </div>
        </section>

        {/* 6. ALGORITHM COMPARISON TABLE (INTERACTIVE CLICK-TO-SORT) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">Compare Sorting Algorithms</h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Click column headers to sort</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40 shadow-inner">
            <table className="w-full text-left text-xs text-gray-400 min-w-[750px]">
              <thead className="bg-slate-900 text-white font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  {[
                    { key: "name", label: "Algorithm" },
                    { key: "bestCase", label: "Best Case" },
                    { key: "avgCase", label: "Average Case" },
                    { key: "worstCase", label: "Worst Case" },
                    { key: "spaceComplexity", label: "Space Aux" },
                    { key: "stable", label: "Stable" },
                    { key: "inPlace", label: "In-Place" },
                    { key: "adaptive", label: "Adaptive" },
                    { key: "difficulty", label: "Difficulty" },
                  ].map(col => (
                    <th 
                      key={col.key}
                      onClick={() => handleTableSort(col.key as keyof AlgorithmData)}
                      className="p-3.5 cursor-pointer hover:bg-white/10 transition-colors select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {tableSortKey === col.key ? (
                          tableSortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-indigo-400" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-2.5 w-2.5 text-gray-600 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedTableAlgos.map(algo => (
                  <tr 
                    key={algo.id} 
                    onClick={() => navigateToVisualizer(algo.id)}
                    className="hover:bg-indigo-500/5 transition-colors cursor-pointer"
                    title={`Click to open ${algo.name} in SortMentor`}
                  >
                    <td className="p-3.5 font-bold text-white font-mono flex items-center gap-1.5">
                      <span>{algo.name}</span>
                      <ArrowUpRight className="h-3 w-3 text-gray-600 opacity-0 group-hover:opacity-100" />
                    </td>
                    <td className="p-3.5 font-mono text-emerald-300">{algo.bestCase}</td>
                    <td className="p-3.5 font-mono text-indigo-300">{algo.avgCase}</td>
                    <td className="p-3.5 font-mono text-rose-300">{algo.worstCase}</td>
                    <td className="p-3.5 font-mono text-pink-300">{algo.spaceComplexity}</td>
                    <td className="p-3.5 font-semibold">
                      <span className={algo.stable ? "text-emerald-400" : "text-gray-500"}>
                        {algo.stable ? "✓ Yes" : "✗ No"}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold">
                      <span className={algo.inPlace ? "text-emerald-400" : "text-gray-500"}>
                        {algo.inPlace ? "✓ Yes" : "✗ No"}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold">
                      <span className={algo.adaptive ? "text-emerald-400" : "text-gray-500"}>
                        {algo.adaptive ? "✓ Yes" : "✗ No"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        algo.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                        algo.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {algo.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. "WHICH ALGORITHM SHOULD I USE?" */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Which Sorting Algorithm Should You Use?</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { scenario: "Nearly sorted data", rec: "Insertion Sort / Tim Sort", reason: "Minimizes comparisons and operations on sorted indices." },
              { scenario: "Guaranteed O(n log n)", rec: "Merge Sort / Heap Sort", reason: "Consistent complexity boundaries across all distributions." },
              { scenario: "Memory constrained", rec: "Heap Sort", reason: "Guarantees O(n log n) with strict O(1) in-place auxiliary space." },
              { scenario: "Integer data with limited range", rec: "Counting Sort", reason: "Outperforms comparison sorters, sorting in O(n + k) linear time." },
              { scenario: "Large integer keys", rec: "Radix Sort", reason: "Stable, digit-by-digit buckets for wide ranges." },
              { scenario: "General-purpose partitioning", rec: "Quick Sort", reason: "Highly efficient cache-locality offsets worst-case risk." },
              { scenario: "Small datasets (n < 50)", rec: "Insertion Sort", reason: "Low overhead constant factor beats asymptotic curves." },
              { scenario: "Stable floating points", rec: "Bucket Sort / Merge Sort", reason: "Maintains duplicate ordering in decimals." }
            ].map((d, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border-l-4 border-indigo-500 border-white/5 flex flex-col gap-2 relative overflow-hidden">
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">{d.scenario}</span>
                <span className="text-sm font-bold text-white mt-1">{d.rec}</span>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{d.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. GENUINE INTERACTIVE SORTING PREVIEW */}
        <section className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/40 flex flex-col lg:flex-row gap-8 justify-between items-stretch">
          <div className="flex-1 flex flex-col gap-4 justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">Interactive Sandbox Preview</span>
              <h3 className="text-xl font-bold text-white">Live Algorithmic Step-Through</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
                Select an algorithm to watch its distinct sorting subroutine in action. Each algorithm demonstrates its actual comparisons, pivot selection, or minimum element swaps.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono">Algorithm:</span>
                <select 
                  value={previewAlgorithm} 
                  onChange={(e) => {
                    setPreviewAlgorithm(e.target.value);
                    resetPreview();
                  }}
                  className="bg-slate-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="quick">Quick Sort (Pivot Partition)</option>
                  <option value="bubble">Bubble Sort (Adjacent Swaps)</option>
                  <option value="selection">Selection Sort (Min Extraction)</option>
                  <option value="insertion">Insertion Sort (Prefix Shifts)</option>
                  <option value="merge">Merge Sort (Divide & Conquer)</option>
                  <option value="heap">Heap Sort (Binary Max-Heap)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={runPreviewSort}
                  disabled={isPreviewSorting || isPreviewSorted}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <Play className="h-3 w-3" />
                  Run Sandbox Sort
                </button>
                <button
                  onClick={resetPreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* Live Step Explanation in Sandbox */}
            <div className="mt-2 p-3 rounded-lg bg-slate-900/60 border border-white/5 text-xs font-mono text-indigo-200">
              <span className="text-[10px] text-gray-500 uppercase block font-bold">Sandbox Event:</span>
              <p className="mt-0.5">{previewMessage}</p>
            </div>

            <div className="mt-2 pt-3 border-t border-white/5">
              <button
                onClick={() => router.push(`/sortmentor?algorithm=${previewAlgorithm}`)}
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-xs transition-all cursor-pointer"
              >
                Launch Full Simulation in SortMentor Workspace →
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full lg:w-96 rounded-xl bg-slate-950 border border-white/5 p-6 flex flex-col justify-center gap-6 relative overflow-hidden">
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="font-mono text-indigo-300 font-bold uppercase tracking-wider">Array State</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isPreviewSorting ? "bg-amber-500/10 text-amber-400" :
                isPreviewSorted ? "bg-emerald-500/10 text-emerald-400" :
                "bg-gray-500/10 text-gray-400"
              }`}>
                {isPreviewSorting ? "Sorting..." : isPreviewSorted ? "Sorted" : "Unsorted"}
              </span>
            </div>

            <div className="flex justify-center items-end gap-3 h-28 mt-2">
              {previewArray.map((val, idx) => {
                const isActive = previewActiveIndices.includes(idx);
                let barColor = "bg-indigo-600/90";
                if (isActive) {
                  if (previewActionType === "swap") barColor = "bg-rose-500";
                  else if (previewActionType === "pivot") barColor = "bg-cyan-400";
                  else if (previewActionType === "sorted") barColor = "bg-emerald-500";
                  else barColor = "bg-amber-400";
                } else if (isPreviewSorted) {
                  barColor = "bg-emerald-500/80";
                }

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-300 ${barColor} relative`}
                      style={{ height: `${val * 1.2}px` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-t-md"></div>
                    </div>
                    <span className={`font-mono text-[10px] font-bold ${isActive ? "text-white" : "text-gray-500"}`}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 9. SORTING IN THE REAL WORLD */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Sorting in the Real World</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white">Databases & Query Engines</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Relational databases rely heavily on sorting for index creation and executing operations like `ORDER BY`, `GROUP BY`, and merge joins. Sorters are optimized to process datasets that exceed local RAM buffer capacities.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white">Search Systems & Product Ordering</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Information retrieval engines use sorting algorithms to rank documents, compute matching metrics, and present catalog items to customers filtered by price, ratings, or relevance scores.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white">Operating Systems & Network Scheduling</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Kernel processes utilize sorting structures to organize thread execution queues, manage job scheduling priority queues, and throttle incoming network packets by time-to-live indexes.
              </p>
            </div>
          </div>
        </section>

        {/* 10. RECOMMENDED LEARNING ORDER */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Recommended Learning Order</h3>
          </div>

          <div className="relative pl-6 border-l border-white/5 flex flex-col gap-4">
            {[
              { num: 1, topic: "Sorting Fundamentals", desc: "Start by understanding sorting definitions, space/time bounds, stability, and in-place concepts." },
              { num: 2, topic: "Bubble, Selection & Insertion Sort", desc: "Learn basic comparison loops to build an intuitive grasp of elements movement." },
              { num: 3, topic: "Merge & Quick Sort", desc: "Advance to Divide-and-Conquer algorithms. Study recursive subdivisions and pivots." },
              { num: 4, topic: "Heap & Shell Sort", desc: "Analyze heap tree structures and binary arrays, and shell increments optimizations." },
              { num: 5, topic: "Counting, Radix & Bucket Sort", desc: "Explore linear-time constraints. Learn how sorting without comparisons works." },
              { num: 6, topic: "Tim Sort", desc: "Study Python/Java standard libraries default hybrid engine. Explore runs and merge patterns." }
            ].map(stage => (
              <div key={stage.num} className="relative group">
                <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-[#030712] border-2 border-indigo-500 flex items-center justify-center font-mono text-[9px] font-bold text-indigo-400">
                  {stage.num}
                </div>
                <div className="flex flex-col pl-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{stage.topic}</h4>
                  <p className="text-xs text-gray-400 mt-0.5 max-w-2xl">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 11. AI-POWERED LEARNING */}
        <section className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-pink-400" /> AI-Powered Learning Hub
            </span>
            <h3 className="text-lg font-bold text-white">Context-Aware AI Tutor</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
              AlgoVerse includes SortMentor, an AI tutor powered by RAG memories. It explains specific visualizer steps, compares performance trade-offs, and adapts conceptual explanations on the fly.
            </p>
          </div>
          <button
            onClick={() => router.push("/sortmentor")}
            className="px-5 py-2.5 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 font-bold text-xs transition-all cursor-pointer self-stretch md:self-auto text-center"
          >
            Ask SortMentor AI →
          </button>
        </section>

        {/* 12. ALGOVERSE ROADMAP */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">AlgoVerse Roadmap</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative before:hidden lg:before:block lg:before:absolute lg:before:left-0 lg:before:right-0 lg:before:top-1/4 lg:before:h-[2px] lg:before:bg-white/5">
            {[
              { stage: "Current", title: "Sorting Algorithms", desc: "Interactive visualization, AI explanations, algorithm comparison, and custom datasets.", active: true },
              { stage: "Next", title: "Searching Algorithms", desc: "Explore Binary Search, Jump Search, Interpolation Search, and Exponential Search.", active: false },
              { stage: "Coming Soon", title: "Trees & Graphs", desc: "Binary Search Trees, AVL balance, Graph DFS/BFS traversals, Dijkstra routing.", active: false },
              { stage: "Future", title: "Advanced Modules", desc: "Dynamic Programming, Greedy algorithms, Backtracking, Operating Systems.", active: false }
            ].map((r, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-3 relative z-10">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded self-start ${
                  r.active ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-gray-500"
                }`}>
                  {r.stage}
                </span>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-white">{r.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 13. COMING SOON MODULES */}
        <section className="flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Coming to AlgoVerse</h4>
          <div className="flex flex-wrap gap-3">
            {[
              "Searching", "Trees", "Graphs", "Dynamic Programming", 
              "Greedy Algorithms", "Backtracking", "String Algorithms"
            ].map((domain, idx) => (
              <span 
                key={idx} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-xs text-gray-500 font-semibold"
              >
                {domain} <Lock className="h-3 w-3 text-gray-600" />
              </span>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto border-t border-white/5 pt-6 text-center text-gray-600 text-xs">
        &copy; {new Date().getFullYear()} AlgoVerse Inc. All rights reserved. Professional Computer Science Learning Workspace.
      </footer>
      
    </div>
  );
}
