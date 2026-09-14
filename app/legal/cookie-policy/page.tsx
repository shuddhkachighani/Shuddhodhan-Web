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
      "Essential: cookies and local storage required for core site functionality, such as keeping items in your cart. These are always active and are not affected by the cookie choice described below.",
      "Analytics: Google Analytics (GA4), used only if you accept cookies via the on-site cookie banner described below, and only once GA4 is actually configured for this site.",
      "Advertising: the Meta (Facebook/Instagram) Pixel, used only if you accept cookies via the on-site cookie banner described below, and only once it is actually configured for this site.",
      "If you reject cookies, or the banner is left unanswered, analytics and advertising cookies are not loaded and no data is sent to Google or Meta from your browser.",
    ],
  },
  {
    id: "managing-cookies",
    heading: "Managing cookies",
    body: [
      "When you first visit this site, a cookie banner lets you Accept or Reject analytics and advertising cookies. No choice is assumed from ordinary browsing — nothing beyond essential cookies loads until you explicitly accept.",
      "You can change your choice at any time using the “Cookie Preferences” link in the site footer.",
      "You can also control or delete cookies through your browser settings. Disabling essential cookies or local storage may affect site functionality such as cart persistence.",
    ],
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
