import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    heading: "What are cookies",
    body: "Cookies are small files stored on your device that help websites function and remember information about your visit.",
  },
  {
    id: "cookies-we-use",
    heading: "Cookies and tracking technologies we use",
    body: [
      "Essential: cookies required for core site functionality such as keeping items in your cart.",
      "Analytics: if configured, Google Analytics (GA4) to understand site usage.",
      "Advertising: if configured, the Meta (Facebook/Instagram) Pixel to measure ad performance.",
      "Each of these only loads once the corresponding tool is actually configured — see this policy's updates for current status.",
    ],
  },
  {
    id: "managing-cookies",
    heading: "Managing cookies",
    body: "You can control or delete cookies through your browser settings. Disabling certain cookies may affect site functionality such as cart persistence.",
  },
  {
    id: "third-party-cookies",
    heading: "Third-party cookies",
    body: "Some cookies may be set by third-party services we use (analytics, advertising, payment gateway). We do not control these directly.",
  },
  {
    id: "policy-updates",
    heading: "Policy updates",
    body: "This policy may be updated from time to time. The current version is always available at this URL.",
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      intro="What cookies and similar technologies this website uses, and how to manage them."
      sections={sections}
    />
  );
}
