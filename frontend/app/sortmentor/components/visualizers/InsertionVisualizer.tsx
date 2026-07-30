import React from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass } from "./BaseVisualizer";

export default function InsertionVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom,
  battleId
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const accentColor = battleId === 2 ? "pink" : "indigo";

  // In insertion sort, the element being inserted (key) shifts down. 
  // Let's identify the index being compared or swapped, and float it up slightly.
  const activeKeyIdx = activeStep?.compare ? activeStep.compare[1] : activeStep?.swap ? activeStep.swap[0] : null;

  return (
    <div 
      className="w-full h-full flex flex-col justify-between min-h-0"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* Array Bars Grid */}
      <div className="flex-1 flex items-end justify-between gap-[2px] border-b border-white/5 pb-2 relative min-h-0 select-none overflow-hidden pt-8">
        {array.map((val, idx) => {
          const heightVal = getNormalizedHeight(val, originalArray);
          const barClass = getBarColorClass(idx, activeStep, accentColor);
          const isFloating = activeKeyIdx === idx;
          const showNumber = array.length <= 16;

          return (
            <motion.div
              key={idx}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              animate={{
                y: isFloating ? -20 : 0,
                boxShadow: isFloating ? "0 0 20px rgba(251,191,36,0.8)" : "none"
              }}
              className={`flex-1 rounded-t-md flex items-end justify-center select-none relative ${barClass}`}
              style={{ height: heightVal }}
            >
              {isFloating && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-300 text-[8px] font-mono font-bold tracking-wider">
                  KEY
                </div>
              )}

              {showNumber && (
                <span className="font-mono text-[9px] font-bold text-white pb-1 rotate-90 sm:rotate-0 origin-center truncate">
                  {val}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
