"use client";

import { useState } from "react";
import Link from "next/link";
import type { FullFaqItem } from "@/lib/data/faq-full";

export function FaqAccordion({ items }: { items: FullFaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mt-4 divide-y divide-stone/60 border-t border-stone/60">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-button-${item.id}`;
        return (
          <div key={item.id}>
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="font-medium text-brown-900">{item.question}</span>
                <span className="shrink-0 text-xl text-brown-500" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            {isOpen && (
              <div id={panelId} role="region" aria-labelledby={buttonId} className="pb-4">
                <p className="text-sm text-brown-700">{item.answer}</p>
                {item.links && item.links.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {item.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-mustard-deep underline underline-offset-2 hover:text-oil-dark"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
