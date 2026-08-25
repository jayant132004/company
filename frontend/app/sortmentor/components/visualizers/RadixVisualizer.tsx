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
      className="w-full h-full flex flex-col justify-between p-2 gap-4 min-h-0 overflow-y-auto"
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
    >
      
      {/* Exponent / Position banner */}
      <div className="shrink-0 flex justify-between items-center text-xs font-mono bg-slate-950/60 border border-white/5 p-3 rounded-xl shadow-inner">
        <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Current Digit Position:</span>
        <span className="text-pink-400 font-extrabold text-xs">Base {exp} ({exp === 1 ? "Ones Place" : exp === 10 ? "Tens Place" : exp === 100 ? "Hundreds Place" : "Higher"})</span>
      </div>

      {/* Main Array Display */}
      <div className="flex flex-col gap-1.5 shrink-0 bg-slate-950/40 p-3 rounded-xl border border-white/5">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Array:</span>
        <div className="flex gap-1.5 justify-between select-none overflow-x-auto pb-1">
          {array.map((val, idx) => {
            const isWriting = writeBackIdx === idx;
            return (
              <div
                key={idx}
                className={`flex-1 min-w-[32px] py-2 rounded-lg border text-center font-mono text-xs font-extrabold transition-all ${
                  isWriting
                    ? "bg-rose-500/30 border-rose-500 text-rose-200 shadow-md shadow-rose-500/30 animate-pulse"
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

      {/* Digit Buckets */}
      <div className="flex flex-col gap-2 min-h-0 flex-1">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block shrink-0 font-bold">Digit Buckets (0-9):</span>
        
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 flex-1 min-h-0 overflow-y-auto">
          {buckets.map((bucketValues, bucketDigit) => {
            // Check if this bucket is actively releasing the current writeBackVal
            const isReleasing = writeBackVal !== null && Math.floor(writeBackVal / exp) % 10 === bucketDigit;

            return (
              <div
                key={bucketDigit}
                className={`rounded-xl border p-2 flex flex-col items-center gap-2 min-h-[100px] transition-all bg-slate-950/60 ${
                  isReleasing
                    ? "border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                    : "border-white/5"
                }`}
              >
                {/* Bucket Header */}
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-mono text-xs font-extrabold text-indigo-300">
                  {bucketDigit}
                </div>

                {/* Bucket Elements stack */}
                <div className="flex flex-col-reverse gap-1.5 w-full flex-1 justify-start overflow-y-auto">
                  {bucketValues.map((val, itemIdx) => {
                    const isTransferring = isReleasing && val === writeBackVal;
                    return (
                      <motion.div
                        key={itemIdx}
                        layout
                        className={`w-full py-1 text-center font-mono text-xs font-extrabold rounded-md border ${
                          isTransferring
                            ? "bg-rose-500 border-rose-500 text-white animate-pulse shadow-md"
                            : "bg-slate-900 border-white/10 text-gray-200"
                        }`}
                      >
                        {val}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
