"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitFork,
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
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Layers,
  GraduationCap,
  Loader2,
  Zap,
  Target,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { useTreeStore, TreeNodeLayout, TreeStep } from "../../context/useTreeStore";
import UserDropdown from "../../components/auth/UserDropdown";
import ShareButton from "../../components/ui/ShareButton";

interface TreeStructureMeta {
  id: "bst" | "avl" | "redblack" | "trie" | "segment" | "fenwick";
  name: string;
  category: string;
  timeSearch: string;
  timeInsert: string;
  timeDelete: string;
  spaceComplexity: string;
  tagline: string;
  formula?: string;
  description: string;
  useCase: string;
}

const TREE_STRUCTURES: Record<string, TreeStructureMeta> = {
  avl: {
    id: "avl",
    name: "AVL Tree (Self-Balancing)",
    category: "Strictly Balanced BST",
    timeSearch: "O(log n)",
    timeInsert: "O(log n)",
    timeDelete: "O(log n)",
    spaceComplexity: "O(n)",
    tagline: "Maintains strict balance factor |h_L - h_R| ≤ 1 using 4 rotation permutations.",
    formula: "BF(node) = \\text{height}(L) - \\text{height}(R) \\in \\{-1, 0, +1\\}",
    description:
      "Invented by Adelson-Velsky and Landis in 1962, AVL Trees strictly enforce that the heights of the two child subtrees of any node differ by at most one. Whenever an insertion or deletion causes an imbalance (|BF| > 1), it immediately executes single (LL, RR) or double (LR, RL) rotations in O(1) time.",
    useCase: "Read-heavy lookup databases, in-memory caches where lookup speed is critical.",
  },
  bst: {
    id: "bst",
    name: "Binary Search Tree (BST)",
    category: "Hierarchical Binary Tree",
    timeSearch: "O(log n) avg / O(n) worst",
    timeInsert: "O(log n) avg / O(n) worst",
    timeDelete: "O(log n) avg / O(n) worst",
    spaceComplexity: "O(n)",
    tagline: "Fundamental ordered tree: left subtree values < node value < right subtree values.",
    formula: "\\forall u \\in Left: u.val < node.val, \\quad \\forall v \\in Right: v.val > node.val",
    description:
      "The foundational binary tree data structure. Elements are organized such that an inorder traversal visits all nodes in non-decreasing sorted order. Without self-balancing, sequential insertions can degrade the tree into a linked list with O(n) worst-case time.",
    useCase: "Symbol tables, syntax trees in compilers, hierarchical indexing.",
  },
  redblack: {
    id: "redblack",
    name: "Red-Black Tree",
    category: "Relaxed Balanced BST",
    timeSearch: "O(log n)",
    timeInsert: "O(log n)",
    timeDelete: "O(log n)",
    spaceComplexity: "O(n)",
    tagline: "Balances insertions with color invariants (max height ≤ 2·log₂(n+1)).",
    formula: "\\text{Black-Height } bh(x) \\text{ is equal along all simple leaf paths}",
    description:
      "Red-Black Trees relax strict balance by painting nodes Red or Black, ensuring no path is more than twice as long as any other. It minimizes rotation count during high-frequency writes (at most 2 rotations on insert, 3 on delete).",
    useCase: "Standard libraries: C++ std::map / std::set, Java TreeMap, Linux CFS scheduler.",
  },
  trie: {
    id: "trie",
    name: "Prefix Trie",
    category: "Retrieval Tree",
    timeSearch: "O(L) - L: Word Length",
    timeInsert: "O(L)",
    timeDelete: "O(L)",
    spaceComplexity: "O(AL · N)",
    tagline: "Tree of character branches for blazing fast prefix search & autocomplete.",
    formula: "\\text{Search Time strictly bounded by string length } L, \\text{ independent of } N",
    description:
      "A tree where nodes share common prefixes. All descendants of a node have a common string prefix. Extremely efficient for dictionary lookup and autocomplete engines.",
    useCase: "Search engine autocomplete, spell checkers, IP routing table lookup (longest prefix match).",
  },
  segment: {
    id: "segment",
    name: "Segment Tree",
    category: "Range Query Tree",
    timeSearch: "O(log n) - Range Query",
    timeInsert: "O(log n) - Point Update",
    timeDelete: "O(log n)",
    spaceComplexity: "O(4n)",
    tagline: "Answers Range Minimum / Sum Queries (RMQ) in logarithmic time.",
    formula: "\\text{Range overlap states: Total Overlap, Partial Overlap, No Overlap}",
    description:
      "A binary tree used for storing intervals or segments. It allows querying which of the stored segments contain a given point or finding range aggregates (minimum, maximum, sum) in O(log n) time.",
    useCase: "Computational geometry, game physics collision ranges, competitive programming RMQ.",
  },
  fenwick: {
    id: "fenwick",
    name: "Fenwick Tree (BIT)",
    category: "Binary Indexed Tree",
    timeSearch: "O(log n) - Prefix Sum",
    timeInsert: "O(log n) - Point Update",
    timeDelete: "O(log n)",
    spaceComplexity: "O(n)",
    tagline: "Compact array representation of a tree using bitwise LSB isolation: i & (-i).",
    formula: "\\text{Parent update: } i \\leftarrow i + (i \\ \\& \\ -i), \\quad \\text{Prefix query: } i \\leftarrow i - (i \\ \\& \\ -i)",
    description:
      "Invented by Peter Fenwick in 1994, the Binary Indexed Tree (BIT) computes prefix sums and frequency tables in O(log n) time while occupying strictly O(n) array space with zero pointer overhead.",
    useCase: "Dynamic cumulative frequency tables, inversion counting, 2D range sums.",
  },
};

