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
  Calculator,
  Layers,
  CheckCircle2,
  Sparkles,
  Zap,
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

  // Query 1: Statistik bulan ini (Grand Total)
  const { data: monthInvoices, error: statsError } = await supabase
    .from("invoices")
    .select("grand_total")
    .is("deleted_at", null)
    .gte("transaction_date", startOfMonth);

  // Query 2: 6 transaksi terakhir (agar list terlihat penuh dan pas)
  const { data: recentInvoices, error: recentError } = await supabase
    .from("invoices")
    .select("id, invoice_number, transaction_date, grand_total, templates(name)")
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .limit(6);

  // Query 3: Jumlah Template aktif
  const { count: templatesCount } = await supabase
    .from("templates")
    .select("id", { count: "exact", head: true });

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

  // Hitung Rata-rata per transaksi
  const avgTransaksi = totalTransaksi > 0 ? totalOmzet / totalTransaksi : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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

      {/* Grid 4 Cards Statistik Lengkap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Omzet Bulan Ini */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Omzet Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalOmzet)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Akumulasi pendapatan
            </p>
          </div>
        </div>

        {/* Card 2: Jumlah Transaksi */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Transaksi
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {totalTransaksi}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Struk tersimpan bulan ini
            </p>
          </div>
        </div>

        {/* Card 3: Rata-Rata Transaksi */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rata-Rata Bill
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Calculator size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrency(avgTransaksi)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Nilai per transaksi
            </p>
          </div>
        </div>

        {/* Card 4: Jumlah Template Active */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Template Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {templatesCount ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Format siap digunakan
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Kolom Layout (Recent Invoices + Side Quick Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
        
        {/* Kolom Kiri: Transaksi Terbaru (8 Kolom) */}
        <div className="lg:col-span-8 space-y-3">
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
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
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
                    className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors group cursor-pointer"
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
                          {new Date(inv.transaction_date).toLocaleString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                      <ChevronRight
                        size={16}
                        className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Quick Information & Panduan ModuBill (4 Kolom) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Actions Card */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={15} className="text-amber-500" />
              <span>Akses Cepat</span>
            </h3>

            <div className="space-y-2">
              <Link
                href="/transactions"
                className="flex items-center justify-between p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 rounded-xl text-xs font-semibold text-blue-900 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-blue-600" />
                  <span>Input Struk Baru</span>
                </div>
                <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/templates"
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-slate-500" />
                  <span>Kelola Template Dokumen</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Tips Panduan Cepat ModuBill */}
          <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3 select-none">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span>Alur Penggunaan ModuBill</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Atur nama & rumus kolom sesuai kebutuhan usahamu.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Pilih template & masukkan transaksi barang.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Pantau omzet & cetak struk kapan saja dari Riwayat.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}