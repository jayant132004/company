"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
  Scale,
  Zap,
  Target,
  FileText,
  Clock,
  HelpCircle,
  ExternalLink,
  Code2,
  TrendingUp,
  Share2,
  Play,
  Calculator,
  ArrowLeft,
  Globe,
  Building2,
  Download,
} from "lucide-react";
import UserDropdown from "../../components/auth/UserDropdown";
import ShareButton from "../../components/ui/ShareButton";

interface PYQ {
  id: string;
  year: string;
  type: "MCQ" | "NAT" | "MSQ";
  marks: number;
  question: string;
  options?: { label: string; text: string; correct?: boolean }[];
  correctAnswer?: string;
  explanation: string;
  formula?: string;
  algoLink: string;
  algoName: string;
}

const GATE_PYQS: PYQ[] = [
  {
    id: "pyq-1",
    year: "GATE CS (Decision Tree Lower Bound)",
    type: "MCQ",
    marks: 2,
    question:
      "What is the minimum number of key comparisons required in the worst case to sort an array of 5 distinct elements using any comparison-based sorting algorithm?",
    options: [
      { label: "A", text: "5" },
      { label: "B", text: "7", correct: true },
      { label: "C", text: "8" },
      { label: "D", text: "10" },
    ],
    correctAnswer: "Option B (7 comparisons)",
    formula: "\\text{Height } h \\ge \\lceil \\log_2(n!) \\rceil",
    explanation:
      "For any comparison-based sorting algorithm, the computation can be modeled as a Binary Decision Tree where each leaf represents a unique permutation of the input elements. An array of n distinct elements has n! possible permutations. A binary tree of height h has at most 2^h leaves. Therefore, 2^h ≥ n! ⟹ h ≥ ⌈log₂(n!)⌉. For n = 5: 5! = 120. log₂(120) ≈ 6.9068. Hence, the minimum worst-case comparisons = ⌈6.9068⌉ = 7.",
    algoLink: "quick",
    algoName: "Quick Sort",
  },
  {
    id: "pyq-2",
    year: "GATE CS (Insertion Sort Inversions)",
    type: "NAT",
    marks: 2,
    question:
      "Consider the array A = [34, 8, 50, 12, 25, 5]. How many element shifts/swaps are performed when this array is sorted in ascending order using standard Insertion Sort?",
    correctAnswer: "10",
    formula: "\\text{Total Swaps} = \\text{Number of Inversions } I(A)",
    explanation:
      "In standard Insertion Sort, each swap/shift reduces the total number of inversions in the array by exactly 1. An inversion is a pair (i, j) such that i < j and A[i] > A[j]. Listing all inverted pairs: For 34: (34,8), (34,12), (34,25), (34,5) → 4 pairs. For 8: (8,5) → 1 pair. For 50: (50,12), (50,25), (50,5) → 3 pairs. For 12: (12,5) → 1 pair. For 25: (25,5) → 1 pair. Total inversions = 4 + 1 + 3 + 1 + 1 = 10. Therefore, exactly 10 shifts/swaps are executed.",
    algoLink: "insertion",
    algoName: "Insertion Sort",
  },
  {
    id: "pyq-3",
    year: "GATE CS (Algorithm Properties & Invariants)",
    type: "MSQ",
    marks: 2,
    question:
      "Which of the following statements is/are TRUE regarding standard sorting algorithms?",
    options: [
      {
        label: "A",
        text: "Any comparison-based sorting algorithm requires at least Ω(n log n) comparisons in the worst case.",
        correct: true,
      },
      {
        label: "B",
        text: "Heap Sort is an in-place sorting algorithm with guaranteed O(n log n) worst-case time complexity, but is not stable.",
        correct: true,
      },
      {
        label: "C",
        text: "Standard 2-way Merge Sort can sort an array in-place without requiring O(n) auxiliary memory.",
        correct: false,
      },
      {
        label: "D",
        text: "Counting Sort achieves O(n + k) time complexity and is stable, making it optimal when the key range k = O(n).",
        correct: true,
      },
    ],
    correctAnswer: "Options A, B, and D",
    explanation:
      "Statement A is TRUE by the decision tree lower bound Ω(n log n). Statement B is TRUE: HeapSort sorts directly within the array (O(1) auxiliary space) and has O(n log n) best/worst/avg time, but non-adjacent sift-down operations make it unstable. Statement C is FALSE: Standard array Merge Sort requires O(n) auxiliary buffer for the merge step. Statement D is TRUE: Counting sort runs in linear O(n + k) time and uses prefix counts to guarantee stability.",
    algoLink: "heap",
    algoName: "Heap Sort",
  },
  {
    id: "pyq-4",
    year: "GATE CS (QuickSort Unbalanced Recurrence)",
    type: "MCQ",
    marks: 2,
    question:
      "Suppose a QuickSort variant always produces a proportional partition where the pivot divides an array of size n into two subarrays of size n/10 and 9n/10. What is the asymptotic time complexity of this algorithm?",
    options: [
      { label: "A", text: "O(n)" },
      { label: "B", text: "O(n log n)", correct: true },
      { label: "C", text: "O(n²)" },
      { label: "D", text: "O(n^(1.5))" },
    ],
    correctAnswer: "Option B (O(n log n))",
    formula: "T(n) = T(n/10) + T(9n/10) + cn",
    explanation:
      "Drawing the recursion tree for T(n) = T(n/10) + T(9n/10) + cn: At each level of the tree, the total cost summed across all nodes is at most cn. The shortest root-to-leaf path has depth log₁₀(n), and the longest path has depth log₁₀/₉(n). Since the depth of the tree is bounded by O(log n) and the work at each level is O(n), the total time complexity is strictly Θ(n log n). Even extreme constant-ratio splits (like 99:1) yield O(n log n) running time.",
    algoLink: "quick",
    algoName: "Quick Sort",
  },
  {
    id: "pyq-5",
    year: "GATE CS (Bottom-Up Heapify Complexity)",
    type: "NAT",
    marks: 2,
    question:
      "What is the asymptotic time complexity to convert an unsorted array of n elements into a Binary Max-Heap using Floyd's bottom-up build-heap algorithm?",
    correctAnswer: "O(n)",
    formula: "\\sum_{h=0}^{\\lfloor \\log_2 n \\rfloor} \\left\\lceil \\frac{n}{2^{h+1}} \\right\\rceil O(h) = O(n)",
    explanation:
      "In bottom-up heap construction, nodes at height h can sift down at most h levels. An n-element binary tree has at most ⌈n / 2^(h+1)⌉ nodes at height h. Total work S = ∑_{h=0}^{log n} (n / 2^(h+1)) · h = (n / 2) ∑_{h=0}^{∞} (h / 2^h). The infinite geometric-arithmetic series ∑ (h / 2^h) converges to 2. Therefore, S = (n / 2) · 2 = O(n). While sorting the heap takes O(n log n), building the initial heap is strictly linear O(n).",
    algoLink: "heap",
    algoName: "Heap Sort",
  },
];

