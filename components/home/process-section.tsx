const STEPS = [
  { step: "Sourcing", detail: "Seeds are sourced and inspected before pressing." },
  { step: "Wood Pressing", detail: "Slow mechanical extraction in a wooden Kachi Ghani, without added heat." },
  { step: "Filtering", detail: "The pressed oil is filtered to remove sediment." },
  { step: "Bottling", detail: "Filtered oil is packed for your kitchen in Indore." },
];

export function ProcessSection() {
  return (
    <section id="process" className="scroll-mt-16 bg-warm-white py-16 md:py-20">
      <div className="container-page">
        <p className="eyebrow text-mustard">Our Process</p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl text-brown-900 sm:text-4xl">
          From seed to bottle, the traditional way
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, i) => (
            <div key={item.step} className="overflow-hidden rounded-lg border border-stone/60">
              <div className="flex aspect-[4/3] items-center justify-center bg-linen">
                <span className="font-serif text-2xl text-brown-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-4">
                <p className="font-serif text-base text-brown-900">{item.step}</p>
                <p className="mt-1.5 text-sm text-brown-700">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-brown-500">
          Manufacturing photography from our Indore facility will be added here soon.
        </p>
      </div>
    </section>
  );
}
