import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://algoverse-flame.vercel.app");

export const metadata: Metadata = {
  title: "Importance of Sorting Algorithms in GATE CS Exam: Weightage, Syllabus & PYQs",
  description:
    "Master sorting algorithms for GATE CS & DA. Comprehensive guide covering 10-year exam weightage, decision tree lower bounds Ω(n log n), stability, recurrence relations, and solved GATE PYQs with interactive visualizer links.",
  keywords: [
    "GATE exam sorting algorithms",
    "GATE CS weightage",
    "sorting algorithms GATE preparation",
    "GATE DAA sorting questions",
    "GATE CS algorithms PYQ",
    "decision tree sorting lower bound",
    "quicksort worst case recurrence GATE",
    "inversion count insertion sort GATE",
    "stable sorting algorithms GATE",
    "heap sort time complexity GATE",
  ],
  alternates: {
    canonical: `${siteUrl}/gate-exam-sorting-algorithms`,
  },
  openGraph: {
    title: "Importance of Sorting Algorithms in GATE CS Exam | AlgoVerse",
    description:
      "Comprehensive GATE CS/DA guide: 10-year weightage breakdown, key concepts (decision trees, recurrences, stability, non-comparison sorts), and 5 solved GATE PYQs with interactive visualizer links.",
    url: `${siteUrl}/gate-exam-sorting-algorithms`,
    type: "article",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "GATE Exam Sorting Algorithms Guide - AlgoVerse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Importance of Sorting Algorithms in GATE CS Exam | AlgoVerse",
    description:
      "Year-wise GATE weightage breakdown, key algorithm concepts, and solved PYQ derivations.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function GateGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
