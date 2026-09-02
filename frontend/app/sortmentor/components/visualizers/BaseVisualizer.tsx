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
  accentColor?: "indigo" | "pink" | "emerald" | "violet" | "cyan";
  theme?: "Classic" | "Pastel" | "Neon";
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
  minHeight: number;
  preferredHeight: number;
  explanation: "bottom" | "right";
  aiDrawer: boolean;
  hasMultiTier: boolean;
  category: "comparison" | "distribution" | "tree" | "hybrid";
  layoutLabel: string;
}

export const ALGO_LAYOUTS: Record<string, VisualizerLayout> = {
  bubble: { minHeight: 380, preferredHeight: 480, explanation: "right", aiDrawer: true, hasMultiTier: false, category: "comparison", layoutLabel: "1D Bar Grid" },
  selection: { minHeight: 380, preferredHeight: 480, explanation: "right", aiDrawer: true, hasMultiTier: false, category: "comparison", layoutLabel: "1D Bar Grid" },
  insertion: { minHeight: 380, preferredHeight: 480, explanation: "right", aiDrawer: true, hasMultiTier: false, category: "comparison", layoutLabel: "Floating Key Bar Grid" },
  quick: { minHeight: 400, preferredHeight: 500, explanation: "right", aiDrawer: true, hasMultiTier: false, category: "comparison", layoutLabel: "Partition Bar Grid" },
  merge: { minHeight: 520, preferredHeight: 620, explanation: "bottom", aiDrawer: true, hasMultiTier: true, category: "tree", layoutLabel: "Split Tree & Dual Workbench" },
  heap: { minHeight: 480, preferredHeight: 580, explanation: "bottom", aiDrawer: true, hasMultiTier: true, category: "tree", layoutLabel: "Binary Tree Graph" },
  counting: { minHeight: 460, preferredHeight: 560, explanation: "bottom", aiDrawer: true, hasMultiTier: true, category: "distribution", layoutLabel: "3-Tier Frequency Matrix" },
  radix: { minHeight: 480, preferredHeight: 580, explanation: "bottom", aiDrawer: true, hasMultiTier: true, category: "distribution", layoutLabel: "10-Digit Bucket Stage" },
  bucket: { minHeight: 520, preferredHeight: 620, explanation: "bottom", aiDrawer: true, hasMultiTier: true, category: "distribution", layoutLabel: "Dynamic Bucket Cups & Output" },
  shell: { minHeight: 400, preferredHeight: 500, explanation: "bottom", aiDrawer: true, hasMultiTier: false, category: "comparison", layoutLabel: "Interleaved Gap Grid" },
  timsort: { minHeight: 460, preferredHeight: 560, explanation: "bottom", aiDrawer: true, hasMultiTier: true, category: "hybrid", layoutLabel: "Run Partitions & Merge Grid" },
};

export const getAlgorithmLayout = (algoName: string): VisualizerLayout => {
  let key = algoName.toLowerCase().replace(/[\s_-]/g, "");
  if (key === "tim") key = "timsort";
  return ALGO_LAYOUTS[key] || ALGO_LAYOUTS.bubble;
};

// Shared Scaling Utilities for Visualizers
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

export interface BarColorOptions {
  theme?: "Classic" | "Pastel" | "Neon";
  accentColor?: "indigo" | "pink" | "emerald" | "violet" | "cyan";
  battleId?: 1 | 2;
}

