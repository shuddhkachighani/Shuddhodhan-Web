import { siteSettings } from "@/lib/data/settings";
import type { FaqItem, Product } from "@/lib/types";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteSettings.brandName,
    url: siteSettings.siteUrl,
    slogan: siteSettings.brandTagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Indore",
      addressRegion: "Madhya Pradesh",
      addressCountry: "IN",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function productJsonLd(product: Product) {
  const inStockVariant = product.variants.find((v) => v.inStock);
  const lowPrice = Math.min(...product.variants.map((v) => v.sellingPrice));
  const highPrice = Math.max(...product.variants.map((v) => v.sellingPrice));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    brand: {
      "@type": "Brand",
      name: siteSettings.brandName,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice,
      highPrice,
      offerCount: product.variants.length,
      availability: inStockVariant
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
