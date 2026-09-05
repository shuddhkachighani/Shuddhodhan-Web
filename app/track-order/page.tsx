"use client";

import { useState } from "react";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Order } from "@/lib/types";

const STAGES: { key: string; label: string }[] = [
  { key: "paid", label: "Order Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipment_created", label: "Shipment Created" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function currentStageIndex(order: Order): number {
  if (order.payment_status !== "paid") return -1;
  const shippingIndex = STAGES.findIndex((s) => s.key === order.shipping_status);
  return shippingIndex >= 0 ? shippingIndex : 0; // paid but shipping_status not yet advanced = "Order Confirmed"
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !mobile.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId.trim())}`, {
        headers: { "X-Order-Mobile": mobile.trim() },
      });
      if (!res.ok) {
        setError(
          "We couldn't find an order with that number and mobile number. Double-check them and try again."
        );
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stageIndex = order ? currentStageIndex(order) : -1;
  const isTerminalNegative =
    order && ["cancelled", "refunded", "partially_refunded", "payment_failed"].includes(order.payment_status);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-warm-white">
        <section className="border-b border-stone/60 bg-cream py-10 md:py-14">
          <div className="container-page max-w-2xl">
            <p className="eyebrow text-mustard">Support</p>
            <h1 className="mt-2 font-serif text-3xl text-brown-900 sm:text-4xl">
              Track Order
            </h1>
            <p className="mt-3 text-brown-700">
              Enter your order number to see its current status.
            </p>
          </div>
        </section>

        <div className="container-page max-w-2xl py-10 md:py-14">
          <form onSubmit={handleSubmit} className="rounded-lg border border-stone/60 p-6">
            <label className="text-sm font-medium text-brown-900">Order Number</label>
            <input
              required
              placeholder="e.g. SHD-20260901-AB12CD"
              className="mt-1.5 w-full rounded-md border border-stone px-4 py-2.5 text-sm"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />

            <label className="mt-4 block text-sm font-medium text-brown-900">
              Mobile Number
            </label>
            <input
              required
              type="tel"
              placeholder="The mobile number used at checkout"
              pattern="[6-9][0-9]{9}"
              className="mt-1.5 w-full rounded-md border border-stone px-4 py-2.5 text-sm"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-brown-500">
              For your privacy, we verify both your Order Number and the
              mobile number used at checkout before showing order details.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-brown-900 px-6 py-3 text-sm font-semibold text-warm-white disabled:opacity-50"
            >
              {loading ? "Searching…" : "Track Order"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {order && (
            <div className="mt-8 rounded-lg border border-stone/60 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl text-brown-900">
                  Order {order.order_id}
                </h2>
                <span className="text-sm text-brown-500">
                  ₹{order.grand_total.toLocaleString("en-IN")}
                </span>
              </div>

              {isTerminalNegative ? (
                <p className="mt-4 text-sm text-brown-700">
                  Current status: <strong>{order.payment_status.replace(/_/g, " ")}</strong>
                </p>
              ) : stageIndex < 0 ? (
                <p className="mt-4 text-sm text-brown-700">
                  This order&apos;s payment is not yet confirmed. Current status:{" "}
                  <strong>{order.payment_status.replace(/_/g, " ")}</strong>
                </p>
              ) : (
                <ol className="mt-6 flex flex-col gap-4">
                  {STAGES.map((stage, i) => (
                    <li key={stage.key} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                          i <= stageIndex
                            ? "bg-mustard text-warm-white"
                            : "bg-linen text-brown-400"
                        }`}
                      >
                        {i <= stageIndex ? "✓" : ""}
                      </span>
                      <span
                        className={
                          i <= stageIndex ? "text-sm font-medium text-brown-900" : "text-sm text-brown-400"
                        }
                      >
                        {stage.label}
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              {order.tracking_number ? (
                <div className="mt-6 border-t border-stone/50 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brown-700">Carrier</span>
                    <span className="text-brown-900">{order.carrier}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-brown-700">Tracking Number</span>
                    <span className="text-brown-900">{order.tracking_number}</span>
                  </div>
                  <p className="mt-3 text-xs text-brown-500">
                    Shipment tracking is currently powered by a placeholder
                    logistics integration for testing (MOCK) — live
                    carrier tracking will appear here once a real logistics
                    provider is connected.
                  </p>
                </div>
              ) : (
                stageIndex >= 0 && (
                  <p className="mt-6 border-t border-stone/50 pt-4 text-xs text-brown-500">
                    A tracking number will appear here once your shipment is
                    created.
                  </p>
                )
              )}
            </div>
          )}

          {searched && !order && !loading && !error && (
            <p className="mt-4 text-sm text-brown-500">No order found.</p>
          )}

          <p className="mt-8 text-center text-sm text-brown-500">
            Can&apos;t find your order?{" "}
            <Link href="/contact" className="underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
