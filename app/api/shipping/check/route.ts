import { NextRequest, NextResponse } from "next/server";
import { getVariant, products } from "@/lib/data/products";
import { getShippingQuote } from "@/lib/shipping";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { CartLine } from "@/lib/types";

function isValidLine(line: unknown): line is CartLine {
  return (
    typeof line === "object" &&
    line !== null &&
    typeof (line as CartLine).productId === "string" &&
    typeof (line as CartLine).variantId === "string" &&
    typeof (line as CartLine).quantity === "number" &&
    (line as CartLine).quantity >= 1
  );
}

// Shipping is always calculated server-side (spec section 25) — the browser
// only ever sends a pincode + cart contents, never a shipping amount, weight
// or value. Weight/value are always recomputed here from the server-side
// product catalogue (same pattern as create-order), never trusted from the
// client.
export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "shipping-check", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  let body: { pincode?: string; lines?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const pincode = String(body.pincode || "").trim();
  const lines = body.lines;

  if (!pincode) {
    return NextResponse.json({ error: "Pincode is required." }, { status: 400 });
  }

  if (!Array.isArray(lines) || lines.length === 0 || !lines.every(isValidLine)) {
    return NextResponse.json({ error: "Cart lines are required." }, { status: 400 });
  }

  let cartValue = 0;
  let cartWeightGrams = 0;

  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId && p.active);
    const variant = getVariant(line.productId, line.variantId);
    if (!product || !variant || !variant.inStock) {
      return NextResponse.json(
        { error: `Item ${line.productId}/${line.variantId} is unavailable.` },
        { status: 400 }
      );
    }
    cartValue += variant.sellingPrice * line.quantity;
    cartWeightGrams += variant.weightGrams * line.quantity;
  }

  const quote = await getShippingQuote({ pincode, cartWeightGrams, cartValue, lines });
  return NextResponse.json(quote);
}
