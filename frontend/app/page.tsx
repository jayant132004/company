"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "../context/useAuthStore";
import { Terminal, BrainCircuit, ShieldAlert, Cpu, Sparkles, Award, Zap } from "lucide-react";

export default function Home() {
  const { user, loginWithGoogle, loginWithGithub, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async (provider: "google" | "github") => {
    try {
      if (provider === "google") {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:px-8">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-pink-500/5 blur-[160px]"></div>

      <motion.div
        className="w-full max-w-4xl glass-panel p-8 md:p-12 rounded-2xl flex flex-col md:flex-row gap-12 items-center relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Visual Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-right from-transparent via-indigo-500 to-pink-500"></div>

        {/* Product Brand / Value Prop Column */}
        <div className="flex-1 flex flex-col gap-6 text-left">
          <motion.div className="flex items-center gap-3 text-indigo-400" variants={itemVariants}>
            <BrainCircuit className="h-8 w-8" />
            <span className="font-mono text-sm uppercase tracking-widest font-bold">Project AlgoVerse</span>
          </motion.div>

          <motion.h1 className="text-4xl md:text-5xl font-black tracking-tight" variants={itemVariants}>
            Master CS with the <span className="text-gradient">Next-Gen AI Tutor</span>
          </motion.h1>

          <motion.p className="text-gray-400 text-base md:text-lg leading-relaxed" variants={itemVariants}>
            AlgoVerse is a premium platform featuring interactive data structure visualizers, RAG-powered learning paths, real-time code execution replay, and personalized AI coaching.
          </motion.p>

          <motion.div className="grid grid-cols-2 gap-4 pt-4" variants={itemVariants}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-300">Live Visualizer</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-300">RAG AI Memory</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-300">Battle Arena</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-300">XP & Gamification</span>
            </div>
          </motion.div>
        </div>

        {/* Login Column */}
        <motion.div
          className="w-full md:w-80 flex flex-col gap-6 p-6 rounded-xl bg-slate-950/40 border border-white/5 relative"
          variants={itemVariants}
        >
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h2 className="text-xl font-bold text-white">Get Started</h2>
            <p className="text-xs text-gray-400">Sign in to start earning XP, syncing your progress, and accessing the AI Tutor.</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Google Sign In */}
            <button
              onClick={() => handleLogin("google")}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-900/100 hover:border-indigo-500/50 hover:text-white transition-all text-sm font-semibold text-gray-200 cursor-pointer shadow-sm shadow-black/40"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* GitHub Sign In */}
            <button
              onClick={() => handleLogin("github")}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-900/100 hover:border-indigo-500/50 hover:text-white transition-all text-sm font-semibold text-gray-200 cursor-pointer shadow-sm shadow-black/40"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
              <Terminal className="h-3 w-3" />
              Secured by Firebase Auth
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 text-gray-500 text-xs tracking-wide">
        &copy; {new Date().getFullYear()} AlgoVerse Inc. All rights reserved.
      </div>
    </div>
  );
}
