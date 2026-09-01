import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      sections={[
        "What information we collect",
        "How we use your information",
        "Payment and order data",
        "Cookies and tracking (Meta Pixel, GA4)",
        "Third-party sharing (payment gateway, logistics partners)",
        "Data retention",
        "Your rights",
        "Contact us",
      ]}
    />
  );
}
