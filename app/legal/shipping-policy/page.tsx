import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "serviceability",
    heading: "Delivery availability",
    body: "Delivery across India is subject to pincode serviceability. Enter your pincode at checkout or on a product page to check whether we currently deliver to your location.",
  },
  {
    id: "indore-delivery",
    heading: "Indore local delivery",
    body: "Local delivery within serviceable Indore pincodes follows a configurable rule set (enabled/disabled, flat rate or free-above-threshold). The exact serviceable pincodes and rate are set by Shuddhodhan and shown at checkout.",
  },
  {
    id: "outside-indore",
    heading: "Delivery outside Indore",
    body: [
      "For destinations outside our configured Indore delivery zone, shipping is calculated dynamically rather than charged at a fixed flat rate nationwide.",
      "The calculation takes into account: destination pincode, origin pincode, cart weight and package dimensions, the courier/service selected, and serviceability at that pincode.",
    ],
  },
  {
    id: "carrier",
    heading: "Carrier and service",
    body: "Once a logistics provider is connected, the carrier and service level shown at checkout, and the delivery estimate, come from that provider in real time. Until then, this website uses a placeholder rate calculation clearly for testing — see the site's technical README for current status.",
  },
  {
    id: "delivery-estimates",
    heading: "Delivery estimates",
    body: "Estimated delivery timelines are shown at checkout based on your pincode. These are estimates, not guarantees, and can be affected by courier delays outside our control.",
  },
  {
    id: "tracking",
    heading: "Order tracking",
    body: "Once your order ships, use the Track Order page with your Order Number to see its current status.",
  },
  {
    id: "exceptions",
    heading: "Delivery exceptions and delays",
    body: "Structure pending: our process for handling delivery exceptions (failed delivery attempts, courier delays, address issues) will be specified here.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout
      title="Shipping Policy"
      intro="How we determine delivery availability, shipping charges and delivery timelines."
      sections={sections}
    />
  );
}
