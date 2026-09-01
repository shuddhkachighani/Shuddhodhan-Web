import { NextRequest, NextResponse } from "next/server";
import { getVariant, products } from "@/lib/data/products";
import { getShippingQuote } from "@/lib/shipping";
import { computePaymentFee } from "@/lib/payment/fees";
import { razorpayProvider } from "@/lib/payment/razorpay-provider";
import { generateOrderId, saveOrder } from "@/lib/orders/store";
import type { CartLine, Order, OrderAttribution, OrderCustomer, OrderItem } from "@/lib/types";
import { isValidIndianPincode } from "@/lib/shipping/types";

interface CreateOrderBody {
  lines: CartLine[];
  customer: OrderCustomer;
  utm_data?: OrderAttribution;
}

// Everything the browser sends is treated as untrusted input: prices,
// weights and totals are always recomputed here from the server-side product
// catalogue and shipping engine (spec section 25) before an order or a
// payment-gateway order is created.
export async function POST(req: NextRequest) {
  let body: CreateOrderBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { lines, customer } = body;
  if (!lines?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!customer?.fullName || !customer?.mobile || !customer?.pincode) {
    return NextResponse.json({ error: "Missing required customer details." }, { status: 400 });
  }
  if (!/^[6-9][0-9]{9}$/.test(customer.mobile.trim())) {
    return NextResponse.json({ error: "Enter a valid Indian mobile number." }, { status: 400 });
  }
  if (!isValidIndianPincode(customer.pincode)) {
    return NextResponse.json({ error: "Enter a valid pincode." }, { status: 400 });
  }

  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  let weightGrams = 0;

  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId && p.active);
    const variant = getVariant(line.productId, line.variantId);
    if (!product || !variant || !variant.inStock || line.quantity < 1) {
      return NextResponse.json(
        { error: `Item ${line.productId}/${line.variantId} is unavailable.` },
        { status: 400 }
      );
    }
    const lineTotal = variant.sellingPrice * line.quantity;
    subtotal += lineTotal;
    weightGrams += variant.weightGrams * line.quantity;
    orderItems.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantSize: variant.size,
      quantity: line.quantity,
      mrp: variant.mrp,
      sellingPrice: variant.sellingPrice,
      lineTotal,
    });
  }

  const shippingQuote = await getShippingQuote({
    pincode: customer.pincode,
    cartWeightGrams: weightGrams,
    cartValue: subtotal,
  });

  if (!shippingQuote.serviceable) {
    return NextResponse.json(
      { error: shippingQuote.reason || "We do not currently deliver to this pincode." },
      { status: 400 }
    );
  }

  const paymentFee = computePaymentFee(subtotal + shippingQuote.shipping_amount);
  const grandTotal = subtotal + shippingQuote.shipping_amount + paymentFee;

  const order: Order = {
    order_id: generateOrderId(),
    customer,
    items: orderItems,
    subtotal,
    shipping_amount: shippingQuote.shipping_amount,
    payment_fee: paymentFee,
    taxes: 0,
    discounts: 0,
    grand_total: grandTotal,
    payment_status: "pending",
    shipping_status: "pending",
    tracking_number: null,
    carrier: shippingQuote.carrier,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    utm_data: body.utm_data || {},
  };

  await saveOrder(order);

  if (razorpayProvider.status === "NOT_CONFIGURED") {
    return NextResponse.json({
      order_id: order.order_id,
      grand_total: grandTotal,
      gateway_configured: false,
      message:
        "Order created, but the online payment gateway is not connected yet. Add NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to go live.",
    });
  }

  const paymentOrder = await razorpayProvider.createOrder({
    amountPaise: Math.round(grandTotal * 100),
    currency: "INR",
    receipt: order.order_id,
    notes: { order_id: order.order_id },
  });

  order.payment_status = "payment_initiated";
  await saveOrder(order);

  return NextResponse.json({
    order_id: order.order_id,
    grand_total: grandTotal,
    gateway_configured: true,
    razorpay_order_id: paymentOrder.providerOrderId,
    razorpay_key_id: paymentOrder.keyId,
    amount_paise: paymentOrder.amountPaise,
  });
}
