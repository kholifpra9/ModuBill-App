"use client";

import { createPortal } from "react-dom";
import type { TemplateColumn, DocumentField } from "@/lib/schemas/template";

type ItemValue = number | string;

function formatValue(value: ItemValue | undefined, dataType: string): string {
  if (value === undefined || value === "") return "—";
  if (dataType === "text") return String(value);
  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  if (dataType === "currency") {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  }
  if (dataType === "percentage") return `${num}%`;
  return num.toLocaleString("id-ID");
}

export function PrintableInvoice({
  invoiceNumber,
  transactionDate,
  documentTitle,
  notes,
  footer,
  columns,
  documentFields,
  items,
  documentValues,
}: {
  invoiceNumber: string;
  transactionDate: string;
  documentTitle: string;
  notes: string | null;
  footer: string | null;
  columns: TemplateColumn[];
  documentFields: DocumentField[];
  items: Record<string, ItemValue>[];
  documentValues: Record<string, number>;
}) {
  return createPortal(
    <div className="hidden print:block p-6 text-black text-sm">
      <div className="text-center mb-4">
        <h1 className="font-bold text-lg">{documentTitle}</h1>
        <p className="text-xs">{invoiceNumber}</p>
        <p className="text-xs">{new Date(transactionDate).toLocaleString("id-ID")}</p>
      </div>

      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="border-b border-black">
            {columns.map((col) => (
              <th key={col.field_key} className="text-left py-1">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.field_key} className="py-1">
                  {formatValue(item[col.field_key], col.data_type)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black pt-2 space-y-1">
        {documentFields.map((d) => (
          <div key={d.field_key} className="flex justify-between text-xs">
            <span>{d.label}</span>
            <span>{formatValue(documentValues[d.field_key], d.data_type)}</span>
          </div>
        ))}
      </div>

      {notes && <p className="text-xs mt-3 whitespace-pre-line">Catatan: {notes}</p>}
      {footer && <p className="text-xs text-center mt-3 italic">{footer}</p>}
    </div>,
    document.body
  );
}