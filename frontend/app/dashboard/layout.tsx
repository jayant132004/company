import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://algoverse-flame.vercel.app");

export const metadata: Metadata = {
  title: "Sorting Algorithms Comparison & Complexity Cheat Sheet",
  description:
    "Interactive sorting algorithm guide & complexity cheat sheet. Compare time & space complexities (O(n log n), O(n²)), stability, and in-place properties for 11 algorithms including Quick, Merge, Heap, TimSort, and Radix Sort.",
  alternates: {
    canonical: `${siteUrl}/dashboard`,
  },
  openGraph: {
    title: "Sorting Algorithms Comparison & Complexity Cheat Sheet | AlgoVerse",
    description:
      "Compare 11 sorting algorithms side-by-side with asymptotic time/space complexities, stability analysis, and interactive sandbox simulations.",
    url: `${siteUrl}/dashboard`,
    type: "website",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
