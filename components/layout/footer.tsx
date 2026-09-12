import Link from "next/link";
import Image from "next/image";
import { siteSettings } from "@/lib/data/settings";

const SHOP_LINKS = [
  { href: "/oils/groundnut-oil", label: "Groundnut Oil" },
  { href: "/oils/black-mustard-oil", label: "Mustard Oil" },
  { href: "/oils/white-sesame-oil", label: "Sesame Oil" },
  { href: "/oils/sunflower-oil", label: "Sunflower Oil" },
  { href: "/oils/virgin-coconut-oil", label: "Virgin Coconut Oil" },
  { href: "/oils", label: "All Oils" },
];

const DISCOVER_LINKS = [
  { href: "/", label: "Our Story" },
  { href: "/#process", label: "Our Process" },
  { href: "/#reels", label: "See Shuddhodhan in Action" },
  { href: "/#faq", label: "FAQs" },
  { href: "/contact", label: "Contact Us" },
];

const CUSTOMER_CARE_LINKS = [
  { href: "/track-order", label: "Track Order" },
  { href: "/legal/shipping-policy", label: "Shipping & Delivery" },
  { href: "/legal/refund-policy", label: "Refund, Return & Cancellation" },
  { href: "/legal/payment-policy", label: "Payment Policy" },
  { href: "/contact", label: "Contact Us" },
  { href: "/legal/grievance-redressal", label: "Grievance Redressal" },
];

const LEGAL_LINKS = [
  { href: "/legal/privacy-policy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms & Conditions" },
  { href: "/legal/cookie-policy", label: "Cookie / Tracking Notice" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
];

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="eyebrow text-warm-white/60">{title}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-warm-white/80 hover:text-warm-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { contact, social, legal } = siteSettings;

  const connectLinks = [
    contact.whatsappNumber && {
      label: "WhatsApp",
      href: `https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, "")}`,
    },
    social.instagram && { label: "Instagram", href: social.instagram },
    social.facebook && { label: "Facebook", href: social.facebook },
    social.youtube && { label: "YouTube", href: social.youtube },
  ].filter(Boolean) as { label: string; href: string }[];

  const registeredAddress = legal.registeredAddress || siteSettings.location;

  return (
    <footer className="border-t border-stone/60 bg-brown-900 text-warm-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <Image
            src="/brand/logo-mark.png"
            alt="Shuddhodhan"
            width={900}
            height={348}
            className="h-14 w-auto"
          />
          <p className="mt-3 text-sm text-warm-white/70">{siteSettings.brandTagline}</p>
          <p className="mt-4 text-sm text-warm-white/70">
            Wood Cold Pressed Oils from Indore.
          </p>
        </div>

        <FooterLinkGroup title="Shop" links={SHOP_LINKS} />
        <FooterLinkGroup title="Discover" links={DISCOVER_LINKS} />
        <FooterLinkGroup title="Customer Care" links={CUSTOMER_CARE_LINKS} />
        <FooterLinkGroup title="Legal" links={LEGAL_LINKS} />

        {connectLinks.length > 0 && (
          <div>
            <p className="eyebrow text-warm-white/60">Connect</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {connectLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-warm-white/80 hover:text-warm-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-warm-white/10 py-6">
        <div className="container-page flex flex-col gap-1.5 text-xs text-warm-white/50">
          {legal.entityName && <p>{legal.entityName}</p>}
          <p>{registeredAddress}</p>
          {(contact.supportPhone || contact.supportEmail) && (
            <p>
              Customer Care:{" "}
              {[contact.supportPhone, contact.supportEmail].filter(Boolean).join(" · ")}
            </p>
          )}
          {legal.fssaiLicenseNumber && <p>FSSAI Lic. No.: {legal.fssaiLicenseNumber}</p>}
          {legal.gstin && <p>GSTIN: {legal.gstin}</p>}
          <p className="pt-2">
            © {new Date().getFullYear()} {siteSettings.brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
