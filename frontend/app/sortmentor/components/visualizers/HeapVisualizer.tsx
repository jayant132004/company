import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass } from "./BaseVisualizer";

export default function HeapVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom,
  battleId
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const accentColor = battleId === 2 ? "pink" : "indigo";

  // Compute active heap size (elements inside the heap, indices < heapSize)
  const heapSize = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return array.length;
    for (let k = currentStepIndex; k >= 0; k--) {
      const step = steps[k];
      if (step.event_type === "extract_max" && step.swap) {
        return step.swap[1];
      }
    }
    return array.length;
  }, [steps, currentStepIndex, array.length]);

  // Compute 2D node coordinates in SVG space
  const nodes = useMemo(() => {
    const list = [];
    const n = array.length;
    for (let i = 0; i < n; i++) {
      const depth = Math.floor(Math.log2(i + 1));
      const indexInRow = i - (Math.pow(2, depth) - 1);
      const totalInRow = Math.pow(2, depth);
      
      // Node position
      const x = ((indexInRow + 0.5) / totalInRow) * 100;
      const y = depth * 55 + 30; // Row height: 55px, top padding: 30px
      
      list.push({ index: i, x, y, value: array[i], depth });
    }
    return list;
  }, [array]);

  // Compute parent-child lines
  const edges = useMemo(() => {
    const list = [];
    const n = array.length;
    for (let i = 1; i < n; i++) {
      const parentIdx = Math.floor((i - 1) / 2);
      list.push({
        id: `edge-${parentIdx}-${i}`,
        parent: nodes[parentIdx],
        child: nodes[i],
        // Dim edge if child or parent is outside active heap size
        isActiveHeap: i < heapSize && parentIdx < heapSize
      });
    }
    return list;
  }, [nodes, array.length, heapSize]);

  // Max depth to set SVG height
  const maxDepth = nodes.reduce((max, node) => Math.max(max, node.depth), 0);
  const svgHeight = (maxDepth + 1) * 55 + 20;

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-1.5 sm:p-3 gap-2 sm:gap-3 min-h-0 select-none overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
    >
      {/* 1. Binary Tree Layout */}
      <div className="flex-1 min-h-[160px] w-full relative p-2 overflow-y-auto flex items-center justify-center bg-slate-950/40 rounded-xl border border-white/5 shadow-inner">
        <svg 
          className="w-full h-full max-h-[360px]" 
          viewBox={`0 0 600 ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          
          {/* Draw Connection Edges */}
          {edges.map((edge) => (
            <line
              key={edge.id}
              x1={(edge.parent.x / 100) * 600}
              y1={edge.parent.y}
              x2={(edge.child.x / 100) * 600}
              y2={edge.child.y}
              stroke={edge.isActiveHeap ? "rgba(99, 102, 241, 0.6)" : "rgba(255, 255, 255, 0.08)"}
              strokeWidth={edge.isActiveHeap ? "2.5" : "1.5"}
            />
          ))}

          {/* Draw Tree Nodes */}
          {nodes.map((node) => {
            const isCompared = activeStep?.compare?.includes(node.index);
            const isSwapped = activeStep?.swap?.includes(node.index);
            const isRoot = node.index === 0;
            const inSortedPart = node.index >= heapSize;
            const cx = (node.x / 100) * 600;

            let circleFill = "bg-slate-950 border-slate-700 text-gray-400";
            if (isSwapped) circleFill = "bg-rose-500 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]";
            else if (isCompared) circleFill = "bg-amber-400 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.6)]";
            else if (inSortedPart) circleFill = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";
            else if (isRoot) circleFill = "bg-slate-900 border-indigo-500/50 text-indigo-200";

            return (
              <g key={node.index}>
                <foreignObject
                  x={cx - 16}
                  y={node.y - 16}
                  width="32"
                  height="32"
                >
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-mono font-extrabold shadow-md transition-all ${circleFill}`}
                  >
                    {node.value}
                  </div>
                </foreignObject>
                <text
                  x={cx}
                  y={node.y + 26}
                  textAnchor="middle"
                  className="fill-gray-400 text-[8px] font-mono font-semibold"
                >
                  [{node.index}]
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2. Synchronized Array Representation */}
      <div className="shrink-0 flex flex-col gap-1 p-2 sm:p-2.5 bg-slate-950/60 rounded-xl border border-white/5 shadow-inner">
        <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
          Underlying Array (Heap Size: {heapSize}/{array.length}):
        </span>
        <div className="flex gap-1 sm:gap-1.5 justify-between select-none overflow-x-auto pb-0.5">
          {array.map((val, idx) => {
            const isCompared = activeStep?.compare?.includes(idx);
            const isSwapped = activeStep?.swap?.includes(idx);
            const inSortedPart = idx >= heapSize;

            let cellClass = "bg-slate-900 border-white/10 text-gray-200";
            if (isSwapped) cellClass = "bg-rose-500/30 border-rose-500 text-rose-200 shadow-md shadow-rose-500/20";
            else if (isCompared) cellClass = "bg-amber-400/30 border-amber-400 text-amber-200 shadow-md shadow-amber-400/20";
            else if (inSortedPart) cellClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[26px] sm:min-w-[34px] py-1.5 sm:py-2 rounded-lg border text-center font-mono text-[10px] sm:text-xs font-black transition-all ${cellClass}`}
              >
                <span className="block leading-tight">{val}</span>
                <span className="block text-[7px] text-gray-500 font-semibold leading-none mt-0.5">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
