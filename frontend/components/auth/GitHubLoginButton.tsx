"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../context/useAuthStore";
import { Loader2 } from "lucide-react";

export default function GitHubLoginButton() {
  const { loginWithGithub } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGithub();
    } catch (err: any) {
      if (err.code === "auth/popup-blocked") {
        setError("Login popup blocked by your browser. Please allow popups and retry.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("Login flow cancelled by user.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error occurred. Please check your internet connection.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError("An account already exists with the same email but different login method.");
      } else {
        setError("GitHub authentication failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <motion.button
        onClick={handleLogin}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/50 hover:text-white transition-all text-sm font-semibold text-gray-200 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        )}
        <span>{loading ? "Connecting..." : "Continue with GitHub"}</span>
      </motion.button>
      {error && (
        <span className="text-[11px] font-medium text-rose-400 text-center bg-rose-500/10 border border-rose-500/20 py-1.5 px-3 rounded-md">
          {error}
        </span>
      )}
    </div>
  );
}
