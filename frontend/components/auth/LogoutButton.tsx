"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../context/useAuthStore";
import { LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
      whileHover={{ x: 2 }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </motion.button>
  );
}