const TREE_PRESETS = {
  avl: [
    { name: "Balanced AVL", data: [30, 20, 40, 10, 25, 35, 50], defaultVal: 5 },
    { name: "LL Rotation Trigger", data: [30, 20, 10], defaultVal: 5 },
    { name: "RR Rotation Trigger", data: [10, 20, 30], defaultVal: 40 },
    { name: "LR Rotation Trigger", data: [30, 10, 20], defaultVal: 25 },
    { name: "RL Rotation Trigger", data: [10, 30, 20], defaultVal: 15 },
  ],
  bst: [
    { name: "Balanced BST", data: [50, 30, 70, 20, 40, 60, 80], defaultVal: 35 },
    { name: "Degenerate Line", data: [10, 20, 30, 40, 50], defaultVal: 60 },
    { name: "Two-Child Delete Demo", data: [50, 30, 70, 20, 40, 60, 80], defaultVal: 30 },
  ],
  redblack: [
    { name: "Standard RB Tree", data: [20, 10, 30, 5, 15, 25, 35], defaultVal: 12 },
    { name: "Recolor Case", data: [10, 5, 20, 1, 7], defaultVal: 15 },
    { name: "Double-Black Deletion Demo", data: [20, 10, 30, 5, 15, 25, 35], defaultVal: 20 },
    { name: "Near Nephew Case 3 Demo", data: [20, 10, 40, 5, 30, 50, 25], defaultVal: 5 },
  ],
  trie: [
    { name: "Dictionary Vocabulary", data: ["cat", "car", "card", "care", "bat", "ball", "app", "apple"], defaultWord: "car" },
    { name: "Prefix Autocomplete", data: ["code", "coder", "coding", "cool", "cook", "cookie"], defaultWord: "co" },
  ],
  segment: [
    { name: "RMQ Array (6)", data: [5, 2, 8, 6, 3, 7], queryRange: [1, 4] },
    { name: "Range Array (8)", data: [18, 12, 7, 25, 9, 31, 14, 2], queryRange: [2, 6] },
  ],
  fenwick: [
    { name: "BIT Array (8)", data: [3, 2, -1, 6, 5, 4, -3, 3], defaultIndex: 5 },
    { name: "Cumulative Frequency", data: [1, 3, 5, 7, 9, 11, 13, 15], defaultIndex: 6 },
  ],
};

