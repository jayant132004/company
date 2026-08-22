import React from "react";
import { VisualizerProps } from "./BaseVisualizer";
import BubbleVisualizer from "./BubbleVisualizer";
import SelectionVisualizer from "./SelectionVisualizer";
import InsertionVisualizer from "./InsertionVisualizer";
import QuickVisualizer from "./QuickVisualizer";
import MergeVisualizer from "./MergeVisualizer";
import HeapVisualizer from "./HeapVisualizer";
import CountingVisualizer from "./CountingVisualizer";
import RadixVisualizer from "./RadixVisualizer";
import BucketVisualizer from "./BucketVisualizer";
import ShellVisualizer from "./ShellVisualizer";
import TimVisualizer from "./TimVisualizer";

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
      // Fallback to standard Bubble (vertical bars) for other algorithms
      return <BubbleVisualizer {...props} />;
  }
}
