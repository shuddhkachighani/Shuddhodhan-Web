import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Refund, Return & Cancellation Policy",
  description:
    "Shuddhodhan's policy on order cancellations, returns and refunds, including for damaged, leaking, incorrect or missing products.",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "scope",
    heading: "What this policy covers",
    body: "This policy covers cancellations, returns and refunds for orders that were successfully placed and paid for. If a payment failed or was not completed, no order was placed on our side — see the Payment Policy for what happens to a failed or reversed payment.",
  },
  {
    id: "cancellation-before-dispatch",
    heading: "Cancellation before dispatch",
    body: "You may cancel your order at any time before it has been dispatched. Contact us as soon as possible with your order number to request cancellation.",
  },
  {
    id: "cancellation-after-dispatch",
    heading: "Cancellation after dispatch",
    body: "Once your order has been dispatched, it can no longer be cancelled through this process. If there is an eligible issue with the order after it arrives — such as a damaged, incorrect, missing or quality-affected product — see “Reporting an eligible issue” below.",
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
    body: "If you notice a spoilage or quality issue with a product, report it within 48 hours of delivery as described in “Reporting an eligible issue” above.",
  },
  {
    id: "refund-process",
    heading: "Refund process",
    body: "When a refund is due under this policy, it is issued to your original payment method — never as cash or store credit, consistent with online-payment-only checkout.",
  },
  {
    id: "issue-reporting-window",
    heading: "Reporting an eligible issue",
    body: [
      "Eligible issues — such as a damaged, leaking, incorrect, missing or quality-affected product — must be reported within 48 hours of delivery.",
      "To help us verify and resolve your report, we may ask for your order number and photos of the product and its packaging. Reporting an issue does not automatically mean it qualifies for a refund or replacement — each report is reviewed against this policy.",
    ],
  },
  {
    id: "refund-timeline",
    heading: "Refund timeline",
    body: "Once a refund is approved under this policy, the refund will be initiated within 15 days. Not every order or report is automatically eligible for a refund — eligibility is assessed against this policy first. We do not control how long your bank or payment provider then takes to reflect an initiated refund in your account.",
  },
  {
    id: "non-returnable",
    heading: "Returns for change of mind",
    body: [
      "As these are food and grocery products, change-of-mind returns — for example, if you no longer want an item, ordered the wrong thing by mistake, or simply changed your preference — are not accepted, whether or not the product has been opened. There is no general return window for these products.",
      "This is separate from reporting an eligible issue: a damaged, incorrect, missing or quality-affected product should be reported within 48 hours of delivery under “Reporting an eligible issue” above, and this policy does not limit your statutory rights as a consumer for a defective, damaged, incorrect or otherwise non-conforming product.",
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
