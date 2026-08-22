import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizerProps, getNormalizedHeight, getBarColorClass } from "./BaseVisualizer";

export default function ShellVisualizer({
  array,
  originalArray,
  steps,
  currentStepIndex,
  zoom,
  battleId
}: VisualizerProps) {
  const activeStep = steps[currentStepIndex];
  const accentColor = battleId === 2 ? "pink" : "indigo";

  // Find the current gap size by scanning backward
  const currentGap = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return 0;
    for (let k = currentStepIndex; k >= 0; k--) {
      const step = steps[k];
      if (step.event_type === "gap_update" && step.message) {
        const match = step.message.match(/interval to (\d+)/);
        if (match) return Number(match[1]);
      }
    }
    // Try to guess gap from comparisons/swaps if no gap_update found
    if (activeStep?.compare && activeStep.compare.length >= 2) {
      return Math.abs(activeStep.compare[1] - activeStep.compare[0]);
    }
    return 0;
  }, [steps, currentStepIndex, activeStep]);

  // Generate distinct HSL colors for each gap group
  const getGapGroupColor = (idx: number, gap: number) => {
    if (gap <= 1) return null; // No special colors for gap <= 1
    const groupIdx = idx % gap;
    const hue = (groupIdx * (360 / gap)) % 360;
    return `hsl(${hue}, 70%, 55%)`;
  };

  return (
    <div 
      className="w-full h-full flex flex-col justify-between min-h-0"
      style={{ transform: `scale(${zoom})`, transformOrigin: "bottom center" }}
    >
      {/* Dynamic Arch comparison SVG Overlay */}
      <div className="flex-1 relative flex flex-col justify-end min-h-0">
        
        {activeStep?.compare && activeStep.compare.length >= 2 && (
          <svg className="absolute inset-0 w-full h-[80px] pointer-events-none z-10">
            {(() => {
              const [c1, c2] = activeStep.compare;
              const n = array.length;
              const leftPercent = ((c1 + 0.5) / n) * 100;
              const rightPercent = ((c2 + 0.5) / n) * 100;
              const midPercent = (leftPercent + rightPercent) / 2;
              
              return (
                <path
                  d={`M ${leftPercent}% 75 Q ${midPercent}% 15, ${rightPercent}% 75`}
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.9)"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  className="animate-[dash_1s_linear_infinite]"
                />
              );
            })()}
          </svg>
        )}

        {/* Array Bars Grid */}
        <div className="flex-grow flex items-end justify-between gap-[2px] border-b border-white/5 pb-2 relative min-h-0 select-none overflow-hidden pt-12">
          {array.map((val, idx) => {
            const heightVal = getNormalizedHeight(val, originalArray);
            
            // Standard colors if compared/swapped, group color otherwise
            const isCompared = activeStep?.compare?.includes(idx);
            const isSwapped = activeStep?.swap?.includes(idx);
            const defaultBarColor = getBarColorClass(idx, activeStep, accentColor);
            
            const gapColor = getGapGroupColor(idx, currentGap);
            const showNumber = array.length <= 16;

            const finalStyle: React.CSSProperties = { height: heightVal };
            let finalClass = defaultBarColor;

            if (!isCompared && !isSwapped && gapColor) {
              finalStyle.backgroundColor = gapColor;
              finalClass = "flex-1 rounded-t-md flex items-end justify-center select-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]";
            }

            return (
              <motion.div
                key={idx}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`${finalClass}`}
                style={finalStyle}
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

      {/* Gap status banner */}
      {currentGap > 0 && (
        <div className="shrink-0 flex justify-between items-center text-[8px] font-mono text-gray-500 py-1 bg-slate-950/20 px-2 rounded-b border-t border-white/5">
          <span>Active Gap: <b className="text-pink-400">{currentGap}</b></span>
          <span>Interleaved Subarrays: {currentGap} distinct groups</span>
        </div>
      )}
    </div>
  );
}
