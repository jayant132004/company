import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://algoverse-flame.vercel.app");

export const metadata: Metadata = {
  title: "SearchMentor — Interactive Searching Algorithms Visualizer & Complexity Studio",
  description:
    "Master searching algorithms with interactive spatial visualizers: Binary Search (with low/mid/high boundaries), Interpolation Search (uniform probe equations), Jump Search, Exponential Search, Ternary Search, and Two Pointers.",
  keywords: [
    "binary search visualizer",
    "searching algorithm visualizer",
    "interpolation search probe visualizer",
    "jump search step simulator",
    "exponential search online",
    "two pointers visualizer",
    "SearchMentor",
    "interactive DSA visualizer",
    "AlgoVerse",
  ],
  alternates: {
    canonical: `${siteUrl}/searchmentor`,
  },
  openGraph: {
    title: "SearchMentor — Interactive Searching Algorithms Visualizer | AlgoVerse",
    description:
      "Visual step-by-step searching studio with dynamic low/mid/high pointer animations, discarded search-space elimination, and instant algorithm benchmark comparisons.",
    url: `${siteUrl}/searchmentor`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SearchMentor Interactive Searching Visualizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SearchMentor — Interactive Searching Algorithms Visualizer",
    description:
      "Step through Binary Search, Interpolation Search, Jump Search, and Two Pointers with visual elimination zones and probe formulas.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function SearchMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
