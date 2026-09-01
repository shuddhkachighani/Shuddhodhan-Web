import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/orders/store";

// NOTE: order_id currently doubles as the lookup token (see lib/orders/store).
// Before production, front this with a real database + a dedicated,
// non-guessable access token (or require authentication) rather than relying
// on order_id randomness alone.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
