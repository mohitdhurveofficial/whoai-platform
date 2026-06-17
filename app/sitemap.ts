import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://whoai-platform.vercel.app";

  const routes: { path: string; priority: number; changefreq: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1.0, changefreq: "daily" },
    { path: "/pricing", priority: 0.9, changefreq: "weekly" },
    { path: "/about", priority: 0.8, changefreq: "monthly" },
    { path: "/teardown", priority: 0.8, changefreq: "weekly" },
    { path: "/demo", priority: 0.8, changefreq: "weekly" },
    { path: "/docs", priority: 0.8, changefreq: "weekly" },
    { path: "/docs/quickstart", priority: 0.7, changefreq: "monthly" },
    { path: "/trust", priority: 0.7, changefreq: "monthly" },
    { path: "/security", priority: 0.7, changefreq: "monthly" },
    { path: "/status", priority: 0.6, changefreq: "daily" },
    { path: "/contact", priority: 0.6, changefreq: "monthly" },
    { path: "/blog", priority: 0.8, changefreq: "weekly" },
    { path: "/blog/ai-finops-guide", priority: 0.7, changefreq: "monthly" },
    { path: "/blog/gpt-4o-cost-tracking", priority: 0.7, changefreq: "monthly" },
    { path: "/blog/preventing-claude-costs", priority: 0.7, changefreq: "monthly" },
    { path: "/search", priority: 0.5, changefreq: "monthly" },
    { path: "/terms", priority: 0.3, changefreq: "monthly" },
    { path: "/privacy", priority: 0.3, changefreq: "monthly" },
    { path: "/legal/dpa", priority: 0.3, changefreq: "monthly" },
  ];

  return routes.map(({ path, priority, changefreq }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: changefreq,
    priority,
  }));
}
