"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "../../context/useAuthStore";
import { db } from "../../firebase/clientApp";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  ArrowLeft, BrainCircuit, User as UserIcon, Mail, Info,
  BookOpen, Star, Save, Loader2, Sparkles, Image, Check
} from "lucide-react";
import UserDropdown from "../../components/auth/UserDropdown";

const PRESET_AVATARS = [
  "💻", "🚀", "⚡", "🧠", "🔥", "🔮", "👽", "🛡️", "👾"
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, setProfile } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Form States
  const [avatar, setAvatar] = useState("💻");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [learningGoal, setLearningGoal] = useState("Learn Sorting Basics");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [language, setLanguage] = useState("Python");
  const [favoriteTopics, setFavoriteTopics] = useState<string[]>(["Sorting"]);

  // Fetch Profile data from Firestore
  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/");
      return;
    }

    if (user) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setAvatar(data.avatar || "💻");
            setDisplayName(data.displayName || user.displayName || "");
            setUsername(data.username || "");
            setBio(data.bio || "");
            setLearningGoal(data.learningGoal || "Learn Sorting Basics");
            setDifficulty(data.difficulty || "intermediate");
            setLanguage(data.language || "Python");
            setFavoriteTopics(data.favoriteTopics || ["Sorting"]);
          } else {
            // Check local storage fallback
            const localStored = localStorage.getItem(`profile_${user.uid}`);
            if (localStored) {
              const data = JSON.parse(localStored);
              setAvatar(data.avatar || "💻");
              setDisplayName(data.displayName || user.displayName || "");
              setUsername(data.username || "");
              setBio(data.bio || "");
              setLearningGoal(data.learningGoal || "Learn Sorting Basics");
              setDifficulty(data.difficulty || "intermediate");
              setLanguage(data.language || "Python");
              setFavoriteTopics(data.favoriteTopics || ["Sorting"]);
            } else {
              setDisplayName(user.displayName || "");
              setUsername(user.email ? user.email.split("@")[0] : "");
            }
          }
        } catch (err) {
          console.warn("Firestore offline or permission denied. Using local state fallback.", err);
          const localStored = localStorage.getItem(`profile_${user.uid}`);
          if (localStored) {
            try {
              const data = JSON.parse(localStored);
              setAvatar(data.avatar || "💻");
              setDisplayName(data.displayName || user.displayName || "");
              setUsername(data.username || "");
              setBio(data.bio || "");
              setLearningGoal(data.learningGoal || "Learn Sorting Basics");
              setDifficulty(data.difficulty || "intermediate");
              setLanguage(data.language || "Python");
              setFavoriteTopics(data.favoriteTopics || ["Sorting"]);
            } catch (e) {}
          } else {
            setDisplayName(user.displayName || "");
            setUsername(user.email ? user.email.split("@")[0] : "");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [user, authLoading, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 1.5MB for Base64 storage)
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleTopic = (topic: string) => {
    if (favoriteTopics.includes(topic)) {
      setFavoriteTopics(favoriteTopics.filter(t => t !== topic));
    } else {
      setFavoriteTopics([...favoriteTopics, topic]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMsg(null);

    const profileData = {
      avatar,
      displayName,
      username: username.replace(/\s+/g, "").toLowerCase(),
      bio,
      learningGoal,
      difficulty,
      language,
      favoriteTopics,
      email: user.email,
      uid: user.uid,
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, profileData, { merge: true });
      setProfile(profileData);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Failed saving profile to Firestore", err);
      // LocalStorage fallback for offline mode
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profileData));
      setProfile(profileData);
      setSuccessMsg("Saved changes locally (Offline Mode).");
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-indigo-300/60 font-medium">Syncing student profile...</p>
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
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              AlgoVerse <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 ml-2">Profile</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <UserDropdown />
        </div>
      </header>

      {/* Main Profile Page */}
      <main className="max-w-4xl mx-auto pt-8">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar Display & Profile Basics */}
          <div className="flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
              
              {/* Profile Avatar Glow Circle */}
              <div className="relative overflow-hidden flex items-center justify-center h-28 w-28 rounded-full bg-slate-950 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                {avatar.startsWith("data:image/") || avatar.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">{avatar}</span>
                )}
                <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white border border-slate-950 cursor-pointer hover:bg-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Image className="h-4.5 w-4.5" />
                </label>
              </div>

              {/* Display Name and email */}
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-white">{displayName || "AlgoVerse Student"}</h2>
                <span className="text-xs text-indigo-400 font-mono">@{username || "student"}</span>
                <span className="text-xs text-gray-400 block mt-1">{user.email}</span>
              </div>
            </div>

            {/* Avatar Preset Grid Selector */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Select Avatar Preset</span>
              <div className="grid grid-cols-3 gap-2.5">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`h-11 rounded-lg flex items-center justify-center text-2xl transition-all cursor-pointer border ${
                      avatar === av
                        ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                        : "bg-slate-950/60 border-white/5 hover:border-white/15"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Profile Detailed Fields */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Form Inputs Container */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <UserIcon className="h-5 w-5" />
                  <h3 className="text-base font-bold text-white">Student Information</h3>
                </div>
                <span className="text-xs font-mono text-gray-500">UID: {user.uid.substring(0, 8)}...</span>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Display Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="glass-input text-sm"
                  />
                </div>

                {/* Username */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="glass-input text-sm pl-8 w-full"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-mono">@</span>
                  </div>
                </div>

                {/* Email (Disabled) */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={user.email || ""}
                      className="glass-input text-sm pl-9 w-full opacity-50 cursor-not-allowed bg-slate-950"
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  </div>
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bio (Optional)</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your learning journey..."
                    className="glass-input text-sm resize-none"
                  />
                </div>
              </div>

              {/* Preferences Section */}
              <div className="border-t border-white/5 pt-6 flex flex-col gap-6">
                
                <div className="flex items-center gap-2 text-pink-400 pb-2 border-b border-white/5">
                  <BookOpen className="h-5 w-5" />
                  <h3 className="text-base font-bold text-white">Learning Preferences</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Learning Goal */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Learning Goal</label>
                    <select
                      value={learningGoal}
                      onChange={(e) => setLearningGoal(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Learn Sorting Basics">Learn Sorting Basics</option>
                      <option value="Master Graph Algorithms">Master Graph Algorithms</option>
                      <option value="Prepare for Coding Interviews">Prepare for Coding Interviews</option>
                      <option value="Academic Coursework Support">Academic Coursework Support</option>
                      <option value="Competitve Programming Prep">Competitive Programming Prep</option>
                    </select>
                  </div>

                  {/* Difficulty Preference */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preferred Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Programming Language */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preferred Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Python">Python</option>
                      <option value="JavaScript">JavaScript / TypeScript</option>
                      <option value="C++">C++</option>
                      <option value="Java">Java</option>
                      <option value="Go">Go</option>
                      <option value="Rust">Rust</option>
                    </select>
                  </div>
                </div>

                {/* Favorite Topics Multi-select */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Favorite Topics</label>
                  <div className="flex flex-wrap gap-2">
                    {["Sorting", "Searching", "Arrays & Matrices", "Linked Lists", "Trees & BSTs", "Graphs & DFS/BFS", "Dynamic Programming", "Bit Manipulation"].map((topic) => {
                      const active = favoriteTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                            active
                              ? "bg-pink-500/20 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                              : "bg-slate-950/60 border-white/5 text-gray-400 hover:text-gray-300 hover:border-white/15"
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Notification alerts */}
              <div className="border-t border-white/5 pt-6 flex items-center justify-between gap-4">
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
                  Save Changes
                </button>
              </div>

            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
