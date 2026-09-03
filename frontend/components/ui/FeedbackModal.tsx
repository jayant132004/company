"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus,
  Star,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Heart,
  Bug,
  Lightbulb,
  Compass,
  Smile,
} from "lucide-react";
import { useAuthStore } from "../../context/useAuthStore";
import { db } from "../../firebase/clientApp";
import { collection, addDoc } from "firebase/firestore";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAlgorithm?: string;
}

const CATEGORIES = [
  { id: "Learning Experience", label: "Learning Experience", icon: Lightbulb, color: "text-amber-400" },
  { id: "Visualizer Feedback", label: "Visualizer Feedback", icon: Compass, color: "text-cyan-400" },
  { id: "Feature Request", label: "Feature Request", icon: Sparkles, color: "text-indigo-400" },
  { id: "Bug Report", label: "Bug Report", icon: Bug, color: "text-rose-400" },
  { id: "General", label: "General", icon: Smile, color: "text-emerald-400" },
];

export default function FeedbackModal({
  isOpen,
  onClose,
  defaultAlgorithm,
}: FeedbackModalProps) {
  const { user } = useAuthStore();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("Learning Experience");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please provide a brief message before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const feedbackPayload = {
      category,
      rating,
      title: title.trim(),
      message: message.trim(),
      algorithm: defaultAlgorithm || undefined,
      page_url: typeof window !== "undefined" ? window.location.href : "",
      email: email.trim() || (user?.email ?? undefined),
    };

    try {
      // 1. Submit to FastAPI Backend
      try {
        await fetch(`${API_BASE}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(feedbackPayload),
        });
      } catch (backendErr) {
        console.warn("[Backend Feedback Offline fallback]", backendErr);
      }

      // 2. Submit to Firestore if available
      try {
        if (db) {
          await addDoc(collection(db, "users_feedback"), {
            ...feedbackPayload,
            uid: user?.uid || "guest_student",
            createdAt: new Date().toISOString(),
          });
        }
      } catch (firestoreErr) {
        console.warn("[Firestore Feedback fallback]", firestoreErr);
      }

      // Also persist locally in localStorage for resilience
      const localFeedback = JSON.parse(localStorage.getItem("local_feedbacks") || "[]");
      localFeedback.push({ ...feedbackPayload, timestamp: new Date().toISOString() });
      localStorage.setItem("local_feedbacks", JSON.stringify(localFeedback));

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        setTitle("");
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-lg bg-slate-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden z-10 flex flex-col gap-5 text-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-400">
                  <MessageSquarePlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    Share Your Feedback
                  </h3>
                  <p className="text-xs text-slate-400">
                    Help us shape the future of AI-powered algorithm learning.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close feedback modal"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="p-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h4 className="text-xl font-extrabold text-white">Thank You!</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Your feedback has been logged. Our engineering team reads every submission to continuously improve AlgoVerse.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Rating Stars */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    How was your experience?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating !== null ? hoverRating : rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              isActive
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                                : "text-slate-600 hover:text-slate-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                      {rating === 5
                        ? "★★★★★ (Excellent!)"
                        : rating === 4
                        ? "★★★★☆ (Very Good)"
                        : rating === 3
                        ? "★★★☆☆ (Good)"
                        : rating === 2
                        ? "★★☆☆☆ (Fair)"
                        : "★☆☆☆☆ (Needs Work)"}
                    </span>
                  </div>
                </div>

                {/* Category Selector Pills */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Feedback Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                              : "bg-slate-950/60 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Title / Summary */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Topic / Summary (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Loved the Quick Sort ghost trails, or Suggestion for AVL Trees"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Feedback Message */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">
                      Your Thoughts & Suggestions <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {message.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you liked, any bugs encountered, or what algorithms / visual features you'd like to see next..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Heart className="h-3 w-3 text-pink-500" />
                    Built with love for CS learners
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-xl hover:bg-slate-800 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !message.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit Feedback</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
