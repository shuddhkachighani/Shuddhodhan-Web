import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export interface LegalSection {
  id: string;
  heading: string;
  /** Factual/structural copy only — no legal claims. One or more paragraphs. */
  body: string | string[];
}

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function LegalPageLayout({
  title,
  intro,
  sections,
}: {
  title: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-warm-white">
        <section className="border-b border-stone/60 bg-cream py-10 md:py-14">
          <div className="container-page max-w-4xl">
            <p className="eyebrow text-mustard">Policy</p>
            <h1 className="mt-2 font-serif text-3xl text-brown-900 sm:text-4xl">
              {title}
            </h1>
            {intro && <p className="mt-3 max-w-2xl text-brown-700">{intro}</p>}
            <p className="mt-4 max-w-2xl rounded-md border border-mustard/40 bg-warm-white px-4 py-3 text-sm text-brown-700">
              This page is a working draft pending final legal review. Section
              headings and structure are in place; the finalized policy text
              will be supplied by Shuddhodhan and reviewed by a qualified
              legal professional before launch.
            </p>
          </div>
        </section>

        <div className="container-page max-w-4xl py-10 md:py-14">
          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <nav
              aria-label="Table of contents"
              className="no-scrollbar sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] overflow-y-auto md:block"
            >
              <p className="eyebrow text-brown-500">On this page</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-brown-700 hover:text-mustard hover:underline"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile TOC */}
            <nav aria-label="Table of contents" className="no-scrollbar flex gap-2 overflow-x-auto pb-2 md:hidden">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="shrink-0 rounded-full border border-stone px-3 py-1.5 text-xs font-medium text-brown-700"
                >
                  {s.heading}
                </a>
              ))}
            </nav>

            <div className="flex flex-col divide-y divide-stone/50">
              {sections.map((s) => {
                const paragraphs = Array.isArray(s.body) ? s.body : [s.body];
                return (
                  <div key={s.id} id={s.id} className="scroll-mt-24 py-6 first:pt-0">
                    <h2 className="font-serif text-xl text-brown-900">{s.heading}</h2>
                    {paragraphs.map((p, i) => (
                      <p key={i} className="mt-2 text-sm text-brown-700">
                        {p}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 rounded-lg border border-stone/60 bg-cream p-6 text-center">
            <p className="font-serif text-lg text-brown-900">
              Questions about this policy?
            </p>
            <p className="mt-1 text-sm text-brown-700">
              Reach our support team and we&apos;ll help directly.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-brown-900 px-6 py-2.5 text-sm font-semibold text-warm-white hover:bg-oil-dark"
              >
                Contact Us
              </Link>
              <Link
                href="/legal/grievance-redressal"
                className="rounded-full border border-brown-900 px-6 py-2.5 text-sm font-semibold text-brown-900 hover:bg-linen"
              >
                Grievance Redressal
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export { slugify };
