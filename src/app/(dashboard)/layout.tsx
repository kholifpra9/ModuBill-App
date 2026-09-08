import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r p-4 flex flex-col justify-between">
        <nav className="space-y-2">
          <a href="/templates" className="block">Templates</a>
          <a href="/transactions" className="block">Transaksi</a>
          <a href="/history" className="block">Riwayat</a>
          <a href="/settings" className="block">Pengaturan</a>
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}