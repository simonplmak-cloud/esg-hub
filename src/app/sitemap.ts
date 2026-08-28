import { MetadataRoute } from "next";
import { getAllPages } from "@/lib/pages";
import { formatPermalink } from "@/lib/utils";

const BASE_URL = "https://esg-hub.ascent.partners";
const LOCALES = ["en", "zh", "hi"] as const;

function localeAlternates(path: string): MetadataRoute.Sitemap[number]["alternates"] {
  return {
    languages: Object.fromEntries(
      LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: localeAlternates(""),
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: localeAlternates("/search"),
    },
    {
      url: `${BASE_URL}/developers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: localeAlternates("/developers"),
    },
    {
      url: `${BASE_URL}/developers/api`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: localeAlternates("/developers/api"),
    },
    {
      url: `${BASE_URL}/developers/mcp`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: localeAlternates("/developers/mcp"),
    },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = pages
    .filter((p) => !p.redirect_to)
    .map((page) => ({
      url: `${BASE_URL}${formatPermalink(page.permalink)}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: page.section === "home" ? 1.0 : page.subsection ? 0.6 : 0.8,
      alternates: localeAlternates(formatPermalink(page.permalink)),
    }));

  return [...staticRoutes, ...dynamicRoutes];
}
