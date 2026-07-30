import { create } from "zustand";

export interface SortStep {
  step: number;
  event_type: string;
  array: number[];
  compare: number[] | null;
  swap: number[] | null;
  pivot?: number;
  locked_indices?: number[];
  message: string;
}

interface SortMetrics {
  time_ms: number;
  swaps: number;
  comparisons: number;
  steps_count: number;
}

interface SortState {
  array: number[];
  originalArray: number[];
  algorithm: string;
  steps: SortStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number; // delay in ms
  metrics: SortMetrics | null;
  
  // Battle Arena states
  battleMode: boolean;
  algorithm2: string;
  steps2: SortStep[];
  currentStepIndex2: number;
  metrics2: SortMetrics | null;
  
  setArray: (arr: number[]) => void;
  setOriginalArray: (arr: number[]) => void;
  setAlgorithm: (algo: string) => void;
  setAlgorithm2: (algo: string) => void;
  setSteps: (steps: SortStep[]) => void;
  setSteps2: (steps: SortStep[]) => void;
  setCurrentStepIndex: (index: number) => void;
  setCurrentStepIndex2: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setMetrics: (metrics: SortMetrics | null) => void;
  setMetrics2: (metrics: SortMetrics | null) => void;
  setBattleMode: (mode: boolean) => void;
  resetPlayback: () => void;
}

export const useSortStore = create<SortState>((set) => ({
  array: [],
  originalArray: [],
  algorithm: "bubble",
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  speed: 150,
  metrics: null,
  
  // Battle Arena defaults
  battleMode: false,
  algorithm2: "quick",
  steps2: [],
  currentStepIndex2: -1,
  metrics2: null,

  setArray: (array) => set({ array }),
  setOriginalArray: (originalArray) => set({ originalArray }),
  setAlgorithm: (algorithm) => set({ algorithm }),
  setAlgorithm2: (algorithm2) => set({ algorithm2 }),
  setSteps: (steps) => set({ steps }),
  setSteps2: (steps2) => set({ steps2 }),
  setCurrentStepIndex: (currentStepIndex) => set((state) => {
    const activeStep = state.steps[currentStepIndex];
    return {
      currentStepIndex,
      array: activeStep ? activeStep.array : state.array
    };
  }),
  setCurrentStepIndex2: (currentStepIndex2) => set({ currentStepIndex2 }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),
  setMetrics: (metrics) => set({ metrics }),
  setMetrics2: (metrics2) => set({ metrics2 }),
  setBattleMode: (battleMode) => set({ battleMode }),
  resetPlayback: () => set((state) => ({
    array: [...state.originalArray],
    currentStepIndex: -1,
    currentStepIndex2: -1,
    isPlaying: false
  }))
}));
