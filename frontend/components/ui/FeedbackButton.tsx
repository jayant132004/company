"use client";

import React, { useState } from "react";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

interface FeedbackButtonProps {
  algorithm?: string;
  floating?: boolean;
}

export default function FeedbackButton({ algorithm, floating = true }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!floating) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/10"
          title="Share your feedback"
        >
          <MessageSquarePlus className="h-4 w-4 text-indigo-400" />
          <span>Feedback</span>
        </button>
        <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} defaultAlgorithm={algorithm} />
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-500 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-xl shadow-black/60 hover:shadow-indigo-500/20 backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
          title="Send Feedback & Suggestions"
          aria-label="Send Feedback & Suggestions"
        >
          <div className="relative">
            <MessageSquarePlus className="h-4 w-4 text-indigo-400 group-hover:text-pink-400 transition-colors" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-sans">Feedback</span>
        </button>
      </div>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} defaultAlgorithm={algorithm} />
    </>
  );
}
