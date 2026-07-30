import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoVerse — AI-Powered Computer Science Learning",
  description: "An interactive computer science platform featuring real-time algorithm visualizers, persistent AI tutoring, gamified roadmaps, and coding challenges.",
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
      <body className="min-h-full flex flex-col bg-[#030712] text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Subtle grid mesh and radial gradient background */}
        <div className="fixed inset-0 -z-50 h-full w-full bg-[#030712] bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70"></div>
        <div className="fixed inset-0 -z-50 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,rgba(99,102,241,0.06),transparent)]"></div>
        
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
