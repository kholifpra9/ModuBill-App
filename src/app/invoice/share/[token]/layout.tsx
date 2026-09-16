import Link from "next/link";
import ModuBillLogo from "@/components/ui/modubilllogo";

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Public Share Header (Flat Design View) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 select-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo ModuBill (Klik untuk kembali ke Landing Page) */}
          <Link
            href="/"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 -ml-1 transition-transform hover:scale-105"
            title="Kembali ke ModuBill"
          >
            {/* Menggunakan varian 'full' di layar sm/desktop dan 'icon' di HP */}
            <div className="hidden sm:block">
              <ModuBillLogo variant="full" size={26} />
            </div>
            <div className="block sm:hidden">
              <ModuBillLogo variant="icon" size={26} />
            </div>
          </Link>

          {/* Badge Indikator Dokumen Publik */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              Pratinjau Struk
            </span>
          </div>
        </div>
      </header>

      {/* Main Content (Shared Invoice / Not Found Page) */}
      <main className="w-full">{children}</main>
    </div>
  );
}