const WEIGHTAGE_DATA = [
  {
    year: "GATE 2024",
    totalAlgoMarks: "8 Marks",
    sortingMarks: "3 Marks",
    topicTested: "Decision Tree Lower Bound & QuickSort Partition Recurrence",
    questionType: "1 MCQ (1 Mark) + 1 NAT (2 Marks)",
  },
  {
    year: "GATE 2023",
    totalAlgoMarks: "7 Marks",
    sortingMarks: "4 Marks",
    topicTested: "Number of Inversions in Insertion Sort & Stability of Heap/Merge",
    questionType: "1 MSQ (2 Marks) + 1 NAT (2 Marks)",
  },
  {
    year: "GATE 2022",
    totalAlgoMarks: "8 Marks",
    sortingMarks: "3 Marks",
    topicTested: "Comparison count in finding Min/Max & Counting Sort key space",
    questionType: "1 MCQ (1 Mark) + 1 MCQ (2 Marks)",
  },
  {
    year: "GATE 2021",
    totalAlgoMarks: "9 Marks",
    sortingMarks: "4 Marks",
    topicTested: "Master's Theorem on Divide & Conquer (Merge/Quick) + Heapify",
    questionType: "2 NATs (2 Marks each)",
  },
  {
    year: "GATE 2020",
    totalAlgoMarks: "7 Marks",
    sortingMarks: "3 Marks",
    topicTested: "Worst-case QuickSort pivot selections & External 2-way Merge",
    questionType: "1 MCQ (1 Mark) + 1 NAT (2 Marks)",
  },
  {
    year: "GATE 2019",
    totalAlgoMarks: "8 Marks",
    sortingMarks: "3 Marks",
    topicTested: "Radix Sort digit passes & Polyphase K-way merging",
    questionType: "1 MCQ (2 Marks) + 1 MCQ (1 Mark)",
  },
];

