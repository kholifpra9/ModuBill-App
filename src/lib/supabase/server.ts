import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client untuk dipakai di Server Component / Route Handler / Server Action.
 * RLS (Row Level Security) otomatis berlaku sesuai user yang sedang login,
 * karena session diambil dari cookie request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component tanpa akses set cookie —
            // aman diabaikan selama ada middleware yang refresh session.
          }
        },
      },
    }
  );
}

/**
 * Service-role client — HANYA untuk endpoint publik seperti /invoice/share/[token]
 * yang perlu bypass RLS (baca invoice tanpa user login).
 * JANGAN pernah dipakai di client-side / diekspos ke browser.
 */
export function createServiceRoleClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
