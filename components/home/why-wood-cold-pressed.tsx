const POINTS = [
  {
    title: "No added heat",
    detail:
      "Seeds are crushed at low speed in a wooden churner, so the oil is never exposed to high processing heat.",
  },
  {
    title: "No chemical solvents",
    detail:
      "Unlike refined oil, nothing is extracted using chemical solvents — only mechanical pressure.",
  },
  {
    title: "Slower, traditional pace",
    detail:
      "The wooden Kachi Ghani turns slowly, the way oil has been extracted in Indian households for generations.",
  },
];

export function WhyWoodColdPressed() {
  return (
    <section className="bg-linen py-16 md:py-20">
      <div className="container-page">
        <p className="eyebrow text-mustard">The Difference</p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl text-brown-900 sm:text-4xl">
          Why wood cold pressed?
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {POINTS.map((point, i) => (
            <div key={point.title}>
              <span className="font-serif text-3xl text-mustard">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 font-serif text-lg text-brown-900">{point.title}</p>
              <p className="mt-2 text-sm text-brown-700">{point.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