const CORE_CONCEPTS = [
  {
    id: "concept-1",
    title: "1. Comparison-Based Lower Bound Ω(n log n)",
    badge: "Must-Know Proof",
    color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    desc: "Why can't any comparison sort run faster than O(n log n) in the worst case?",
    points: [
      "Every comparison sort can be represented as a 2-ary Decision Tree.",
      "An array of n distinct elements has n! permutations, so the tree must have at least n! leaves.",
      "A binary tree of height h has at most 2^h leaves ⟹ 2^h ≥ n! ⟹ h ≥ ⌈log₂(n!)⌉.",
      "Using Stirling's Approximation (n! ≈ √(2πn)(n/e)^n): log₂(n!) = n log₂ n - n log₂ e + O(log n) = Ω(n log n).",
      "Frequent GATE Question: Exact number of comparisons for small n (e.g. n=5 requires ⌈log₂(120)⌉ = 7 comparisons).",
    ],
  },
  {
    id: "concept-2",
    title: "2. Stability & In-Place Memory Classification",
    badge: "Frequent MSQ Topic",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    desc: "Which algorithms preserve relative order of duplicates and which operate in O(1) extra space?",
    points: [
      "Stable Algorithms: Merge Sort, Insertion Sort, Bubble Sort, Counting Sort, Radix Sort, TimSort.",
      "Unstable Algorithms: QuickSort, Heap Sort, Selection Sort, Shell Sort.",
      "In-Place (O(1) extra memory): Bubble, Selection, Insertion, Heap, Shell Sort.",
      "Out-of-Place (Auxiliary memory): Merge Sort (O(n)), Counting Sort (O(n+k)), Radix Sort (O(n+k)).",
      "QuickSort uses O(log n) call stack auxiliary memory in best/avg case, and O(n) in worst case.",
    ],
  },
  {
    id: "concept-3",
    title: "3. Recurrence Relations & Divide-and-Conquer",
    badge: "Master Theorem Link",
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    desc: "How sorting problems translate into recurrence equations in GATE DAA.",
    points: [
      "Merge Sort: T(n) = 2T(n/2) + Θ(n) ⟹ By Master's Theorem Case 2, T(n) = Θ(n log n).",
      "QuickSort Best Case (Balanced 50:50): T(n) = 2T(n/2) + Θ(n) ⟹ Θ(n log n).",
      "QuickSort Worst Case (Sorted/Reverse 1:(n-1)): T(n) = T(n-1) + Θ(n) ⟹ Θ(n²).",
      "QuickSort Asymmetric (10:90 split): T(n) = T(n/10) + T(9n/10) + cn ⟹ Θ(n log n).",
      "K-Way Merge of K sorted lists of size N/K: T(n) = O(N log K) using a Min-Heap of size K.",
    ],
  },
  {
    id: "concept-4",
    title: "4. Non-Comparison Linear-Time Sorts",
    badge: "Constraints & Trade-offs",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    desc: "When and why we can bypass the Ω(n log n) comparison barrier.",
    points: [
      "Counting Sort: Runs in O(n + k) time and O(n + k) space where keys are in range [0, k]. Feasible only when k = O(n).",
      "Radix Sort: Uses Counting Sort on each of d digits. Time = O(d · (n + b)) where b is the base/radix. When d = O(1), runs in O(n).",
      "Bucket Sort: Assumes uniform distribution over [0, 1). Distributes keys into n buckets and sorts each with Insertion Sort in average O(n) time.",
      "GATE Trap: Counting Sort is NOT comparison-based, so it does NOT violate the Ω(n log n) decision tree theorem.",
    ],
  },
];

