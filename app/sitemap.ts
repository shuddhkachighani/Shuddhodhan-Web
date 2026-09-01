import type { MetadataRoute } from "next";
import { products } from "@/lib/data/products";
import { siteSettings } from "@/lib/data/settings";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteSettings.siteUrl;
  const staticRoutes = [
    "",
    "/oils",
    "/cart",
    "/checkout",
    "/legal/privacy-policy",
    "/legal/terms",
    "/legal/shipping-policy",
    "/legal/refund-policy",
    "/legal/payment-policy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = products
    .filter((p) => p.active)
    .map((p) => ({
      url: `${base}/oils/${p.slug}`,
      lastModified: new Date(),
    }));

  return [...staticRoutes, ...productRoutes];
}
