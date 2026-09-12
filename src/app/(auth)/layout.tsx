import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ModuBillLogo from "@/components/ui/modubilllogo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Cek Sesi Supabase di Server Side (PRD §2)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika sudah terautentikasi, tendang ke Dashboard/Beranda (PRD §2)
  if (user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 cursor-pointer"
        >
          <ModuBillLogo variant="full" size={36} />
        </Link>
      </div>

      {/* Main Form Container Card (Flat Design Style) */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-2xl sm:px-10">
          {children}
        </div>

        {/* Small Footer Text */}
        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ModuBill. Aplikasi Struk & Invoice Modular.
        </p>
      </div>

    </div>
  );
}