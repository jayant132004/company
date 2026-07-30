import { SortStep } from "../../../../context/useSortStore";

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
  bubble: { preferredWidth: "100%", preferredHeight: 600, explanation: "right", aiDrawer: true },
  selection: { preferredWidth: "100%", preferredHeight: 600, explanation: "right", aiDrawer: true },
  insertion: { preferredWidth: "100%", preferredHeight: 600, explanation: "right", aiDrawer: true },
  quick: { preferredWidth: "100%", preferredHeight: 620, explanation: "right", aiDrawer: true },
  merge: { preferredWidth: "100%", preferredHeight: 850, explanation: "bottom", aiDrawer: true },
  heap: { preferredWidth: "100%", preferredHeight: 700, explanation: "bottom", aiDrawer: true },
  counting: { preferredWidth: "100%", preferredHeight: 620, explanation: "bottom", aiDrawer: true },
  radix: { preferredWidth: "100%", preferredHeight: 650, explanation: "bottom", aiDrawer: true },
  bucket: { preferredWidth: "100%", preferredHeight: 650, explanation: "bottom", aiDrawer: true },
  shell: { preferredWidth: "100%", preferredHeight: 600, explanation: "bottom", aiDrawer: true },
};

// Shared Styling Utilities for Visualizers
export const getNormalizedHeight = (val: number, originalArray: number[]): string => {
  const minVal = Math.min(...originalArray, 0);
  const maxVal = Math.max(...originalArray, 1);
  const range = maxVal - minVal;
  if (range === 0) return "50%";
  const percentage = ((val - minVal) / range) * 80 + 20; // Ensure at least 20% visible height
  return `${percentage}%`;
};

export const getBarColorClass = (
  idx: number,
  activeStep: SortStep | undefined,
  accentColor: "indigo" | "pink" | "emerald" = "indigo"
): string => {
  if (!activeStep) {
    return accentColor === "pink" ? "bg-pink-500/80" : "bg-indigo-500/80";
  }

  // Swap Event
  if (activeStep.swap && activeStep.swap.includes(idx)) {
    return "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]";
  }

  // Compare Event
  if (activeStep.compare && activeStep.compare.includes(idx)) {
    return "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]";
  }

  // Pivot Event
  if (activeStep.pivot === idx) {
    return "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]";
  }

  // Sorted / Locked Region
  if (activeStep.locked_indices && activeStep.locked_indices.includes(idx)) {
    return "bg-emerald-500/80";
  }

  return "bg-slate-700/50";
};
