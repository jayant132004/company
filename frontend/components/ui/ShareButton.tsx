"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "AlgoVerse",
      text: "Check out AlgoVerse — the interactive AI-powered Computer Science learning platform!",
      url: typeof window !== "undefined" ? window.location.origin : "https://algoverse-flame.vercel.app"
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Share aborted or failed", err);
      }
    } else {
      // Fallback to Clipboard copy
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard copy failed", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="relative flex items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-950 text-gray-400 hover:text-white transition-all cursor-pointer shadow-md select-none group"
      title="Share Website"
    >
      {copied ? (
        <Check className="h-4.5 w-4.5 text-emerald-400" />
      ) : (
        <Share2 className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
      )}
      
      {/* Dynamic Copy Tooltip */}
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-11 right-0 z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 rounded bg-indigo-600 text-[10px] font-bold font-mono text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
          >
            Link Copied!
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
