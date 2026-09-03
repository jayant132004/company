import React from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass } from "./BaseVisualizer";
import { Star } from "lucide-react";
import StepGhostTrails from "./StepGhostTrails";

export default function SelectionVisualizer({
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

  // In selection sort, the first element compared is often the minimum candidate index
  const minCandidateIdx = activeStep?.compare && activeStep.compare.length > 0 ? activeStep.compare[0] : null;

  return (
    <div 
      className="w-full h-full flex flex-col justify-start min-h-0 relative"
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
    >
      <div className="flex-1 flex flex-col justify-start gap-2 p-2 sm:p-4 select-none overflow-y-auto min-h-0 max-h-full relative">
        {/* Step Ghost Trails & Motion Trajectory Overlay */}
        <StepGhostTrails
          array={array}
          originalArray={originalArray}
          steps={steps}
          currentStepIndex={currentStepIndex}
          speed={speed}
          enabled={ghostTrails}
          orientation="horizontal"
          accentColor={accentColor as any}
        />
        {array.map((val, idx) => {
          // Normalize height function calculates percentages, which we use as width here!
          const widthVal = getNormalizedHeight(val, originalArray);
          const barColorClass = getBarColorClass(idx, activeStep, accentColor);
          const isMinCandidate = minCandidateIdx === idx;

          return (
            <div key={idx} className="flex items-center gap-2 sm:gap-3 w-full shrink-0">
              {/* Index label */}
              <span className="font-mono text-xs text-gray-400 font-semibold w-9 select-none shrink-0 text-right pr-1">
                [{idx}]
              </span>

              {/* Bar Wrapper */}
              <div className="flex-1 h-7 bg-slate-950/60 rounded-lg border border-white/5 relative overflow-hidden flex items-center pr-2 shadow-inner">
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`h-full rounded-r-lg flex items-center justify-end px-3 transition-colors ${barColorClass}`}
                  style={{ width: widthVal }}
                >
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {val}
                  </span>
                </motion.div>

                {isMinCandidate && (
                  <div className="absolute right-3 flex items-center gap-1 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider bg-slate-950/90 px-2 py-0.5 rounded border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse z-10">
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
