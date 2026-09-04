import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://algoverse.io";

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
  ];

  // Specific Algorithm deep-links for Google indexing
  const algoRoutes: MetadataRoute.Sitemap = ALGORITHM_SLUGS.map((slug) => ({
    url: `${siteUrl}/sortmentor?algorithm=${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...mainRoutes, ...algoRoutes];
}
