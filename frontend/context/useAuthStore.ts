import { create } from "zustand";
import { User, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";

export interface UserProfile {
  avatar: string;
  displayName: string;
  username: string;
  bio: string;
  learningGoal: string;
  difficulty: string;
  language: string;
  favoriteTopics: string[];
}

export interface UserSettings {
  accentColor: string;
  defaultSpeed: string;
  visualTheme: string;
  defaultLlm: string;
  preferredMentor: string;
  autoSaveChats: boolean;
  enableNotifications: boolean;
  enableSystemAlerts: boolean;
}

interface AuthState {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  profile: UserProfile | null;
  settings: UserSettings | null;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setIdToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  fetchProfileAndSettings: (uid: string, fallbackUser?: User | null) => Promise<void>;
}

// Cookie Helper Functions for Edge-based Middleware Routing
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict; Secure`;
};

const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Helper to load profile/settings
  const loadProfileAndSettings = async (uid: string, fallbackUser?: User | null) => {
    let profileData: UserProfile = {
      avatar: "💻",
      displayName: fallbackUser?.displayName || "AlgoVerse Student",
      username: fallbackUser?.email ? fallbackUser.email.split("@")[0] : "student",
      bio: "",
      learningGoal: "Learn Sorting Basics",
      difficulty: "intermediate",
      language: "Python",
      favoriteTopics: ["Sorting"]
    };

    let settingsData: UserSettings = {
      accentColor: "indigo",
      defaultSpeed: "normal",
      visualTheme: "Neon",
      defaultLlm: "Gemini 2.5 Flash",
      preferredMentor: "Tutor",
      autoSaveChats: true,
      enableNotifications: true,
      enableSystemAlerts: false
    };

    // Try Firestore
    try {
      const profileRef = doc(db, "users", uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        profileData = {
          avatar: data.avatar || "💻",
          displayName: data.displayName || fallbackUser?.displayName || "AlgoVerse Student",
          username: data.username || (fallbackUser?.email ? fallbackUser.email.split("@")[0] : "student"),
          bio: data.bio || "",
          learningGoal: data.learningGoal || "Learn Sorting Basics",
          difficulty: data.difficulty || "intermediate",
          language: data.language || "Python",
          favoriteTopics: data.favoriteTopics || ["Sorting"]
        };
      } else {
        // Fallback to local storage if doc doesn't exist
        const localProf = localStorage.getItem(`profile_${uid}`);
        if (localProf) {
          const parsed = JSON.parse(localProf);
          profileData = { ...profileData, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Firestore profile fetch offline/failed, using local fallback", e);
      const localProf = localStorage.getItem(`profile_${uid}`);
      if (localProf) {
        try {
          const parsed = JSON.parse(localProf);
          profileData = { ...profileData, ...parsed };
        } catch (err) {}
      }
    }

    try {
      const settingsRef = doc(db, "users_settings", uid);
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        settingsData = {
          accentColor: data.accentColor || "indigo",
          defaultSpeed: data.defaultSpeed || "normal",
          visualTheme: data.visualTheme || "Neon",
          defaultLlm: data.defaultLlm || "Gemini 2.5 Flash",
          preferredMentor: data.preferredMentor || "Tutor",
          autoSaveChats: data.autoSaveChats !== undefined ? data.autoSaveChats : true,
          enableNotifications: data.enableNotifications !== undefined ? data.enableNotifications : true,
          enableSystemAlerts: data.enableSystemAlerts !== undefined ? data.enableSystemAlerts : false
        };
      } else {
        const localSett = localStorage.getItem(`settings_${uid}`);
        if (localSett) {
          const parsed = JSON.parse(localSett);
          settingsData = { ...settingsData, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Firestore settings fetch offline/failed, using local fallback", e);
      const localSett = localStorage.getItem(`settings_${uid}`);
      if (localSett) {
        try {
          const parsed = JSON.parse(localSett);
          settingsData = { ...settingsData, ...parsed };
        } catch (err) {}
      }
    }

    set({ profile: profileData, settings: settingsData });
  };

  // Synchronize Firebase Authentication state changes
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
      setTimeout(async () => {
        const mockUser = {
          uid: "guest_student_id",
          email: "guest@algoverse.io",
          displayName: "Guest Student",
          photoURL: null,
        } as unknown as User;
        set({
          user: mockUser,
          idToken: "mock_token_value",
          loading: false
        });
        setCookie("token", "mock_token_value", 7);
        await loadProfileAndSettings("guest_student_id", mockUser);
      }, 50);
    } else {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const token = await user.getIdToken();
            setCookie("token", token, 7);
            set({ user, idToken: token, loading: false });
            await loadProfileAndSettings(user.uid, user);
          } catch (err) {
            console.error("Error retrieving ID Token:", err);
            deleteCookie("token");
            set({ user: null, idToken: null, loading: false, profile: null, settings: null });
          }
        } else {
          deleteCookie("token");
          set({ user: null, idToken: null, loading: false, profile: null, settings: null });
        }
      });
    }
  }

  return {
    user: null,
    idToken: null,
    loading: true,
    profile: null,
    settings: null,
    setIdToken: (idToken) => {
      if (idToken) setCookie("token", idToken, 7);
      else deleteCookie("token");
      set({ idToken });
    },
    setLoading: (loading) => set({ loading }),
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setSettings: (settings) => set({ settings }),
    fetchProfileAndSettings: async (uid, fallbackUser) => {
      await loadProfileAndSettings(uid, fallbackUser || get().user);
    },
    loginWithGoogle: async () => {
      set({ loading: true });
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        const mockUser = {
          uid: "guest_student_id",
          email: "guest@algoverse.io",
          displayName: "Guest Student",
          photoURL: null,
        } as unknown as User;
        set({
          user: mockUser,
          idToken: "mock_token_value",
          loading: false
        });
        setCookie("token", "mock_token_value", 7);
        await loadProfileAndSettings("guest_student_id", mockUser);
        return;
      }
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          await loadProfileAndSettings(result.user.uid, result.user);
        }
      } catch (error) {
        set({ loading: false });
        console.error("Google login error:", error);
        throw error;
      }
    },
    loginWithGithub: async () => {
      set({ loading: true });
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        const mockUser = {
          uid: "guest_student_id",
          email: "guest@algoverse.io",
          displayName: "Guest Student",
          photoURL: null,
        } as unknown as User;
        set({
          user: mockUser,
          idToken: "mock_token_value",
          loading: false
        });
        setCookie("token", "mock_token_value", 7);
        await loadProfileAndSettings("guest_student_id", mockUser);
        return;
      }
      const provider = new GithubAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          await loadProfileAndSettings(result.user.uid, result.user);
        }
      } catch (error) {
        set({ loading: false });
        console.error("Github login error:", error);
        throw error;
      }
    },
    logout: async () => {
      set({ loading: true });
      deleteCookie("token");
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        set({ user: null, idToken: null, loading: false, profile: null, settings: null });
        return;
      }
      try {
        await signOut(auth);
        set({ user: null, idToken: null, loading: false, profile: null, settings: null });
      } catch (error) {
        set({ loading: false });
        console.error("Sign-out error:", error);
        throw error;
      }
    },
    refreshToken: async () => {
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        return;
      }
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true);
          setCookie("token", token, 7);
          set({ idToken: token });
        } catch (error) {
          console.error("Error refreshing token:", error);
          throw error;
        }
      }
    }
  };
});
