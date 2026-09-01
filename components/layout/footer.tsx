import Link from "next/link";
import Image from "next/image";
import { siteSettings } from "@/lib/data/settings";

const OIL_LINKS = [
  { href: "/oils/groundnut-oil", label: "Groundnut Oil" },
  { href: "/oils/black-mustard-oil", label: "Black Mustard Oil" },
  { href: "/oils/virgin-coconut-oil", label: "Virgin Coconut Oil" },
  { href: "/oils/white-sesame-oil", label: "White Sesame Oil" },
];

const LEGAL_LINKS = [
  { href: "/legal/privacy-policy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms & Conditions" },
  { href: "/legal/shipping-policy", label: "Shipping Policy" },
  { href: "/legal/refund-policy", label: "Refund & Cancellation" },
  { href: "/legal/payment-policy", label: "Payment Policy" },
];

export function Footer() {
  return (
    <footer className="border-t border-stone/60 bg-brown-900 text-warm-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Image
            src="/brand/logo-mark.png"
            alt="Shuddhodhan"
            width={900}
            height={348}
            className="h-14 w-auto"
          />
          <p className="mt-3 text-sm text-warm-white/70">
            {siteSettings.brandTagline}
          </p>
          <p className="mt-4 text-sm text-warm-white/70">{siteSettings.location}</p>
        </div>

        <div>
          <p className="eyebrow text-warm-white/60">Shop</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {OIL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-warm-white/80 hover:text-warm-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/oils" className="text-warm-white/80 hover:text-warm-white">
                View all oils
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-warm-white/60">Company</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href="/#process" className="text-warm-white/80 hover:text-warm-white">
                Our Process
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-warm-white/80 hover:text-warm-white">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-warm-white/60">Legal</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-warm-white/80 hover:text-warm-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-warm-white/10 py-5">
        <p className="container-page text-xs text-warm-white/50">
          © {new Date().getFullYear()} {siteSettings.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
