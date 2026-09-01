import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function LegalPageLayout({
  title,
  sections,
}: {
  title: string;
  sections: string[];
}) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="container-page max-w-3xl py-12 md:py-16">
        <h1 className="font-serif text-3xl text-brown-900">{title}</h1>
        <p className="mt-3 rounded-md bg-linen px-4 py-3 text-sm text-brown-700">
          This page is a placeholder pending final legal review. The section
          headings below outline what this policy will cover; the finalized
          text will be supplied and published here before launch.
        </p>
        <div className="mt-8 flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section}>
              <h2 className="font-serif text-lg text-brown-900">{section}</h2>
              <p className="mt-1 text-sm text-brown-500">To be finalized.</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
