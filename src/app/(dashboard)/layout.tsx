import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Cek Autentikasi Server Side via Supabase Client (PRD §2 & Route Protection)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

   // Jika belum login, tendang ke /login (PRD §2)
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Memuat Top Header Mobile, Left Sidebar Desktop, dan Bottom Nav Mobile */}
      <Sidebar />

      {/* Main Content Workspace: 
          - pt-16 (padding-top) di mobile agar tidak tertutup Header Atas
          - pb-20 (padding-bottom) di mobile agar tidak tertutup Bottom Nav
          - md:pt-8 & md:pb-8 di desktop 
      */}
      <main className="flex-1 p-4 pt-16 pb-20 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}