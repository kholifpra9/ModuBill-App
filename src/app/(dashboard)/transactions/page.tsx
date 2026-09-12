import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Receipt,
  Plus,
  Check,
  Printer,
  FileText,
  ArrowRight,
} from "lucide-react";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, document_title, orientation, is_default")
    .order("is_default", { ascending: false });

  // Empty State jika belum ada template sama sekali (PRD §6.2 & §6.7)
  if (!templates || templates.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto">
          <Receipt size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Belum Ada Template Transaksi
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Anda perlu membuat setidaknya satu template struk/invoice terlebih dahulu sebelum dapat mencatat transaksi.
          </p>
        </div>
        <Link
          href="/templates/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>Buat Template Sekarang</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Buat Transaksi Baru
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Pilih template dokumen yang ingin digunakan untuk mencatat transaksi ini.
        </p>
      </div>

      {/* Grid Interactive Cards Template Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((t) => {
          const isThermal =
            t.orientation?.toLowerCase().includes("thermal") ||
            t.orientation?.toLowerCase().includes("58") ||
            t.orientation?.toLowerCase().includes("80");

          return (
            <Link
              key={t.id}
              href={`/transactions/new/${t.id}`}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group select-none ${
                t.is_default
                  ? "bg-blue-50/40 border-blue-300 hover:border-blue-500 hover:bg-blue-50/80 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {t.name}
                  </h2>

                  {t.is_default && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 bg-blue-100 border border-blue-200 rounded-full shrink-0">
                      <Check size={12} />
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  Judul Dokumen:{" "}
                  <span className="font-medium text-slate-700">
                    "{t.document_title}"
                  </span>
                </p>
              </div>

              {/* Action Footer Indicator */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  {isThermal ? <Printer size={14} /> : <FileText size={14} />}
                  <span>{t.orientation || "Standard"}</span>
                </span>

                <span className="font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Gunakan Template</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}