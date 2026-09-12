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
      {/* 2. Komponen Sidebar (Memuat Responsive Collapsible Sidebar + Mobile Bottom Nav) */}
      <Sidebar />

      {/* 3. Area Konten Utama Workspace (Padding bawah pb-20 disiapkan agar tidak tertutup Bottom Nav di Mobile) */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}