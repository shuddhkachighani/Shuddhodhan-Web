"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/lib/cart/cart-context";
import { trackInitiateCheckout } from "@/lib/analytics/events";
import { getStoredAttribution } from "@/lib/analytics/attribution";
import type { OrderCustomer, ShippingQuoteResponse } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const emptyCustomer: OrderCustomer = {
  fullName: "",
  mobile: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
};

export default function CheckoutPage() {
  const { detailedLines, subtotal, weightGrams, lines } = useCart();
  const router = useRouter();

  const [customer, setCustomer] = useState<OrderCustomer>(emptyCustomer);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuoteResponse | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gatewayNotice, setGatewayNotice] = useState<string | null>(null);

  useEffect(() => {
    if (detailedLines.length > 0) {
      trackInitiateCheckout(
        detailedLines.map((l) => ({
          id: l.variantId,
          name: `${l.productName} — ${l.variantSize}`,
          price: l.sellingPrice,
          quantity: l.quantity,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estimatedTotal = useMemo(
    () => subtotal + (shippingQuote?.serviceable ? shippingQuote.shipping_amount : 0),
    [subtotal, shippingQuote]
  );

  const checkPincode = async (pincode: string) => {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setShippingQuote(null);
      return;
    }
    setCheckingPincode(true);
    try {
      const res = await fetch("/api/shipping/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, cartWeightGrams: weightGrams, cartValue: subtotal }),
      });
      const data: ShippingQuoteResponse = await res.json();
      setShippingQuote(data);
    } catch {
      setShippingQuote({
        serviceable: false,
        shipping_amount: 0,
        estimated_delivery: null,
        carrier: null,
        service: null,
        weight_used_grams: weightGrams,
        zone: null,
        reason: "Could not check delivery right now. Please try again.",
      });
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setGatewayNotice(null);

    if (!shippingQuote?.serviceable) {
      setErrorMessage("Please enter a serviceable pincode before proceeding.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customer,
          utm_data: getStoredAttribution(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (!data.gateway_configured) {
        setGatewayNotice(
          `Order reference ${data.order_id} was created, but the online payment gateway isn't connected yet, so this order is NOT confirmed. Once Razorpay credentials are configured, this flow will take you straight to secure payment.`
        );
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setErrorMessage("Could not load the payment gateway. Please try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.razorpay_key_id,
        amount: data.amount_paise,
        currency: "INR",
        name: "Shuddhodhan",
        description: `Order ${data.order_id}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: customer.fullName,
          email: customer.email,
          contact: customer.mobile,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: data.order_id, ...response }),
          });
          if (verifyRes.ok) {
            try {
              sessionStorage.setItem(`shd_order_mobile_${data.order_id}`, customer.mobile);
            } catch {
              // sessionStorage can throw in locked-down browser contexts;
              // order-confirmation falls back to asking for the mobile
              // number itself if it isn't there.
            }
            router.push(`/order-confirmation?order_id=${data.order_id}`);
          } else {
            setErrorMessage("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      razorpay.open();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (detailedLines.length === 0 && !gatewayNotice) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <main className="container-page py-16 text-center">
          <p className="text-brown-700">Your cart is empty.</p>
          <Link
            href="/oils"
            className="mt-4 inline-block rounded-full bg-brown-900 px-6 py-3 text-sm font-semibold text-warm-white"
          >
            Shop Oils
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <div className="container-page grid gap-10 py-10 md:grid-cols-3 md:py-14">
          <form onSubmit={handleSubmit} className="md:col-span-2">
            <h1 className="font-serif text-3xl text-brown-900">Checkout</h1>

            <fieldset className="mt-8">
              <legend className="font-serif text-xl text-brown-900">Delivery details</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="Full Name"
                  className="col-span-2 rounded-md border border-stone px-4 py-2.5 text-sm"
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                />
                <input
                  required
                  type="tel"
                  placeholder="Mobile Number"
                  pattern="[6-9][0-9]{9}"
                  className="rounded-md border border-stone px-4 py-2.5 text-sm"
                  value={customer.mobile}
                  onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="rounded-md border border-stone px-4 py-2.5 text-sm"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
                <input
                  required
                  placeholder="Address"
                  className="col-span-2 rounded-md border border-stone px-4 py-2.5 text-sm"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                />
                <input
                  required
                  placeholder="City"
                  className="rounded-md border border-stone px-4 py-2.5 text-sm"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                />
                <input
                  required
                  placeholder="State"
                  className="rounded-md border border-stone px-4 py-2.5 text-sm"
                  value={customer.state}
                  onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                />
                <input
                  required
                  placeholder="Pincode"
                  pattern="[1-9][0-9]{5}"
                  className="rounded-md border border-stone px-4 py-2.5 text-sm"
                  value={customer.pincode}
                  onChange={(e) => {
                    const pincode = e.target.value.trim();
                    setCustomer({ ...customer, pincode });
                    if (pincode.length === 6) checkPincode(pincode);
                    else setShippingQuote(null);
                  }}
                />
                <input
                  placeholder="Landmark (optional)"
                  className="rounded-md border border-stone px-4 py-2.5 text-sm"
                  value={customer.landmark}
                  onChange={(e) => setCustomer({ ...customer, landmark: e.target.value })}
                />
              </div>

              <div className="mt-3 min-h-[1.5rem] text-sm">
                {checkingPincode && <p className="text-brown-500">Checking delivery…</p>}
                {!checkingPincode && shippingQuote?.serviceable && (
                  <p className="text-green-700">
                    Delivery available · ₹{shippingQuote.shipping_amount} shipping ·{" "}
                    {shippingQuote.estimated_delivery}
                  </p>
                )}
                {!checkingPincode && shippingQuote && !shippingQuote.serviceable && (
                  <p className="text-red-700">{shippingQuote.reason}</p>
                )}
              </div>
            </fieldset>

            {errorMessage && (
              <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
            {gatewayNotice && (
              <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {gatewayNotice}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !shippingQuote?.serviceable}
              className="mt-8 w-full rounded-full bg-brown-900 px-6 py-3.5 text-sm font-semibold text-warm-white disabled:opacity-50 md:w-auto md:px-10"
            >
              {submitting ? "Processing…" : "Proceed to Payment"}
            </button>
            <p className="mt-3 text-xs text-brown-500">
              Secure online payment only. Cash on Delivery is not available.
            </p>
          </form>

          <aside className="h-fit rounded-lg border border-stone/60 p-6">
            <h2 className="font-serif text-xl text-brown-900">Order Summary</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {detailedLines.map((line) => (
                <li key={line.variantId} className="flex justify-between">
                  <span className="text-brown-700">
                    {line.productName} ({line.variantSize}) × {line.quantity}
                  </span>
                  <span className="font-medium text-brown-900">
                    ₹{line.lineTotal.toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-stone/50 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-brown-700">Subtotal</span>
                <span className="text-brown-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-700">Shipping</span>
                <span className="text-brown-900">
                  {shippingQuote?.serviceable
                    ? `₹${shippingQuote.shipping_amount}`
                    : "Enter pincode"}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone/50 pt-2 font-semibold">
                <span className="text-brown-900">Estimated Total</span>
                <span className="text-brown-900">₹{estimatedTotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-xs text-brown-500">
                Any configured payment processing fee is added and shown before
                you pay.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
