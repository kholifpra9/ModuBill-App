import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { TemplateColumn, DocumentField } from "@/lib/schemas/template";
import { ArrowLeft, Calendar, FileText, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { ShareInvoiceButton } from "@/components/ui/share-invoice-button";
import { PrintButton } from "@/components/ui/print-button";
import { PrintableInvoice } from "@/components/ui/printable-invoice";
import { formatTransactionDate } from "@/lib/utils/format-date";

export const metadata: Metadata = {
  title: "Detail Riwayat",
};

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
    document_title?: string;
    notes?: string;
    footer?: string;
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
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Komponen Portal Cetak Invoice */}
      <PrintableInvoice
        invoiceNumber={invoice.invoice_number ?? `#${invoice.id.slice(0, 8)}`}
        transactionDate={invoice.transaction_date}
        documentTitle={snapshot.document_title || "Struk Transaksi"}
        notes={snapshot.notes ?? null}
        footer={snapshot.footer ?? null}
        columns={snapshot.columns_schema}
        documentFields={snapshot.document_fields}
        items={items.map((item) => item.item_values)}
        documentValues={documentValues}
      />

      {/* 1. Header Navigasi Responsif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        
        {/* SISI KIRI: Back Button + Info Invoice */}
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <Link
            href="/history"
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
            title="Kembali ke Riwayat"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Link>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 break-all">
                {invoice.invoice_number ?? `#${invoice.id.slice(0, 8)}`}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full shrink-0">
                <CheckCircle2 size={11} className="sm:w-3 sm:h-3" />
                Tersimpan
              </span>
            </div>

            <p className="text-[11px] sm:text-sm text-slate-500 flex items-center gap-1.5 font-mono">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span>{formatTransactionDate(invoice.transaction_date)}</span>
            </p>
          </div>
        </div>

        {/* SISI KANAN: Tombol Cetak & Bagikan Berdampingan */}
        <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-slate-100 sm:border-0">
          <PrintButton />
          <ShareInvoiceButton
            invoiceId={invoice.id}
            initialShareToken={invoice.share_token}
          />
        </div>
      </div>

      {/* 2. Main Document Preview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-xs">
        
        {/* Document Header Mock */}
        <div className="pb-3 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold truncate">
            <FileText size={15} className="text-blue-600 shrink-0" />
            <span className="truncate">Rincian Transaksi Dokumen</span>
          </div>
          <span className="font-mono text-slate-400 shrink-0 text-[11px]">
            ID: {invoice.id.slice(0, 8)}
          </span>
        </div>

        {/* 3. Tabel Item Transaksi (Aman untuk Layar Sempit) */}
        <div className="-mx-4 sm:mx-0 overflow-x-auto border-y sm:border sm:rounded-xl border-slate-100 sm:border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm min-w-[340px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/80">
                {snapshot.columns_schema.map((col, idx) => (
                  <th 
                    key={col.field_key} 
                    className={`p-2.5 sm:p-3 whitespace-nowrap ${
                      col.data_type === "currency" ||
                      col.data_type === "number" ||
                      col.data_type === "formula_output"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {snapshot.columns_schema.map((col) => {
                    const isNumeric =
                      col.data_type === "currency" ||
                      col.data_type === "number" ||
                      col.data_type === "formula_output";

                    return (
                      <td
                        key={col.field_key}
                        className={`p-2.5 sm:p-3 font-medium whitespace-nowrap ${
                          isNumeric
                            ? "font-mono text-slate-900 text-right"
                            : "text-slate-700 text-left"
                        }`}
                      >
                        {formatValue(
                          item.item_values[col.field_key],
                          col.data_type
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Section Ringkasan Dokumen */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2 w-full sm:max-w-sm ml-auto">
          {snapshot.document_fields.map((d) => {
            const val = documentValues[d.field_key];
            const isGrandTotal =
              d.field_key.toLowerCase().includes("grand") ||
              d.field_key.toLowerCase().includes("total_bayar") ||
              d.label.toLowerCase().includes("grand total");

            return (
              <div
                key={d.field_key}
                className={`flex items-center justify-between text-xs sm:text-sm gap-2 ${
                  isGrandTotal
                    ? "pt-2 border-t border-slate-200 font-extrabold text-slate-900 text-sm sm:text-base"
                    : "text-slate-600 font-medium"
                }`}
              >
                <span className="truncate">{d.label}</span>
                <span className="font-mono shrink-0">
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