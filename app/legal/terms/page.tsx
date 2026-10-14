import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions that apply when you browse the Shuddhodhan website or place an order for our wood cold pressed oils.",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    heading: "Introduction",
    body: "These terms govern your use of the Shuddhodhan website and any purchase made through it.",
  },
  {
    id: "eligibility",
    heading: "Eligibility",
    body: "By placing an order on this website, you confirm that you are legally capable of entering into a binding contract under applicable law.",
  },
  {
    id: "products",
    heading: "Products",
    body: "Shuddhodhan sells wood cold pressed (Kachi Ghani) oils as listed on this website.",
  },
  {
    id: "product-information",
    heading: "Product information",
    body: "We aim to keep product names, sizes and descriptions accurate and consistent with the physical product label. Report any discrepancy via Contact Us.",
  },
  {
    id: "prices",
    heading: "Prices",
    body: "All prices are listed in Indian Rupees (INR). We may change prices for products not yet ordered at any time; the price shown to you at checkout for an order you have already placed and paid for will not change.",
  },
  {
    id: "mrp-selling-price",
    heading: "MRP and selling price",
    body: "Every product displays its MRP (Maximum Retail Price) alongside the actual selling price charged at checkout.",
  },
  {
    id: "taxes",
    heading: "Taxes",
    body: "Where an applicable tax (such as GST) applies to your order, it is calculated and shown separately in your order summary at checkout before you pay.",
  },
  {
    id: "shipping",
    heading: "Shipping",
    body: "See the Shipping Policy for how delivery availability and shipping charges are determined. Delivery estimates shown at checkout are estimates, not guarantees.",
  },
  {
    id: "payment",
    heading: "Payment",
    body: "See the Payment Policy for accepted payment methods and verification process.",
  },
  {
    id: "no-cod",
    heading: "No Cash on Delivery",
    body: "Shuddhodhan does not offer Cash on Delivery. All orders are prepaid via secure online payment.",
  },
  {
    id: "order-acceptance",
    heading: "Order acceptance",
    body: "An order is accepted only once your payment has been verified by us — see the Payment Policy. Adding items to your cart or reaching checkout does not, by itself, create a binding order.",
  },
  {
    id: "product-availability",
    heading: "Product availability",
    body: "Products are subject to availability. We will inform you if an item in your order cannot be fulfilled.",
  },
  {
    id: "cancellation",
    heading: "Cancellation",
    body: "You may cancel your order before it has been dispatched. See the Refund, Return & Cancellation Policy for how to request cancellation.",
  },
  {
    id: "refunds",
    heading: "Refunds",
    body: "See the Refund, Return & Cancellation Policy for how and when a refund is processed.",
  },
  {
    id: "returns-replacements",
    heading: "Returns and replacements",
    body: "As these are food and grocery products, change-of-mind returns are not accepted. See the Refund, Return & Cancellation Policy for reporting an eligible issue, such as a damaged, incorrect, missing or quality-affected product.",
  },
  {
    id: "intellectual-property",
    heading: "Intellectual property",
    body: "The Shuddhodhan name, logo, and the content of this website (including its text, images and design) belong to Shuddhodhan (Bharatjyoti) or its licensors, and may not be used without our permission.",
  },
  {
    id: "user-conduct",
    heading: "User conduct",
    body: "When using this website, you agree not to misuse it — for example, by attempting to interfere with its operation, placing a fraudulent order, or accessing it in a way not permitted by these terms.",
  },
  {
    id: "customer-support",
    heading: "Customer support",
    body: "Reach us via the Contact Us page for any order or website-related query.",
  },
  {
    id: "grievance-redressal",
    heading: "Grievance redressal",
    body: "See the Grievance Redressal page for our Grievance Officer's details and the complaint process.",
  },
  {
    id: "governing-law",
    heading: "Governing law",
    body: "These terms are governed by the laws of India. Courts in Indore, Madhya Pradesh shall have jurisdiction over any dispute arising from these terms or your use of this website. Nothing in these terms excludes or limits any consumer right that cannot lawfully be excluded or limited.",
  },
  {
    id: "policy-changes",
    heading: "Changes to these terms",
    body: "These terms may be updated from time to time. The current version is always available at this URL.",
  },
  {
    id: "contact-information",
    heading: "Contact information",
    body: "See Contact Us for how to reach Shuddhodhan support.",
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      intro="The terms that apply when you browse this website or place an order with Shuddhodhan."
      sections={sections}
    />
  );
}
