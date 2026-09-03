import React from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass, getNumberFontSizeClass } from "./BaseVisualizer";
import StepGhostTrails from "./StepGhostTrails";

export default function InsertionVisualizer({
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

  // In insertion sort, the element being inserted (key) shifts down. 
  // Let's identify the index being compared or swapped, and float it up slightly.
  const activeKeyIdx = activeStep?.compare ? activeStep.compare[1] : activeStep?.swap ? activeStep.swap[0] : null;

  return (
    <div 
      className="w-full h-full flex flex-col justify-between min-h-0 relative overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* Array Bars Grid */}
      <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 border-b border-white/5 pb-2 relative min-h-0 select-none px-2 pt-10">
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
          const isFloating = activeKeyIdx === idx;

          return (
            <motion.div
              key={idx}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              animate={{
                y: isFloating ? -16 : 0,
                boxShadow: isFloating ? "0 0 20px rgba(251,191,36,0.8)" : "none"
              }}
              className={`flex-1 min-w-0 rounded-t-lg flex flex-col items-center justify-between py-2 select-none relative transition-colors ${barClass}`}
              style={{ height: heightVal }}
            >
              {isFloating && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold tracking-wider shadow-md">
                  KEY
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
    </div>
  );
}
