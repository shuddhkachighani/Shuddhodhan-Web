import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Disclaimer",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "general",
    heading: "General",
    body: "Structure pending final legal wording. This page will set out general disclaimers regarding use of this website and its content.",
  },
  {
    id: "product-information",
    heading: "Product information",
    body: "We aim to keep product descriptions, sizes and images accurate and consistent with the physical product label. Always refer to the physical label for definitive product, ingredient and nutritional information.",
  },
  {
    id: "no-medical-advice",
    heading: "Not medical advice",
    body: "Information on this website about oils and their traditional use is provided for general informational purposes only and is not medical or dietary advice.",
  },
  {
    id: "third-party-links",
    heading: "Third-party links",
    body: "This website may link to third-party sites (e.g. our social media pages). We are not responsible for the content of external sites.",
  },
  {
    id: "limitation-of-liability",
    heading: "Limitation of liability",
    body: "Structure pending final legal wording.",
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      sections={sections}
    />
  );
}
