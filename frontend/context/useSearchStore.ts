import { create } from "zustand";

export interface SearchStep {
  step: number;
  event_type: "start" | "probe" | "linear_probe" | "discard_left" | "discard_right" | "jump" | "mismatch" | "candidate_found" | "pointer_move" | "found" | "not_found" | "binary_search_range";
  array: number[];
  target: number;
  pointers: {
    low?: number;
    high?: number;
    mid?: number;
    mid1?: number;
    mid2?: number;
    pos?: number;
    current?: number;
    prev?: number;
    bound_i?: number;
    left?: number;
    right?: number;
    found?: number;
    candidate?: number;
    pair_left?: number;
    pair_right?: number;
    step_size?: number;
    block_start?: number;
    block_end?: number;
  };
  active_index: number | null;
  discarded_ranges: [number, number][];
  found_index: number;
  comparisons: number;
  message: string;
}

export interface SearchMetrics {
  time_ms: number;
  comparisons: number;
  steps_count: number;
  found: boolean;
  found_index: number;
}

interface SearchState {
  array: number[];
  originalArray: number[];
  target: number;
  algorithm: string;
  steps: SearchStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  metrics: SearchMetrics | null;

  setArray: (arr: number[]) => void;
  setOriginalArray: (arr: number[]) => void;
  setTarget: (target: number) => void;
  setAlgorithm: (algo: string) => void;
  setSteps: (steps: SearchStep[]) => void;
  setCurrentStepIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setMetrics: (metrics: SearchMetrics | null) => void;
  resetPlayback: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  array: [8, 15, 23, 37, 42, 56, 68, 74, 82, 91, 99],
  originalArray: [8, 15, 23, 37, 42, 56, 68, 74, 82, 91, 99],
  target: 56,
  algorithm: "binary",
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  speed: 500,
  metrics: null,

  setArray: (array) => set({ array }),
  setOriginalArray: (originalArray) => set({ originalArray }),
  setTarget: (target) => set({ target }),
  setAlgorithm: (algorithm) => set({ algorithm }),
  setSteps: (steps) => set({ steps }),
  setCurrentStepIndex: (currentStepIndex) => set((state) => {
    const activeStep = state.steps[currentStepIndex];
    return {
      currentStepIndex,
      array: activeStep ? activeStep.array : state.array,
    };
  }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),
  setMetrics: (metrics) => set({ metrics }),
  resetPlayback: () => set((state) => ({
    array: [...state.originalArray],
    currentStepIndex: -1,
    isPlaying: false,
  })),
}));
