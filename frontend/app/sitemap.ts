import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://algoverse-flame.vercel.app");

const ALGORITHM_SLUGS = [
  "bubble",
  "selection",
  "insertion",
  "merge",
  "quick",
  "heap",
  "counting",
  "radix",
  "bucket",
  "shell",
  "timsort",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Core public landing routes
  const mainRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/sortmentor`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/gate-exam-sorting-algorithms`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/searchmentor`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/treementor`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  const TREE_SLUGS = ["avl", "bst", "redblack", "trie", "segment", "fenwick"];

  // Specific Tree deep-links for Google indexing
  const treeRoutes: MetadataRoute.Sitemap = TREE_SLUGS.map((slug) => ({
    url: `${siteUrl}/treementor?structure=${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Specific Algorithm deep-links for Google indexing
  const algoRoutes: MetadataRoute.Sitemap = ALGORITHM_SLUGS.map((slug) => ({
    url: `${siteUrl}/sortmentor?algorithm=${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...mainRoutes, ...treeRoutes, ...algoRoutes];
}
