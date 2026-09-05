"use client";

import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/lib/cart/cart-context";

export default function CartPage() {
  const { detailedLines, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-[50vh]">
        <div className="container-page py-10 md:py-14">
          <h1 className="font-serif text-3xl text-brown-900">Your Cart</h1>

          {detailedLines.length === 0 ? (
            <div className="mt-10 rounded-lg border border-dashed border-stone px-6 py-16 text-center">
              <p className="text-brown-700">Your cart is empty.</p>
              <Link
                href="/oils"
                className="mt-4 inline-block rounded-full bg-brown-900 px-6 py-3 text-sm font-semibold text-warm-white"
              >
                Shop Oils
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ul className="divide-y divide-stone/50 border-y border-stone/50">
                  {detailedLines.map((line) => (
                    <li key={line.variantId} className="flex items-center gap-4 py-5">
                      <div className="flex-1">
                        <Link
                          href={`/oils/${line.productSlug}`}
                          className="font-serif text-lg text-brown-900"
                        >
                          {line.productName}
                        </Link>
                        <p className="text-sm text-brown-500">{line.variantSize}</p>
                        <p className="mt-2 text-sm text-brown-700">
                          ₹{line.sellingPrice.toLocaleString("en-IN")} each
                        </p>
                      </div>

                      <div className="flex items-center rounded-full border border-stone">
                        <button
                          className="px-3 py-1.5 text-brown-700"
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          className="px-3 py-1.5 text-brown-700"
                          onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <p className="w-20 text-right font-semibold text-brown-900">
                        ₹{line.lineTotal.toLocaleString("en-IN")}
                      </p>

                      <button
                        aria-label="Remove item"
                        className="text-brown-400 hover:text-brown-700"
                        onClick={() => removeItem(line.variantId)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-fit rounded-lg border border-stone/60 p-6">
                <h2 className="font-serif text-xl text-brown-900">Order Summary</h2>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-brown-700">Subtotal</span>
                  <span className="font-medium text-brown-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-brown-500">
                  Shipping and any payment charges are calculated at checkout,
                  based on your pincode.
                </p>
                <Link
                  href="/checkout"
                  className="mt-6 block rounded-full bg-brown-900 px-4 py-3 text-center text-sm font-semibold text-warm-white hover:bg-oil-dark"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
