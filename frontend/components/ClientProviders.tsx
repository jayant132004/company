"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../context/useAuthStore";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  }));

  const { loading, user, refreshToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Refresh Firebase ID token every 45 minutes
    const refreshTimer = setInterval(() => {
      console.log("[ClientProviders] Automatic token refresh triggered.");
      refreshToken().catch((err) => console.error("[ClientProviders] Token refresh error:", err));
    }, 45 * 60 * 1000);

    return () => clearInterval(refreshTimer);
  }, [user, refreshToken]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712]">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="absolute h-8 w-8 animate-ping rounded-full border border-pink-500/20"></div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {loading ? (
        <div className="flex h-screen w-screen items-center justify-center bg-[#030712]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
              <div className="absolute h-6 w-6 animate-pulse rounded-full bg-indigo-500/10"></div>
            </div>
            <p className="text-sm font-medium text-indigo-300/60 animate-pulse tracking-wide">
              Initializing AlgoVerse...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}
