import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  Plus,
  Receipt,
  FileSpreadsheet,
  TrendingUp,
  History,
  Calendar,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard", // Otomatis menjadi "Dashboard — ModuBill" di tab browser
};

// Helper Format Currency Rupiah
function formatCurrency(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

  // Query 1: Statistik bulan ini
  const { data: monthInvoices, error: statsError } = await supabase
    .from("invoices")
    .select("grand_total")
    .is("deleted_at", null)
    .gte("transaction_date", startOfMonth);

  // Query 2: 5 transaksi terakhir
  const { data: recentInvoices, error: recentError } = await supabase
    .from("invoices")
    .select("id, invoice_number, transaction_date, grand_total, templates(name)")
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .limit(5);

  if (statsError || recentError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        Gagal memuat data dashboard: {statsError?.message || recentError?.message}
      </div>
    );
  }

  const totalTransaksi = monthInvoices?.length ?? 0;
  const totalOmzet =
    monthInvoices?.reduce(
      (sum, inv) => sum + (Number(inv.grand_total) || 0),
      0
    ) ?? 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ringkasan performa penjualan dan transaksi harian Anda.
          </p>
        </div>

        {/* Quick Actions Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/templates/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet size={15} className="text-slate-500" />
            <span>+ Template Baru</span>
          </Link>

          <Link
            href="/transactions"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            <span>Buat Transaksi</span>
          </Link>
        </div>
      </div>

      {/* Grid Cards Statistik Bulan Ini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Jumlah Transaksi */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Transaksi Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Receipt size={18} />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {totalTransaksi}
            </p>
            <p className="text-[11px] text-slate-400">
              Dokumen tersimpan bulan ini
            </p>
          </div>
        </div>

        {/* Card 2: Omzet Bulan Ini */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Omzet Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalOmzet)}
            </p>
            <p className="text-[11px] text-slate-400">
              Akumulasi total pendapatan
            </p>
          </div>
        </div>
      </div>

      {/* Transaksi Terbaru Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History size={16} className="text-blue-600" />
            <span>Transaksi Terbaru</span>
          </h2>
          <Link
            href="/history"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group cursor-pointer"
          >
            <span>Lihat semua</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          /* Empty State Transaksi */
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
            <p className="text-xs text-slate-500">
              Belum ada transaksi tersimpan sama sekali.
            </p>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Mulai Buat Transaksi</span>
            </Link>
          </div>
        ) : (
          /* List Transaksi Terbaru (Sesuai Prioritas PRD §6.9) */
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
            {recentInvoices.map((inv) => {
              const templateName =
                (inv.templates as unknown as { name: string })?.name ??
                "Template Terhapus";

              return (
                <Link
                  key={inv.id}
                  href={`/history/${inv.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    {/* Element Paling Menonjol (Invoice Number) */}
                    <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {inv.invoice_number ?? `#${inv.id.slice(0, 8)}`}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {/* Tanggal Transaksi */}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(inv.transaction_date).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* Element Terkecil (Nama Template) */}
                      <span className="text-[11px] text-slate-400">
                        • {templateName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Grand Total Format Currency */}
                    {inv.grand_total != null && (
                      <p className="text-sm font-mono font-bold text-slate-900">
                        {formatCurrency(Number(inv.grand_total))}
                      </p>
                    )}
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}