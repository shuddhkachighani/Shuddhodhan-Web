import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service_role key, which bypasses Row Level
// Security by design — the `orders` table has RLS enabled with NO policies
// (see the migration in supabase/), so this key is the ONLY way to read or
// write orders. Never import this module from a client component, and never
// prefix SUPABASE_SERVICE_ROLE_KEY with NEXT_PUBLIC_.
let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseServerClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "SUPABASE_NOT_CONFIGURED: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return client;
}
