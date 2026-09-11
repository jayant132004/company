import { create } from "zustand";

export interface TreeNodeLayout {
  id: string;
  val: number | string;
  x: number;
  y: number;
  left_id?: string | null;
  right_id?: string | null;
  balance_factor?: number | null;
  height?: number | null;
  color?: "RED" | "BLACK" | null;
  interval?: [number, number] | null;
  is_end_of_word?: boolean;
  word?: string;
  children_ids?: string[];
}

export interface TreeEdge {
  from: string;
  to: string;
  dir?: string;
}

export interface TreeStep {
  step: number;
  event_type: string;
  nodes: TreeNodeLayout[];
  edges: TreeEdge[];
  active_node_id?: string | null;
  visited_ids?: string[];
  path_ids?: string[];
  rotation?: string | null;
  completions?: string[];
  result?: any;
  prefix_sum?: number;
  array?: number[];
  bit_table?: number[];
  lsb?: number;
  accumulated_sum?: number;
  message: string;
}

interface TreeMetrics {
  total_nodes?: number;
  tree_height?: number;
  steps_count?: number;
  tree_type?: string;
}

interface TreeState {
  treeType: "bst" | "avl" | "redblack" | "trie" | "segment" | "fenwick";
  initialData: any[];
  steps: TreeStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  metrics: TreeMetrics | null;

  setTreeType: (type: "bst" | "avl" | "redblack" | "trie" | "segment" | "fenwick") => void;
  setInitialData: (data: any[]) => void;
  setSteps: (steps: TreeStep[]) => void;
  setCurrentStepIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setMetrics: (metrics: TreeMetrics | null) => void;
  resetPlayback: () => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  treeType: "avl",
  initialData: [30, 20, 40, 10, 25],
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  speed: 600,
  metrics: null,

  setTreeType: (treeType) => set({ treeType }),
  setInitialData: (initialData) => set({ initialData }),
  setSteps: (steps) => set({ steps }),
  setCurrentStepIndex: (currentStepIndex) => set({ currentStepIndex }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),
  setMetrics: (metrics) => set({ metrics }),
  resetPlayback: () => set({
    currentStepIndex: -1,
    isPlaying: false,
  }),
}));
