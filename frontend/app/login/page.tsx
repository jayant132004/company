"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../context/useAuthStore";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import GitHubLoginButton from "../../components/auth/GitHubLoginButton";
import { BrainCircuit, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function LoginContent() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/dashboard";

  useEffect(() => {
    if (user && !loading) {
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#030712] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-indigo-300/60 font-semibold tracking-wide animate-pulse">
          Establishing secure session...
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#030712]">
      {/* Carbon animated mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Floating ambient globes */}
      <motion.div
        className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-pink-600/10 blur-[100px] pointer-events-none"
        animate={{
          x: [0, -50, 50, 0],
          y: [0, 50, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Login Portal Card */}
      <motion.div
        className="glass-panel relative w-full max-w-md p-8 md:p-10 rounded-3xl flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* AlgoVerse Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            Algo<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Verse</span>
          </h1>
          <p className="text-xs text-gray-400 font-semibold tracking-wide text-center max-w-[280px]">
            Master algorithms & data structures with context-aware AI guidance.
          </p>
        </div>

        {/* Buttons Panel */}
        <div className="flex w-full flex-col gap-3 mt-4">
          <GoogleLoginButton />
          <GitHubLoginButton />
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-4">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span>Interactive Computer Science Portal</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#030712] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-indigo-300/60 font-semibold tracking-wide animate-pulse">
            Loading Login Portal...
          </p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
