-- Adds nullable columns to persist Shiprocket's own order/shipment
-- identifiers once a real Shiprocket shipment is created for a paid order
-- (see lib/logistics/shiprocket-provider.ts). Needed for any future
-- tracking/label/cancel call against Shiprocket's API, which is keyed on
-- Shiprocket's IDs, not our order_id. No constraint changes — both columns
-- are optional and unrelated to the existing payment/shipping status checks.

alter table public.orders
  add column if not exists shiprocket_order_id text,
  add column if not exists shiprocket_shipment_id text;
