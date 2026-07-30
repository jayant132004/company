import React from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass } from "./BaseVisualizer";

export default function BubbleVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom,
  battleId
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const accentColor = battleId === 2 ? "pink" : "indigo";

  return (
    <div 
      className="w-full h-full flex flex-col justify-between min-h-0"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* Array Bars Grid */}
      <div className="flex-1 flex items-end justify-between gap-[2px] border-b border-white/5 pb-2 relative min-h-0 select-none overflow-hidden">
        {array.map((val, idx) => {
          const heightVal = getNormalizedHeight(val, originalArray);
          const barClass = getBarColorClass(idx, activeStep, accentColor);
          const showNumber = array.length <= 16;

          return (
            <motion.div
              key={idx}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`flex-1 rounded-t-md flex items-end justify-center select-none ${barClass}`}
              style={{ height: heightVal }}
            >
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
