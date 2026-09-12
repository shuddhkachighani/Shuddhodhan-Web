import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Shuddhodhan for order help, product questions, or support.",
};

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone/50 py-4 last:border-none">
      <span className="text-sm text-brown-500">{label}</span>
      {value ? (
        href ? (
          <a href={href} className="text-sm font-medium text-brown-900 underline">
            {value}
          </a>
        ) : (
          <span className="text-sm font-medium text-brown-900">{value}</span>
        )
      ) : (
        <span className="text-sm text-brown-400">Not yet configured</span>
      )}
    </div>
  );
}

export default function ContactPage() {
  const { contact, legal } = siteSettings;
  const whatsappHref = contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        contact.whatsappDefaultMessage
      )}`
    : "";

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-warm-white">
        <section className="border-b border-stone/60 bg-cream py-10 md:py-14">
          <div className="container-page max-w-3xl">
            <p className="eyebrow text-mustard">Support</p>
            <h1 className="mt-2 font-serif text-3xl text-brown-900 sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-3 max-w-xl text-brown-700">
              Order help, product questions, or anything else — reach us
              through any of the channels below.
            </p>
          </div>
        </section>

        <div className="container-page max-w-3xl py-10 md:py-14">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border border-stone/60 p-6">
              <h2 className="font-serif text-xl text-brown-900">Get in touch</h2>
              <div className="mt-2">
                <ContactRow label="Phone" value={contact.supportPhone} href={contact.supportPhone ? `tel:${contact.supportPhone}` : undefined} />
                <ContactRow
                  label="WhatsApp"
                  value={contact.whatsappNumber}
                  href={whatsappHref || undefined}
                />
                <ContactRow
                  label="Email"
                  value={contact.supportEmail}
                  href={contact.supportEmail ? `mailto:${contact.supportEmail}` : undefined}
                />
                <ContactRow label="Business hours" value={siteSettings.businessHours} />
              </div>
            </div>

            <div className="rounded-lg border border-stone/60 p-6">
              <h2 className="font-serif text-xl text-brown-900">Address</h2>
              <p className="mt-2 text-sm text-brown-700">
                {legal.registeredAddress || siteSettings.location || (
                  <span className="text-brown-400">Not yet configured</span>
                )}
              </p>

              <h2 className="mt-6 font-serif text-xl text-brown-900">
                Grievances
              </h2>
              <p className="mt-2 text-sm text-brown-700">
                For a formal complaint, see our{" "}
                <Link href="/legal/grievance-redressal" className="underline">
                  Grievance Redressal
                </Link>{" "}
                page for our Grievance Officer&apos;s contact details.
              </p>

              <h2 className="mt-6 font-serif text-xl text-brown-900">
                Track an order
              </h2>
              <p className="mt-2 text-sm text-brown-700">
                Already placed an order? Visit{" "}
                <Link href="/track-order" className="underline">
                  Track Order
                </Link>{" "}
                with your order number for its latest status.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
