import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Middleware ini menjaga session Supabase tetap fresh di setiap request
// (dibutuhkan karena Server Component tidak bisa menulis cookie sendiri).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Dapatkan data user saat ini (Refresh session)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 2. Daftar rute publik & auth
  const isAuthOrPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/register";

  // 3. LOGIKA PROTEKSI 2 ARAH:
  // Jika pengguna SUDAH LOGIN dan mencoba akses landing page (/) / login / register,
  // tendang langsung ke rute dashboard utama (/templates)
  if (user && isAuthOrPublicRoute) {
    return NextResponse.redirect(new URL("/templates", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};