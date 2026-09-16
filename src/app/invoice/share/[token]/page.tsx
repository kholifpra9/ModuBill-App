import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { TemplateColumn, DocumentField } from "@/lib/schemas/template";
import ModuBillLogo from "@/components/ui/modubilllogo";
import { Calendar, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Pratinjau Invoice",
};

// Snapshot lengkap — document_title/notes/footer BARU ada di transaksi
// yang dibuat SETELAH transaction-form.tsx diperbaiki (lihat catatan di
// bawah komponen). Transaksi lama tidak akan punya field ini, makanya
// semuanya opsional di sini, bukan wajib.
interface DocumentSnapshot {
  document_title?: string;
  notes?: string;
  footer?: string;
  columns_schema: TemplateColumn[];
  document_fields: DocumentField[];
}

type ItemValue = number | string;

function formatValue(value: ItemValue | null | undefined, dataType: string): string {
  if (value === undefined || value === null || value === "") return "—";
  if (dataType === "text") return String(value);

  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return String(value);

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

function isGrandTotalField(field: DocumentField): boolean {
  const key = field.field_key.toLowerCase();
  const label = field.label.toLowerCase();
  return key.includes("grand") || key.includes("total_bayar") || label.includes("grand total");
}

export default async function SharedInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceRoleClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(row_order, item_values)")
    .eq("share_token", token)
    .is("deleted_at", null)
    .single();

  if (error || !invoice) notFound();

  // Logo & nama bisnis milik PEMILIK invoice (bukan logo ModuBill) —
  // dua konsep ini sengaja terpisah, lihat penjelasan di bawah komponen.
  // Query terpisah (bukan join) karena RLS profiles butuh bypass yang sama
  // seperti invoices, dan join lintas-tabel dengan service-role client
  // lebih mudah dibaca kalau dipisah eksplisit begini.
  const { data: profile } = await supabase
    .from("profiles")
    .select("logo_url, business_name")
    .eq("id", invoice.user_id)
    .single();

  const snapshot = (invoice.document_snapshot ?? {}) as DocumentSnapshot;
  const columnsSchema = snapshot.columns_schema ?? [];
  const documentFields = snapshot.document_fields ?? [];

  const items = (
    (invoice.invoice_items as { row_order: number; item_values: Record<string, ItemValue> }[]) ?? []
  ).sort((a, b) => a.row_order - b.row_order);

  const documentValues = (invoice.document_values ?? {}) as Record<string, ItemValue>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header: logo bisnis (kondisional) + judul dokumen + tanggal */}
          <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {profile?.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element -- URL dari Supabase Storage, domain eksternal
                <img
                  src={profile.logo_url}
                  alt={profile.business_name ?? "Logo bisnis"}
                  className="h-10 w-10 rounded object-cover shrink-0"
                />
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {snapshot.document_title || "Struk Transaksi"}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 font-mono">
                  {invoice.invoice_number ?? `#${invoice.id.slice(0, 8)}`}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5 sm:text-right">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <span>
                {new Date(invoice.transaction_date).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>

          {/* Tabel Baris Item */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/80">
                  {columnsSchema.map((col) => (
                    <th key={col.field_key} className="p-2.5">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    {columnsSchema.map((col) => (
                      <td
                        key={col.field_key}
                        className={`p-2.5 font-medium ${
                          col.data_type === "currency" || col.data_type === "formula_output"
                            ? "font-mono text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        {formatValue(item.item_values[col.field_key], col.data_type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ringkasan Dokumen (Subtotal, Diskon, Grand Total, dst) */}
          {documentFields.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 max-w-sm ml-auto">
              {documentFields.map((d) => {
                const isGrandTotal = isGrandTotalField(d);
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
                    <span className="font-mono">{formatValue(documentValues[d.field_key], d.data_type)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Catatan Dokumen */}
          {snapshot.notes && (
            <div className="pt-4 border-t border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FileText size={13} /> Catatan:
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
                {snapshot.notes}
              </p>
            </div>
          )}

          {/* Footer Dokumen */}
          {snapshot.footer && (
            <div className="pt-2 text-center text-xs sm:text-sm text-slate-500 font-medium italic">
              {snapshot.footer}
            </div>
          )}
        </div>

        {/* Watermark ModuBill — identitas PLATFORM, terpisah dari logo bisnis di header */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Dibuat dengan</span>
          <ModuBillLogo variant="monochrome" size={16} />
        </div>
      </div>
    </div>
  );
}