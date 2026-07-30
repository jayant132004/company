import React from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass } from "./BaseVisualizer";
import { Star } from "lucide-react";

export default function SelectionVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom,
  battleId
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const accentColor = battleId === 2 ? "pink" : "indigo";

  // In selection sort, the first element compared is often the minimum candidate index
  const minCandidateIdx = activeStep?.compare && activeStep.compare.length > 0 ? activeStep.compare[0] : null;

  return (
    <div 
      className="w-full h-full flex flex-col justify-center min-h-0"
      style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
    >
      <div className="flex-1 flex flex-col justify-center gap-2 p-4 select-none overflow-y-auto min-h-0">
        {array.map((val, idx) => {
          // Normalize height function calculates percentages, which we use as width here!
          const widthVal = getNormalizedHeight(val, originalArray);
          const barColorClass = getBarColorClass(idx, activeStep, accentColor);
          const isMinCandidate = minCandidateIdx === idx;

          return (
            <div key={idx} className="flex items-center gap-3 w-full">
              {/* Index label */}
              <span className="font-mono text-[10px] text-gray-500 w-8 select-none">
                idx:{idx}
              </span>

              {/* Bar Wrapper */}
              <div className="flex-1 h-6 bg-slate-950/40 rounded border border-white/5 relative overflow-hidden flex items-center pr-2">
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`h-full rounded-r flex items-center justify-end px-3 transition-colors ${barColorClass}`}
                  style={{ width: widthVal }}
                >
                  <span className="font-mono text-[10px] font-bold text-white">
                    {val}
                  </span>
                </motion.div>

                {isMinCandidate && (
                  <div className="absolute left-2 flex items-center gap-1 text-amber-400 font-mono text-[9px] font-bold uppercase tracking-wider bg-slate-950/80 px-1.5 py-0.5 rounded border border-amber-400/20 shadow-[0_0_8px_rgba(251,191,36,0.3)] animate-pulse">
                    <Star className="h-3 w-3 fill-current" />
                    MIN Candidate
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
