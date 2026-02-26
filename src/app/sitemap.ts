import { MetadataRoute } from "next";
import { getAllPages } from "@/lib/pages";
import { formatPermalink } from "@/lib/utils";

const BASE_URL = "https://esg-hub.ascent.partners";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/developers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/developers/api`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/developers/mcp`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic content pages
  const dynamicRoutes: MetadataRoute.Sitemap = pages
    .filter((p) => !p.redirect_to)
    .map((page) => ({
      url: `${BASE_URL}${formatPermalink(page.permalink)}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: page.section === "home" ? 1.0 : page.subsection ? 0.6 : 0.8,
    }));

  return [...staticRoutes, ...dynamicRoutes];
}
