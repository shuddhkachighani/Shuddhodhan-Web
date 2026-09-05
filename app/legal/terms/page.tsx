import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    heading: "Introduction",
    body: "These terms govern your use of the Shuddhodhan website and any purchase made through it. Structure pending final legal wording.",
  },
  {
    id: "eligibility",
    heading: "Eligibility",
    body: "Structure pending: who may place an order on this website (e.g. age and contractual capacity requirements) will be specified here.",
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
    body: "Structure pending: general pricing terms will be described here.",
  },
  {
    id: "mrp-selling-price",
    heading: "MRP and selling price",
    body: "Every product displays its MRP (Maximum Retail Price) alongside the actual selling price charged at checkout.",
  },
  {
    id: "taxes",
    heading: "Taxes",
    body: "Structure pending: applicable taxes, if any beyond what is included in the displayed price, will be specified here.",
  },
  {
    id: "shipping",
    heading: "Shipping",
    body: "See the Shipping Policy for how delivery availability and shipping charges are determined.",
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
    body: "Structure pending: the point at which an order is considered accepted (e.g. upon successful payment verification) will be specified here.",
  },
  {
    id: "product-availability",
    heading: "Product availability",
    body: "Products are subject to availability. We will inform you if an item in your order cannot be fulfilled.",
  },
  {
    id: "cancellation",
    heading: "Cancellation",
    body: "See the Refund, Return & Cancellation Policy.",
  },
  {
    id: "refunds",
    heading: "Refunds",
    body: "See the Refund, Return & Cancellation Policy.",
  },
  {
    id: "returns-replacements",
    heading: "Returns and replacements",
    body: "See the Refund, Return & Cancellation Policy.",
  },
  {
    id: "intellectual-property",
    heading: "Intellectual property",
    body: "Structure pending: ownership of the Shuddhodhan name, logo and website content will be specified here.",
  },
  {
    id: "user-conduct",
    heading: "User conduct",
    body: "Structure pending: expected conduct when using this website will be specified here.",
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
    id: "limitation-of-liability",
    heading: "Limitation of liability",
    body: "Structure pending final legal wording.",
  },
  {
    id: "governing-law",
    heading: "Governing law",
    body: "Structure pending: the governing jurisdiction will be specified here.",
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
