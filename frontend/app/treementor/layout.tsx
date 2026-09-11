import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://algoverse-flame.vercel.app");

export const metadata: Metadata = {
  title: "TreeMentor — Interactive Trees & Hierarchical Structures Visualizer",
  description:
    "Master hierarchical data structures with physics-based SVG tree layouts: Binary Search Trees (BST), AVL Trees (LL, RR, LR, RL rotations), Red-Black Trees (CLRS double-black fixup), Prefix Tries, Segment Trees (RMQ), and Fenwick Trees (BIT).",
  keywords: [
    "binary search tree visualizer",
    "avl tree rotation visualizer",
    "red black tree visualizer",
    "trie prefix tree visualizer",
    "segment tree rmq visualizer",
    "fenwick tree binary indexed tree",
    "TreeMentor",
    "interactive DSA visualizer",
    "AlgoVerse",
  ],
  alternates: {
    canonical: `${siteUrl}/treementor`,
  },
  openGraph: {
    title: "TreeMentor — Interactive Trees & Hierarchical Structures Visualizer | AlgoVerse",
    description:
      "Interactive physics-based SVG visualizer for BST, AVL self-balancing rotations, Red-Black Trees, Tries, and Segment Trees.",
    url: `${siteUrl}/treementor`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TreeMentor Interactive Tree Visualizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TreeMentor — Interactive Tree Visualizer",
    description:
      "Explore dynamic AVL rotations, Red-Black color invariants, Tries, and Segment Trees visually.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function TreeMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
