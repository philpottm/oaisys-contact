import type { MetadataRoute } from "next";
import { appUrl } from "./lib/siteMeta";

// Static export: the route must be prerendered at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
