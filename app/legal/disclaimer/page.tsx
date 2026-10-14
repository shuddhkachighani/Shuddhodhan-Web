import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Disclaimer",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "product-information",
    heading: "Product information",
    body: "We aim to keep product descriptions, sizes and images accurate and consistent with the physical product label. Always refer to the physical label for definitive product, ingredient and nutritional information.",
  },
  {
    id: "natural-variation",
    heading: "Natural product variation",
    body: "Our oils are natural, wood cold pressed products. Normal batch-to-batch variation in colour, aroma, consistency or a natural sediment can occur and does not by itself indicate a defect.",
  },
  {
    id: "storage-and-use",
    heading: "Storage and use",
    body: "Please follow the storage and usage instructions on the product label to help maintain quality after delivery.",
  },
  {
    id: "no-medical-advice",
    heading: "Not medical advice",
    body: "Information on this website about oils and their traditional use is provided for general informational purposes only and is not medical or dietary advice. This website does not make, and should not be read as making, any medical, therapeutic or health guarantee.",
  },
  {
    id: "third-party-links",
    heading: "Third-party links",
    body: "This website may link to third-party sites (e.g. our social media pages). We are not responsible for the content of external sites.",
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
