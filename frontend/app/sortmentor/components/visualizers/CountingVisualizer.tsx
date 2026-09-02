import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizerProps } from "./BaseVisualizer";

export default function CountingVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];

  // Helper values
  const minVal = useMemo(() => Math.min(...originalArray, 0), [originalArray]);
  const maxVal = useMemo(() => Math.max(...originalArray, 1), [originalArray]);
  const range = maxVal - minVal + 1;

  // Reconstruct exact state at current step
  const sim = useMemo(() => {
    const count_arr = new Array(range).fill(0);
    const output_arr = new Array(originalArray.length).fill(null);
    
    if (currentStepIndex < 0 || steps.length === 0) {
      return { count_arr, output_arr, phase: "init", activePointer: null, activeOutputPointer: null };
    }

    // Phase detection
    const currentStep = steps[currentStepIndex];
    
    // Simulate counts incrementation
    let activePointer = null;
    let activeOutputPointer = null;

    for (let k = 0; k <= currentStepIndex; k++) {
      const s = steps[k];
      if (s.event_type === "count_increment" && s.compare) {
        const origIdx = s.compare[0];
        const val = originalArray[origIdx];
        count_arr[val - minVal] += 1;
        activePointer = origIdx;
      }
    }

    // Check if accumulation has started/finished
    const isAccumulated = steps.slice(0, currentStepIndex + 1).some(s => s.event_type === "accumulate_counts");
    if (isAccumulated) {
      let sum = 0;
      for (let i = 0; i < count_arr.length; i++) {
        sum += count_arr[i];
        count_arr[i] = sum;
      }

      // Simulate output placements
      for (let k = 0; k <= currentStepIndex; k++) {
        const s = steps[k];
        if (s.event_type === "write_output" && s.compare && s.swap) {
          const origIdx = s.compare[0];
          const destIdx = s.swap[0];
          const val = originalArray[origIdx];
          output_arr[destIdx] = val;
          count_arr[val - minVal] -= 1;
          activePointer = origIdx;
          activeOutputPointer = destIdx;
        }
      }
      return { count_arr, output_arr, phase: "write", activePointer, activeOutputPointer };
    }

    return { count_arr, output_arr, phase: "count", activePointer, activeOutputPointer };
  }, [originalArray, steps, currentStepIndex, range, minVal]);

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-1.5 sm:p-3 gap-2 sm:gap-3 min-h-0 overflow-y-auto select-none"
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
    >
      
      {/* 1. Input Array */}
      <div className="flex flex-col gap-1 shrink-0 bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-white/5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            1. Input Array ({originalArray.length} items):
          </span>
          {sim.activePointer !== null && (
            <span className="text-[9px] font-mono text-amber-300 font-bold">
              Scanning element [{sim.activePointer}] = {originalArray[sim.activePointer]}
            </span>
          )}
        </div>
        <div className="flex gap-1 sm:gap-1.5 justify-between select-none overflow-x-auto pb-0.5">
          {originalArray.map((val, idx) => {
            const isActive = sim.activePointer === idx;
            return (
              <div
                key={idx}
                className={`flex-1 min-w-[26px] sm:min-w-[34px] py-1 sm:py-1.5 rounded-lg border text-center font-mono text-[10px] sm:text-xs font-black transition-all ${
                  isActive
                    ? "bg-amber-400/30 border-amber-400 text-amber-200 shadow-md shadow-amber-400/30 scale-105 z-10 ring-1 ring-amber-400/40"
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

      {/* 2. Frequency Counting Array */}
      <div className="flex flex-col gap-1 flex-1 min-h-[120px] bg-slate-950/40 p-2 sm:p-2.5 rounded-xl border border-white/5 shadow-inner overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <span className="text-[9px] sm:text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold">
            2. Counting Array (Frequencies {sim.phase === "write" ? "& Prefix Sums" : ""}):
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            Range: [{minVal} ... {maxVal}] ({sim.count_arr.length} positions)
          </span>
        </div>
        <div className="flex gap-1 sm:gap-1.5 justify-between overflow-x-auto select-none py-1 flex-1 items-center">
          {sim.count_arr.map((val, idx) => {
            const mappedVal = idx + minVal;
            const isHighlighted = activeStep && activeStep.event_type === "count_increment" && (activeStep.compare && originalArray[activeStep.compare[0]] === mappedVal);

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[28px] sm:min-w-[36px] py-1 sm:py-1.5 rounded-lg border text-center font-mono text-[10px] sm:text-xs font-black transition-all ${
                  isHighlighted
                    ? "bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-500/30 scale-105 z-10"
                    : "bg-slate-950 border-white/10 text-gray-300"
                }`}
              >
                <span className="block leading-tight text-white">{val}</span>
                <span className="block text-[7px] text-indigo-400 font-bold leading-none mt-0.5">v:{mappedVal}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Output Array */}
      <div className="flex flex-col gap-1 shrink-0 bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-white/5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            3. Output Array:
          </span>
          {sim.activeOutputPointer !== null && (
            <span className="text-[9px] font-mono text-emerald-300 font-bold">
              Placing into output[{sim.activeOutputPointer}]
            </span>
          )}
        </div>
        <div className="flex gap-1 sm:gap-1.5 justify-between select-none overflow-x-auto pb-0.5">
          {sim.output_arr.map((val, idx) => {
            const isActive = sim.activeOutputPointer === idx;
            const hasVal = val !== null;

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[26px] sm:min-w-[34px] py-1 sm:py-1.5 rounded-lg border text-center font-mono text-[10px] sm:text-xs font-black transition-all ${
                  isActive
                    ? "bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-md scale-105 z-10"
                    : hasVal
                      ? "bg-slate-900 border-white/10 text-gray-200"
                      : "bg-slate-950/30 border-dashed border-white/10 text-gray-600"
                }`}
              >
                <span className="block leading-tight">{hasVal ? val : "-"}</span>
                <span className="block text-[7px] text-gray-500 font-semibold leading-none mt-0.5">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
