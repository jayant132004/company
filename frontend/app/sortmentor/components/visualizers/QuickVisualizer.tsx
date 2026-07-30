import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass } from "./BaseVisualizer";
import { ChevronDown } from "lucide-react";

export default function QuickVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom,
  battleId
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const accentColor = battleId === 2 ? "pink" : "indigo";

  // Find the partition range [low, high] for the current step by tracing back
  const partitionRange = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return null;
    for (let k = currentStepIndex; k >= 0; k--) {
      const step = steps[k];
      if (step.event_type === "pivot_selection" && step.compare && step.compare.length >= 3) {
        return { low: step.compare[0], high: step.compare[2] };
      }
    }
    return { low: 0, high: array.length - 1 };
  }, [steps, currentStepIndex, array.length]);

  const pivotIdx = activeStep?.pivot !== undefined ? activeStep.pivot : null;

  // Track pointers i and j
  const pointers = useMemo(() => {
    if (!activeStep) return { i: null, j: null };
    let j = null;
    let i = null;
    
    if (activeStep.event_type === "comparison" && activeStep.compare) {
      j = activeStep.compare[0]; // scanner pointer j
    }
    if (activeStep.event_type === "swap" && activeStep.swap) {
      i = activeStep.swap[0]; // partition index i
      j = activeStep.swap[1];
    }
    return { i, j };
  }, [activeStep]);

  return (
    <div 
      className="w-full h-full flex flex-col justify-between min-h-0"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* Array Bars Grid */}
      <div className="flex-1 flex items-end justify-between gap-[2px] border-b border-white/5 pb-2 relative min-h-0 select-none overflow-hidden pt-8">
        {array.map((val, idx) => {
          const heightVal = getNormalizedHeight(val, originalArray);
          const barClass = getBarColorClass(idx, activeStep, accentColor);
          const isPivot = pivotIdx === idx;
          const isPointerI = pointers.i === idx;
          const isPointerJ = pointers.j === idx;
          const showNumber = array.length <= 16;

          // Dim elements outside the active partition range to emphasize focus
          const inPartition = partitionRange ? (idx >= partitionRange.low && idx <= partitionRange.high) : true;
          const opacityClass = inPartition ? "opacity-100" : "opacity-25";

          return (
            <motion.div
              key={idx}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`flex-1 rounded-t-md flex items-end justify-center select-none relative ${barClass} ${opacityClass}`}
              style={{ height: heightVal }}
            >
              {isPivot && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-cyan-400 flex flex-col items-center animate-pulse">
                  <span className="text-[7px] font-mono font-bold uppercase">PIVOT</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              )}

              {isPointerI && (
                <div className="absolute -top-4 left-0 text-rose-400 text-[8px] font-mono font-bold">
                  i
                </div>
              )}

              {isPointerJ && (
                <div className="absolute -top-4 right-0 text-amber-400 text-[8px] font-mono font-bold">
                  j
                </div>
              )}

              {showNumber && (
                <span className="font-mono text-[9px] font-bold text-white pb-1 rotate-90 sm:rotate-0 origin-center truncate">
                  {val}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Partition Range Indicator Bar */}
      {partitionRange && (
        <div className="flex justify-between items-center text-[8px] font-mono text-gray-500 py-1 bg-slate-950/20 px-2 rounded-b border-t border-white/5">
          <span>Partition Bounds:</span>
          <span>Indices [{partitionRange.low} ... {partitionRange.high}]</span>
        </div>
      )}
    </div>
  );
}
