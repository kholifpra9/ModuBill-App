import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { TemplateColumn, DocumentField } from "@/lib/schemas/template";
import { ArrowLeft, Calendar, FileText, CheckCircle2 } from "lucide-react";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(row_order, item_values)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !invoice) notFound();

  // Membaca dari document_snapshot agar tetap akurat meski template induk berubah (PRD §5)
  const snapshot = invoice.document_snapshot as {
    columns_schema: TemplateColumn[];
    document_fields: DocumentField[];
  };

  const items = (
    invoice.invoice_items as {
      row_order: number;
      item_values: Record<string, any>;
    }[]
  ).sort((a, b) => a.row_order - b.row_order);

  const documentValues = (invoice.document_values ?? {}) as Record<
    string,
    any
  >;

  function formatValue(value: any, dataType: string) {
    if (value === undefined || value === null || value === "") return "—";
    if (dataType === "text") return String(value);

    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return String(value);

    if (dataType === "currency") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(num);
    }
    if (dataType === "percentage") return `${num}%`;
    return num.toLocaleString("id-ID");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/history"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          title="Kembali ke Riwayat"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {invoice.invoice_number ?? `#${invoice.id.slice(0, 8)}`}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
              <CheckCircle2 size={12} />
              Tersimpan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            <span>
              {new Date(invoice.transaction_date).toLocaleString("id-ID", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </span>
          </p>
        </div>
      </div>

      {/* Main Document Preview Card (Flat Read-Only Invoice View) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        {/* Document Header Mock */}
        <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
            <FileText size={16} className="text-blue-600" />
            <span>Rincian Transaksi Dokumen</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            ID: {invoice.id.slice(0, 8)}
          </span>
        </div>

        {/* Table Item Values */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/80">
                {snapshot.columns_schema.map((col) => (
                  <th key={col.field_key} className="p-3">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {snapshot.columns_schema.map((col) => (
                    <td
                      key={col.field_key}
                      className={`p-3 font-medium ${
                        col.data_type === "currency" ||
                        col.data_type === "formula_output"
                          ? "font-mono text-slate-900"
                          : "text-slate-700"
                      }`}
                    >
                      {formatValue(
                        item.item_values[col.field_key],
                        col.data_type
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Document Summary Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 max-w-sm ml-auto">
          {snapshot.document_fields.map((d) => {
            const val = documentValues[d.field_key];
            const isGrandTotal =
              d.field_key.toLowerCase().includes("grand") ||
              d.field_key.toLowerCase().includes("total_bayar") ||
              d.label.toLowerCase().includes("grand total");

            return (
              <div
                key={d.field_key}
                className={`flex items-center justify-between text-xs sm:text-sm ${
                  isGrandTotal
                    ? "pt-2 border-t border-slate-200 font-extrabold text-slate-900 text-sm sm:text-base"
                    : "text-slate-600 font-medium"
                }`}
              >
                <span>{d.label}</span>
                <span className="font-mono">
                  {formatValue(val, d.data_type)}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}