import React from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass, getNumberFontSizeClass } from "./BaseVisualizer";
import StepGhostTrails from "./StepGhostTrails";

export default function BubbleVisualizer({
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

  return (
    <div 
      className="w-full h-full flex flex-col justify-between min-h-0 relative overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* Array Bars Grid */}
      <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 border-b border-white/5 pb-2 relative min-h-0 select-none px-2 pt-6">
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
          const isCompared = activeStep?.compare?.includes(idx);
          const isSwapped = activeStep?.swap?.includes(idx);

          return (
            <motion.div
              key={idx}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`flex-1 min-w-0 rounded-t-lg flex flex-col items-center justify-between py-2 select-none relative transition-colors ${barClass}`}
              style={{ height: heightVal }}
            >
              {/* Value Number at the top of the bar */}
              <span className={`font-mono ${numFont} text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none truncate px-0.5`}>
                {val}
              </span>

              {/* Index label at the bottom of the bar */}
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
