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
      className="w-full h-full flex flex-col justify-between min-h-0 gap-4"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* 1. Binary Tree Layout */}
      <div className="flex-1 min-h-0 w-full relative p-2 overflow-y-auto flex items-center justify-center">
        <svg className="w-full h-full min-h-[220px]" style={{ maxHeight: `${svgHeight}px`, maxWidth: "560px" }}>
          
          {/* Draw Connection Edges */}
          {edges.map((edge) => (
            <line
              key={edge.id}
              x1={`${edge.parent.x}%`}
              y1={edge.parent.y}
              x2={`${edge.child.x}%`}
              y2={edge.child.y}
              stroke={edge.isActiveHeap ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.05)"}
              strokeWidth={edge.isActiveHeap ? "2" : "1"}
            />
          ))}

          {/* Draw Tree Nodes */}
          {nodes.map((node) => {
            const isCompared = activeStep?.compare?.includes(node.index);
            const isSwapped = activeStep?.swap?.includes(node.index);
            const isRoot = node.index === 0;
            const inSortedPart = node.index >= heapSize;

            let circleFill = "bg-slate-950 border-slate-700 text-gray-400";
            if (isSwapped) circleFill = "bg-rose-500 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]";
            else if (isCompared) circleFill = "bg-amber-400 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.6)]";
            else if (inSortedPart) circleFill = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";
            else if (isRoot) circleFill = "bg-slate-900 border-indigo-500/50 text-indigo-200";

            return (
              <g key={node.index}>
                <foreignObject
                  x={`calc(${node.x}% - 14px)`}
                  y={node.y - 14}
                  width="28"
                  height="28"
                >
                  <div
                    className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold transition-all ${circleFill}`}
                  >
                    {node.value}
                  </div>
                </foreignObject>
                <text
                  x={`${node.x}%`}
                  y={node.y + 24}
                  textAnchor="middle"
                  className="fill-gray-600 text-[7px] font-mono"
                >
                  idx:{node.index}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2. Synchronized Array Representation */}
      <div className="shrink-0 flex flex-col gap-1.5 p-3 bg-slate-950/40 rounded-xl border border-white/5 mx-2">
        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Underlying Array:</span>
        <div className="flex gap-1 justify-between select-none">
          {array.map((val, idx) => {
            const isCompared = activeStep?.compare?.includes(idx);
            const isSwapped = activeStep?.swap?.includes(idx);
            const inSortedPart = idx >= heapSize;

            let cellClass = "bg-slate-900 border-white/5 text-gray-400";
            if (isSwapped) cellClass = "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm shadow-rose-500/10";
            else if (isCompared) cellClass = "bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-400/10";
            else if (inSortedPart) cellClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";

            return (
              <div
                key={idx}
                className={`flex-1 py-1.5 rounded border text-center font-mono text-[9px] font-bold transition-all ${cellClass}`}
              >
                {val}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
