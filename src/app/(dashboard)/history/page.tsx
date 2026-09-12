import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SoftDeleteButton } from "./soft-delete-button";
import { History, Receipt, ChevronRight, Calendar } from "lucide-react";

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, transaction_date, grand_total, templates(name)")
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        Gagal memuat riwayat transaksi: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Riwayat Transaksi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Daftar seluruh dokumen struk dan invoice yang pernah tersimpan.
        </p>
      </div>

      {/* Main Content Area */}
      {invoices.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
            <History size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Belum Ada Transaksi
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transaksi yang Anda catat akan tersimpan dan dapat dilihat kembali di halaman ini.
            </p>
          </div>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            <Receipt size={16} />
            <span>Buat Transaksi Pertama</span>
          </Link>
        </div>
      ) : (
        /* List Item Riwayat */
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
          {invoices.map((inv) => {
            const templateName =
              (inv.templates as unknown as { name: string })?.name ??
              "Template Terhapus";

            return (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors group"
              >
                {/* Information Link (Klik ke Detail) */}
                <Link
                  href={`/history/${inv.id}`}
                  className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center cursor-pointer pr-3"
                >
                  {/* Nomor Invoice & Template */}
                  <div className="sm:col-span-6 space-y-0.5">
                    {/* Element Paling Menonjol (PRD §6.9) */}
                    <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <span>
                        {inv.invoice_number ?? `#${inv.id.slice(0, 8)}`}
                      </span>
                    </p>
                    {/* Element Terkecil (PRD §6.9) */}
                    <p className="text-xs text-slate-400">
                      {templateName}
                    </p>
                  </div>

                  {/* Tanggal Transaksi */}
                  <div className="sm:col-span-3 text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span>
                      {new Date(inv.transaction_date).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="sm:col-span-3 sm:text-right font-mono font-bold text-slate-900 text-sm">
                    {inv.grand_total != null
                      ? formatCurrency(Number(inv.grand_total))
                      : "—"}
                  </div>
                </Link>

                {/* Right Action & Soft Delete */}
                <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
                  <SoftDeleteButton invoiceId={inv.id} />
                  <Link
                    href={`/history/${inv.id}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}