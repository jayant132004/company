import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VisualizerProps } from "./BaseVisualizer";
import { Layers } from "lucide-react";

export default function BucketVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];

  // Reconstruct bucket contents at current step
  const sim = useMemo(() => {
    const n = originalArray.length;
    const bucketCount = Math.max(2, n);
    const bucketsList: number[][] = Array.from({ length: bucketCount }, () => []);
    
    if (currentStepIndex < 0 || steps.length === 0) {
      return { bucketsList, phase: "init", activeBucketIdx: null, activeElement: null };
    }

    let activeBucketIdx: number | null = null;
    let activeElement: number | null = null;
    let phase = "init";

    // Simulate distribution
    const maxVal = Math.max(...originalArray, 1);
    const minVal = Math.min(...originalArray, 0);
    const diff = maxVal - minVal;

    for (let k = 0; k <= currentStepIndex; k++) {
      const step = steps[k];
      if (step.event_type === "distribute_bucket" && step.compare) {
        const origIdx = step.compare[0];
        const val = originalArray[origIdx];
        const bIdx = diff === 0 ? 0 : Math.floor(((val - minVal) / diff) * (bucketCount - 1));
        bucketsList[bIdx].push(val);
        activeBucketIdx = bIdx;
        activeElement = val;
        phase = "distribute";
      }
    }

    // Check if bucket sorting has started
    const sortingStarted = steps.slice(0, currentStepIndex + 1).some(
      (s) => s.event_type === "sort_bucket_start" || s.event_type === "bucket_collect"
    );
    if (sortingStarted) {
      phase = "sort";
      // Prepopulate all buckets
      const finalBucketsList: number[][] = Array.from({ length: bucketCount }, () => []);
      for (const val of originalArray) {
        const bIdx = diff === 0 ? 0 : Math.floor(((val - minVal) / diff) * (bucketCount - 1));
        finalBucketsList[bIdx].push(val);
      }

      // Sort the buckets for representation
      for (let b = 0; b < bucketCount; b++) {
        finalBucketsList[b].sort((a, b) => a - b);
      }

      // Detect current sorting bucket
      for (let k = 0; k <= currentStepIndex; k++) {
        const s = steps[k];
        if (s.event_type === "sort_bucket_start" && s.message) {
          const match = s.message.match(/bucket (\d+)/);
          if (match) {
            activeBucketIdx = Number(match[1]);
          }
        }
      }

      return { bucketsList: finalBucketsList, phase: "sort", activeBucketIdx, activeElement: null };
    }

    return { bucketsList, phase, activeBucketIdx, activeElement };
  }, [originalArray, steps, currentStepIndex]);

  const activeCollectIdx = activeStep?.event_type === "bucket_collect" && activeStep.swap ? activeStep.swap[0] : null;
  const bucketCount = sim.bucketsList.length;
  const isCompact = bucketCount > 8;
  const isVeryCompact = bucketCount > 12;

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-1.5 sm:p-3 gap-2 sm:gap-3 min-h-0 overflow-y-auto select-none"
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
    >
      {/* Tier 1: Input Dataset Array */}
      <div className="flex flex-col gap-1 shrink-0 bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-white/5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            1. Input Dataset ({originalArray.length} items):
          </span>
          {sim.phase === "distribute" && sim.activeElement !== null && (
            <span className="text-[9px] font-mono text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 animate-pulse">
              Distributing {sim.activeElement} → Bucket {sim.activeBucketIdx}
            </span>
          )}
        </div>

        <div className="flex gap-1 sm:gap-1.5 justify-between overflow-x-auto pb-0.5">
          {originalArray.map((val, idx) => {
            const isDistributed = steps.slice(0, currentStepIndex + 1).some(
              (s) => s.event_type === "distribute_bucket" && s.compare && s.compare[0] === idx
            );
            const isActive = activeStep?.event_type === "distribute_bucket" && activeStep.compare && activeStep.compare[0] === idx;

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[26px] sm:min-w-[34px] py-1 sm:py-1.5 rounded-lg border text-center font-mono text-[10px] sm:text-xs font-black transition-all ${
                  isActive
                    ? "bg-amber-400/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105 z-10 ring-1 ring-amber-400/50"
                    : isDistributed
                      ? "bg-slate-950/30 border-dashed border-white/5 text-gray-600 opacity-40"
                      : "bg-slate-900 border-white/10 text-gray-200"
                }`}
              >
                <span className="block leading-tight">{val}</span>
                <span className="block text-[7px] text-gray-500 font-semibold leading-none mt-0.5">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier 2: Dynamic Responsive Bucket Containers (Single Screen View) */}
      <div className="flex-1 min-h-[140px] flex flex-col gap-1 bg-slate-950/40 p-2 sm:p-2.5 rounded-xl border border-white/5 shadow-inner overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <span className="text-[9px] sm:text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-indigo-400" />
            2. Dynamic Bucket Distribution ({bucketCount} Buckets):
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            {sim.phase === "sort" ? "Phase: Sorting Individual Buckets" : "Phase: Range Partitioning"}
          </span>
        </div>

        {/* Dynamic Buckets Row */}
        <div className="flex-1 min-h-0 flex items-stretch justify-between gap-1 sm:gap-2 md:gap-2.5 w-full pt-3 pb-1 overflow-x-auto">
          {sim.bucketsList.map((bucketValues, bucketIdx) => {
            const isSorting = sim.activeBucketIdx === bucketIdx;
            const isTarget = sim.phase === "distribute" && sim.activeBucketIdx === bucketIdx;
            
            return (
              <motion.div
                key={bucketIdx}
                layout
                animate={{
                  borderColor: isSorting 
                    ? "rgba(99, 102, 241, 0.9)" 
                    : isTarget 
                      ? "rgba(251, 191, 36, 0.9)" 
                      : "rgba(255,255,255,0.08)",
                  boxShadow: isSorting 
                    ? "0 4px 20px rgba(99, 102, 241, 0.3)" 
                    : isTarget 
                      ? "0 4px 18px rgba(251, 191, 36, 0.25)" 
                      : "none",
                  scale: isSorting || isTarget ? 1.02 : 1
                }}
                className="flex-1 min-w-[28px] sm:min-w-[42px] max-w-[130px] rounded-b-2xl sm:rounded-b-3xl border-x-2 border-b-2 p-1 sm:p-2 flex flex-col justify-end items-center gap-1 relative group bg-slate-950/70"
              >
                {/* Bucket handle curve */}
                <div className={`absolute -top-3 sm:-top-3.5 ${isVeryCompact ? "w-5 h-3" : "w-8 sm:w-10 h-3 sm:h-4"} border-2 rounded-t-full pointer-events-none transition-colors ${
                  isSorting 
                    ? "border-indigo-500 shadow-sm shadow-indigo-500/50" 
                    : isTarget 
                      ? "border-amber-400 shadow-sm shadow-amber-400/50" 
                      : "border-white/10 group-hover:border-white/20"
                }`}></div>

                {/* Bucket Title Tag */}
                <span className={`absolute top-1 sm:top-1.5 text-[7.5px] sm:text-[9px] font-mono font-extrabold uppercase tracking-tight block truncate max-w-[95%] ${
                  isSorting ? "text-indigo-300" : isTarget ? "text-amber-300" : "text-gray-400"
                }`}>
                  {isVeryCompact ? `B${bucketIdx}` : isCompact ? `B${bucketIdx}` : `Bucket ${bucketIdx}`}
                </span>
                
                {/* Items inside bucket */}
                <div className="flex flex-col-reverse gap-1 w-full flex-1 overflow-y-auto justify-start select-none pt-4 sm:pt-5 pr-0.5">
                  <AnimatePresence>
                    {bucketValues.map((val, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ y: -30, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 22 }}
                        className={`w-full py-0.5 sm:py-1 text-center font-mono text-[9px] sm:text-xs font-black rounded border truncate shadow-sm ${
                          isSorting
                            ? "bg-indigo-600/30 border-indigo-400 text-indigo-100"
                            : isTarget && idx === bucketValues.length - 1
                              ? "bg-amber-400/30 border-amber-400 text-amber-100"
                              : "bg-slate-900 border-white/10 text-white"
                        }`}
                      >
                        {val}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Empty bucket placeholder */}
                {bucketValues.length === 0 && (
                  <span className="text-[7.5px] font-mono text-gray-600 mb-1">empty</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tier 3: Collected / Sorted Output List */}
      <div className="flex flex-col gap-1 shrink-0 bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-white/5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            3. Collected / Sorted Output:
          </span>
          {activeCollectIdx !== null && (
            <span className="text-[9px] font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Gathering Sorted Buckets
            </span>
          )}
        </div>

        <div className="flex gap-1 sm:gap-1.5 justify-between overflow-x-auto pb-0.5">
          {array.map((val, idx) => {
            const isCollected = activeCollectIdx !== null && idx <= activeCollectIdx;
            const isCollectingNow = activeCollectIdx === idx;

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[26px] sm:min-w-[34px] py-1 sm:py-1.5 rounded-lg border text-center font-mono text-[10px] sm:text-xs font-black transition-all ${
                  isCollectingNow
                    ? "bg-rose-500 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse scale-105 z-10"
                    : isCollected
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-slate-950/30 border-dashed border-white/5 text-gray-700"
                }`}
              >
                <span className="block leading-tight">
                  {isCollected || (activeCollectIdx !== null && idx < activeCollectIdx) ? val : "-"}
                </span>
                <span className="block text-[7px] text-gray-500 font-semibold leading-none mt-0.5">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
