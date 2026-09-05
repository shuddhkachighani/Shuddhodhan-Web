"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, detailedLines, subtotal, updateQuantity, removeItem } =
    useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart"
        className="absolute inset-0 bg-charcoal/40"
        onClick={closeDrawer}
      />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-warm-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone/60 px-5 py-4">
          <h2 className="font-serif text-lg text-brown-900">Your Cart</h2>
          <button
            aria-label="Close"
            onClick={closeDrawer}
            className="text-2xl leading-none text-brown-700"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {detailedLines.length === 0 ? (
            <p className="py-10 text-center text-sm text-brown-700">Your cart is empty.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {detailedLines.map((line) => (
                <li key={line.variantId} className="flex gap-3 border-b border-stone/40 pb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brown-900">{line.productName}</p>
                    <p className="text-xs text-brown-500">{line.variantSize}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-stone">
                        <button
                          className="px-2 py-0.5 text-brown-700"
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="min-w-[1.25rem] text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          className="px-2 py-0.5 text-brown-700"
                          onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-xs text-brown-500 underline"
                        onClick={() => removeItem(line.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-brown-900">
                    ₹{line.lineTotal.toLocaleString("en-IN")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {detailedLines.length > 0 && (
          <div className="border-t border-stone/60 px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-brown-700">Subtotal</span>
              <span className="font-semibold text-brown-900">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mb-3 text-xs text-brown-500">
              Shipping and any payment charges are calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block rounded-full bg-brown-900 px-4 py-3 text-center text-sm font-semibold text-warm-white hover:bg-oil-dark"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
