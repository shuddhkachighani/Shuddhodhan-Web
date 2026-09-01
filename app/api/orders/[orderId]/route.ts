import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/orders/store";

// NOTE: order_id currently doubles as this endpoint's lookup token. Direct
// access to the `orders` table is blocked by RLS (no policies — only the
// server-side service_role key used in lib/orders/store.ts can bypass it),
// but this route itself has no auth check. Before production, add a
// dedicated, non-guessable access token (or require authentication) rather
// than relying on order_id randomness alone.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
