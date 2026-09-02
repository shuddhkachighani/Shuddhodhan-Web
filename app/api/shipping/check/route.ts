import { NextRequest, NextResponse } from "next/server";
import { getShippingQuote } from "@/lib/shipping";
import { enforceRateLimit } from "@/lib/rate-limit";

// Shipping is always calculated server-side (spec section 25) — the browser
// only ever sends a pincode + cart contents, never a shipping amount.
export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "shipping-check", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  let body: { pincode?: string; cartWeightGrams?: number; cartValue?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const pincode = String(body.pincode || "").trim();
  const cartWeightGrams = Number(body.cartWeightGrams) || 0;
  const cartValue = Number(body.cartValue) || 0;

  if (!pincode) {
    return NextResponse.json({ error: "Pincode is required." }, { status: 400 });
  }

  const quote = await getShippingQuote({ pincode, cartWeightGrams, cartValue });
  return NextResponse.json(quote);
}
