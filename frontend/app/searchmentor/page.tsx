"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  BarChart3,
  SlidersHorizontal,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Layers,
  GraduationCap,
  Loader2,
  Zap,
  Target,
  RefreshCw,
  Plus,
  Minus,
  GitFork,
} from "lucide-react";
import { useSearchStore, SearchStep } from "../../context/useSearchStore";
import UserDropdown from "../../components/auth/UserDropdown";
import ShareButton from "../../components/ui/ShareButton";

interface SearchAlgoMeta {
  id: string;
  name: string;
  category: "Divide & Conquer" | "Linear / Block" | "Intelligent Probing" | "Two Pointers";
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  spaceComplexity: string;
  requiresSorted: boolean;
  tagline: string;
  formula?: string;
  description: string;
  useCase: string;
}

const SEARCH_ALGORITHMS: Record<string, SearchAlgoMeta> = {
  binary: {
    id: "binary",
    name: "Binary Search",
    category: "Divide & Conquer",
    timeBest: "O(1)",
    timeAvg: "O(log n)",
    timeWorst: "O(log n)",
    spaceComplexity: "O(1)",
    requiresSorted: true,
    tagline: "Repeatedly halves the search space by evaluating the midpoint element.",
    formula: "mid = \\lfloor (low + high) / 2 \\rfloor",
    description:
      "Binary Search is the gold standard for searching sorted collections. By comparing the middle element with the target, it eliminates exactly half of the remaining elements in each step, delivering guaranteed logarithmic time.",
    useCase: "Standard library lookups (C++ std::binary_search, Python bisect, Java Arrays.binarySearch).",
  },
  lowerbound: {
    id: "lowerbound",
    name: "Lower Bound Search",
    category: "Divide & Conquer",
    timeBest: "O(1)",
    timeAvg: "O(log n)",
    timeWorst: "O(log n)",
    spaceComplexity: "O(1)",
    requiresSorted: true,
    tagline: "Finds the first position where the element is greater than or equal to the target.",
    formula: "\\text{first } i \\text{ such that } arr[i] \\ge target",
    description:
      "Lower Bound variant of binary search continues searching in the left partition even when an element >= target is found, locating the leftmost valid insertion index.",
    useCase: "Range queries, multiset frequency counts, and competitive programming (C++ std::lower_bound).",
  },
  jump: {
    id: "jump",
    name: "Jump Search",
    category: "Linear / Block",
    timeBest: "O(1)",
    timeAvg: "O(√n)",
    timeWorst: "O(√n)",
    spaceComplexity: "O(1)",
    requiresSorted: true,
    tagline: "Hops forward by fixed block intervals of size ⌊√n⌋ before executing a linear scan.",
    formula: "\\text{optimal block jump } m = \\lfloor \\sqrt{n} \\rfloor",
    description:
      "Jump Search balances between linear scanning and binary jumping. It steps forward in blocks of size √n until the element exceeds the target, then backtracks linearly within that single block.",
    useCase: "Systems where binary search backward jumping is costly (e.g. tape drives, singly linked structures).",
  },
  interpolation: {
    id: "interpolation",
    name: "Interpolation Search",
    category: "Intelligent Probing",
    timeBest: "O(1)",
    timeAvg: "O(log log n)",
    timeWorst: "O(n)",
    spaceComplexity: "O(1)",
    requiresSorted: true,
    tagline: "Calculates the likely position of the target assuming uniform numerical distribution.",
    formula: "pos = low + \\left\\lfloor \\frac{target - arr[low]}{arr[high] - arr[low]} \\cdot (high - low) \\right\\rfloor",
    description:
      "Like looking up a word in a telephone directory (opening near 'Z' for zebra rather than the middle), Interpolation Search estimates the target position using linear interpolation, achieving sub-logarithmic O(log log n) average time on uniformly distributed data.",
    useCase: "Uniformly distributed large phonebooks, timestamps, and linear indexing keys.",
  },
  exponential: {
    id: "exponential",
    name: "Exponential Search",
    category: "Divide & Conquer",
    timeBest: "O(1)",
    timeAvg: "O(log i)",
    timeWorst: "O(log i)",
    spaceComplexity: "O(1)",
    requiresSorted: true,
    tagline: "Finds range bounds by doubling indices (1, 2, 4, 8, ...) then performs binary search.",
    formula: "\\text{Bound Range: } [2^{k-1} .. \\min(2^k, n-1)]",
    description:
      "Exponential Search finds an upper bound by repeatedly doubling the index (1, 2, 4, 8, 16...) until array[i] > target, then restricts Binary Search to the bounded interval. It is especially fast when the target is located near the beginning of large or unbounded lists.",
    useCase: "Unbounded/infinite streams, web server logs, and queries where targets are clustered near the head.",
  },
  ternary: {
    id: "ternary",
    name: "Ternary Search",
    category: "Divide & Conquer",
    timeBest: "O(1)",
    timeAvg: "O(log₃ n)",
    timeWorst: "O(log₃ n)",
    spaceComplexity: "O(1)",
    requiresSorted: true,
    tagline: "Divides the search space into three equal segments using two midpoints.",
    formula: "mid_1 = low + \\lfloor (high - low)/3 \\rfloor, \\quad mid_2 = high - \\lfloor (high - low)/3 \\rfloor",
    description:
      "Ternary Search splits the array into 3 partitions. While each step discards 2/3 of the array, it requires 2 comparisons per iteration. In standard discrete searching, Binary Search is faster due to fewer comparisons per step.",
    useCase: "Finding the maximum/minimum of unimodal continuous mathematical functions.",
  },
  linear: {
    id: "linear",
    name: "Linear Search",
    category: "Linear / Block",
    timeBest: "O(1)",
    timeAvg: "O(n)",
    timeWorst: "O(n)",
    spaceComplexity: "O(1)",
    requiresSorted: false,
    tagline: "Sequentially inspects every element from left to right until the target is found.",
    description:
      "The simplest search strategy. It requires zero preprocessing and works on unordered collections, but scales linearly with the input size.",
    useCase: "Unsorted collections, small arrays (n < 16), or when sorting overhead exceeds search count.",
  },
  twopointers: {
    id: "twopointers",
    name: "Two Pointers Pair Sum",
    category: "Two Pointers",
    timeBest: "O(1)",
    timeAvg: "O(n)",
    timeWorst: "O(n)",
    spaceComplexity: "O(1)",
    requiresSorted: true,
    tagline: "Converges left and right pointers inward to find two elements that sum to the target.",
    formula: "arr[left] + arr[right] \\stackrel{?}{=} target",
    description:
      "A classic technique in interview coding (2-Sum on sorted arrays). Starting from extreme ends, if the sum is too small, left moves right; if too large, right moves left.",
    useCase: "2-Sum, 3-Sum, Container With Most Water, Trapping Rain Water, and palindrome verification.",
  },
};

