import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass, getNumberFontSizeClass } from "./BaseVisualizer";

export default function TimVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom,
  battleId
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const accentColor = battleId === 2 ? "pink" : "indigo";
  const numFont = getNumberFontSizeClass(array.length);

  // Parse active run bounds from step messages by scanning backwards
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const activeRun = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return null;
    for (let k = currentStepIndex; k >= 0; k--) {
      const step = steps[k];
      // Check if we started a run or if we are still doing run-based operations
      if (step.event_type === "timsort_run_start" && step.message) {
        const match = step.message.match(/index (\d+) to (\d+)/);
        if (match) {
          return { start: Number(match[1]), end: Number(match[2]) };
        }
      }
      // If we hit a merge start, then we are no longer in a run insertion sort phase
      if (step.event_type === "timsort_merge_start") {
        return null;
      }
    }
    return null;
  }, [steps, currentStepIndex]);

  // Parse active merge bounds from step messages by scanning backwards
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const activeMerge = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return null;
    for (let k = currentStepIndex; k >= 0; k--) {
      const step = steps[k];
      if (step.event_type === "timsort_merge_start" && step.message) {
        // [TimSort] Merging runs from indices [0-3] and [4-7]
        const match = step.message.match(/indices \[(\d+)-(\d+)\] and \[(\d+)-(\d+)\]/);
        if (match) {
          return {
            leftStart: Number(match[1]),
            leftEnd: Number(match[2]),
            rightStart: Number(match[3]),
            rightEnd: Number(match[4])
          };
        }
      }
      // If we see a new run start, then we are back to run phase
      if (step.event_type === "timsort_run_start") {
        return null;
      }
    }
    return null;
  }, [steps, currentStepIndex]);

  // Determine current phase description
  const phaseInfo = useMemo(() => {
    if (!activeStep) return "Ready";
    if (activeRun) {
      return `Phase: Sorting Run [Indices ${activeRun.start}-${activeRun.end}] via Insertion Sort`;
    }
    if (activeMerge) {
      return `Phase: Merging Runs [Indices ${activeMerge.leftStart}-${activeMerge.leftEnd}] & [Indices ${activeMerge.rightStart}-${activeMerge.rightEnd}]`;
    }
    if (activeStep.event_type === "all_sorted") {
      return "Phase: Sorting Complete!";
    }
    return "Phase: Initializing TimSort";
  }, [activeStep, activeRun, activeMerge]);

  // Generate run partitions for the bottom timeline visualization
  const runSize = 4; // MIN_MERGE matches the backend
  const runsCount = Math.ceil(originalArray.length / runSize);
  const runPartitions = useMemo(() => {
    const list = [];
    for (let i = 0; i < runsCount; i++) {
      const start = i * runSize;
      const end = Math.min(start + runSize - 1, originalArray.length - 1);
      list.push({ id: i, start, end });
    }
    return list;
  }, [runsCount, originalArray.length]);

  return (
    <div 
      className="w-full h-full flex flex-col justify-between min-h-0 gap-4"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* 1. Dynamic Phase Banner */}
      <div className="shrink-0 flex justify-between items-center text-xs font-mono bg-slate-950/40 border border-white/5 p-2.5 rounded-xl">
        <span className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">TimSort State:</span>
        <span className="text-indigo-400 font-bold">{phaseInfo}</span>
      </div>

      {/* 2. Visual Array Bars */}
      <div className="flex-1 min-h-0 relative flex flex-col justify-end p-2">
        
        {/* Draw active run/merge outline borders in background */}
        <div className="absolute inset-x-0 bottom-0 top-12 pointer-events-none flex justify-between gap-[2px]">
          {array.map((_, idx) => {
            let borderStyle = "";
            let bgFill = "";

            if (activeRun && idx >= activeRun.start && idx <= activeRun.end) {
              borderStyle = "border-t-2 border-pink-500/50";
              bgFill = "bg-pink-500/5";
            } else if (activeMerge) {
              if (idx >= activeMerge.leftStart && idx <= activeMerge.leftEnd) {
                borderStyle = "border-t-2 border-indigo-500/40";
                bgFill = "bg-indigo-500/5";
              } else if (idx >= activeMerge.rightStart && idx <= activeMerge.rightEnd) {
                borderStyle = "border-t-2 border-violet-500/40";
                bgFill = "bg-violet-500/5";
              }
            }

            return (
              <div 
                key={idx} 
                className={`flex-1 h-full rounded-t-sm transition-all duration-300 ${borderStyle} ${bgFill}`}
              />
            );
          })}
        </div>

        {/* Array Bars Grid */}
        <div className="flex-grow flex items-end justify-between gap-1 sm:gap-2 border-b border-white/5 pb-2 relative min-h-0 select-none overflow-hidden z-10 px-2 pt-10">
          {array.map((val, idx) => {
            const heightVal = getNormalizedHeight(val, originalArray);
            
            // Highlight compared, swapped, pivot, or locked elements
            const isCompared = activeStep?.compare?.includes(idx);
            const isSwapped = activeStep?.swap?.includes(idx);
            
            let barClass = getBarColorClass(idx, activeStep, accentColor);
            
            // Additional custom highlights for TimSort phases
            if (!isCompared && !isSwapped) {
              if (activeRun && idx >= activeRun.start && idx <= activeRun.end) {
                barClass = "bg-pink-500/40 border border-pink-500/50 text-pink-300";
              } else if (activeMerge) {
                if (idx >= activeMerge.leftStart && idx <= activeMerge.leftEnd) {
                  barClass = "bg-indigo-500/40 border border-indigo-500/50 text-indigo-300";
                } else if (idx >= activeMerge.rightStart && idx <= activeMerge.rightEnd) {
                  barClass = "bg-violet-500/40 border border-violet-500/50 text-violet-300";
                }
              }
            }

            return (
              <motion.div
                key={idx}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`flex-1 min-w-0 rounded-t-lg flex flex-col items-center justify-between py-2 select-none relative transition-colors ${barClass}`}
                style={{ height: heightVal }}
              >
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
      </div>

      {/* 3. Runs Timeline / Segment Tracker */}
      <div className="shrink-0 flex flex-col gap-1.5 p-3.5 bg-slate-950/60 rounded-xl border border-white/5 mx-2 shadow-inner">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Run Segments (Size {runSize}):</span>
        <div className="flex gap-2 justify-between select-none overflow-x-auto pb-0.5">
          {runPartitions.map((r) => {
            const isCurrentRun = activeRun && r.start === activeRun.start;
            const isMergingLeft = activeMerge && r.start >= activeMerge.leftStart && r.end <= activeMerge.leftEnd;
            const isMergingRight = activeMerge && r.start >= activeMerge.rightStart && r.end <= activeMerge.rightEnd;

            let cardStyle = "bg-slate-900 border-white/10 text-gray-400";
            if (isCurrentRun) {
              cardStyle = "bg-pink-500/30 border-pink-500 text-pink-200 shadow-md shadow-pink-500/20";
            } else if (isMergingLeft) {
              cardStyle = "bg-indigo-500/30 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/20";
            } else if (isMergingRight) {
              cardStyle = "bg-violet-500/30 border-violet-500 text-violet-200 shadow-md shadow-violet-500/20";
            }

            return (
              <div
                key={r.id}
                className={`flex-1 min-w-[70px] py-2 px-1.5 rounded-lg border text-center font-mono transition-all ${cardStyle}`}
              >
                <div className="text-xs font-extrabold">Run {r.id}</div>
                <div className="text-[8px] opacity-75 font-semibold">idx [{r.start}..{r.end}]</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