export default function TreeMentorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    treeType,
    initialData,
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    metrics,
    setTreeType,
    setInitialData,
    setSteps,
    setCurrentStepIndex,
    setIsPlaying,
    setSpeed,
    setMetrics,
    resetPlayback,
  } = useTreeStore();

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState<string>("35");
  const [inputWord, setInputWord] = useState<string>("car");
  const [segRange, setSegRange] = useState<[number, number]>([1, 4]);
  const [fenwickIdx, setFenwickIdx] = useState<number>(5);

  const activeMeta = TREE_STRUCTURES[treeType] || TREE_STRUCTURES.avl;
  const activeStep: TreeStep | null = steps[currentStepIndex] || null;

  // Initialize or read URL param
  useEffect(() => {
    const typeParam = searchParams.get("type") || searchParams.get("structure");
    if (typeParam && TREE_STRUCTURES[typeParam.toLowerCase()]) {
      setTreeType(typeParam.toLowerCase() as any);
    }
  }, [searchParams, setTreeType]);

  // Execute tree operation via backend endpoint
  const executeOperation = useCallback(
    async (op: string) => {
      setIsPlaying(false);
      setIsLoading(true);

      const numVal = parseInt(inputValue, 10);

      try {
        const res = await fetch("/api/v1/treementor/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tree_type: treeType,
            operation: op,
            value: isNaN(numVal) ? undefined : numVal,
            word: inputWord,
            initial_data: initialData,
            query_range: segRange,
            index: fenwickIdx,
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
      } catch (err) {
        console.warn("Tree backend fallback", err);
      } finally {
        setIsLoading(false);
      }
    },
    [treeType, inputValue, inputWord, initialData, segRange, fenwickIdx, setSteps, setMetrics, setCurrentStepIndex, setIsPlaying]
  );

  // Initialize tree on first load or preset change
  useEffect(() => {
    executeOperation("init");
  }, [treeType, initialData]);

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

  const loadPreset = (preset: any) => {
    setInitialData(preset.data);
    if (preset.defaultVal !== undefined) setInputValue(preset.defaultVal.toString());
    if (preset.defaultWord !== undefined) setInputWord(preset.defaultWord);
    if (preset.queryRange !== undefined) setSegRange(preset.queryRange);
    if (preset.defaultIndex !== undefined) setFenwickIdx(preset.defaultIndex);
    resetPlayback();
  };

  const currentNodes: TreeNodeLayout[] = activeStep?.nodes || [];
  const currentEdges = activeStep?.edges || [];
  const activeNodeId = activeStep?.active_node_id;

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
            <Link href="/searchmentor" className="text-gray-400 hover:text-white transition-colors">
              SearchMentor
            </Link>
            <span className="text-white border-b-2 border-emerald-500 pb-1 cursor-default flex items-center gap-1.5">
              <GitFork className="h-4 w-4 text-emerald-400" />
              TreeMentor
            </span>
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
        <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-400">Hierarchical Trees</span>
        <span>/</span>
        <span className="text-emerald-300 font-semibold">{activeMeta.name}</span>
      </nav>

      <main className="max-w-6xl mx-auto flex flex-col gap-8 pt-6 pb-20">
        {/* 3. HERO & STRUCTURE SELECTOR */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-emerald-950/20 via-slate-950/50 to-slate-950/80 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <GitFork className="h-3.5 w-3.5" /> Physics Tree Topology Engine
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
                <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Search</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{activeMeta.timeSearch}</span>
              </div>
              <div className="h-6 w-[1px] bg-white/10"></div>
              <div className="flex flex-col text-center px-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Insert</span>
                <span className="text-sm font-black text-cyan-400 font-mono">{activeMeta.timeInsert}</span>
              </div>
              <div className="h-6 w-[1px] bg-white/10"></div>
              <div className="flex flex-col text-center px-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Space</span>
                <span className="text-sm font-black text-purple-400 font-mono">{activeMeta.spaceComplexity}</span>
              </div>
            </div>
          </div>

          {/* Tree Structure Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-t border-white/5 pt-4 scrollbar-none">
            {Object.values(TREE_STRUCTURES).map((str) => (
              <button
                key={str.id}
                onClick={() => {
                  setTreeType(str.id as any);
                  const defaultPreset = TREE_PRESETS[str.id]?.[0];
                  if (defaultPreset) loadPreset(defaultPreset);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  treeType === str.id
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/20"
                    : "bg-slate-900/60 border-white/5 text-gray-400 hover:text-white hover:border-white/15"
                }`}
              >
                {str.name}
              </button>
            ))}
          </div>
        </section>

        {/* 4. TREE OPERATIONS TOOLBAR */}
        <section className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {/* Operation Input Control */}
          <div className="flex items-center gap-3 flex-wrap">
            {treeType === "trie" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">Word:</span>
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value.toLowerCase())}
                  placeholder="e.g. car"
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => executeOperation("search")}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors"
                >
                  Search / Autocomplete
                </button>
              </div>
            ) : treeType === "segment" ? (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-white">Range [L, R]:</span>
                <input
                  type="number"
                  value={segRange[0]}
                  onChange={(e) => setSegRange([parseInt(e.target.value, 10) || 0, segRange[1]])}
                  className="w-14 px-2 py-1 rounded bg-slate-900 border border-white/10 text-center font-bold text-white"
                />
                <span>to</span>
                <input
                  type="number"
                  value={segRange[1]}
                  onChange={(e) => setSegRange([segRange[0], parseInt(e.target.value, 10) || 0])}
                  className="w-14 px-2 py-1 rounded bg-slate-900 border border-white/10 text-center font-bold text-white"
                />
                <button
                  onClick={() => executeOperation("query")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Query RMQ
                </button>
              </div>
            ) : treeType === "fenwick" ? (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-white">Prefix Sum Index (1..n):</span>
                <input
                  type="number"
                  value={fenwickIdx}
                  onChange={(e) => setFenwickIdx(parseInt(e.target.value, 10) || 1)}
                  className="w-16 px-2 py-1 rounded bg-slate-900 border border-white/10 text-center font-bold text-white"
                />
                <button
                  onClick={() => executeOperation("prefix_sum")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Calculate Sum
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">Value:</span>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-20 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => executeOperation("insert")}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Insert</span>
                </button>
                <button
                  onClick={() => executeOperation("search")}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-gray-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </button>
                {(treeType === "bst" || treeType === "redblack") && (
                  <button
                    onClick={() => executeOperation("delete")}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Presets List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Presets:</span>
            {(TREE_PRESETS[treeType] || []).map((p: any, idx: number) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-[11px] font-semibold text-gray-300 hover:text-white whitespace-nowrap transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>

        {/* 5. INTERACTIVE DYNAMIC SVG TREE CANVAS */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 bg-slate-950/80 flex flex-col gap-6 relative min-h-[480px] justify-between overflow-hidden">
          {/* Top Canvas Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-gray-400">
                Step {currentStepIndex >= 0 ? currentStepIndex + 1 : 0} of {steps.length || 0}
              </span>
              {activeStep?.rotation && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse">
                  ⚡ Rotation: {activeStep.rotation}
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
                className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 disabled:opacity-30 cursor-pointer"
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
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Speed Slider */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-mono ml-3 border-l border-white/10 pl-3">
                <span>Speed:</span>
                <input
                  type="range"
                  min={100}
                  max={1200}
                  step={100}
                  value={1300 - speed}
                  onChange={(e) => setSpeed(1300 - parseInt(e.target.value, 10))}
                  className="w-20 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="w-full h-[360px] sm:h-[420px] relative overflow-auto flex items-center justify-center">
            {currentNodes.length > 0 ? (
              <svg className="w-full h-full min-w-[700px] min-h-[350px]" viewBox="0 0 800 380">
                <defs>
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Draw Edges */}
                {currentEdges.map((edge, idx) => {
                  const fromNode = currentNodes.find((n) => n.id === edge.from);
                  const toNode = currentNodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const dx = toNode.x - fromNode.x;
                  const dy = toNode.y - fromNode.y;
                  const path = `M ${fromNode.x} ${fromNode.y} C ${fromNode.x} ${fromNode.y + dy * 0.5}, ${toNode.x} ${fromNode.y + dy * 0.5}, ${toNode.x} ${toNode.y}`;

                  return (
                    <path
                      key={`edge-${idx}`}
                      d={path}
                      stroke="url(#edgeGrad)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Draw Nodes */}
                {currentNodes.map((node) => {
                  const isActive = activeNodeId === node.id || activeStep?.visited_ids?.includes(node.id);
                  const isRBRed = node.color === "RED";
                  const isRBBlack = node.color === "BLACK";

                  return (
                    <g key={node.id} className="transition-all duration-500 cursor-pointer">
                      {/* Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={22}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "stroke-emerald-400 fill-emerald-500/20 stroke-[3]"
                            : isRBRed
                            ? "fill-rose-600 stroke-rose-400 stroke-2 shadow-lg"
                            : isRBBlack
                            ? "fill-slate-950 stroke-white/40 stroke-2"
                            : node.is_end_of_word
                            ? "fill-emerald-950 stroke-emerald-400 stroke-2"
                            : "fill-slate-900 stroke-white/20 stroke-2"
                        }`}
                        filter={isActive ? "url(#glow)" : undefined}
                      />

                      {/* Node Value */}
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        className="font-mono font-bold text-xs fill-white select-none pointer-events-none"
                      >
                        {node.val}
                      </text>

                      {/* Balance Factor Badge (AVL) */}
                      {node.balance_factor !== undefined && node.balance_factor !== null && (
                        <g transform={`translate(${node.x + 14}, ${node.y - 14})`}>
                          <rect
                            x={-10}
                            y={-8}
                            width={20}
                            height={14}
                            rx={4}
                            className={`stroke-[1] ${
                              Math.abs(node.balance_factor) > 1
                                ? "fill-rose-500 stroke-rose-300"
                                : "fill-slate-900 stroke-emerald-500/50"
                            }`}
                          />
                          <text
                            x={0}
                            y={3}
                            textAnchor="middle"
                            className="text-[9px] font-mono font-bold fill-white select-none"
                          >
                            {node.balance_factor > 0 ? `+${node.balance_factor}` : node.balance_factor}
                          </text>
                        </g>
                      )}

                      {/* Segment Tree Interval Badge */}
                      {node.interval && (
                        <text
                          x={node.x}
                          y={node.y + 35}
                          textAnchor="middle"
                          className="font-mono text-[10px] fill-emerald-400 font-semibold"
                        >
                          [{node.interval[0]}, {node.interval[1]}]
                        </text>
                      )}

                      {/* Trie Word Indicator */}
                      {node.word && (
                        <text
                          x={node.x}
                          y={node.y - 28}
                          textAnchor="middle"
                          className="font-mono text-[10px] fill-emerald-300 font-bold"
                        >
                          &ldquo;{node.word}&rdquo;
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                <span className="text-xs font-mono">Rendering Tree...</span>
              </div>
            )}
          </div>

          {/* Bottom Live Step Message */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-mono">
              {activeStep?.message || `Ready. Select an operation to simulate ${activeMeta.name}.`}
            </p>
          </div>
        </section>

        {/* 6. THEORY & INVARIANT MATRIX */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invariant Card */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Calculator className="h-4 w-4" />
              <span>Structural Invariant</span>
            </div>
            {activeMeta.formula && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-emerald-300 font-semibold">
                {activeMeta.formula}
              </div>
            )}
            <p className="text-xs text-gray-400 leading-relaxed">
              {activeMeta.description}
            </p>
          </div>

          {/* Rotation / Fixup Summary */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Zap className="h-4 w-4" />
              <span>Rotation & Balancing Rules</span>
            </div>
            {treeType === "avl" ? (
              <div className="space-y-1.5 text-xs font-mono text-gray-300">
                <div className="p-2 rounded bg-slate-900 flex justify-between">
                  <span className="text-pink-400">LL (Left-Left):</span>
                  <span>Single Right Rotate</span>
                </div>
                <div className="p-2 rounded bg-slate-900 flex justify-between">
                  <span className="text-pink-400">RR (Right-Right):</span>
                  <span>Single Left Rotate</span>
                </div>
                <div className="p-2 rounded bg-slate-900 flex justify-between">
                  <span className="text-cyan-400">LR (Left-Right):</span>
                  <span>Left Rotate &rarr; Right Rotate</span>
                </div>
                <div className="p-2 rounded bg-slate-900 flex justify-between">
                  <span className="text-cyan-400">RL (Right-Left):</span>
                  <span>Right Rotate &rarr; Left Rotate</span>
                </div>
              </div>
            ) : treeType === "redblack" ? (
              <div className="space-y-1 text-xs text-gray-400">
                <p>• Root is always strictly BLACK.</p>
                <p>• No two consecutive RED nodes (Red child has Black parent).</p>
                <p>• Black-height parity across all leaf paths.</p>
                <p>• CLRS 4 double-black deletion cases with symmetric mirroring.</p>
              </div>
            ) : treeType === "segment" ? (
              <div className="space-y-1.5 text-xs font-mono text-gray-300">
                <p className="text-emerald-400">1. Total Overlap [L..R] &sube; [qL..qR]: Return node.val</p>
                <p className="text-cyan-400">2. Partial Overlap: Split into left & right subtrees</p>
                <p className="text-gray-500">3. No Overlap: Discard branch immediately</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed">
                Logarithmic tree depth guarantees high-throughput search and dynamic mutations.
              </p>
            )}
          </div>

          {/* Real World Applications */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Layers className="h-4 w-4" />
              <span>Real-World Systems</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {activeMeta.useCase}
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto border-t border-white/5 pt-8 text-center text-gray-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>&copy; {new Date().getFullYear()} AlgoVerse. TreeMentor Studio & Hierarchical Structures.</span>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/sortmentor" className="hover:text-gray-300 transition-colors">
            SortMentor
          </Link>
          <Link href="/searchmentor" className="hover:text-gray-300 transition-colors">
            SearchMentor
          </Link>
          <Link href="/treementor" className="text-emerald-400 font-semibold">
            TreeMentor
          </Link>
          <Link href="/gate-exam-sorting-algorithms" className="hover:text-gray-300 transition-colors">
            GATE Guide
          </Link>
        </div>
      </footer>
    </div>
  );
}
