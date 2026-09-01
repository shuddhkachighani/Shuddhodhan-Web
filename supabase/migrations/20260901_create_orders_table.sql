-- Orders table: source of truth mirrored from the migration applied via the
-- Supabase MCP tool to project umydmimbteiyiuohpdio. Keep this file in sync
-- with any future schema change so the schema lives in source control, not
-- only in the dashboard.

create table if not exists public.orders (
  order_id text primary key,
  customer jsonb not null,
  items jsonb not null,
  subtotal numeric not null,
  shipping_amount numeric not null,
  payment_fee numeric not null default 0,
  taxes numeric not null default 0,
  discounts numeric not null default 0,
  grand_total numeric not null,
  payment_status text not null default 'pending' check (
    payment_status in (
      'pending', 'payment_initiated', 'payment_failed', 'paid',
      'processing', 'shipment_created', 'shipped', 'out_for_delivery',
      'delivered', 'cancelled', 'refunded', 'partially_refunded'
    )
  ),
  shipping_status text not null default 'pending' check (
    shipping_status in (
      'pending', 'payment_initiated', 'payment_failed', 'paid',
      'processing', 'shipment_created', 'shipped', 'out_for_delivery',
      'delivered', 'cancelled', 'refunded', 'partially_refunded'
    )
  ),
  tracking_number text,
  carrier text,
  utm_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- RLS is enabled with NO permissive policies: only a service_role key
-- (server-only, never shipped to the browser) can read/write orders.
-- The app's Next.js API routes are the only intended access path.
alter table public.orders enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();
