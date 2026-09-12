import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Refund, Return & Cancellation Policy",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "cancellation-before-dispatch",
    heading: "Cancellation before dispatch",
    body: "Structure pending: the window and process for cancelling an order before it ships will be specified here.",
  },
  {
    id: "cancellation-after-dispatch",
    heading: "Cancellation after dispatch",
    body: "Structure pending: how a cancellation request is handled once an order has already shipped will be specified here.",
  },
  {
    id: "damaged-product",
    heading: "Damaged product",
    body: "If your order arrives damaged, contact us with your order number and photos of the damage so we can arrange a resolution.",
  },
  {
    id: "leaking-product",
    heading: "Leaking product",
    body: "If a bottle arrives leaking, contact us with your order number and photos so we can arrange a resolution.",
  },
  {
    id: "wrong-product",
    heading: "Wrong product received",
    body: "If you receive a different product or variant than what you ordered, contact us with your order number so we can correct it.",
  },
  {
    id: "missing-product",
    heading: "Missing product",
    body: "If an item from your order is missing on delivery, contact us with your order number so we can investigate.",
  },
  {
    id: "quality-complaint",
    heading: "Quality complaint",
    body: "If you have a concern about the quality of a product you received, contact us with your order number and details so we can look into it.",
  },
  {
    id: "spoilage",
    heading: "Spoilage or quality issue",
    body: "Structure pending: our process for handling spoilage or quality issues reported after delivery will be specified here.",
  },
  {
    id: "refund-process",
    heading: "Refund process",
    body: "Structure pending: the refund process and method (e.g. refund to original payment method) will be specified here.",
  },
  {
    id: "replacement-process",
    heading: "Replacement process",
    body: "Structure pending: the process for replacing a defective, damaged or incorrect item will be specified here.",
  },
  {
    id: "evidence-required",
    heading: "Evidence required",
    body: "For damage, leakage, wrong-item or missing-item claims, we will generally ask for your order number and photo evidence to process a resolution quickly.",
  },
  {
    id: "refund-timeline",
    heading: "Refund timeline",
    body: "Structure pending: the expected timeline for processing an approved refund will be specified here once confirmed with our payment gateway.",
  },
  {
    id: "non-returnable",
    heading: "Non-returnable conditions",
    body: [
      "Given the nature of packaged edible and topical oils, unopened and unused products in their original condition may be eligible for return within a defined window (to be specified), while opened or used products are generally not eligible for return for hygiene and safety reasons — except where the product itself is defective, damaged, incorrect or otherwise non-conforming.",
      "This policy does not limit your statutory rights as a consumer for defective, damaged, incorrect or non-conforming products.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund, Return & Cancellation Policy"
      intro="How order cancellations, returns and refunds are handled — including for damaged, leaking, incorrect, missing or defective products."
      sections={sections}
    />
  );
}
