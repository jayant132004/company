import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass, getNumberFontSizeClass } from "./BaseVisualizer";
import { ChevronDown } from "lucide-react";
import StepGhostTrails from "./StepGhostTrails";

export default function QuickVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  speed,
  ghostTrails = true,
  zoom,
  battleId
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const accentColor = battleId === 2 ? "pink" : "indigo";
  const numFont = getNumberFontSizeClass(array.length);

  // Find the partition range [low, high] for the current step by tracing back
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
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
      className="w-full h-full flex flex-col justify-between min-h-0 relative overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* Array Bars Grid */}
      <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 border-b border-white/5 pb-2 relative min-h-0 select-none px-2 pt-12">
        {/* Step Ghost Trails & Motion Trajectory Overlay */}
        <StepGhostTrails
          array={array}
          originalArray={originalArray}
          steps={steps}
          currentStepIndex={currentStepIndex}
          speed={speed}
          enabled={ghostTrails}
          accentColor={accentColor as any}
        />

        {array.map((val, idx) => {
          const heightVal = getNormalizedHeight(val, originalArray);
          const barClass = getBarColorClass(idx, activeStep, accentColor);
          const isPivot = pivotIdx === idx;
          const isPointerI = pointers.i === idx;
          const isPointerJ = pointers.j === idx;

          // Dim elements outside the active partition range to emphasize focus
          const inPartition = partitionRange ? (idx >= partitionRange.low && idx <= partitionRange.high) : true;
          const opacityClass = inPartition ? "opacity-100" : "opacity-30";

          return (
            <motion.div
              key={idx}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`flex-1 min-w-0 rounded-t-lg flex flex-col items-center justify-between py-2 select-none relative transition-colors ${barClass} ${opacityClass}`}
              style={{ height: heightVal }}
            >
              {isPivot && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-cyan-300 flex flex-col items-center animate-pulse z-10">
                  <span className="text-[8px] font-mono font-extrabold uppercase bg-cyan-950/90 border border-cyan-400/40 px-1.5 py-0.2 rounded shadow-md">
                    PIVOT
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 -mt-0.5" />
                </div>
              )}

              {isPointerI && !isPivot && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[8px] font-mono font-extrabold px-1.5 py-0.2 rounded shadow-md z-10">
                  i
                </div>
              )}

              {isPointerJ && !isPivot && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[8px] font-mono font-extrabold px-1.5 py-0.2 rounded shadow-md z-10">
                  j
                </div>
              )}

              {/* Value Number */}
              <span className={`font-mono ${numFont} text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none truncate px-0.5`}>
                {val}
              </span>

              {/* Index label */}
              <span className="font-mono text-[9px] text-white/60 font-medium select-none hidden sm:block">
                {idx}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Partition Range Indicator Bar */}
      {partitionRange && (
        <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 py-1 bg-slate-950/40 px-3 rounded-b border-t border-white/5">
          <span>Active Partition Bounds:</span>
          <span className="text-indigo-300 font-bold">[{partitionRange.low} ... {partitionRange.high}]</span>
        </div>
      )}
    </div>
  );
}