const FAQS = [
  {
    q: "Why is Sorting tested so heavily in the GATE CS syllabus?",
    a: "Sorting serves as the ultimate litmus test for algorithmic maturity. A single sorting question can simultaneously test Asymptotic Analysis (Big-O, Omega, Theta), Recurrence Relations (Master Theorem), Data Structures (Heaps, Arrays), Proof Techniques (Decision Trees), and Memory Invariants (Stability and In-Place).",
  },
  {
    q: "What is the typical weightage of Algorithms & Sorting in GATE CSE?",
    a: "The Algorithms section in GATE CSE consistently carries between 6 to 9 marks out of 100. Sorting and searching directly contribute 2 to 4 marks every single year, with indirect concepts (divide-and-conquer recurrences, heap operations) contributing another 2 to 3 marks.",
  },
  {
    q: "Are standard library hybrid algorithms like TimSort asked in GATE?",
    a: "While classical GATE questions primarily focus on QuickSort, MergeSort, and HeapSort, modern GATE trends and MSQ questions increasingly test hybrid design concepts (e.g. why Python and Java combine Merge Sort with Insertion Sort into TimSort to leverage O(n) run-detection and cache-friendly sorting).",
  },
  {
    q: "How does visualizing algorithms help score higher in GATE NAT and MSQ questions?",
    a: "GATE NAT questions frequently ask for the exact number of comparisons, swaps, or tree heights on concrete array examples (e.g. finding inversions or Lomuto partition steps). Visualizing these step-by-step in SortMentor builds concrete geometric intuition so you don't make off-by-one errors under exam pressure.",
  },
];

interface GateResourceLink {
  title: string;
  category: "Official Portal" | "Syllabus" | "Academic Lecture" | "PYQ Archive";
  url: string;
  authority: string;
  desc: string;
  tag: string;
  isPdf?: boolean;
}

const OFFICIAL_GATE_RESOURCES: GateResourceLink[] = [
  {
    title: "GATE Official Examination Portal",
    category: "Official Portal",
    url: "https://gate2025.iitr.ac.in/",
    authority: "Organizing IITs (IIT Roorkee / IISc Bangalore)",
    desc: "National examination portal for application notifications, exam schedules, official announcements, scorecards, and admission counseling.",
    tag: "Primary Authority",
  },
  {
    title: "Official GATE Computer Science (CS) Syllabus PDF",
    category: "Syllabus",
    url: "https://gate2025.iitr.ac.in/doc/syllabus/CS.pdf",
    authority: "Ministry of Education & National GATE Committee",
    desc: "Official curriculum detailing Section 3 (Data Structures & Algorithms): Asymptotic complexity, worst and average case analysis, sorting algorithms, priority queues, and hashing.",
    tag: "Official CS PDF",
    isPdf: true,
  },
  {
    title: "Official GATE Data Science & AI (DA) Syllabus PDF",
    category: "Syllabus",
    url: "https://gate2025.iitr.ac.in/doc/syllabus/DA.pdf",
    authority: "National GATE Committee (IITs & IISc)",
    desc: "Official syllabus for the dedicated DA paper detailing Algorithms: Search algorithms, sorting algorithms (comparison and non-comparison), divide-and-conquer, and graph traversals.",
    tag: "Official DA PDF",
    isPdf: true,
  },
  {
    title: "Official Master Question Papers & Answer Keys Repository",
    category: "PYQ Archive",
    url: "https://gate2025.iitr.ac.in/download-question-papers.html",
    authority: "National GATE Organizing Committee",
    desc: "Official archive containing master question papers with official verified answer keys from 2010 to 2025 across all examination sessions.",
    tag: "Verified Keys",
  },
  {
    title: "NPTEL Design and Analysis of Algorithms (IIT Madras)",
    category: "Academic Lecture",
    url: "https://nptel.ac.in/courses/106106131",
    authority: "Prof. Madhavan Mukund (IIT Madras / CMI)",
    desc: "Premier government-funded university lecture series covering divide-and-conquer recurrences, Master's theorem proofs, decision tree lower bounds, and sorting.",
    tag: "Top Faculty",
  },
  {
    title: "GATE Overflow Verified Sorting & Algorithms Archive",
    category: "PYQ Archive",
    url: "https://gateoverflow.in/tag/sorting",
    authority: "GATE Overflow Peer-Review Community",
    desc: "Detailed peer-reviewed community solutions, edge-case derivations, and multiple solution approaches for every sorting question asked in GATE since 1987.",
    tag: "PYQ Community",
  },
  {
    title: "MIT OpenCourseWare 6.006: Introduction to Algorithms",
    category: "Academic Lecture",
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
    authority: "MIT EECS Department",
    desc: "World-benchmark university lectures covering comparison-based sorting bounds Ω(n log n), Binary Heaps, and linear-time counting/radix sorts.",
    tag: "Global Benchmark",
  },
  {
    title: "GeeksforGeeks GATE CS Algorithms Subject Notes",
    category: "Academic Lecture",
    url: "https://www.geeksforgeeks.org/gate-cs-notes-gq/",
    authority: "GeeksforGeeks DAA Portal",
    desc: "Topic-by-topic structured notes, quick complexity comparison charts, and practice multiple-choice questions categorized by GATE syllabus modules.",
    tag: "Quick Revision",
  },
];

