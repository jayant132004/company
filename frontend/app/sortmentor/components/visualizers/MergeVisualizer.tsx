import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VisualizerProps } from "./BaseVisualizer";
import { GitFork, Layers, ArrowDownRight, ArrowDownLeft, CheckCircle2 } from "lucide-react";

interface TreeNode {
  id: string;
  start: number;
  end: number;
  level: number;
  children: TreeNode[];
}

export default function MergeVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const [viewMode, setViewMode] = useState<"tree" | "dual" | "bars">("dual");

  // 1. Build the complete split tree recursively down to single-element leaves
  const splitTree = useMemo(() => {
    const buildTree = (start: number, end: number, level: number = 0): TreeNode => {
      const node: TreeNode = {
        id: `node-${start}-${end}-${level}`,
        start,
        end,
        level,
        children: []
      };
      if (end - start > 1) {
        const mid = Math.floor((start + end) / 2);
        node.children.push(buildTree(start, mid, level + 1));
        node.children.push(buildTree(mid, end, level + 1));
      }
      return node;
    };
    return buildTree(0, originalArray.length, 0);
  }, [originalArray.length]);

  // 2. Group nodes by level for clean tree row rendering
  const levels = useMemo(() => {
    const map: Record<number, TreeNode[]> = {};
    const traverse = (node: TreeNode) => {
      if (!map[node.level]) map[node.level] = [];
      map[node.level].push(node);
      for (const child of node.children) {
        traverse(child);
      }
    };
    traverse(splitTree);
    return Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b)
      .map(lvl => map[lvl]);
  }, [splitTree]);

  // 3. Trace active merge bounds from current step
  const activeRange = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return null;
    
    // Check if current step has compare or swap
    if (activeStep?.compare && activeStep.compare.length >= 2) {
      const leftIdx = activeStep.compare[0];
      const rightIdx = activeStep.compare[1];
      
      const findRange = (node: TreeNode): { start: number; mid: number; end: number } | null => {
        const mid = Math.floor((node.start + node.end) / 2);
        if (leftIdx >= node.start && leftIdx < mid && rightIdx >= mid && rightIdx < node.end) {
          return { start: node.start, mid, end: node.end };
        }
        for (const child of node.children) {
          const r = findRange(child);
          if (r) return r;
        }
        return null;
      };
      const range = findRange(splitTree);
      if (range) return range;
    }

    if (activeStep?.swap && activeStep.swap.length >= 1) {
      const swapIdx = activeStep.swap[0];
      // Look back for active merge block
      for (let k = currentStepIndex; k >= 0; k--) {
        const st = steps[k];
        if (st.compare && st.compare.length >= 2) {
          const lIdx = st.compare[0];
          const rIdx = st.compare[1];
          const findRange = (node: TreeNode): { start: number; mid: number; end: number } | null => {
            const mid = Math.floor((node.start + node.end) / 2);
            if (lIdx >= node.start && lIdx < mid && rIdx >= mid && rIdx < node.end) {
              return { start: node.start, mid, end: node.end };
            }
            for (const child of node.children) {
              const r = findRange(child);
              if (r) return r;
            }
            return null;
          };
          const r = findRange(splitTree);
          if (r && swapIdx >= r.start && swapIdx < r.end) return r;
        }
      }
    }

    // Default to active comparison if available in lookback
    for (let k = currentStepIndex; k >= 0; k--) {
      const st = steps[k];
      if (st.compare && st.compare.length >= 2) {
        const lIdx = st.compare[0];
        const rIdx = st.compare[1];
        const findRange = (node: TreeNode): { start: number; mid: number; end: number } | null => {
          const mid = Math.floor((node.start + node.end) / 2);
          if (lIdx >= node.start && lIdx < mid && rIdx >= mid && rIdx < node.end) {
            return { start: node.start, mid, end: node.end };
          }
          for (const child of node.children) {
            const r = findRange(child);
            if (r) return r;
          }
          return null;
        };
        const r = findRange(splitTree);
        if (r) return r;
      }
    }

    return null;
  }, [steps, currentStepIndex, splitTree, activeStep]);

  // 4. Compute active node ID and callstack IDs
  const { activeNodeId, stackIds } = useMemo(() => {
    const ids = new Set<string>();
    let activeId = "";
    if (!activeRange) return { activeNodeId: activeId, stackIds: ids };

    const findAncestors = (node: TreeNode): boolean => {
      const isTarget = node.start === activeRange.start && node.end === activeRange.end;
      if (isTarget) {
        activeId = node.id;
        ids.add(node.id);
        return true;
      }
      for (const child of node.children) {
        if (findAncestors(child)) {
          ids.add(node.id);
          return true;
        }
      }
      return false;
    };
    findAncestors(splitTree);
    return { activeNodeId: activeId, stackIds: ids };
  }, [activeRange, splitTree]);

  // Helper: Recursive Node Renderer
  const renderSubtree = (node: TreeNode, depth: number = 0) => {
    const isActive = activeNodeId === node.id;
    const isOnStack = stackIds.has(node.id);
    const nodeArray = array.slice(node.start, node.end);
    const isLeaf = node.children.length === 0;

    let borderClass = "border-white/10 bg-slate-950/70 text-slate-400";
    if (isActive) {
      borderClass = "border-pink-500 bg-pink-500/15 shadow-[0_0_20px_rgba(236,72,153,0.4)] text-pink-200 ring-2 ring-pink-500/50";
    } else if (isOnStack) {
      borderClass = "border-indigo-500/60 bg-indigo-500/10 text-indigo-200";
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Box */}
        <motion.div
          layout
          className={`px-1.5 py-1 rounded-lg border flex flex-col items-center gap-0.5 transition-all shadow-md ${borderClass}`}
        >
          <div className="flex items-center gap-0.5">
            {nodeArray.map((val, idx) => {
              const globalIdx = node.start + idx;
              const isCompared = activeStep?.compare?.includes(globalIdx);
              const isSwapped = activeStep?.swap?.includes(globalIdx);

              let cellClass = "bg-slate-900/90 text-slate-200 border-white/10";
              if (isSwapped) {
                cellClass = "bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)] font-black scale-105";
              } else if (isCompared) {
                cellClass = "bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] font-black scale-105";
              }

              return (
                <div
                  key={idx}
                  className={`min-w-[18px] sm:min-w-[22px] h-4.5 sm:h-5.5 px-0.5 flex items-center justify-center font-mono text-[9px] sm:text-[11px] font-bold rounded border transition-all ${cellClass}`}
                >
                  {val}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between w-full text-[7.5px] font-mono text-slate-400 px-0.5 leading-tight">
            <span>[{node.start}..{node.end - 1}]</span>
            {isLeaf && <span className="text-emerald-400 font-bold">1</span>}
          </div>
        </motion.div>

        {/* Child Subtrees + Clean Tree Connectors */}
        {node.children.length > 0 && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical Connector Stem */}
            <div className="w-[1px] h-2 bg-white/20" />
            
            {/* Horizontal Branch Bar */}
            <div className="flex gap-1.5 sm:gap-3 relative pt-0.5">
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-white/20" />
              {node.children.map(child => renderSubtree(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 5. Left and Right Subarrays during Active Merge
  const leftSubarray = useMemo(() => {
    if (!activeRange) return [];
    return array.slice(activeRange.start, activeRange.mid).map((val, idx) => ({
      val,
      idx: activeRange.start + idx,
      isCompared: activeStep?.compare?.includes(activeRange.start + idx),
      isMerged: activeStep?.swap?.includes(activeRange.start + idx),
    }));
  }, [array, activeRange, activeStep]);

  const rightSubarray = useMemo(() => {
    if (!activeRange) return [];
    return array.slice(activeRange.mid, activeRange.end).map((val, idx) => ({
      val,
      idx: activeRange.mid + idx,
      isCompared: activeStep?.compare?.includes(activeRange.mid + idx),
      isMerged: activeStep?.swap?.includes(activeRange.mid + idx),
    }));
  }, [array, activeRange, activeStep]);

  return (
    <div
      className="w-full h-full flex flex-col justify-between min-h-0 select-none overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
    >
      {/* Top View Mode Switcher Strip */}
      <div className="px-3 py-1.5 bg-slate-950/60 border-b border-white/5 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
          <GitFork className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-bold text-white">Full Divide & Conquer Hierarchy</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Total Levels: {levels.length} ({originalArray.length} items)</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
          <button
            onClick={() => setViewMode("dual")}
            className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
              viewMode === "dual"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚡ Split & Merge Workbench
          </button>
          <button
            onClick={() => setViewMode("tree")}
            className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
              viewMode === "tree"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌳 Full Tree Only
          </button>
          <button
            onClick={() => setViewMode("bars")}
            className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
              viewMode === "bars"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📊 Partition Bars
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      {(viewMode === "tree" || viewMode === "dual") && (
        <div className="flex-1 overflow-auto w-full p-2 sm:p-4 flex items-start justify-center min-h-0 custom-scrollbar">
          <div className="flex flex-col items-center min-w-max pb-2">
            {renderSubtree(splitTree)}
          </div>
        </div>
      )}

      {/* Classic Partition Bars View */}
      {viewMode === "bars" && (
        <div className="flex-1 flex flex-col justify-end items-center px-4 py-6 overflow-hidden min-h-0">
          <div className="flex items-end justify-center gap-1.5 sm:gap-2 w-full h-full max-w-4xl">
            {array.map((val, idx) => {
              const isCompared = activeStep?.compare?.includes(idx);
              const isSwapped = activeStep?.swap?.includes(idx);
              const isInActiveRange = activeRange && idx >= activeRange.start && idx < activeRange.end;
              const isLeftHalf = activeRange && idx >= activeRange.start && idx < activeRange.mid;

              const minVal = Math.min(...originalArray, 0);
              const maxVal = Math.max(...originalArray, 1);
              const heightPercent = ((val - minVal) / (maxVal - minVal)) * 58 + 24;

              let barBg = "bg-indigo-600/60 border-indigo-500/40 text-indigo-200";
              if (isSwapped) barBg = "bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse";
              else if (isCompared) barBg = "bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] font-black";
              else if (isLeftHalf) barBg = "bg-cyan-500/70 border-cyan-400/80 text-cyan-100";
              else if (isInActiveRange) barBg = "bg-purple-500/70 border-purple-400/80 text-purple-100";

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full max-w-[48px]">
                  <span className="text-xs font-mono font-bold text-slate-200 mb-1">{val}</span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg border-t-2 border-x transition-all duration-150 flex items-start justify-center pt-1 ${barBg}`}
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-1">{idx}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dual Mode: Active Two-Pointer Auxiliary Merge Workbench */}
      {viewMode === "dual" && activeRange && (
        <div className="shrink-0 bg-slate-950/90 border-t border-white/10 p-2.5 sm:p-3 flex flex-col gap-2 shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-sm shadow-pink-500/50" />
              <span className="font-bold text-white uppercase">Active Two-Pointer Merge Phase</span>
              <span className="text-slate-400 text-[11px]">
                Target Range: <b className="text-pink-300">[{activeRange.start} .. {activeRange.end - 1}]</b> (Midpoint: {activeRange.mid})
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-cyan-400 font-semibold">Left Subarray: [{activeRange.start}..{activeRange.mid - 1}]</span>
              <span className="text-slate-500">vs</span>
              <span className="text-purple-400 font-semibold">Right Subarray: [{activeRange.mid}..{activeRange.end - 1}]</span>
            </div>
          </div>

          {/* Side-by-side Left vs Right Subarrays + Comparison Arrow */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Left Subarray with Pointer */}
            <div className="sm:col-span-5 p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-cyan-300">
                <span>Left Subarray [Low..Mid]</span>
                <span>{leftSubarray.length} items</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {leftSubarray.map((item, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
                      item.isCompared
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105"
                        : item.isMerged
                        ? "bg-rose-500 text-white border-rose-400"
                        : "bg-slate-900 text-slate-200 border-cyan-500/30"
                    }`}
                  >
                    <span>{item.val}</span>
                    <span className="text-[8px] block text-center opacity-70">i={item.idx}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Operator Indicator */}
            <div className="sm:col-span-2 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono font-black text-amber-300 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 shadow-inner">
                {activeStep?.compare && activeStep.compare.length >= 2 ? "COMPARE ⇄" : "MERGING ➔"}
              </span>
            </div>

            {/* Right Subarray with Pointer */}
            <div className="sm:col-span-5 p-2 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-purple-300">
                <span>Right Subarray [Mid+1..High]</span>
                <span>{rightSubarray.length} items</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rightSubarray.map((item, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
                      item.isCompared
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105"
                        : item.isMerged
                        ? "bg-rose-500 text-white border-rose-400"
                        : "bg-slate-900 text-slate-200 border-purple-500/30"
                    }`}
                  >
                    <span>{item.val}</span>
                    <span className="text-[8px] block text-center opacity-70">j={item.idx}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
