"use client";

import { useState } from "react";
import { faqs } from "@/lib/data/faq";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <section id="faq" className="scroll-mt-16 bg-linen py-16 md:py-20">
      <div className="container-page max-w-3xl">
        <p className="eyebrow text-mustard">Questions</p>
        <h2 className="mt-3 font-serif text-3xl text-brown-900 sm:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mt-8 divide-y divide-stone/60 border-t border-stone/60">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-brown-900">{faq.question}</span>
                  <span className="shrink-0 text-xl text-brown-500">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="pb-4 text-sm text-brown-700">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
