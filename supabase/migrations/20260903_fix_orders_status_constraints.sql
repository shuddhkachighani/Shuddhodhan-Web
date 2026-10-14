-- Fixes orders_payment_status_check and orders_shipping_status_check to
-- match the exact values the application actually writes (see
-- app/api/checkout/create-order/route.ts, app/api/payment/verify/route.ts,
-- app/api/payment/webhook/route.ts, lib/orders/fulfillment.ts).
--
-- The 20260901_create_orders_table.sql migration was authored against a
-- different Supabase project (umydmimbteiyiuohpdio) and was never applied
-- to shuddhodhan-production (cefhxpwqfjpkkidxbxqr). That project's live
-- constraints only allowed a subset of values that didn't include
-- 'payment_failed' or 'shipment_created', causing every successful payment
-- verification's fulfillment step (shipping_status: "shipment_created") and
-- every failed-payment write (payment_status: "payment_failed") to fail
-- with a 23514 check_violation. Applied directly to shuddhodhan-production
-- via the Supabase MCP tool; this file brings source control back in sync.
-- Verified against live production data before applying: 0 of 10 existing
-- rows had a payment_status/shipping_status value outside these new lists.

alter table public.orders
drop constraint if exists orders_payment_status_check;

alter table public.orders
add constraint orders_payment_status_check
check (
  payment_status in (
    'pending',
    'payment_initiated',
    'payment_failed',
    'paid'
  )
);

alter table public.orders
drop constraint if exists orders_shipping_status_check;

alter table public.orders
add constraint orders_shipping_status_check
check (
  shipping_status in (
    'pending',
    'processing',
    'shipment_created'
  )
);
