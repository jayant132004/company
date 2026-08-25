import { SortStep } from "../../../../context/useSortStore";
import { useAuthStore } from "../../../../context/useAuthStore";

export interface VisualizerProps {
  array: number[];
  originalArray: number[];
  steps: SortStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  onJump: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  zoom: number;
  fullscreen: boolean;
  battleId?: 1 | 2;
}

export interface VisualizerRef {
  play: () => void;
  pause: () => void;
  nextStep: () => void;
  previousStep: () => void;
  restart: () => void;
  jumpToStep: (step: number) => void;
  updateSpeed: (speed: number) => void;
  exportReplay: () => void;
}

export interface VisualizerLayout {
  preferredWidth: string;
  preferredHeight: number;
  explanation: "bottom" | "right";
  aiDrawer: boolean;
}

export const ALGO_LAYOUTS: Record<string, VisualizerLayout> = {
  bubble: { preferredWidth: "100%", preferredHeight: 540, explanation: "right", aiDrawer: true },
  selection: { preferredWidth: "100%", preferredHeight: 560, explanation: "right", aiDrawer: true },
  insertion: { preferredWidth: "100%", preferredHeight: 540, explanation: "right", aiDrawer: true },
  quick: { preferredWidth: "100%", preferredHeight: 560, explanation: "right", aiDrawer: true },
  merge: { preferredWidth: "100%", preferredHeight: 650, explanation: "bottom", aiDrawer: true },
  heap: { preferredWidth: "100%", preferredHeight: 600, explanation: "bottom", aiDrawer: true },
  counting: { preferredWidth: "100%", preferredHeight: 560, explanation: "bottom", aiDrawer: true },
  radix: { preferredWidth: "100%", preferredHeight: 580, explanation: "bottom", aiDrawer: true },
  bucket: { preferredWidth: "100%", preferredHeight: 600, explanation: "bottom", aiDrawer: true },
  shell: { preferredWidth: "100%", preferredHeight: 540, explanation: "bottom", aiDrawer: true },
  tim: { preferredWidth: "100%", preferredHeight: 600, explanation: "bottom", aiDrawer: true },
  timsort: { preferredWidth: "100%", preferredHeight: 600, explanation: "bottom", aiDrawer: true },
};

// Shared Styling Utilities for Visualizers
export const getNormalizedHeight = (val: number, originalArray: number[]): string => {
  const minVal = Math.min(...originalArray, 0);
  const maxVal = Math.max(...originalArray, 1);
  const range = maxVal - minVal;
  if (range === 0) return "50%";
  // Safe scaling: minimum 24% height, maximum 82% height to ensure value numbers never clip
  const percentage = ((val - minVal) / range) * 58 + 24;
  return `${percentage}%`;
};

export const getNumberFontSizeClass = (arrayLength: number): string => {
  if (arrayLength <= 10) return "text-sm font-extrabold";
  if (arrayLength <= 14) return "text-xs font-bold";
  if (arrayLength <= 18) return "text-[11px] font-bold";
  return "text-[10px] font-semibold";
};

export const getBarColorClass = (
  idx: number,
  activeStep: SortStep | undefined,
  accentColor: "indigo" | "pink" | "emerald" = "indigo"
): string => {
  // If battle mode player 2, keep pink. Otherwise, use global settings color if it exists.
  let activeAccent: string = accentColor;
  if (accentColor !== "pink") {
    const globalSettings = useAuthStore.getState().settings;
    if (globalSettings?.accentColor) {
      activeAccent = globalSettings.accentColor;
    }
  }

  const visualTheme = useAuthStore.getState().settings?.visualTheme || "Neon";

  if (visualTheme === "Classic") {
    if (!activeStep) {
      const colorMap: Record<string, string> = {
        indigo: "bg-indigo-600 rounded-none border-b-2 border-indigo-800",
        pink: "bg-pink-600 rounded-none border-b-2 border-pink-800",
        emerald: "bg-emerald-600 rounded-none border-b-2 border-emerald-800",
        violet: "bg-violet-600 rounded-none border-b-2 border-violet-800",
      };
      return colorMap[activeAccent] || "bg-indigo-600 rounded-none";
    }
    if (activeStep.swap && activeStep.swap.includes(idx)) {
      return "bg-rose-600 rounded-none border-b-2 border-rose-800";
    }
    if (activeStep.compare && activeStep.compare.includes(idx)) {
      return "bg-amber-500 rounded-none border-b-2 border-amber-700";
    }
    if (activeStep.pivot === idx) {
      return "bg-cyan-500 rounded-none border-b-2 border-cyan-700";
    }
    if (activeStep.locked_indices && activeStep.locked_indices.includes(idx)) {
      return "bg-emerald-600 rounded-none border-b-2 border-emerald-800";
    }
    return "bg-slate-700 rounded-none";
  }

  if (visualTheme === "Pastel") {
    if (!activeStep) {
      const colorMap: Record<string, string> = {
        indigo: "bg-indigo-300/80 rounded-t-xl shadow-sm",
        pink: "bg-pink-300/80 rounded-t-xl shadow-sm",
        emerald: "bg-emerald-300/80 rounded-t-xl shadow-sm",
        violet: "bg-violet-300/80 rounded-t-xl shadow-sm",
      };
      return colorMap[activeAccent] || "bg-indigo-300/80 rounded-t-xl";
    }
    if (activeStep.swap && activeStep.swap.includes(idx)) {
      return "bg-rose-300/90 rounded-t-xl shadow-sm";
    }
    if (activeStep.compare && activeStep.compare.includes(idx)) {
      return "bg-amber-200/90 rounded-t-xl shadow-sm";
    }
    if (activeStep.pivot === idx) {
      return "bg-cyan-200/90 rounded-t-xl shadow-sm";
    }
    if (activeStep.locked_indices && activeStep.locked_indices.includes(idx)) {
      return "bg-emerald-300/90 rounded-t-xl shadow-sm";
    }
    return "bg-slate-300/40 rounded-t-xl";
  }

  // Neon (Default)
  if (!activeStep) {
    const colorMap: Record<string, string> = {
      indigo: "bg-indigo-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(99,102,241,0.2)] rounded-t-md",
      pink: "bg-pink-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(236,72,153,0.2)] rounded-t-md",
      emerald: "bg-emerald-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(16,185,129,0.2)] rounded-t-md",
      violet: "bg-violet-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(139,92,246,0.2)] rounded-t-md",
    };
    return colorMap[activeAccent] || "bg-indigo-500/80 rounded-t-md";
  }

  if (activeStep.swap && activeStep.swap.includes(idx)) {
    return "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] rounded-t-md";
  }
  if (activeStep.compare && activeStep.compare.includes(idx)) {
    return "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] rounded-t-md";
  }
  if (activeStep.pivot === idx) {
    return "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] rounded-t-md";
  }
  if (activeStep.locked_indices && activeStep.locked_indices.includes(idx)) {
    const sortedColorMap: Record<string, string> = {
      indigo: "bg-indigo-600/70 border border-indigo-400/30 rounded-t-md",
      pink: "bg-pink-600/70 border border-pink-400/30 rounded-t-md",
      emerald: "bg-emerald-600/70 border border-emerald-400/30 rounded-t-md",
      violet: "bg-violet-600/70 border border-violet-400/30 rounded-t-md",
    };
    return sortedColorMap[activeAccent] || "bg-emerald-500/80 rounded-t-md";
  }
  return "bg-slate-700/50 rounded-t-md";
};
