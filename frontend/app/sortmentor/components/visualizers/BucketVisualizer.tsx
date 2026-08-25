import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VisualizerProps } from "./BaseVisualizer";
import { Trash } from "lucide-react";

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
    const sortingStarted = steps.slice(0, currentStepIndex + 1).some(s => s.event_type === "sort_bucket_start" || s.event_type === "bucket_collect");
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

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-2 sm:p-4 gap-4 min-h-0 overflow-y-auto"
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
    >
      {/* 1. Input list */}
      <div className="flex flex-col gap-1.5 shrink-0 bg-slate-950/40 p-3 rounded-xl border border-white/5">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Input dataset:</span>
        <div className="flex gap-1.5 justify-between select-none overflow-x-auto pb-1">
          {originalArray.map((val, idx) => {
            const isDistributed = steps.slice(0, currentStepIndex + 1).some(s => s.event_type === "distribute_bucket" && s.compare && s.compare[0] === idx);
            const isActive = activeStep?.event_type === "distribute_bucket" && activeStep.compare && activeStep.compare[0] === idx;

            return (
              <div
                key={idx}
                className={`flex-grow min-w-[32px] py-2 rounded-lg border text-center font-mono text-xs font-extrabold transition-all ${
                  isActive
                    ? "bg-amber-400/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105"
                    : isDistributed
                      ? "bg-slate-950/20 border-dashed border-white/5 text-gray-700 opacity-30"
                      : "bg-slate-900 border-white/10 text-gray-200"
                }`}
              >
                {val}
                <span className="block text-[7px] text-gray-500 font-semibold mt-0.5">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Visual Bucket Containers (Cups) */}
      <div className="flex-grow min-h-0 overflow-x-auto py-2 flex items-center">
        <div className="flex gap-4 h-full min-w-max px-2">
          {sim.bucketsList.map((bucketValues, bucketIdx) => {
            const isSorting = sim.activeBucketIdx === bucketIdx;
            
            return (
              <motion.div
                key={bucketIdx}
                layout
                animate={{
                  borderColor: isSorting ? "rgba(99, 102, 241, 0.8)" : "rgba(255,255,255,0.1)",
                  boxShadow: isSorting ? "0 8px 24px rgba(99, 102, 241, 0.25)" : "none"
                }}
                className={`w-28 rounded-b-3xl border-x-2 border-b-2 p-3 flex flex-col justify-end items-center gap-2 min-h-[160px] bg-slate-950/60 relative group`}
              >
                {/* Bucket handle curve */}
                <div className={`absolute -top-4 w-12 h-6 border-2 rounded-t-full pointer-events-none transition-colors ${
                  isSorting ? "border-indigo-500/80" : "border-white/10 group-hover:border-white/20"
                }`}></div>

                {/* Bucket Title Tag */}
                <span className="absolute top-2 text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider block">
                  Bucket {bucketIdx}
                </span>
                
                {/* Items inside bucket */}
                <div className="flex flex-col-reverse gap-1.5 w-full flex-grow overflow-y-auto justify-start select-none pt-6 pr-0.5">
                  <AnimatePresence>
                    {bucketValues.map((val, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-full py-1.5 text-center font-mono text-xs font-extrabold rounded-lg border border-white/10 bg-slate-900 text-white shadow-sm"
                      >
                        {val}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Collected output progress flow */}
      <div className="shrink-0 flex flex-col gap-1.5 p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Collected / Sorted List:</span>
        <div className="flex gap-1.5 justify-between select-none overflow-x-auto pb-1">
          {array.map((val, idx) => {
            const isCollected = activeCollectIdx !== null && idx <= activeCollectIdx;
            const isCollectingNow = activeCollectIdx === idx;

            return (
              <div
                key={idx}
                className={`flex-grow min-w-[32px] py-2 rounded-lg border text-center font-mono text-xs font-extrabold transition-all ${
                  isCollectingNow
                    ? "bg-rose-500 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse"
                    : isCollected
                      ? "bg-slate-900 border-white/10 text-emerald-300"
                      : "bg-slate-950/20 border-dashed border-white/5 text-gray-700"
                }`}
              >
                {isCollected || (activeCollectIdx !== null && idx < activeCollectIdx) ? val : "-"}
                <span className="block text-[7px] text-gray-500 font-semibold mt-0.5">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
