import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";
import FeedbackButton from "../components/ui/FeedbackButton";
import JsonLd from "../components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://algoverse-flame.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AlgoVerse — Interactive DSA Visualizer & Next-Gen AI Tutor",
    template: "%s | AlgoVerse",
  },
  description:
    "Master Data Structures & Algorithms with real-time interactive sorting visualizers (Quick, Merge, Heap, TimSort, Radix), step ghost trails, RAG-powered AI tutoring, and competitive coding simulations.",
  keywords: [
    "data structures and algorithms",
    "sorting algorithm visualizer",
    "interactive DSA visualizer",
    "SortMentor AI tutor",
    "AlgoVerse",
  ],
  authors: [{ name: "AlgoVerse Team", url: siteUrl }],
  creator: "AlgoVerse",
  publisher: "AlgoVerse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "AlgoVerse — Interactive DSA Visualizer & AI Tutor",
    description:
      "Interactive DSA visualizer featuring 11 specialized algorithm topologies, step ghost trails, battle arena benchmarks, and real-time AI tutor grounding.",
    url: siteUrl,
    siteName: "AlgoVerse",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AlgoVerse Interactive Algorithm Visualizer & AI Tutor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoVerse — Interactive DSA Visualizer & AI Tutor",
    description:
      "Master computer science algorithms visually with 11 custom visualizers and instant AI tutoring.",
    creator: "@algoverse",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google50ef3dbf2b4a590e",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-[#030712] text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Subtle grid mesh and radial gradient background */}
        <div className="fixed inset-0 -z-50 h-full w-full bg-[#030712] bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70"></div>
        <div className="fixed inset-0 -z-50 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,rgba(99,102,241,0.06),transparent)]"></div>

        <ClientProviders>
          {children}
          {/* Global Floating Feedback Form */}
          <FeedbackButton floating={true} />
        </ClientProviders>
      </body>
    </html>
  );
}
