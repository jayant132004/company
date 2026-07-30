"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../context/useAuthStore";
import UserAvatar from "./UserAvatar";
import LogoutButton from "./LogoutButton";
import { LayoutDashboard, Settings, User as UserIcon, ChevronDown } from "lucide-react";

export default function UserDropdown() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.displayName || "AlgoVerse Student";
  const email = user.email || "";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/5 bg-slate-950/40 p-1 pr-3 hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all cursor-pointer"
      >
        <UserAvatar size="sm" />
        <span className="hidden md:inline text-xs font-semibold text-gray-300 max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-slate-900/90 p-1.5 backdrop-blur-xl shadow-2xl z-50"
          >
            {/* User Profile Header */}
            <div className="flex flex-col gap-0.5 border-b border-white/5 px-3 py-2.5">
              <span className="text-xs font-bold text-white truncate">{displayName}</span>
              {email && <span className="text-[10px] text-gray-400 truncate">{email}</span>}
            </div>

            {/* Menu Links */}
            <div className="flex flex-col gap-0.5 py-1.5 border-b border-white/5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/dashboard");
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/profile");
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <UserIcon className="h-4 w-4 text-pink-400" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-cyan-400" />
                <span>Settings</span>
              </button>
            </div>

            {/* Logout Action */}
            <div className="py-1">
              <LogoutButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
