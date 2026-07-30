"use client";

import React from "react";
import { useAuthStore } from "../../context/useAuthStore";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
}

export default function UserAvatar({ size = "md" }: UserAvatarProps) {
  const { user } = useAuthStore();
  
  if (!user) return null;
  
  const displayName = user.displayName || user.email || "Student";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
    
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base"
  };
  
  return (
    <div className={`relative flex items-center justify-center rounded-full overflow-hidden border border-white/10 bg-slate-900/80 shadow-inner ${sizeClasses[size]}`}>
      {user.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.photoURL}
          alt={displayName}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-bold text-indigo-300 tracking-wider">{initials}</span>
      )}
    </div>
  );
}
