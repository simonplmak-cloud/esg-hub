import { MetadataRoute } from "next";
import { getAllPages } from "@/lib/pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://esg-hub.ascent.partners";

  return pages
    .filter((p) => !p.redirect_to)
    .map((page) => ({
      url: `${baseUrl}${page.permalink.replace(/\/$/, "")}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: page.section === "home" ? 1.0 : page.subsection ? 0.6 : 0.8,
    }));
}
