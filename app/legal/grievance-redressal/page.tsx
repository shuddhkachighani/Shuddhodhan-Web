import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Grievance Redressal",
  robots: { index: false },
};

function OfficerField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-brown-500">{label}</dt>
      <dd className="mt-0.5 text-brown-900">
        {value || <span className="text-brown-400">Not yet configured</span>}
      </dd>
    </div>
  );
}

export default function GrievanceRedressalPage() {
  const officer = siteSettings.grievanceOfficer;
  const officerConfigured = Boolean(officer.name);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-warm-white">
        <section className="border-b border-stone/60 bg-cream py-10 md:py-14">
          <div className="container-page max-w-3xl">
            <p className="eyebrow text-mustard">Policy</p>
            <h1 className="mt-2 font-serif text-3xl text-brown-900 sm:text-4xl">
              Grievance Redressal
            </h1>
            <p className="mt-3 max-w-2xl text-brown-700">
              How to raise a complaint with Shuddhodhan, and how it will be
              handled — as required under the Consumer Protection
              (E-Commerce) Rules, 2020.
            </p>
          </div>
        </section>

        <div className="container-page max-w-3xl py-10 md:py-14">
          <div className="rounded-lg border border-stone/60 p-6">
            <h2 className="font-serif text-xl text-brown-900">Grievance Officer</h2>
            {!officerConfigured && (
              <p className="mt-2 text-sm text-brown-500">
                A Grievance Officer has not yet been named in this site&apos;s
                configuration. Details will appear here once supplied by
                Shuddhodhan.
              </p>
            )}
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <OfficerField label="Name" value={officer.name} />
              <OfficerField label="Designation" value={officer.designation} />
              <OfficerField label="Email" value={officer.email} />
              <OfficerField label="Phone" value={officer.phone} />
              <div className="sm:col-span-2">
                <OfficerField label="Address" value={officer.address} />
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-xl text-brown-900">
                How to raise a complaint
              </h2>
              <p className="mt-2 text-sm text-brown-700">
                Contact us via the{" "}
                <Link href="/contact" className="underline">
                  Contact Us
                </Link>{" "}
                page, or write directly to the Grievance Officer above.
                Please always include your order number (shown on your order
                confirmation and on the{" "}
                <Link href="/track-order" className="underline">
                  Track Order
                </Link>{" "}
                page) so we can locate your order quickly.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-brown-900">
                How complaints are acknowledged
              </h2>
              <p className="mt-2 text-sm text-brown-700">
                Structure pending: our acknowledgement timeline and process
                will be specified here once finalized.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-brown-900">
                Expected resolution process
              </h2>
              <p className="mt-2 text-sm text-brown-700">
                Structure pending: our resolution process and expected
                timeline will be specified here once finalized.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-brown-900">
                Referencing your order
              </h2>
              <p className="mt-2 text-sm text-brown-700">
                Every order has a unique order number. Quoting it in any
                complaint or query lets us look up your order details
                immediately without extra back-and-forth.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-brown-900">
                Complaint tracking
              </h2>
              <p className="mt-2 text-sm text-brown-700">
                This site&apos;s order system is built to support a dedicated
                complaint/ticket ID for tracking a grievance end-to-end. That
                capability is planned and not yet active — for now, your
                order number is the reference we use.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
