import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { TemplateColumn, DocumentField } from "@/lib/schemas/template";

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

  // PENTING: pakai document_snapshot, BUKAN fetch ulang template.
  // Ini yang bikin invoice lama tetap akurat meski template induknya
  // sudah diedit (kolom ditambah/dihapus) setelah invoice ini dibuat.
  const snapshot = invoice.document_snapshot as {
    columns_schema: TemplateColumn[];
    document_fields: DocumentField[];
  };

  const items = (invoice.invoice_items as { row_order: number; item_values: Record<string, number> }[])
    .sort((a, b) => a.row_order - b.row_order);

  const documentValues = (invoice.document_values ?? {}) as Record<string, number>;

  function formatValue(value: number, dataType: string) {
    if (dataType === "currency") return `Rp ${value.toLocaleString("id-ID")}`;
    if (dataType === "percentage") return `${value}%`;
    return value.toLocaleString("id-ID");
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/history" className="text-sm text-gray-500">&larr; Kembali ke Riwayat</Link>

      <div>
        <h1 className="text-xl font-semibold">{invoice.invoice_number ?? `#${invoice.id.slice(0, 8)}`}</h1>
        <p className="text-sm text-gray-500">{new Date(invoice.transaction_date).toLocaleString("id-ID")}</p>
      </div>

      <table className="w-full text-sm border rounded">
        <thead>
          <tr className="border-b bg-gray-50">
            {snapshot.columns_schema.map((col) => (
              <th key={col.field_key} className="text-left p-2">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b">
              {snapshot.columns_schema.map((col) => (
                <td key={col.field_key} className="p-2">
                  {formatValue(item.item_values[col.field_key] ?? 0, col.data_type)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border rounded p-4 space-y-1 bg-gray-50">
        {snapshot.document_fields.map((d) => (
          <div key={d.field_key} className="flex justify-between text-sm">
            <span>{d.label}</span>
            <span className="font-medium">{formatValue(documentValues[d.field_key] ?? 0, d.data_type)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}