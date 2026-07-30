"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "../../context/useAuthStore";
import { 
  Trophy, Flame, Sparkles, Map, Code, BookOpen, 
  ChevronRight, BrainCircuit, ArrowUpRight, Loader2
} from "lucide-react";
import UserDropdown from "../../components/auth/UserDropdown";

export default function Dashboard() {
  const { user, logout, loading } = useAuthStore();
  const router = useRouter();
  const [xp, setXp] = useState(380);
  const [level, setLevel] = useState(4);
  const [streak, setStreak] = useState(5);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
      return;
    }
    if (user) {
      fetch("http://localhost:8000/api/v1/recommendations")
        .then(res => res.json())
        .then(data => setRecommendation(data))
        .catch(err => console.error("Error loading recommendations:", err));
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-indigo-300/60 font-medium">Syncing student profile...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#030712] py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Algo<span className="text-gradient">Verse</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <UserDropdown />
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        
        {/* Left Columns - Stats, AI Recommendation, Roadmap */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              className="glass-card p-5 flex flex-col gap-2 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between text-indigo-400">
                <Trophy className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300/50">XP</span>
              </div>
              <span className="text-2xl font-black text-white">{xp}</span>
              <span className="text-[10px] text-gray-400">Next level at 500 XP</span>
              <div className="w-full bg-white/5 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-indigo-500 h-full w-[76%] rounded-full"></div>
              </div>
            </motion.div>

            <motion.div 
              className="glass-card p-5 flex flex-col gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between text-pink-400">
                <Flame className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-300/50">Streak</span>
              </div>
              <span className="text-2xl font-black text-white">{streak} days</span>
              <span className="text-[10px] text-gray-400">Keep it up tomorrow!</span>
            </motion.div>

            <motion.div 
              className="glass-card p-5 flex flex-col gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between text-cyan-400">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300/50">Level</span>
              </div>
              <span className="text-2xl font-black text-white">{level}</span>
              <span className="text-[10px] text-gray-400">CS Practitioner</span>
            </motion.div>
          </div>

          {/* AI Recommendation Card */}
          <motion.div 
            className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-left from-indigo-500/5 to-transparent pointer-events-none"></div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase font-mono tracking-widest font-bold">Personalized AI Recommendation</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {recommendation?.recommended_next?.name 
                  ? `Next Up: Study ${recommendation.recommended_next.name}`
                  : "Analyze sorting performance with SortMentor"}
              </h3>
              <p className="text-sm text-gray-400 max-w-lg">
                {recommendation?.recommended_next?.reason 
                  ? recommendation.recommended_next.reason
                  : "Your profile shows you have completed basic array lessons. We recommend launching SortMentor to compare Merge Sort and Quick Sort live in the Battle Arena."}
              </p>
            </div>
            <button 
              onClick={() => router.push("/sortmentor")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all text-white shadow-lg shadow-indigo-600/20 cursor-pointer whitespace-nowrap self-stretch md:self-auto text-center justify-center"
            >
              Launch SortMentor
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Interactive Curriculum Roadmap */}
          <motion.div 
            className="glass-card p-6 flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <Map className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Your Learning Journey</h3>
            </div>

            <div className="flex flex-col gap-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              
              {/* Node 1 - Completed */}
              <div className="relative flex justify-between items-center group">
                <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-500 shadow-md shadow-emerald-500/30"></div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">1. Foundations of Programming</span>
                  <span className="text-xs text-gray-400">Arrays, Strings, Recursion</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Mastered</span>
              </div>

              {/* Node 2 - Active */}
              <div className="relative flex justify-between items-center group">
                <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-indigo-500 border-2 border-indigo-500 animate-pulse shadow-md shadow-indigo-500/30"></div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">2. Sorting & Searching Algorithms</span>
                  <span className="text-xs text-gray-400">Visualizing swaps, compares, and time complexities</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">Active</span>
              </div>

              {/* Node 3 - Locked */}
              <div className="relative flex justify-between items-center opacity-40">
                <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-white/20 border-2 border-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-400">3. Non-Linear Structures (Trees & Graphs)</span>
                  <span className="text-xs text-gray-500">BSTs, AVLs, Shortest Path Routing</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-500">Locked</span>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Right Column - AI Mentor Box & Quick Navigation */}
        <div className="flex flex-col gap-8">
          
          {/* AI Mentor Persistent Memory Box */}
          <motion.div 
            className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">AI Coach Memory</span>
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></div>
            </div>

            <div className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-xl border border-white/5">
              <BrainCircuit className="h-5 w-5 text-pink-400 mt-1 flex-shrink-0" />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-400 font-semibold">Active Profile Focus</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  "I noticed you struggled slightly with Pivot selection in Quick Sort. I have flagged **Partition complexity** in your vector search memory. I will adapt future sorting quizzes to focus here."
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Strongest Concept</span>
                <span className="text-emerald-400 font-semibold">Binary Search</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Weakest Concept</span>
                <span className="text-pink-400 font-semibold">Quick Sort Partition</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Nav Options */}
          <motion.div 
            className="flex flex-col gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Available Modules</h4>
            
            <button 
              onClick={() => router.push("/sortmentor")}
              className="glass-card p-4 flex items-center justify-between hover:bg-slate-900/40 border-l-4 border-l-indigo-500 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-indigo-400" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-white">SortMentor</span>
                  <span className="text-[10px] text-gray-400">11 Algorithms & Battle Arena</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>

            <button 
              disabled
              className="glass-card p-4 flex items-center justify-between border-l-4 border-l-gray-600 opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-gray-400" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-400">TreeMentor</span>
                  <span className="text-[10px] text-gray-500">Coming soon in Phase 4</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