// Unified Theme Palette Matrix (Consolidated, DRY, and scalable)
export const THEME_PALETTES = {
  Classic: {
    base: {
      indigo: "bg-indigo-600 rounded-none border-b-2 border-indigo-800",
      pink: "bg-pink-600 rounded-none border-b-2 border-pink-800",
      emerald: "bg-emerald-600 rounded-none border-b-2 border-emerald-800",
      violet: "bg-violet-600 rounded-none border-b-2 border-violet-800",
      cyan: "bg-cyan-600 rounded-none border-b-2 border-cyan-800",
    },
    swap: "bg-rose-600 rounded-none border-b-2 border-rose-800",
    compare: "bg-amber-500 rounded-none border-b-2 border-amber-700",
    pivot: "bg-cyan-500 rounded-none border-b-2 border-cyan-700",
    locked: "bg-emerald-600 rounded-none border-b-2 border-emerald-800",
    default: "bg-slate-700 rounded-none",
  },
  Pastel: {
    base: {
      indigo: "bg-indigo-300/80 rounded-t-xl shadow-sm",
      pink: "bg-pink-300/80 rounded-t-xl shadow-sm",
      emerald: "bg-emerald-300/80 rounded-t-xl shadow-sm",
      violet: "bg-violet-300/80 rounded-t-xl shadow-sm",
      cyan: "bg-cyan-300/80 rounded-t-xl shadow-sm",
    },
    swap: "bg-rose-300/90 rounded-t-xl shadow-sm",
    compare: "bg-amber-200/90 rounded-t-xl shadow-sm",
    pivot: "bg-cyan-200/90 rounded-t-xl shadow-sm",
    locked: "bg-emerald-300/90 rounded-t-xl shadow-sm",
    default: "bg-slate-300/40 rounded-t-xl",
  },
  Neon: {
    base: {
      indigo: "bg-indigo-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(99,102,241,0.2)] rounded-t-md",
      pink: "bg-pink-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(236,72,153,0.2)] rounded-t-md",
      emerald: "bg-emerald-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(16,185,129,0.2)] rounded-t-md",
      violet: "bg-violet-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(139,92,246,0.2)] rounded-t-md",
      cyan: "bg-cyan-500/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_0_10px_rgba(6,182,212,0.2)] rounded-t-md",
    },
    swap: "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] rounded-t-md ring-1 ring-rose-300/40",
    compare: "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] rounded-t-md ring-1 ring-amber-200/40",
    pivot: "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] rounded-t-md ring-1 ring-cyan-200/40",
    locked: "bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)] rounded-t-md",
    default: "bg-slate-700/50 rounded-t-md",
  },
};

/**
 * Returns accessible, non-color visual indicators for colorblind users
 */
export const getBarA11yIndicator = (idx: number, activeStep: SortStep | undefined) => {
  if (!activeStep) return null;
  if (activeStep.swap && activeStep.swap.includes(idx)) {
    return { symbol: "⇄", label: "Swap", color: "text-rose-400" };
  }
  if (activeStep.compare && activeStep.compare.includes(idx)) {
    return { symbol: "▲", label: "Compare", color: "text-amber-300" };
  }
  if (activeStep.pivot === idx) {
    return { symbol: "◆", label: "Pivot", color: "text-cyan-300" };
  }
  if (activeStep.locked_indices && activeStep.locked_indices.includes(idx)) {
    return { symbol: "✓", label: "Sorted", color: "text-emerald-400" };
  }
  return null;
};

/**
 * Computes the bar styling class based on algorithm step state, theme, and battle player role.
 * Resolves color collisions between User Personal Accent and Battle Arena Opponent.
 */
export const getBarColorClass = (
  idx: number,
  activeStep: SortStep | undefined,
  options?: BarColorOptions | "indigo" | "pink" | "emerald" | "violet" | "cyan"
): string => {
  // Normalize options parameter
  let theme: "Classic" | "Pastel" | "Neon" = "Neon";
  let userAccent: "indigo" | "pink" | "emerald" | "violet" | "cyan" = "indigo";
  let battleId: 1 | 2 | undefined = undefined;

  if (typeof options === "string") {
    userAccent = options;
  } else if (options) {
    if (options.theme) theme = options.theme;
    if (options.accentColor) userAccent = options.accentColor;
    if (options.battleId) battleId = options.battleId;
  } else {
    // Fallback store read
    const settings = useAuthStore.getState().settings;
    if (settings?.visualTheme) theme = settings.visualTheme as "Classic" | "Pastel" | "Neon";
    if (settings?.accentColor) userAccent = settings.accentColor as "indigo" | "pink" | "emerald" | "violet" | "cyan";
  }

  // Battle Arena Conflict Resolution:
  // Player 1 is guaranteed non-colliding (defaults to indigo, or emerald if user prefers pink).
  // Player 2 is guaranteed pink/rose.
  let resolvedAccent: "indigo" | "pink" | "emerald" | "violet" | "cyan" = userAccent;
  if (battleId === 1) {
    resolvedAccent = userAccent === "pink" ? "indigo" : userAccent;
  } else if (battleId === 2) {
    resolvedAccent = "pink";
  }

  const palette = THEME_PALETTES[theme] || THEME_PALETTES.Neon;

  if (!activeStep) {
    return palette.base[resolvedAccent] || palette.base.indigo;
  }

  if (activeStep.swap && activeStep.swap.includes(idx)) {
    return palette.swap;
  }
  if (activeStep.compare && activeStep.compare.includes(idx)) {
    return palette.compare;
  }
  if (activeStep.pivot === idx) {
    return palette.pivot;
  }
  if (activeStep.locked_indices && activeStep.locked_indices.includes(idx)) {
    return palette.locked;
  }

  return palette.default;
};
