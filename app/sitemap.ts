import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "./lib/deployMode";
import { appUrl, isShowcase } from "./lib/siteMeta";

// Static export: the route must be prerendered at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return buildSitemapEntries(appUrl, isShowcase).map((entry) => ({
    url: entry.url,
    priority: entry.priority,
    lastModified,
    changeFrequency: "monthly" as const,
  }));
}
