import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://algoverse-flame.vercel.app");

export const metadata: Metadata = {
  title: "SortMentor — Interactive DSA Sorting Visualizer & AI Tutor Studio",
  description:
    "Master computer science algorithms visually with 11 specialized visualizer topologies (Merge tree, Binary Heap, Bucket cups, Step Ghost Trails), Battle Arena dual mode, and RAG-powered AI state explanations.",
  alternates: {
    canonical: `${siteUrl}/sortmentor`,
  },
  openGraph: {
    title: "SortMentor — Interactive Sorting Visualizer Studio & AI Tutor",
    description:
      "Step through QuickSort, MergeSort, TimSort, and HeapSort with motion ghost trails, divide-and-conquer trees, and instant AI tutor explanations.",
    url: `${siteUrl}/sortmentor`,
    type: "website",
  },
};

export default function SortMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
