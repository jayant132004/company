import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizerProps } from "./BaseVisualizer";

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

  // 1. Build the split tree recursively
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

  // 2. Trace back to find the active merge range [start, end]
  const activeRange = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return null;
    
    // Find the most recent comparison or active step that indicates the merge bounds
    for (let k = currentStepIndex; k >= 0; k--) {
      const step = steps[k];
      if (step.event_type === "comparison" && step.compare && step.compare.length >= 2) {
        // Find the node in the tree that splits left and right compared elements
        const leftIdx = step.compare[0];
        const rightIdx = step.compare[1];
        
        // Find the smallest range in the tree enclosing both leftIdx and rightIdx
        const findRange = (node: TreeNode): { start: number; end: number } | null => {
          const mid = Math.floor((node.start + node.end) / 2);
          if (leftIdx >= node.start && leftIdx < mid && rightIdx >= mid && rightIdx < node.end) {
            return { start: node.start, end: node.end };
          }
          for (const child of node.children) {
            const range = findRange(child);
            if (range) return range;
          }
          return null;
        };
        const range = findRange(splitTree);
        if (range) return range;
      }
      if (step.event_type === "merge" && step.swap && step.swap.length >= 2) {
        // Look back for the compare step that initiated this merge block
        const swapIdx = step.swap[0];
        // Return the node containing the swap index at the lowest active level
        // For simplicity, find the node that fits best.
      }
    }
    return null;
  }, [steps, currentStepIndex, splitTree]);

  // 3. Compute stack IDs (all ancestors of the active node)
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

  // 4. Render the Split Tree nodes
  const renderNode = (node: TreeNode) => {
    const isActive = activeNodeId === node.id;
    const isOnStack = stackIds.has(node.id);
    const nodeArray = array.slice(node.start, node.end);

    const isLeaf = node.children.length === 0;

    let borderClass = "border-white/5 bg-slate-900/40 text-gray-500";
    if (isActive) {
      borderClass = "border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.3)] text-pink-300";
    } else if (isOnStack) {
      borderClass = "border-indigo-500 bg-indigo-500/5 text-indigo-300";
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Array Block */}
        <motion.div
          layout
          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all shadow-md ${borderClass}`}
        >
          <div className="flex gap-1">
            {nodeArray.map((val, idx) => {
              const globalIdx = node.start + idx;
              const isCompared = activeStep?.compare?.includes(globalIdx);
              const isSwapped = activeStep?.swap?.includes(globalIdx);
              
              let cellClass = "bg-slate-950 text-gray-200 border-white/10";
              if (isSwapped) cellClass = "bg-rose-500/30 text-rose-200 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]";
              else if (isCompared) cellClass = "bg-amber-400/30 text-amber-200 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]";

              return (
                <div
                  key={idx}
                  className={`min-w-[28px] h-7 px-1 flex items-center justify-center font-mono text-xs font-extrabold rounded-md border ${cellClass}`}
                >
                  {val}
                </div>
              );
            })}
          </div>
          <span className="text-[8px] font-mono text-gray-400 font-semibold">
            range: [{node.start}..{node.end - 1}]
          </span>
        </motion.div>

        {/* Children split */}
        {node.children.length > 0 && (
          <div className="flex gap-4 sm:gap-6 mt-4 relative">
            {/* Split lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-20px)] h-[1px] bg-white/10 -translate-y-2"></div>
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="w-full h-full flex flex-col justify-between min-h-0"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* Scrollable Tree Workspace */}
      <div className="flex-1 overflow-auto w-full p-4 flex items-start justify-center min-h-0">
        <div className="flex flex-col items-center min-w-max pb-4">
          {renderNode(splitTree)}
        </div>
      </div>

      {/* Sub-arrays divide & conquer details */}
      {activeRange && (
        <div className="shrink-0 flex justify-between items-center text-[9px] font-mono text-gray-400 py-2.5 bg-slate-950/40 px-3 rounded-b border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
            <span>Merging Sub-arrays:</span>
            <span className="text-white">[{activeRange.start} ... {Math.floor((activeRange.start + activeRange.end)/2) - 1}]</span>
            <span className="text-gray-600">&</span>
            <span className="text-white">[{Math.floor((activeRange.start + activeRange.end)/2)} ... {activeRange.end - 1}]</span>
          </div>
          <span>Depth: {activeRange.end - activeRange.start} elements</span>
        </div>
      )}
    </div>
  );
}
