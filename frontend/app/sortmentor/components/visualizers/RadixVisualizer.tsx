import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizerProps } from "./BaseVisualizer";

export default function RadixVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];

  // 1. Determine current exponent (exp: 1, 10, 100, etc.)
  const exp = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return 1;
    for (let k = currentStepIndex; k >= 0; k--) {
      const step = steps[k];
      if (step.event_type === "radix_pass_start" && step.message) {
        const match = step.message.match(/position (\d+)/);
        if (match) return Number(match[1]);
      }
      if (step.event_type === "write_back" && step.message) {
        const match = step.message.match(/base (\d+)/);
        if (match) return Number(match[1]);
      }
    }
    return 1;
  }, [steps, currentStepIndex]);

  // 2. Find the state at the start of this pass to see how buckets are populated
  const passStartArray = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return originalArray;
    
    // Scan backward to find the last radix_pass_start
    for (let k = currentStepIndex; k >= 0; k--) {
      const step = steps[k];
      if (step.event_type === "radix_pass_start") {
        return step.array;
      }
    }
    return originalArray;
  }, [steps, currentStepIndex, originalArray]);

  // 3. Place elements in their digit buckets
  const buckets = useMemo(() => {
    const b: number[][] = Array.from({ length: 10 }, () => []);
    for (const val of passStartArray) {
      const digit = Math.floor(val / exp) % 10;
      b[digit].push(val);
    }
    return b;
  }, [passStartArray, exp]);

  // 4. Track which element index in the main array is currently being written back
  const writeBackIdx = activeStep?.event_type === "write_back" && activeStep.swap ? activeStep.swap[0] : null;
  const writeBackVal = writeBackIdx !== null ? array[writeBackIdx] : null;

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-1.5 sm:p-3 gap-2 sm:gap-3 min-h-0 overflow-y-auto select-none"
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
    >
      
      {/* Exponent / Position banner */}
      <div className="shrink-0 flex justify-between items-center text-xs font-mono bg-slate-950/60 border border-white/5 p-2 sm:p-2.5 rounded-xl shadow-inner">
        <span className="text-gray-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
          Current Digit Position:
        </span>
        <span className="text-pink-400 font-extrabold text-xs">
          Base {exp} ({exp === 1 ? "1s Place" : exp === 10 ? "10s Place" : exp === 100 ? "100s Place" : "Higher"})
        </span>
      </div>

      {/* Main Array Display */}
      <div className="flex flex-col gap-1 shrink-0 bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-white/5 shadow-inner">
        <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">
          Active Array ({array.length} items):
        </span>
        <div className="flex gap-1 sm:gap-1.5 justify-between select-none overflow-x-auto pb-0.5">
          {array.map((val, idx) => {
            const isWriting = writeBackIdx === idx;
            return (
              <div
                key={idx}
                className={`flex-1 min-w-[26px] sm:min-w-[34px] py-1 sm:py-1.5 rounded-lg border text-center font-mono text-[10px] sm:text-xs font-black transition-all ${
                  isWriting
                    ? "bg-rose-500/30 border-rose-500 text-rose-200 shadow-md shadow-rose-500/30 animate-pulse scale-105 z-10"
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

      {/* Digit Buckets */}
      <div className="flex flex-col gap-1 min-h-[140px] flex-1 bg-slate-950/40 p-2 sm:p-2.5 rounded-xl border border-white/5 shadow-inner overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">
            Digit Buckets (0-9):
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            {writeBackVal !== null ? `Writing back ${writeBackVal}` : "Distributing by current radix digit"}
          </span>
        </div>
        
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5 flex-1 min-h-0 pt-1 overflow-y-auto">
          {buckets.map((bucketValues, bucketDigit) => {
            // Check if this bucket is actively releasing the current writeBackVal
            const isReleasing = writeBackVal !== null && Math.floor(writeBackVal / exp) % 10 === bucketDigit;

            return (
              <div
                key={bucketDigit}
                className={`rounded-xl border p-1 sm:p-1.5 flex flex-col items-center gap-1 min-h-[90px] transition-all bg-slate-950/70 ${
                  isReleasing
                    ? "border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] bg-amber-500/10 ring-1 ring-amber-400/40"
                    : "border-white/10"
                }`}
              >
                {/* Bucket Header */}
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center font-mono text-[10px] sm:text-xs font-black shrink-0 ${
                  isReleasing ? "bg-amber-400 text-slate-950 border-amber-300" : "bg-slate-900 border-white/10 text-indigo-300"
                }`}>
                  {bucketDigit}
                </div>

                {/* Bucket Elements stack */}
                <div className="flex flex-col-reverse gap-1 w-full flex-1 justify-start overflow-y-auto pt-1">
                  {bucketValues.map((val, itemIdx) => {
                    const isTransferring = isReleasing && val === writeBackVal;
                    return (
                      <motion.div
                        key={itemIdx}
                        layout
                        className={`w-full py-0.5 sm:py-1 text-center font-mono text-[9px] sm:text-xs font-black rounded border truncate shadow-sm ${
                          isTransferring
                            ? "bg-rose-500 border-rose-500 text-white animate-pulse shadow-md"
                            : "bg-slate-900 border-white/10 text-gray-200"
                        }`}
                      >
                        {val}
                      </motion.div>
                    );
                  })}
                  {bucketValues.length === 0 && (
                    <span className="text-[7.5px] font-mono text-gray-600 mt-auto mb-1">empty</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
