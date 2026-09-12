import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cart-context";
import { MetaPixelScript } from "@/components/analytics/meta-pixel-script";
import { GA4Script } from "@/components/analytics/ga4-script";
import { AttributionCapture } from "@/components/analytics/attribution-capture";
import WhatsAppButton from "@/components/whatsapp-button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { siteSettings } from "@/lib/data/settings";
import { organizationJsonLd } from "@/lib/seo/json-ld";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteSettings.siteUrl),
  title: {
    default: `${siteSettings.brandName} — Wood Cold Pressed Oils | Indore`,
    template: `%s | ${siteSettings.brandName}`,
  },
  description:
    "Shuddhodhan Wood Cold Pressed Oils — traditional Kachi Ghani process, honest ingredients, made in Indore. Groundnut, Mustard, Coconut, Sesame and more.",
  openGraph: {
    type: "website",
    siteName: siteSettings.brandName,
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-white text-charcoal">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <MetaPixelScript />
        <GA4Script />
        <AttributionCapture />
        <CartProvider>
          {children}
          <CartDrawer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
