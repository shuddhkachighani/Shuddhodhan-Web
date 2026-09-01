"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";

const NAV_LINKS = [
  { href: "/oils", label: "Shop Oils" },
  { href: "/#process", label: "Our Process" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-stone/70 bg-warm-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Shuddhodhan home">
          <Image
            src="/brand/logo-mark.png"
            alt="Shuddhodhan"
            width={900}
            height={348}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brown-700 transition-colors hover:text-brown-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-brown-900 hover:bg-linen"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="21" r="1.4" fill="currentColor" />
              <circle cx="17" cy="21" r="1.4" fill="currentColor" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-mustard px-1 text-[10px] font-bold text-warm-white">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brown-900 hover:bg-linen md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-stone/70 bg-warm-white md:hidden">
          <div className="container-page flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-stone/40 py-3 text-sm font-medium text-brown-800 last:border-none"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
