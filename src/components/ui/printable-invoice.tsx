"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { TemplateColumn, DocumentField } from "@/lib/schemas/template";
import ModuBillLogo from "@/components/ui/modubilllogo";

type ItemValue = number | string;

function formatValue(value: ItemValue | undefined, dataType: string): string {
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
  // 2. Tambahkan state untuk mengecek apakah aplikasi sudah terpasang di browser (Client)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Jika masih di server (SSR), kembalikan null agar tidak memicu error "document is not defined"
  if (!isMounted) {
    return null;
  }

  // Hanya dirender saat proses print dipicu browser
  return createPortal(
    <div className="hidden print:block font-sans text-slate-900 text-xs p-8 max-w-3xl mx-auto bg-white">
      
      {/* 1. KOP / HEADER INVOICE */}
      <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            {documentTitle || "INVOICE / STRUK"}
          </h1>
          <p className="text-sm font-bold font-mono text-slate-700 mt-1">
            {invoiceNumber}
          </p>
        </div>

        <div className="text-right space-y-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
            Tanggal Transaksi
          </span>
          <p className="font-semibold text-slate-800">
            {new Date(transactionDate).toLocaleString("id-ID", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {/* 2. TABEL DAFTAR ITEM TRANSAKSI */}
      <div className="my-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={col.field_key}
                  className={`py-2 px-1 ${
                    col.data_type === "currency" ||
                    col.data_type === "number" ||
                    col.data_type === "formula_output"
                      ? "text-right"
                      : "text-left"
                  } ${idx === 0 ? "pl-0" : ""} ${
                    idx === columns.length - 1 ? "pr-0" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {items.map((item, i) => (
              <tr key={i} className="align-top">
                {columns.map((col, idx) => {
                  const isNumeric =
                    col.data_type === "currency" ||
                    col.data_type === "number" ||
                    col.data_type === "formula_output";

                  return (
                    <td
                      key={col.field_key}
                      className={`py-2.5 px-1 font-medium ${
                        isNumeric ? "text-right font-mono" : "text-left"
                      } ${idx === 0 ? "pl-0 font-semibold text-slate-900" : ""} ${
                        idx === columns.length - 1 ? "pr-0" : ""
                      }`}
                    >
                      {formatValue(item[col.field_key], col.data_type)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. RINGKASAN TOTAL & CATATAN (2-COLUMN GRID LAYOUT) */}
      <div className="pt-4 border-t-2 border-slate-900 flex items-start justify-between gap-8">
        
        {/* Kolom Kiri: Catatan Tambahan (Notes) */}
        <div className="flex-1 space-y-1 pr-4">
          {notes && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Catatan:
              </span>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-0.5">
                {notes}
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Rincian Angka Ringkasan (Subtotal, Diskon, Grand Total) */}
        {documentFields.length > 0 && (
          <div className="w-64 space-y-2 shrink-0">
            {documentFields.map((d) => {
              const val = documentValues[d.field_key];
              const isGrandTotal =
                d.field_key.toLowerCase().includes("grand") ||
                d.field_key.toLowerCase().includes("total_bayar") ||
                d.label.toLowerCase().includes("grand total");

              return (
                <div
                  key={d.field_key}
                  className={`flex items-center justify-between text-xs ${
                    isGrandTotal
                      ? "pt-2 border-t-2 border-slate-900 font-extrabold text-sm text-slate-900"
                      : "text-slate-600 font-semibold"
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
        )}
      </div>

      {/* 4. FOOTER UCAPAN & WATERMARK BRANDING MODUBILL */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-center space-y-3">
        {footer && (
          <p className="text-xs font-medium italic text-slate-600">
            {footer}
          </p>
        )}

        {/* Watermark Pencetakan Resmi ModuBill */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <span>Dicetak melalui</span>
          <ModuBillLogo variant="monochrome" size={14} />
        </div>
      </div>

    </div>,
    document.body
  );
}