const PRESETS = [
  { name: "Uniform Sorted (11)", data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110], defaultTarget: 70 },
  { name: "Random Sorted (15)", data: [3, 8, 14, 22, 29, 35, 41, 49, 58, 64, 73, 81, 89, 94, 98], defaultTarget: 49 },
  { name: "Exponential Steps (12)", data: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096], defaultTarget: 512 },
  { name: "Large Dense Range (20)", data: [5, 12, 18, 23, 27, 34, 39, 45, 51, 56, 62, 68, 73, 79, 84, 88, 92, 95, 99, 105], defaultTarget: 73 },
  { name: "Missing Target Edge", data: [10, 25, 40, 55, 70, 85, 100, 115], defaultTarget: 60 },
];

export default function SearchMentorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    array,
    originalArray,
    target,
    algorithm,
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    metrics,
    setArray,
    setOriginalArray,
    setTarget,
    setAlgorithm,
    setSteps,
    setCurrentStepIndex,
    setIsPlaying,
    setSpeed,
    setMetrics,
    resetPlayback,
  } = useSearchStore();

  const [isLoading, setIsLoading] = useState(false);
  const [targetInput, setTargetInput] = useState(target.toString());
  const [activeTab, setActiveTab] = useState<"visualizer" | "benchmark" | "theory">("visualizer");
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, any> | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const activeMeta = SEARCH_ALGORITHMS[algorithm] || SEARCH_ALGORITHMS.binary;
  const activeStep: SearchStep | null = steps[currentStepIndex] || null;

  // Initialize or read URL param
  useEffect(() => {
    const algoParam = searchParams.get("algo") || searchParams.get("algorithm");
    if (algoParam && SEARCH_ALGORITHMS[algoParam.toLowerCase()]) {
      setAlgorithm(algoParam.toLowerCase());
    }
  }, [searchParams, setAlgorithm]);

  // Execute Search Simulation from backend (or client fallback)
  const runSearch = useCallback(async () => {
    setIsPlaying(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/searchmentor/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: originalArray,
          target,
          algorithm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSteps(data.steps || []);
        setMetrics(data.metrics || null);
        setCurrentStepIndex(0);
        setIsPlaying(true);
      } else {
        throw new Error("Backend response error");
      }
    } catch {
      // Client-side fallback computation for instant offline demo
      executeClientSearch(originalArray, target, algorithm);
    } finally {
      setIsLoading(false);
    }
  }, [originalArray, target, algorithm, setSteps, setMetrics, setCurrentStepIndex, setIsPlaying]);

  // Fallback client simulation if backend is launching
  const executeClientSearch = (data: number[], targetVal: number, algo: string) => {
    const arr = [...data];
    const stepsList: SearchStep[] = [];
    let comparisons = 0;
    let foundIndex = -1;

    if (algo === "binary" || algo === "lowerbound") {
      let low = 0;
      let high = arr.length - 1;
      let candidate = -1;

      stepsList.push({
        step: 0,
        event_type: "start",
        array: [...arr],
        target: targetVal,
        pointers: { low, high },
        active_index: null,
        discarded_ranges: [],
        found_index: -1,
        comparisons: 0,
        message: `Starting Binary Search with search window [0 .. ${high}].`,
      });

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        comparisons++;

        const discarded: [number, number][] = [];
        if (low > 0) discarded.push([0, low - 1]);
        if (high < arr.length - 1) discarded.push([high + 1, arr.length - 1]);

        stepsList.push({
          step: stepsList.length,
          event_type: "probe",
          array: [...arr],
          target: targetVal,
          pointers: { low, mid, high },
          active_index: mid,
          discarded_ranges: [...discarded],
          found_index: -1,
          comparisons,
          message: `Inspecting midpoint index ${mid} (value: ${arr[mid]}) vs target ${targetVal}.`,
        });

        if (arr[mid] === targetVal) {
          foundIndex = mid;
          stepsList.push({
            step: stepsList.length,
            event_type: "found",
            array: [...arr],
            target: targetVal,
            pointers: { low, mid, high, found: mid },
            active_index: mid,
            discarded_ranges: [...discarded],
            found_index: mid,
            comparisons,
            message: `🎯 Target ${targetVal} found at index ${mid} in ${comparisons} comparisons!`,
          });
          break;
        } else if (arr[mid] < targetVal) {
          const oldLow = low;
          low = mid + 1;
          discarded.push([oldLow, mid]);
          stepsList.push({
            step: stepsList.length,
            event_type: "discard_left",
            array: [...arr],
            target: targetVal,
            pointers: { low, high },
            active_index: mid,
            discarded_ranges: [...discarded],
            found_index: -1,
            comparisons,
            message: `arr[${mid}] (${arr[mid]}) < ${targetVal}. Discarding left partition [${oldLow}..${mid}]. Move low to ${low}.`,
          });
        } else {
          const oldHigh = high;
          high = mid - 1;
          discarded.push([mid, oldHigh]);
          stepsList.push({
            step: stepsList.length,
            event_type: "discard_right",
            array: [...arr],
            target: targetVal,
            pointers: { low, high },
            active_index: mid,
            discarded_ranges: [...discarded],
            found_index: -1,
            comparisons,
            message: `arr[${mid}] (${arr[mid]}) > ${targetVal}. Discarding right partition [${mid}..${oldHigh}]. Move high to ${high}.`,
          });
        }
      }

      if (foundIndex === -1) {
        stepsList.push({
          step: stepsList.length,
          event_type: "not_found",
          array: [...arr],
          target: targetVal,
          pointers: { low, high },
          active_index: null,
          discarded_ranges: [[0, arr.length - 1]],
          found_index: -1,
          comparisons,
          message: `❌ Search interval exhausted. Target ${targetVal} is not present in array.`,
        });
      }
    } else {
      // Generic linear step fallback
      for (let i = 0; i < arr.length; i++) {
        comparisons++;
        stepsList.push({
          step: stepsList.length,
          event_type: "probe",
          array: [...arr],
          target: targetVal,
          pointers: { current: i },
          active_index: i,
          discarded_ranges: [[0, Math.max(0, i - 1)]],
          found_index: -1,
          comparisons,
          message: `Probing index ${i} (value: ${arr[i]}) vs target ${targetVal}.`,
        });

        if (arr[i] === targetVal) {
          foundIndex = i;
          stepsList.push({
            step: stepsList.length,
            event_type: "found",
            array: [...arr],
            target: targetVal,
            pointers: { found: i },
            active_index: i,
            discarded_ranges: [],
            found_index: i,
            comparisons,
            message: `🎯 Target ${targetVal} found at index ${i}!`,
          });
          break;
        }
      }
    }

    setSteps(stepsList);
    setMetrics({
      time_ms: 1.2,
      comparisons,
      steps_count: stepsList.length,
      found: foundIndex !== -1,
      found_index: foundIndex,
    });
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  // Playback timer ticker
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && steps.length > 0) {
      if (currentStepIndex < steps.length - 1) {
        timer = setTimeout(() => {
          setCurrentStepIndex(currentStepIndex + 1);
        }, speed);
      } else {
        setIsPlaying(false);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, steps.length, speed, setCurrentStepIndex, setIsPlaying]);

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setOriginalArray(preset.data);
    setArray(preset.data);
    setTarget(preset.defaultTarget);
    setTargetInput(preset.defaultTarget.toString());
    resetPlayback();
    setSteps([]);
    setMetrics(null);
  };

  const handleTargetChange = (valStr: string) => {
    setTargetInput(valStr);
    const num = parseInt(valStr, 10);
    if (!isNaN(num)) {
      setTarget(num);
      resetPlayback();
      setSteps([]);
      setMetrics(null);
    }
  };

  const runBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch("/api/v1/searchmentor/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: originalArray,
          target,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBenchmarkResults(data.results || null);
      }
    } catch {
      // Mock benchmark
      setBenchmarkResults({
        linear: { comparisons: originalArray.indexOf(target) + 1 || originalArray.length, found: originalArray.includes(target) },
        binary: { comparisons: Math.ceil(Math.log2(originalArray.length)), found: originalArray.includes(target) },
        jump: { comparisons: Math.ceil(Math.sqrt(originalArray.length)), found: originalArray.includes(target) },
        interpolation: { comparisons: 2, found: originalArray.includes(target) },
        exponential: { comparisons: 4, found: originalArray.includes(target) },
      });
    } finally {
      setIsBenchmarking(false);
    }
  };

  const isDiscarded = (index: number) => {
    if (!activeStep) return false;
    for (const [start, end] of activeStep.discarded_ranges) {
      if (index >= start && index <= end) return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#030712] py-6 px-4 sm:px-6 lg:px-8 text-gray-300">
      {/* 1. TOP MAIN NAVIGATION */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative overflow-hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 shadow-[0_0_10px_rgba(99,102,241,0.15)] bg-slate-950 group-hover:border-indigo-500/40 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon.png"
                alt="AlgoVerse"
                className="h-full w-full object-cover scale-110"
              />
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              Algo<span className="text-gradient">Verse</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/sortmentor" className="text-gray-400 hover:text-white transition-colors">
              Sorting Studio
            </Link>
            <span className="text-white border-b-2 border-cyan-500 pb-1 cursor-default flex items-center gap-1.5">
              <Search className="h-4 w-4 text-cyan-400" />
              SearchMentor
            </span>
            <Link
              href="/treementor"
              className="text-gray-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <GitFork className="h-4 w-4 text-emerald-400" />
              <span>TreeMentor</span>
            </Link>
            <Link
              href="/gate-exam-sorting-algorithms"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="h-4 w-4" />
              <span>GATE Guide</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ShareButton />
          <UserDropdown />
        </div>
      </header>

      {/* 2. BREADCRUMBS */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-6xl mx-auto pt-6 flex items-center gap-2 text-xs text-gray-500 font-mono"
      >
        <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-400">Searching Algorithms</span>
        <span>/</span>
        <span className="text-cyan-300 font-semibold">{activeMeta.name}</span>
      </nav>

      <main className="max-w-6xl mx-auto flex flex-col gap-8 pt-6 pb-20">
        {/* 3. HERO & ALGORITHM SELECTOR */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-cyan-950/20 via-slate-950/50 to-slate-950/80 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" /> Search Space Elimination Engine
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-white/5 text-gray-400 border border-white/10">
                  {activeMeta.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {activeMeta.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                {activeMeta.tagline}
              </p>
            </div>

            {/* Complexity Badges */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 p-3 rounded-2xl">
              <div className="flex flex-col text-center px-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Average</span>
                <span className="text-sm font-black text-cyan-400 font-mono">{activeMeta.timeAvg}</span>
              </div>
              <div className="h-6 w-[1px] bg-white/10"></div>
              <div className="flex flex-col text-center px-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Worst</span>
                <span className="text-sm font-black text-pink-400 font-mono">{activeMeta.timeWorst}</span>
              </div>
              <div className="h-6 w-[1px] bg-white/10"></div>
              <div className="flex flex-col text-center px-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Space</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{activeMeta.spaceComplexity}</span>
              </div>
            </div>
          </div>

          {/* Algorithm Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-t border-white/5 pt-4 scrollbar-none">
            {Object.values(SEARCH_ALGORITHMS).map((algo) => (
              <button
                key={algo.id}
                onClick={() => {
                  setAlgorithm(algo.id);
                  resetPlayback();
                  setSteps([]);
                  setMetrics(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  algorithm === algo.id
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20"
                    : "bg-slate-900/60 border-white/5 text-gray-400 hover:text-white hover:border-white/15"
                }`}
              >
                {algo.name}
              </button>
            ))}
          </div>
        </section>

        {/* 4. SEARCH TOOLBAR & CONTROLS */}
        <section className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {/* Target Value Input */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase font-mono">Target:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={targetInput}
                onChange={(e) => handleTargetChange(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleTargetChange((target - 1).toString())}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-gray-400 hover:text-white"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleTargetChange((target + 1).toString())}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-gray-400 hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick target chips from array */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 pl-2 border-l border-white/5">
              <span className="text-[10px] font-mono">Quick Pick:</span>
              {[originalArray[0], originalArray[Math.floor(originalArray.length / 2)], originalArray[originalArray.length - 1]].map(
                (val, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTargetChange(val.toString())}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-500/20 text-gray-300 font-mono text-[11px] border border-white/5"
                  >
                    {val}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Presets:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-[11px] font-semibold text-gray-300 hover:text-white whitespace-nowrap transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Main Action Run Button */}
          <button
            onClick={runSearch}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : <Play className="h-4 w-4 fill-current" />}
            <span>Execute {activeMeta.name}</span>
          </button>
        </section>

        {/* 5. INTERACTIVE SEARCH CANVAS */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 bg-slate-950/80 flex flex-col gap-6 relative min-h-[380px] justify-between">
          {/* Top Canvas Status Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-gray-400">
                Step {currentStepIndex >= 0 ? currentStepIndex + 1 : 0} of {steps.length || 0}
              </span>
              {metrics && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Comparisons: {metrics.comparisons}
                </span>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex <= 0}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-gray-300 disabled:opacity-30 cursor-pointer"
                title="Previous Step"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={steps.length === 0}
                className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 disabled:opacity-30 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              </button>

              <button
                onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
                disabled={currentStepIndex >= steps.length - 1}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-gray-300 disabled:opacity-30 cursor-pointer"
                title="Next Step"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={resetPlayback}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-gray-400 hover:text-white cursor-pointer ml-1"
                title="Reset Playback"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Speed Controller */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-mono ml-3 border-l border-white/10 pl-3">
                <span>Speed:</span>
                <input
                  type="range"
                  min={100}
                  max={1200}
                  step={100}
                  value={1300 - speed}
                  onChange={(e) => setSpeed(1300 - parseInt(e.target.value, 10))}
                  className="w-20 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Main Visual Array Bars & Pointers */}
          <div className="flex-1 flex flex-col justify-center items-center py-8">
            <div className="w-full flex items-end justify-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap min-h-[160px]">
              {originalArray.map((val, idx) => {
                const discarded = isDiscarded(idx);
                const isMid = activeStep?.pointers?.mid === idx || activeStep?.pointers?.mid1 === idx || activeStep?.pointers?.mid2 === idx;
                const isLow = activeStep?.pointers?.low === idx || activeStep?.pointers?.left === idx;
                const isHigh = activeStep?.pointers?.high === idx || activeStep?.pointers?.right === idx;
                const isPos = activeStep?.pointers?.pos === idx || activeStep?.pointers?.current === idx;
                const isFound = activeStep?.pointers?.found === idx || (activeStep?.event_type === "found" && activeStep?.found_index === idx);
                const isMatch = val === target;

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 relative transition-all duration-300">
                    {/* Floating Pointer Badges */}
                    <div className="h-8 flex items-center justify-center">
                      {isFound ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 animate-bounce">
                          MATCH
                        </span>
                      ) : isMid ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950 font-mono shadow-md">
                          MID
                        </span>
                      ) : isPos ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-slate-950 font-mono shadow-md">
                          PROBE
                        </span>
                      ) : isLow && isHigh ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-400 text-slate-950 font-mono shadow-md">
                          L=H
                        </span>
                      ) : isLow ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-400 text-slate-950 font-mono shadow-md">
                          LOW
                        </span>
                      ) : isHigh ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-400 text-slate-950 font-mono shadow-md">
                          HIGH
                        </span>
                      ) : null}
                    </div>

                    {/* Array Cell Card */}
                    <div
                      className={`w-10 sm:w-14 h-16 sm:h-20 rounded-xl flex flex-col items-center justify-center border font-mono font-bold transition-all duration-300 relative ${
                        discarded
                          ? "bg-slate-900/20 border-white/5 text-gray-600 opacity-30 scale-95"
                          : isFound
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-xl shadow-emerald-500/20 scale-105 ring-2 ring-emerald-400"
                          : isMid
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30 scale-105"
                          : isPos
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30 scale-105"
                          : isLow || isHigh
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                          : "bg-slate-900/80 border-white/10 text-gray-200"
                      }`}
                    >
                      <span className="text-base sm:text-lg font-black">{val}</span>
                      <span className="text-[9px] text-gray-500 font-normal">[{idx}]</span>
                    </div>

                    {/* Discarded cross indicator */}
                    {discarded && (
                      <span className="text-[9px] font-mono text-gray-600">eliminated</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Live Step Message Explanation */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-mono">
              {activeStep ? activeStep.message : `Click 'Execute ${activeMeta.name}' to start step-by-step visual exploration.`}
            </p>
          </div>
        </section>

        {/* 6. FORMULA & THEORY SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Formula Card */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Calculator className="h-4 w-4" />
              <span>Mathematical Invariant</span>
            </div>
            {activeMeta.formula ? (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-cyan-300 font-semibold">
                {activeMeta.formula}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Sequential comparison without mathematical index projection.</p>
            )}
            <p className="text-xs text-gray-400 leading-relaxed">
              {activeMeta.description}
            </p>
          </div>

          {/* Complexity Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Zap className="h-4 w-4" />
              <span>Asymptotic Bounds</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-gray-500 block text-[10px]">Best Case:</span>
                <span className="text-emerald-400 font-bold">{activeMeta.timeBest}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-gray-500 block text-[10px]">Average Case:</span>
                <span className="text-cyan-400 font-bold">{activeMeta.timeAvg}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-gray-500 block text-[10px]">Worst Case:</span>
                <span className="text-pink-400 font-bold">{activeMeta.timeWorst}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-gray-500 block text-[10px]">Aux Space:</span>
                <span className="text-white font-bold">{activeMeta.spaceComplexity}</span>
              </div>
            </div>
            <span className="text-[11px] text-gray-500">
              Requires Sorted Array: <strong className={activeMeta.requiresSorted ? "text-emerald-400" : "text-gray-400"}>{activeMeta.requiresSorted ? "YES" : "NO"}</strong>
            </span>
          </div>

          {/* Real World Use Case */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
              <Layers className="h-4 w-4" />
              <span>Real-World Application</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {activeMeta.useCase}
            </p>
            <div className="pt-2">
              <button
                onClick={runBenchmark}
                disabled={isBenchmarking}
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Run Algorithm Benchmark</span>
              </button>
            </div>
          </div>
        </section>

        {/* 7. BENCHMARK COMPARISON TABLE */}
        {benchmarkResults && (
          <section className="p-6 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <span>Benchmark: Comparison Count for Target {target}</span>
              </h3>
              <span className="text-xs font-mono text-gray-500">Array Size: {originalArray.length}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(benchmarkResults).map(([key, val]: [string, any]) => (
                <div key={key} className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">{key}</span>
                  <span className="text-xl font-black text-cyan-300 font-mono">
                    {val.comparisons ?? "—"} <span className="text-xs text-gray-500 font-normal">checks</span>
                  </span>
                  <span className={`text-[10px] font-mono ${val.found ? "text-emerald-400" : "text-pink-400"}`}>
                    {val.found ? "✓ Found" : "✗ Not Found"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto border-t border-white/5 pt-8 text-center text-gray-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>&copy; {new Date().getFullYear()} AlgoVerse. SearchMentor Studio & Algorithms Workspace.</span>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/sortmentor" className="hover:text-gray-300 transition-colors">
            SortMentor
          </Link>
          <Link href="/searchmentor" className="text-cyan-400 font-semibold">
            SearchMentor
          </Link>
          <Link href="/gate-exam-sorting-algorithms" className="hover:text-gray-300 transition-colors">
            GATE Guide
          </Link>
        </div>
      </footer>
    </div>
  );
}
