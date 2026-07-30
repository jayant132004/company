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
      className="w-full h-full flex flex-col justify-between p-2 gap-4 min-h-0 overflow-y-auto"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      
      {/* 1. Input Array */}
      <div className="flex flex-col gap-1">
        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">1. Input Array:</span>
        <div className="flex gap-1 justify-between select-none">
          {originalArray.map((val, idx) => {
            const isActive = sim.activePointer === idx;
            return (
              <div
                key={idx}
                className={`flex-1 py-1.5 rounded border text-center font-mono text-[9px] font-bold transition-all ${
                  isActive
                    ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-400/10"
                    : "bg-slate-900/40 border-white/5 text-gray-400"
                }`}
              >
                {val}
                <span className="block text-[6px] text-gray-600 font-normal">idx:{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Frequency Counting Array */}
      <div className="flex flex-col gap-1">
        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">
          2. Counting Array (Frequencies {sim.phase === "write" ? "& Mappings" : ""}):
        </span>
        <div className="flex gap-1 justify-between overflow-x-auto select-none py-1">
          {sim.count_arr.map((val, idx) => {
            const mappedVal = idx + minVal;
            const isHighlighted = activeStep && activeStep.event_type === "count_increment" && (activeStep.compare && originalArray[activeStep.compare[0]] === mappedVal);

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[32px] py-1.5 rounded border text-center font-mono text-[9px] font-bold transition-all ${
                  isHighlighted
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/10"
                    : "bg-slate-950/60 border-white/5 text-gray-400"
                }`}
              >
                {val}
                <span className="block text-[6px] text-gray-500 font-bold">val:{mappedVal}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Output Array */}
      <div className="flex flex-col gap-1">
        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">3. Output Array:</span>
        <div className="flex gap-1 justify-between select-none">
          {sim.output_arr.map((val, idx) => {
            const isActive = sim.activeOutputPointer === idx;
            const hasVal = val !== null;

            return (
              <div
                key={idx}
                className={`flex-1 py-1.5 rounded border text-center font-mono text-[9px] font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                    : hasVal
                      ? "bg-slate-900 border-white/10 text-gray-300"
                      : "bg-slate-950/20 border-dashed border-white/5 text-gray-700"
                }`}
              >
                {hasVal ? val : "-"}
                <span className="block text-[6px] text-gray-600 font-normal">idx:{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
