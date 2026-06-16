import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/usage",
        "/billing",
        "/settings",
        "/settings/api-keys",
        "/settings/providers",
        "/api/",
        "/_next/",
      ],
    },
    sitemap: "https://whoai-platform.vercel.app/sitemap.xml",
    host: "https://whoai-platform.vercel.app",
  };
}