export default function GateGuidePage() {
  const router = useRouter();
  const [expandedPYQ, setExpandedPYQ] = useState<string | null>("pyq-1");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);

  const navigateToVisualizer = (algoId?: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof document !== "undefined") {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    const params = new URLSearchParams();
    if (algoId) params.set("algorithm", algoId);
    const queryString = params.toString();
    router.push(queryString ? `/sortmentor?${queryString}` : "/sortmentor");
  };

  return (
    <div className="min-h-screen bg-[#030712] py-6 px-4 sm:px-6 lg:px-8 text-gray-300">
      {/* 1. TOP NAVIGATION HEADER */}
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
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/sortmentor"
              className="text-gray-400 hover:text-white transition-colors"
            >
              SortMentor Studio
            </Link>
            <span className="text-white border-b-2 border-indigo-500 pb-1 cursor-default flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              GATE Guide
            </span>
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
        <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
          GATE Preparation
        </Link>
        <span>/</span>
        <span className="text-indigo-300 font-semibold">Sorting Algorithms Weightage</span>
      </nav>

      <main className="max-w-6xl mx-auto flex flex-col gap-14 pt-6 pb-20">
        {/* 3. HERO SECTION */}
        <section className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden border border-white/5 bg-gradient-to-b from-indigo-950/20 via-slate-950/50 to-slate-950/80">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="flex flex-col gap-6 text-left max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-indigo-400" /> GATE CS & DA Master Guide
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Updated for 2026/2027 Pattern
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Importance of <span className="text-gradient">Sorting Algorithms</span> in GATE Exam
            </h1>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Sorting algorithms are the single highest-yield foundational topic in the GATE Computer Science and Data Science & AI (DA) syllabi. They are tested not just as standalone questions, but as the core building blocks for <strong>Master&apos;s Theorem</strong>, <strong>Divide-and-Conquer recurrences</strong>, <strong>Heap data structures</strong>, and <strong>Greedy optimization</strong>.
            </p>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
                <span className="text-2xl font-black text-white font-mono">4–8</span>
                <span className="text-xs text-gray-400 font-medium">Marks in DAA Section</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
                <span className="text-2xl font-black text-emerald-400 font-mono">100%</span>
                <span className="text-xs text-gray-400 font-medium">10-Year Appearance Rate</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
                <span className="text-2xl font-black text-indigo-400 font-mono">Ω(n log n)</span>
                <span className="text-xs text-gray-400 font-medium">Decision Tree Bound</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
                <span className="text-2xl font-black text-pink-400 font-mono">11+</span>
                <span className="text-xs text-gray-400 font-medium">Interactive Visualizers</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={() => document.getElementById("gate-pyqs")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm transition-all text-white shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Practice Solved GATE Questions ↓
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateToVisualizer()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 font-semibold text-sm transition-all text-white cursor-pointer"
              >
                Launch Visualizer Simulation →
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. WEIGHTAGE BREAKDOWN TABLE */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  GATE CS Weightage & Trends (Last 6+ Years)
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Actual marks breakdown and question distributions across official GATE question papers.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-white/10 text-gray-400">
              DAA Total Weightage: ~6–9 Marks
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/60 shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80 font-mono text-gray-400">
                  <th className="p-4 font-bold">Exam Year</th>
                  <th className="p-4 font-bold">Total DAA Weightage</th>
                  <th className="p-4 font-bold">Sorting Direct Weightage</th>
                  <th className="p-4 font-bold">Core Concepts Tested</th>
                  <th className="p-4 font-bold">Question Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {WEIGHTAGE_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white font-mono">{row.year}</td>
                    <td className="p-4 text-indigo-300 font-semibold">{row.totalAlgoMarks}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {row.sortingMarks}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{row.topicTested}</td>
                    <td className="p-4 text-gray-400 font-mono text-[11px]">{row.questionType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Trend Takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                <Target className="h-4 w-4" /> Shift to MSQs
              </span>
              <p className="text-xs text-gray-400 leading-relaxed">
                Recent papers utilize Multiple Select Questions (MSQ) with negative marking traps on algorithm <strong>stability</strong>, <strong>in-place auxiliary space</strong>, and adaptive time complexities.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <span className="text-xs font-mono font-bold text-pink-400 flex items-center gap-1.5">
                <Calculator className="h-4 w-4" /> NAT Precision on Inversions
              </span>
              <p className="text-xs text-gray-400 leading-relaxed">
                Numerical Answer Type (NAT) questions frequently require calculating exact shift counts in Insertion Sort or finding decision tree leaf depths ⌈log₂(n!)⌉ for concrete arrays.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> Cross-Domain Recurrences
              </span>
              <p className="text-xs text-gray-400 leading-relaxed">
                Partition-based sorting recurrences directly feed into Median-of-Medians (QuickSelect) and Kruskal&apos;s Minimum Spanning Tree edge sorting complexities.
              </p>
            </div>
          </div>
        </section>

        {/* 5. WHY IT MATTERS - INTERCONNECTEDNESS SECTION */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Zap className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Why Sorting Matters: How It Connects to All GATE CS Topics
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Mastering sorting unlocks high scores across multiple core Computer Science subjects.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>1. Divide and Conquer & Master Theorem</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Merge Sort and QuickSort are the standard benchmark models in Design and Analysis of Algorithms (DAA). When solving recurrence equations via Master&apos;s Theorem or Akra-Bazzi, GATE examiners test recursive subproblems directly modeled after these two sorting engines:
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-white/5 font-mono text-xs text-indigo-300">
                T(n) = 2T(n/2) + O(n) &rarr; Merge Sort &Theta;(n log n)<br />
                T(n) = T(n-1) + O(n) &rarr; QuickSort Worst Case &Theta;(n²)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Layers className="h-4 w-4" />
                <span>2. Priority Queues & Binary Heap Structures</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Heap Sort bridges array-based indexing with complete binary tree properties. Understanding why building a heap takes <strong>O(n)</strong> time while heap sorting takes <strong>O(n log n)</strong> is tested repeatedly in GATE Data Structures.
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-white/5 font-mono text-xs text-emerald-300">
                Build-Heap: O(n) via geometric summation<br />
                Extract-Min/Max: O(log n) &times; n times = O(n log n)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                <Scale className="h-4 w-4" />
                <span>3. Greedy Algorithms (Kruskal & Huffman Coding)</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Many classical greedy algorithms depend strictly on an initial sorting phase. Kruskal&apos;s MST algorithm requires sorting all graph edges in <strong>O(E log E) = O(E log V)</strong> time. Huffman encoding builds optimal prefix trees by repeatedly extracting the smallest frequencies from a sorted priority queue.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Target className="h-4 w-4" />
                <span>4. Searching, 2-Pointers & Median Selection</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Sorting transforms unorganized search spaces into ordered structures that enable <strong>Binary Search in O(log n)</strong>, 2-Sum two-pointer linear scans in <strong>O(n)</strong>, and QuickSelect (Hoare&apos;s selection algorithm) for k-th order statistics in <strong>O(n) expected time</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* 6. COMMONLY TESTED CONCEPTS & CHEAT SHEET */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Commonly Tested Concepts in GATE Syllabus
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                The 4 theoretical pillars you must memorize and understand conceptually.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_CONCEPTS.map((concept) => (
              <div
                key={concept.id}
                className={`p-6 rounded-2xl bg-slate-950/50 border flex flex-col gap-4 ${concept.color}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{concept.title}</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    {concept.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{concept.desc}</p>
                <ul className="space-y-2 text-xs text-gray-400 list-disc pl-4">
                  {concept.points.map((pt, i) => (
                    <li key={i} className="leading-relaxed">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 7. SOLVED GATE-STYLE QUESTIONS (INTERACTIVE REVEAL) */}
        <section id="gate-pyqs" className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Sample GATE-Style Questions with Deep-Dive Solutions
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Step-by-step mathematical proofs and direct links to test in the AlgoVerse visualizer.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {GATE_PYQS.map((pyq) => {
              const isExpanded = expandedPYQ === pyq.id;
              return (
                <div
                  key={pyq.id}
                  className="p-6 rounded-2xl bg-slate-950/70 border border-white/5 transition-all flex flex-col gap-4"
                >
                  <div
                    onClick={() => setExpandedPYQ(isExpanded ? null : pyq.id)}
                    className="flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {pyq.year}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/5 text-gray-400">
                          {pyq.type} &bull; {pyq.marks} Marks
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                        {pyq.question}
                      </h3>
                    </div>
                    <button className="p-1 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Multiple Choice Options if applicable */}
                  {pyq.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {pyq.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                            isExpanded && opt.correct
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold"
                              : "bg-slate-900/60 border-white/5 text-gray-300"
                          }`}
                        >
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                              isExpanded && opt.correct
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-slate-800 text-gray-400"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expanded Solution Explanation */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-white/5 flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-white">
                            Correct Answer: <span className="text-emerald-400 font-mono">{pyq.correctAnswer}</span>
                          </span>
                        </div>

                        {pyq.formula && (
                          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 font-mono text-xs text-indigo-300">
                            Mathematical Basis: {pyq.formula}
                          </div>
                        )}

                        <p className="text-xs text-gray-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-white/5">
                          {pyq.explanation}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                          <span className="text-xs text-gray-500">
                            Reinforce this concept with live motion trajectory:
                          </span>
                          <button
                            onClick={() => navigateToVisualizer(pyq.algoLink)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Play className="h-3 w-3" />
                            Simulate {pyq.algoName} in SortMentor →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. OFFICIAL GATE PORTALS, SYLLABI & REPOSITORIES */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Globe className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Official GATE Portals, Syllabi & Authoritative Repositories
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Direct links to organizing IITs, official syllabus PDFs, NPTEL master lectures, and verified PYQ archives.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-white/10 text-emerald-400 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Official IIT & Government Sources
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_GATE_RESOURCES.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-indigo-500/40 hover:bg-slate-900/40 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {res.category}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-400 group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                      {res.isPdf ? <Download className="h-3 w-3 text-pink-400" /> : <ExternalLink className="h-3 w-3" />}
                      {res.tag}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                    <span>{res.title}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-indigo-400" />
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {res.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-gray-500 font-mono">
                  <span>{res.authority}</span>
                  <span className="text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
                    Visit Resource &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 9. INTERACTIVE CTA SECTION */}
        <section className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950/60 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-xl text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Interactive DSA Studio
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Test & Verify Algorithm Invariants in Real-Time
            </h2>
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
              Don&apos;t memorize abstract proofs blindly. Watch partition boundaries shift in QuickSort, trace recursive tree splits in MergeSort, and inspect max-heapify adjustments step-by-step in SortMentor.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigateToVisualizer("quick")}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Launch QuickSort Visualizer
              </button>
              <button
                onClick={() => navigateToVisualizer("heap")}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 hover:border-white/20 text-gray-200 font-semibold text-xs transition-all cursor-pointer"
              >
                Test Heap Binary Trees
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 hover:border-white/20 text-gray-200 font-semibold text-xs transition-all flex items-center gap-1"
              >
                Complexity Cheat Sheet →
              </Link>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 p-6 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col gap-3 text-center md:text-left">
            <span className="text-xs font-mono font-bold text-emerald-400">Battle Arena Mode</span>
            <p className="text-xs text-gray-400 max-w-xs">
              Compare two algorithms side-by-side on identical arrays to see comparison count differences live.
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                router.push("/sortmentor?mode=battle");
              }}
              className="px-4 py-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 font-bold text-xs transition-all cursor-pointer"
            >
              Open Side-by-Side Arena →
            </button>
          </div>
        </section>

        {/* 9. FREQUENTLY ASKED QUESTIONS */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <HelpCircle className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Frequently Asked Questions (GATE Preparation)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Targeted advice for scoring maximum marks in the Algorithms section.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFAQ === idx;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-950/60 border border-white/5 transition-all flex flex-col gap-3"
                >
                  <button
                    onClick={() => setExpandedFAQ(isOpen ? null : idx)}
                    className="flex items-center justify-between gap-4 text-left w-full cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <span className="p-1 rounded bg-slate-900 text-gray-400 shrink-0">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-white/5"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto border-t border-white/5 pt-8 text-center text-gray-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>&copy; {new Date().getFullYear()} AlgoVerse. Computer Science & GATE Preparation Studio.</span>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
            Cheat Sheet
          </Link>
          <Link href="/sortmentor" className="hover:text-gray-300 transition-colors">
            SortMentor
          </Link>
          <Link href="/gate-exam-sorting-algorithms" className="text-indigo-400 font-semibold">
            GATE Guide
          </Link>
        </div>
      </footer>
    </div>
  );
}
