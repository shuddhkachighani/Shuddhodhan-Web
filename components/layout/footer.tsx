import Link from "next/link";
import Image from "next/image";
import { siteSettings } from "@/lib/data/settings";
import { CookiePreferencesButton } from "@/components/consent/cookie-preferences-button";

const SHOP_LINKS = [
  { href: "/oils/groundnut-oil", label: "Groundnut Oil" },
  { href: "/oils/virgin-coconut-oil", label: "Coconut Oil" },
  { href: "/oils/white-sesame-oil", label: "Sesame Oil" },
  { href: "/oils/black-mustard-oil", label: "Mustard Oil" },
  { href: "/oils/sunflower-oil", label: "Sunflower Oil" },
  { href: "/oils", label: "Shop All Oils" },
];

const SHUDDHODHAN_LINKS = [
  { href: "/#process", label: "Our Process" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact Us" },
];

const CUSTOMER_CARE_LINKS = [
  { href: "/track-order", label: "Track Order" },
  { href: "/legal/shipping-policy", label: "Shipping Policy" },
  { href: "/legal/refund-policy", label: "Refund & Cancellation Policy" },
  { href: "/legal/terms", label: "Terms & Conditions" },
  { href: "/legal/privacy-policy", label: "Privacy Policy" },
];

// Not part of the requested footer sections, but kept reachable from the
// bottom bar rather than dropped outright — Grievance Redressal is a
// regulatory-relevance page (Consumer Protection (E-Commerce) Rules) and
// Cookie Policy is directly referenced by the cookie consent banner.
const MORE_LEGAL_LINKS = [
  { href: "/legal/cookie-policy", label: "Cookie Policy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/grievance-redressal", label: "Grievance Redressal" },
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
  ].filter(Boolean) as { label: string; href: string }[];

  const registeredAddress = legal.registeredAddress || siteSettings.location;

  return (
    <footer className="border-t border-stone/60 bg-brown-900 text-warm-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
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
            Wood Cold Pressed Oils, made in Indore.
          </p>
        </div>

        <FooterLinkGroup title="Shop" links={SHOP_LINKS} />
        <FooterLinkGroup title="Shuddhodhan" links={SHUDDHODHAN_LINKS} />
        <FooterLinkGroup title="Customer Care" links={CUSTOMER_CARE_LINKS} />

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
        <div className="container-page flex flex-col gap-3 text-xs text-warm-white/50">
          <div className="flex flex-col gap-1.5">
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
          </div>

          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {MORE_LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-warm-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <CookiePreferencesButton />
            </li>
          </ul>

          <p className="pt-1">
            © {new Date().getFullYear()} {siteSettings.brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
