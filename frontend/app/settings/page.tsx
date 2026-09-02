"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../context/useAuthStore";
import { db } from "../../firebase/clientApp";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import {
  ArrowLeft, BrainCircuit, Sliders, Sparkles, AlertTriangle,
  Lock, Bell, Download, Trash2, Check, Loader2, Save
} from "lucide-react";
import UserDropdown from "../../components/auth/UserDropdown";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, setSettings } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  // Settings State Variables
  const [accentColor, setAccentColor] = useState("indigo");
  const [defaultSpeed, setDefaultSpeed] = useState("normal");
  const [visualTheme, setVisualTheme] = useState("Neon");
  
  const [defaultLlm, setDefaultLlm] = useState("Gemini 2.5 Flash");
  const [preferredMentor, setPreferredMentor] = useState("Tutor");
  const [autoSaveChats, setAutoSaveChats] = useState(true);

  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableSystemAlerts, setEnableSystemAlerts] = useState(false);

  // Fetch settings from Firestore
  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/");
      return;
    }

    if (user) {
      const fetchSettings = async () => {
        try {
          const docRef = doc(db, "users_settings", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setAccentColor(data.accentColor || "indigo");
            setDefaultSpeed(data.defaultSpeed || "normal");
            setVisualTheme(data.visualTheme || "Neon");
            setDefaultLlm(data.defaultLlm || "Gemini 2.5 Flash");
            setPreferredMentor(data.preferredMentor || "Tutor");
            setAutoSaveChats(data.autoSaveChats !== undefined ? data.autoSaveChats : true);
            setEnableNotifications(data.enableNotifications !== undefined ? data.enableNotifications : true);
            setEnableSystemAlerts(data.enableSystemAlerts !== undefined ? data.enableSystemAlerts : false);
          }
        } catch (err) {
          console.warn("Firestore offline. Using local settings fallback.", err);
          // Try local storage fallback
          const local = localStorage.getItem(`settings_${user.uid}`);
          if (local) {
            try {
              const data = JSON.parse(local);
              setAccentColor(data.accentColor || "indigo");
              setDefaultSpeed(data.defaultSpeed || "normal");
              setVisualTheme(data.visualTheme || "Neon");
              setDefaultLlm(data.defaultLlm || "Gemini 2.5 Flash");
              setPreferredMentor(data.preferredMentor || "Tutor");
              setAutoSaveChats(data.autoSaveChats !== undefined ? data.autoSaveChats : true);
              setEnableNotifications(data.enableNotifications !== undefined ? data.enableNotifications : true);
              setEnableSystemAlerts(data.enableSystemAlerts !== undefined ? data.enableSystemAlerts : false);
            } catch (e) {}
          }
        } finally {
          setLoading(false);
        }
      };

      fetchSettings();
    }
  }, [user, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMsg(null);

    const settingsData = {
      accentColor,
      defaultSpeed,
      visualTheme,
      defaultLlm,
      preferredMentor,
      autoSaveChats,
      enableNotifications,
      enableSystemAlerts,
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, "users_settings", user.uid);
      await setDoc(docRef, settingsData, { merge: true });
      setSettings(settingsData);
      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      // LocalStorage backup
      localStorage.setItem(`settings_${user.uid}`, JSON.stringify(settingsData));
      setSettings(settingsData);
      setSuccessMsg("Settings saved locally (Offline mode).");
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Privacy Actions with Custom Confirmation Modal
  const handleDeleteChatHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete All Chat History?",
      message: "Are you sure you want to delete all your conversation history? This cannot be undone.",
      confirmLabel: "Yes, Delete History",
      cancelLabel: "Cancel",
      onConfirm: () => {
        localStorage.removeItem("sortmentor_conversations");
        setSuccessMsg("Chat history deleted.");
        setTimeout(() => setSuccessMsg(null), 3000);
        setConfirmModal(null);
      },
    });
  };

  const handleExportData = () => {
    if (!user) return;
    const data = {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
      settings: {
        accentColor,
        defaultSpeed,
        visualTheme,
        defaultLlm,
        preferredMentor,
        autoSaveChats,
        enableNotifications
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `algoverse_user_data_${user.uid.substring(0, 6)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Permanently Delete Account?",
      message: "WARNING: This will permanently delete your account and all associated data. This action is irreversible. Do you want to proceed?",
      confirmLabel: "Permanently Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        if (!user) return;
        try {
          await deleteDoc(doc(db, "users", user.uid));
          await deleteDoc(doc(db, "users_settings", user.uid));
        } catch (e) {
          console.warn("Delete document failed/offline");
        }
        localStorage.clear();
        await logout();
        router.push("/");
      },
    });
  };

  if (authLoading || loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-indigo-300/60 font-medium">Syncing configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between pb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative overflow-hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 shadow-[0_0_10px_rgba(99,102,241,0.15)] bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.png" alt="AlgoVerse" className="h-full w-full object-cover scale-110" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              AlgoVerse <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 ml-2">Settings</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <UserDropdown />
        </div>
      </header>

      {/* Main Settings Page */}
      <main className="max-w-3xl mx-auto pt-8">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Appearance Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
            <div className="flex items-center gap-2.5 text-indigo-400 border-b border-white/5 pb-3">
              <Sliders className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Appearance & Themes</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Accent Color */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accent Color</label>
                <div className="flex gap-2.5 mt-1">
                  {["indigo", "pink", "violet", "emerald"].map((color) => {
                    const colorMap: Record<string, string> = {
                      indigo: "bg-indigo-500 shadow-indigo-500/30",
                      pink: "bg-pink-500 shadow-pink-500/30",
                      violet: "bg-violet-500 shadow-violet-500/30",
                      emerald: "bg-emerald-500 shadow-emerald-500/30",
                    };
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAccentColor(color)}
                        className={`h-7 w-7 rounded-full cursor-pointer transition-all border-2 ${colorMap[color]} ${
                          accentColor === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Default Speed */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Animation Speed</label>
                <select
                  value={defaultSpeed}
                  onChange={(e) => setDefaultSpeed(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="slow">Slow (350ms delay)</option>
                  <option value="normal">Default (150ms delay)</option>
                  <option value="fast">Fast (50ms delay)</option>
                </select>
              </div>

              {/* Visualization Theme */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visualization Color Theme</label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {["Neon", "Classic", "Pastel"].map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setVisualTheme(theme)}
                      className={`py-2 px-4 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        visualTheme === theme
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                          : "bg-slate-950/60 border-white/5 text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      {theme} Theme
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
            <div className="flex items-center gap-2.5 text-pink-400 border-b border-white/5 pb-3">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">AI Coach & Tutor Settings</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Default LLM */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default LLM Model</label>
                <select
                  value={defaultLlm}
                  onChange={(e) => setDefaultLlm(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Gemini 2.5 Flash">Gemini 2.5 Flash (Default)</option>
                  <option value="Gemini 2.5 Pro">Gemini 2.5 Pro (In-depth analysis)</option>
                  <option value="Groq Llama 3">Groq Llama 3 (Ultra-low latency)</option>
                </select>
              </div>

              {/* Preferred Mentor style */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mentor Persona Style</label>
                <select
                  value={preferredMentor}
                  onChange={(e) => setPreferredMentor(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Tutor">Encouraging Tutor (Step-by-step guidance)</option>
                  <option value="Coach">Rigorous Coach (Quiz questions, performance focus)</option>
                  <option value="Examiner">Formal Examiner (Interrogative code analysis)</option>
                </select>
              </div>

              {/* Autosave Chats Toggle */}
              <div className="flex items-center justify-between sm:col-span-2 pt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">Auto Save Conversation History</span>
                  <span className="text-xs text-gray-400">Save active sessions automatically to local cache</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSaveChats}
                  onChange={(e) => setAutoSaveChats(e.target.checked)}
                  className="h-5 w-5 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Notifications config */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-5">
            <div className="flex items-center gap-2.5 text-cyan-400 border-b border-white/5 pb-3">
              <Bell className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">System Notifications</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">In-App Notifications</span>
                  <span className="text-xs text-gray-400">Receive alerts when milestones or streaks are earned</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableNotifications}
                  onChange={(e) => setEnableNotifications(e.target.checked)}
                  className="h-5 w-5 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">Sound Alerts</span>
                  <span className="text-xs text-gray-400">Play micro-tones during swaps/compares visualization events</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableSystemAlerts}
                  onChange={(e) => setEnableSystemAlerts(e.target.checked)}
                  className="h-5 w-5 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Account Management Section (Priority 6) */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6 border-red-500/20">
            <div className="flex items-center gap-2.5 text-rose-400 border-b border-white/5 pb-3">
              <Lock className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Privacy & Danger Zone</h3>
            </div>

            <div className="flex flex-col gap-4">
              {/* Clear chats */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">Clear All Conversations</span>
                  <span className="text-xs text-gray-400">Permanently delete all session messages and history logs</span>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteChatHistory}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete History
                </button>
              </div>

              {/* Export Data */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">Export Student Profile Data</span>
                  <span className="text-xs text-gray-400">Download a full JSON export of your settings and profile metrics</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </button>
              </div>

              {/* Delete account */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="h-4.5 w-4.5" />
                    Permanently Delete Account
                  </span>
                  <span className="text-xs text-gray-400">Deletes your user profile and configurations permanently</span>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="flex-1">
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold font-mono"
                >
                  <Check className="h-4 w-4" />
                  {successMsg}
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 shrink-0"
            >
              {saving ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Save className="h-4.5 w-4.5" />
              )}
              Save Settings
            </button>
          </div>

        </form>
      </main>

      {/* Custom Destructive Confirmation Modal */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200"
            >
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h4 className="font-bold text-sm text-white">{confirmModal.title}</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{confirmModal.message}</p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 transition-all cursor-pointer"
                >
                  {confirmModal.cancelLabel || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  {confirmModal.confirmLabel || "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
