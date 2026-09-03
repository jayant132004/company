import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SortStep } from "../../../../context/useSortStore";
import { getNormalizedHeight } from "./BaseVisualizer";

export interface StepGhostTrailsProps {
  array: number[];
  originalArray: number[];
  steps: SortStep[];
  currentStepIndex: number;
  speed: number;
  enabled?: boolean;
  orientation?: "vertical" | "horizontal";
  accentColor?: "indigo" | "pink" | "emerald" | "violet" | "cyan";
}

interface GhostDisplacement {
  originIdx: number;
  targetIdx: number;
  value: number;
  targetValue: number;
}

export default function StepGhostTrails({
  array,
  originalArray,
  steps,
  currentStepIndex,
  speed,
  enabled = true,
  orientation = "vertical",
  accentColor = "indigo",
}: StepGhostTrailsProps) {
  if (!enabled || currentStepIndex <= 0 || steps.length === 0) {
    return null;
  }

  const activeStep = steps[currentStepIndex];
  const prevStep = steps[currentStepIndex - 1];

  if (!activeStep || !prevStep) return null;

  // Compute swapped or displaced elements between previous and current step
  const displacements: GhostDisplacement[] = useMemo(() => {
    const list: GhostDisplacement[] = [];
    const n = array.length;
    if (n === 0) return list;

    // Case 1: Explicit swap indices
    if (activeStep.swap && activeStep.swap.length >= 2) {
      const [i1, i2] = activeStep.swap;
      if (i1 >= 0 && i1 < n && i2 >= 0 && i2 < n && i1 !== i2) {
        const val1 = prevStep.array[i1] ?? array[i2];
        const val2 = prevStep.array[i2] ?? array[i1];
        list.push({
          originIdx: i1,
          targetIdx: i2,
          value: val1,
          targetValue: val2,
        });
        list.push({
          originIdx: i2,
          targetIdx: i1,
          value: val2,
          targetValue: val1,
        });
        return list;
      }
    }

    // Case 2: Array delta scan (detects single shifts or implicit key moves)
    const prevArr = prevStep.array || [];
    const currArr = activeStep.array || [];
    const changedIndices: number[] = [];

    for (let i = 0; i < n; i++) {
      if (prevArr[i] !== undefined && currArr[i] !== undefined && prevArr[i] !== currArr[i]) {
        changedIndices.push(i);
      }
    }

    if (changedIndices.length >= 2 && changedIndices.length <= 4) {
      for (const origin of changedIndices) {
        const val = prevArr[origin];
        const target = currArr.findIndex((v, idx) => v === val && changedIndices.includes(idx));
        if (target !== -1 && target !== origin) {
          list.push({
            originIdx: origin,
            targetIdx: target,
            value: val,
            targetValue: currArr[origin],
          });
        }
      }
    }

    return list;
  }, [activeStep, prevStep, array]);

  if (displacements.length === 0) {
    return null;
  }

  const n = array.length;
  // Adaptive animation duration based on playback speed (max 300ms, min 100ms)
  const animDuration = Math.min(0.35, Math.max(0.1, speed / 1000));

  if (orientation === "horizontal") {
    // Horizontal layout displacement trails (e.g. for Selection Sort)
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-30">
        <svg className="w-full h-full pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="ghost-h-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
            <marker
              id="ghost-h-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e" />
            </marker>
          </defs>

          {displacements.slice(0, 2).map((disp, dIdx) => {
            const y1Percent = ((disp.originIdx + 0.5) / n) * 100;
            const y2Percent = ((disp.targetIdx + 0.5) / n) * 100;
            const yMid = (y1Percent + y2Percent) / 2;
            const xArc = 92; // arc curve towards right boundary

            return (
              <motion.path
                key={`h-disp-${dIdx}-${disp.originIdx}-${disp.targetIdx}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: animDuration, ease: "easeOut" }}
                d={`M 82% ${y1Percent}% Q ${xArc}% ${yMid}%, 82% ${y2Percent}%`}
                fill="none"
                stroke="url(#ghost-h-gradient)"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#ghost-h-arrow)"
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // Vertical Bar Grid Layout (Quick, Shell, Bubble, Insertion)
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-30">
      {/* 1. Curved SVG Trajectory Flight Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <linearGradient id="ghost-arc-gradient-rose" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
          </linearGradient>
          <marker
            id="ghost-arc-arrow-rose"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
          </marker>
          <marker
            id="ghost-arc-arrow-cyan"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
          </marker>
        </defs>

        {displacements.slice(0, 2).map((disp, dIdx) => {
          const x1 = ((disp.originIdx + 0.5) / n) * 100;
          const x2 = ((disp.targetIdx + 0.5) / n) * 100;
          const xMid = (x1 + x2) / 2;
          const dist = Math.abs(x1 - x2);
          
          // Arc apex arches higher for wider swaps, capped between 8% and 36% from top
          const yBase = 72; // Percentage baseline near bar tops
          const yApex = Math.max(6, Math.min(38, 48 - dist * 0.45));
          const markerUrl = dIdx === 0 ? "url(#ghost-arc-arrow-rose)" : "url(#ghost-arc-arrow-cyan)";

          return (
            <g key={`arc-${dIdx}-${disp.originIdx}-${disp.targetIdx}`}>
              {/* Glowing Background Blur Path */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: animDuration, ease: "easeOut" }}
                d={`M ${x1}% ${yBase}% Q ${xMid}% ${yApex}%, ${x2}% ${yBase}%`}
                fill="none"
                stroke={dIdx === 0 ? "#f43f5e" : "#06b6d4"}
                strokeWidth="5"
                strokeLinecap="round"
                className="blur-[2px]"
              />

              {/* Crisp Foreground Trajectory Line with Directional Arrow */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ duration: animDuration, ease: "easeOut" }}
                d={`M ${x1}% ${yBase}% Q ${xMid}% ${yApex}%, ${x2}% ${yBase}%`}
                fill="none"
                stroke="url(#ghost-arc-gradient-rose)"
                strokeWidth="2.2"
                strokeDasharray="4 2.5"
                markerEnd={markerUrl}
              />
            </g>
          );
        })}
      </svg>

      {/* 2. Origin Ghost Silhouettes & Motion Origin Badges */}
      <div className="absolute inset-0 w-full h-full flex items-end justify-between gap-1 sm:gap-2 px-2 pb-2 pointer-events-none">
        {array.map((_, idx) => {
          const ghostDisp = displacements.find((d) => d.originIdx === idx);
          if (!ghostDisp) {
            return <div key={idx} className="flex-1 min-w-0 pointer-events-none invisible" />;
          }

          const ghostHeight = getNormalizedHeight(ghostDisp.value, originalArray);

          return (
            <div
              key={idx}
              className="flex-1 min-w-0 flex flex-col items-center justify-end pointer-events-none relative"
              style={{ height: ghostHeight }}
            >
              {/* Faint Dashed Ghost Silhouette */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 0.45, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: animDuration }}
                className="w-full h-full rounded-t-lg border-2 border-dashed border-rose-400/60 bg-rose-500/10 flex flex-col items-center justify-between py-1.5 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
              >
                {/* Ghost Origin Floating Tag */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1 py-0.2 bg-rose-950/90 border border-rose-400/40 rounded text-[7.5px] font-mono font-bold text-rose-300 uppercase tracking-tight flex items-center gap-0.5 whitespace-nowrap shadow-md">
                  <span>origin:</span>
                  <span className="font-extrabold text-white">{ghostDisp.value}</span>
                  <span className="text-rose-400">➔ [{ghostDisp.targetIdx}]</span>
                </div>

                {/* Faint Ghost Value Indicator */}
                <span className="text-[10px] font-mono font-extrabold text-rose-300/80 drop-shadow-sm select-none">
                  {ghostDisp.value}
                </span>

                <span className="text-[8px] font-mono text-rose-400/60 select-none hidden sm:block">
                  ghost
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
