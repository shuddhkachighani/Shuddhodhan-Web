"use client";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div className="animate-fade-up">
          <p className="eyebrow text-mustard">Shuddhodhan · Indore</p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-brown-900 sm:text-5xl md:text-6xl">
            Pure by process.
            <br />
            <span className="italic text-oil-dark">Honest by choice.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-brown-700">
            Wood Cold Pressed Oils for the everyday Indian kitchen.
          </p>
          <p className="mt-3 max-w-md text-sm text-brown-500">
            Carefully selected ingredients. Traditional processing.
            Thoughtfully packed for your kitchen.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo("products")}
              className="rounded-full bg-brown-900 px-7 py-3.5 text-sm font-semibold tracking-wide text-warm-white transition-colors hover:bg-oil-dark"
            >
              SHOP OUR OILS
            </button>
            <button
              onClick={() => scrollTo("process")}
              className="rounded-full border border-brown-900 px-7 py-3.5 text-sm font-semibold tracking-wide text-brown-900 transition-colors hover:bg-linen"
            >
              WHY SHUDDHODHAN?
            </button>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-linen md:aspect-square">
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-brown-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-14 w-14 opacity-50">
              <path
                d="M9 2h6l1 4h2a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h2l1-4Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path d="M8 11c0 2.5 1.8 3 4 3s4-.5 4-3" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <p className="eyebrow text-center text-xs opacity-70">
              Hero product photography pending
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
