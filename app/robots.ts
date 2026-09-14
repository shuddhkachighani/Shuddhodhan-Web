import type { MetadataRoute } from "next";
import { siteSettings } from "@/lib/data/settings";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/order-confirmation"],
      },
    ],
    sitemap: `${siteSettings.siteUrl}/sitemap.xml`,
  };
}
