import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // never statically cache/prerender this

export async function GET() {
  return NextResponse.json(
    {
      supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseServiceRoleKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      nodeEnv: process.env.NODE_ENV ?? null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
