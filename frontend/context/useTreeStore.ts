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
  active_index?: number | null;
  lsb?: number;
  accumulated_sum?: number;
  message: string;
}

export interface TreeOperation {
  op: string;
  value?: number;
  word?: string;
  qRange?: [number, number];
  fIdx?: number;
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
  treeSnapshot: any | null;
  operationHistory: TreeOperation[];
  steps: TreeStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  metrics: TreeMetrics | null;

  setTreeType: (type: "bst" | "avl" | "redblack" | "trie" | "segment" | "fenwick") => void;
  setInitialData: (data: any[]) => void;
  setTreeSnapshot: (snapshot: any | null) => void;
  setOperationHistory: (history: TreeOperation[]) => void;
  addOperation: (op: TreeOperation) => void;
  resetTree: () => void;
  undoLastOperation: () => TreeOperation[];
  setSteps: (steps: TreeStep[]) => void;
  setCurrentStepIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setMetrics: (metrics: TreeMetrics | null) => void;
  resetPlayback: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  treeType: "avl",
  initialData: [30, 20, 40, 10, 25],
  treeSnapshot: null,
  operationHistory: [
    { op: "insert", value: 30 },
    { op: "insert", value: 20 },
    { op: "insert", value: 40 },
    { op: "insert", value: 10 },
    { op: "insert", value: 25 },
  ],
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  speed: 600,
  metrics: null,

  setTreeType: (treeType) => set({ treeType }),
  setInitialData: (initialData) => set({ initialData }),
  setTreeSnapshot: (treeSnapshot) => set({ treeSnapshot }),
  setOperationHistory: (operationHistory) => set({ operationHistory }),
  addOperation: (op) => set((state) => ({ operationHistory: [...state.operationHistory, op] })),
  resetTree: () => set({
    treeSnapshot: null,
    operationHistory: [],
    initialData: [],
    steps: [],
    currentStepIndex: -1,
    isPlaying: false,
    metrics: { total_nodes: 0, tree_height: 0, steps_count: 0 },
  }),
  undoLastOperation: () => {
    const history = get().operationHistory;
    if (history.length === 0) return [];
    const newHistory = history.slice(0, history.length - 1);
    set({ operationHistory: newHistory });
    return newHistory;
  },
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
