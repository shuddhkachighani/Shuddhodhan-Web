import Script from "next/script";
import { siteSettings } from "@/lib/data/settings";

// No-op until NEXT_PUBLIC_GA4_MEASUREMENT_ID is set.
export function GA4Script() {
  const id = siteSettings.analytics.ga4MeasurementId;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
