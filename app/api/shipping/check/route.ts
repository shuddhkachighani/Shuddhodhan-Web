import { NextRequest, NextResponse } from "next/server";
import { getShippingQuote } from "@/lib/shipping";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { CartLine } from "@/lib/types";

// Shipping is always calculated server-side (spec section 25) — the browser
// only ever sends a pincode + cart contents, never a shipping amount.
export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "shipping-check", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  let body: { pincode?: string; cartWeightGrams?: number; cartValue?: number; lines?: CartLine[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const pincode = String(body.pincode || "").trim();
  const cartWeightGrams = Number(body.cartWeightGrams) || 0;
  const cartValue = Number(body.cartValue) || 0;
  const lines = body.lines;

  if (!pincode) {
    return NextResponse.json({ error: "Pincode is required." }, { status: 400 });
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Cart lines are required." }, { status: 400 });
  }

  const quote = await getShippingQuote({ pincode, cartWeightGrams, cartValue, lines });
  return NextResponse.json(quote);
}
