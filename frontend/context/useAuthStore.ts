import { create } from "zustand";
import { User, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/clientApp";

interface AuthState {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setIdToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
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

export const useAuthStore = create<AuthState>((set) => {
  // Synchronize Firebase Authentication state changes
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
      setTimeout(() => {
        set({
          user: {
            uid: "guest_student_id",
            email: "guest@algoverse.io",
            displayName: "Guest Student",
            photoURL: null,
          } as any,
          idToken: "mock_token_value",
          loading: false
        });
        setCookie("token", "mock_token_value", 7);
      }, 50);
    } else {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const token = await user.getIdToken();
            setCookie("token", token, 7);
            set({ user, idToken: token, loading: false });
          } catch (err) {
            console.error("Error retrieving ID Token:", err);
            deleteCookie("token");
            set({ user: null, idToken: null, loading: false });
          }
        } else {
          deleteCookie("token");
          set({ user: null, idToken: null, loading: false });
        }
      });
    }
  }

  return {
    user: null,
    idToken: null,
    loading: true,
    setIdToken: (idToken) => {
      if (idToken) setCookie("token", idToken, 7);
      else deleteCookie("token");
      set({ idToken });
    },
    setLoading: (loading) => set({ loading }),
    setUser: (user) => set({ user }),
    loginWithGoogle: async () => {
      set({ loading: true });
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        set({
          user: {
            uid: "guest_student_id",
            email: "guest@algoverse.io",
            displayName: "Guest Student",
            photoURL: null,
          } as any,
          idToken: "mock_token_value",
          loading: false
        });
        setCookie("token", "mock_token_value", 7);
        return;
      }
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        set({ loading: false });
        console.error("Google login error:", error);
        throw error;
      }
    },
    loginWithGithub: async () => {
      set({ loading: true });
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        set({
          user: {
            uid: "guest_student_id",
            email: "guest@algoverse.io",
            displayName: "Guest Student",
            photoURL: null,
          } as any,
          idToken: "mock_token_value",
          loading: false
        });
        setCookie("token", "mock_token_value", 7);
        return;
      }
      const provider = new GithubAuthProvider();
      try {
        await signInWithPopup(auth, provider);
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
        set({ user: null, idToken: null, loading: false });
        return;
      }
      try {
        await signOut(auth);
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
