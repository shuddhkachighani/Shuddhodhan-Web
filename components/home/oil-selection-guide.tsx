import Link from "next/link";

const GUIDE = [
  {
    title: "Everyday cooking",
    detail: "A neutral, all-purpose oil for daily meals.",
    href: "/oils/groundnut-oil",
    cta: "Groundnut Oil",
  },
  {
    title: "Traditional tempering",
    detail: "The sharp, pungent flavour classic to North & East Indian cooking.",
    href: "/oils/black-mustard-oil",
    cta: "Mustard Oil",
  },
  {
    title: "Deep, nutty flavour",
    detail: "Rich sesame oil for South Indian and festive cooking.",
    href: "/oils/white-sesame-oil",
    cta: "Sesame Oil",
  },
  {
    title: "Hair, skin & wellness",
    detail: "Coconut and almond oil, cold pressed for topical use.",
    href: "/oils/virgin-coconut-oil",
    cta: "Coconut Oil",
  },
];

export function OilSelectionGuide() {
  return (
    <section className="bg-warm-white py-16 md:py-20">
      <div className="container-page">
        <p className="eyebrow text-mustard">Not sure where to start?</p>
        <h2 className="mt-3 max-w-lg font-serif text-3xl text-brown-900 sm:text-4xl">
          Find the right oil for your kitchen
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDE.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-lg border border-stone/60 p-5 transition-colors hover:border-brown-500"
            >
              <p className="font-serif text-lg text-brown-900">{item.title}</p>
              <p className="mt-2 text-sm text-brown-700">{item.detail}</p>
              <p className="mt-4 text-sm font-semibold text-mustard group-hover:underline">
                Shop {item.cta} →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
