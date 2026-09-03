import React from "react";
import dynamic from "next/dynamic";
import { VisualizerProps } from "./BaseVisualizer";
import { Loader2 } from "lucide-react";

const VisualizerSkeleton = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-slate-400 select-none">
    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 flex items-center justify-center">
      <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
    </div>
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
        Loading Visualizer Topology...
      </span>
      <span className="text-[10px] text-slate-500 font-mono">
        Streaming algorithm component chunks asynchronously
      </span>
    </div>
  </div>
);

// Dynamic, code-split imports for all 11 visualizers with SSR disabled for optimal bundle size
const BubbleVisualizer = dynamic(() => import("./BubbleVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const SelectionVisualizer = dynamic(() => import("./SelectionVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const InsertionVisualizer = dynamic(() => import("./InsertionVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const QuickVisualizer = dynamic(() => import("./QuickVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const MergeVisualizer = dynamic(() => import("./MergeVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const HeapVisualizer = dynamic(() => import("./HeapVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const CountingVisualizer = dynamic(() => import("./CountingVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const RadixVisualizer = dynamic(() => import("./RadixVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const BucketVisualizer = dynamic(() => import("./BucketVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const ShellVisualizer = dynamic(() => import("./ShellVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

const TimVisualizer = dynamic(() => import("./TimVisualizer"), {
  ssr: false,
  loading: VisualizerSkeleton,
});

interface VisualizerFactoryProps extends VisualizerProps {
  algorithmName: string;
}

export default function VisualizerFactory(props: VisualizerFactoryProps) {
  const algo = props.algorithmName.toLowerCase().replace(/[\s_-]/g, "");

  switch (algo) {
    case "bubble":
    case "bubblesort":
      return <BubbleVisualizer {...props} />;

    case "selection":
    case "selectionsort":
      return <SelectionVisualizer {...props} />;

    case "insertion":
    case "insertionsort":
      return <InsertionVisualizer {...props} />;

    case "quick":
    case "quicksort":
      return <QuickVisualizer {...props} />;

    case "merge":
    case "mergesort":
      return <MergeVisualizer {...props} />;

    case "heap":
    case "heapsort":
      return <HeapVisualizer {...props} />;

    case "counting":
    case "countingsort":
      return <CountingVisualizer {...props} />;

    case "radix":
    case "radixsort":
      return <RadixVisualizer {...props} />;

    case "bucket":
    case "bucketsort":
      return <BucketVisualizer {...props} />;

    case "shell":
    case "shellsort":
      return <ShellVisualizer {...props} />;

    case "tim":
    case "timsort":
      return <TimVisualizer {...props} />;

    default:
      return <BubbleVisualizer {...props} />;
  }
}
