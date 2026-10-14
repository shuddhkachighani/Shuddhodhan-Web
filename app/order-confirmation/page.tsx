"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/lib/cart/cart-context";
import { trackPurchase } from "@/lib/analytics/events";
import type { Order } from "@/lib/types";

function lookupOrder(orderId: string, mobile: string) {
  return fetch(`/api/orders/${orderId}`, {
    headers: { "X-Order-Mobile": mobile },
  }).then((res) => {
    if (!res.ok) throw new Error("not found");
    return res.json() as Promise<{ order: Order }>;
  });
}

function ConfirmationContent() {
  const orderId = useSearchParams().get("order_id");
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);
  const [needsMobile, setNeedsMobile] = useState(() => {
    if (typeof window === "undefined" || !orderId) return false;
    try {
      return !sessionStorage.getItem(`shd_order_mobile_${orderId}`);
    } catch {
      return true;
    }
  });
  const [mobileInput, setMobileInput] = useState("");

  const runLookup = (mobile: string) => {
    if (!orderId) return;
    const dedupeKey = `shuddhodhan_purchase_tracked_${orderId}`;
    lookupOrder(orderId, mobile)
      .then((data) => {
        setOrder(data.order);
        setNeedsMobile(false);
        setError(false);
        try {
          sessionStorage.removeItem(`shd_order_mobile_${orderId}`);
        } catch {
          // best-effort cleanup only
        }
        if (data.order.payment_status === "paid" && !sessionStorage.getItem(dedupeKey)) {
          trackPurchase(
            orderId,
            data.order.items.map((item) => ({
              id: item.variantId,
              name: `${item.productName} — ${item.variantSize}`,
              price: item.sellingPrice,
              quantity: item.quantity,
            }))
          );
          sessionStorage.setItem(dedupeKey, "1");
          clearCart();
        }
      })
      .catch(() => {
        // Whether this came from the automatic (sessionStorage) attempt or
        // a manual retry, fall through to the "enter your mobile number"
        // form rather than getting stuck on a loading state.
        setError(true);
        setNeedsMobile(true);
        setMobileInput((current) => current || mobile);
      });
  };

  useEffect(() => {
    if (!orderId) return;
    let storedMobile = "";
    try {
      storedMobile = sessionStorage.getItem(`shd_order_mobile_${orderId}`) || "";
    } catch {
      // sessionStorage unavailable — fall through to asking the customer
    }
    if (storedMobile) {
      runLookup(storedMobile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-brown-700">We couldn&apos;t find that order.</p>
        <Link href="/oils" className="mt-4 inline-block text-sm font-semibold underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (needsMobile && !order) {
    return (
      <div className="container-page max-w-md py-16 text-center">
        <h1 className="font-serif text-2xl text-brown-900">Confirm your order</h1>
        <p className="mt-2 text-sm text-brown-700">
          Enter the mobile number used at checkout to view order {orderId}.
        </p>
        <form
          className="mt-6 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            runLookup(mobileInput.trim());
          }}
        >
          <input
            required
            type="tel"
            placeholder="Mobile Number"
            pattern="[6-9][0-9]{9}"
            className="w-full rounded-md border border-stone px-4 py-2.5 text-sm"
            value={mobileInput}
            onChange={(e) => setMobileInput(e.target.value)}
          />
          {error && (
            <p className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              We couldn&apos;t find that order with this mobile number.
            </p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-brown-900 px-6 py-3 text-sm font-semibold text-warm-white"
          >
            View Order
          </button>
        </form>
      </div>
    );
  }

  if (!order) {
    return <div className="container-page py-16 text-center text-brown-500">Loading…</div>;
  }

  return (
    <div className="container-page max-w-xl py-16 text-center">
      {order.payment_status === "paid" ? (
        <>
          <p className="eyebrow text-mustard">Order Confirmed</p>
          <h1 className="mt-3 font-serif text-3xl text-brown-900">Thank you, {order.customer.fullName}!</h1>
          <p className="mt-2 text-brown-700">
            Your order <strong>{order.order_id}</strong> has been placed successfully.
          </p>
        </>
      ) : (
        <>
          <p className="eyebrow text-red-600">Payment Pending</p>
          <h1 className="mt-3 font-serif text-3xl text-brown-900">Order {order.order_id}</h1>
          <p className="mt-2 text-brown-700">
            This order is not yet confirmed. Current status: {order.payment_status}.
          </p>
        </>
      )}

      <div className="mt-8 rounded-lg border border-stone/60 p-6 text-left">
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <li key={item.variantId} className="flex justify-between">
              <span className="text-brown-700">
                {item.productName} ({item.variantSize}) × {item.quantity}
              </span>
              <span className="text-brown-900">₹{item.lineTotal.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-stone/50 pt-3 font-semibold">
          <span className="text-brown-900">Total Paid</span>
          <span className="text-brown-900">₹{order.grand_total.toLocaleString("en-IN")}</span>
        </div>

        {order.tracking_number && (
          <div className="mt-4 border-t border-stone/50 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-brown-700">Carrier</span>
              <span className="text-brown-900">{order.carrier}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-brown-700">Tracking Number</span>
              <span className="text-brown-900">{order.tracking_number}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-brown-700">Shipping Status</span>
              <span className="text-brown-900">{order.shipping_status.replace(/_/g, " ")}</span>
            </div>
          </div>
        )}
      </div>

      <Link
        href="/oils"
        className="mt-8 inline-block rounded-full bg-brown-900 px-6 py-3 text-sm font-semibold text-warm-white"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-[50vh]">
        <Suspense fallback={<div className="container-page py-16 text-center">Loading…</div>}>
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
