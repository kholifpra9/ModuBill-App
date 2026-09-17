"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { evaluateExpression, sortFormulasByDependency } from "@/lib/math/engine";
import { useToast } from "@/components/ui/toast-provider";
import type {
  TemplateColumn,
  DocumentField,
  TemplateFormula,
} from "@/lib/schemas/template";
import { generateInvoiceNumber } from "@/lib/utils/invoice-number";
import { PrintableInvoice } from "@/components/ui/printable-invoice";
import { ShareInvoiceButton } from "@/components/ui/share-invoice-button";

import {
  Plus,
  Trash2,
  Calendar,
  Save,
  AlertCircle,
  Calculator,
  Receipt,
  Package,
  RotateCcw,
  History,
  CheckCircle2,
  Printer,
  ArrowRight,
} from "lucide-react";

type RowValues = Record<string, string>;
type FormValues = {
  transaction_date: string;
  rows: RowValues[];
  documentInputs: Record<string, string>;
};

function toNumber(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isNaN(n) ? 0 : n;
}

// Helper Formatting Rupiah
function formatCurrency(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function TransactionForm({
  templateId,
  documentTitle,
  notes,
  footer,
  columns,
  documentFields,
  formulas,
}: {
  templateId: string;
  documentTitle: string;
  notes: string | null;
  footer: string | null;
  columns: TemplateColumn[];
  documentFields: DocumentField[];
  formulas: TemplateFormula[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedInvoice, setSavedInvoice] = useState<{
    id: string;
    invoice_number: string;
    share_token: string | null;
    document_values: Record<string, number>;
  } | null>(null);

  // State indikator jika transaksi baru saja berhasil disimpan
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const toast = useToast();

  const lineFormulas = useMemo(
    () => formulas.filter((f) => f.scope === "line_item"),
    [formulas]
  );
  const documentFormulas = useMemo(
    () => formulas.filter((f) => f.scope === "document_level"),
    [formulas]
  );
  const inputDocFields = documentFields.filter((d) => d.kind === "input");
  const computedDocFields = documentFields.filter((d) => d.kind === "computed");

  const emptyRow = (): RowValues =>
    Object.fromEntries(columns.map((c) => [c.field_key, ""]));

  // ISO string local datetime picker format
  const getNowISO = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

  const { control, register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      transaction_date: getNowISO(),
      rows: [emptyRow()],
      documentInputs: Object.fromEntries(
        inputDocFields.map((d) => [d.field_key, ""])
      ),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "rows" });

  const watchedRows = watch("rows");
  const watchedDocInputs = watch("documentInputs");

  // ==== LIVE CALCULATION (Dipanggil ulang tiap render saat mengetik) ====
  const calculated = useMemo(() => {
    const sortedLineFormulas = sortFormulasByDependency(lineFormulas);

    // 1. Hitung rumus line_item per baris (misal: Total = Qty * Harga)
    const computedRows = watchedRows.map((row) => {
      const scope: Record<string, number> = {};
      const rawTextValues: Record<string, string> = {};

      for (const col of columns) {
        if (col.data_type === "formula_output") continue;
        if (col.data_type === "text") {
          rawTextValues[col.field_key] = row[col.field_key] ?? "";
        } else {
          scope[col.field_key] = toNumber(row[col.field_key]);
        }
      }
      for (const f of sortedLineFormulas) {
        try {
          scope[f.target_field_key] = evaluateExpression(f.expression, scope);
        } catch {
          scope[f.target_field_key] = 0;
        }
      }
      return { ...scope, ...rawTextValues };
    });

    // 2. Kumpulkan tiap kolom NUMERIK jadi array untuk agregasi SUM()/AVG()
    const columnArrays: Record<string, number[]> = {};
    for (const col of columns) {
      if (col.data_type === "text") continue;
      columnArrays[col.field_key] = computedRows.map((r) => {
        const v = r[col.field_key];
        return typeof v === "number" ? v : 0;
      });
    }

    // 3. Input dokumen (Diskon, Uang Diterima, dst)
    const docInputScope: Record<string, number> = {};
    for (const d of inputDocFields)
      docInputScope[d.field_key] = toNumber(watchedDocInputs[d.field_key]);

    // 4. Jalankan rumus document_level
    const sortedDocFormulas = sortFormulasByDependency(documentFormulas);
    const scope: Record<string, number | number[]> = {
      ...columnArrays,
      ...docInputScope,
    };
    const documentResults: Record<string, number> = {};
    for (const f of sortedDocFormulas) {
      try {
        const value = evaluateExpression(f.expression, scope);
        scope[f.target_field_key] = value;
        documentResults[f.target_field_key] = value;
      } catch {
        documentResults[f.target_field_key] = 0;
      }
    }

    return { computedRows, documentResults };
  }, [
    watchedRows,
    watchedDocInputs,
    columns,
    lineFormulas,
    documentFormulas,
    inputDocFields,
  ]);

  // Handler untuk Mereset Form dan Menyiapkan Transaksi Baru
  function handleResetForNewTransaction() {
    reset({
      transaction_date: getNowISO(),
      rows: [emptyRow()],
      documentInputs: Object.fromEntries(
        inputDocFields.map((d) => [d.field_key, ""])
      ),
    });
    setIsSavedSuccess(false);
    setSavedInvoice(null);
    setSaveError(null);
    toast.success("Form dibersihkan. Siap untuk transaksi baru!");
  }

  async function onSubmit(values: FormValues) {
    setSaveError(null);

    // VALIDASI 1: Cek apakah tidak ada baris item sama sekali
    if (!values.rows || values.rows.length === 0) {
      setSaveError("Minimal tambahkan 1 baris item transaksi.");
      toast.error("Tidak dapat menyimpan transaksi tanpa item.");
      return;
    }

    // VALIDASI 2: Cek apakah semua baris item kosong (tidak ada input teks atau nilai > 0)
    const hasValidItem = values.rows.some((row) =>
      columns.some((col) => {
        if (col.data_type === "formula_output") return false;
        const val = row[col.field_key];
        if (col.data_type === "text") {
          return val && val.trim().length > 0;
        }
        return toNumber(val) > 0;
      })
    );

    if (!hasValidItem) {
      setSaveError("Silakan isi minimal 1 data item transaksi.");
      toast.error("Data item transaksi masih kosong.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const document_snapshot = {
      document_title: documentTitle,
      notes,
      footer,
      columns_schema: columns,
      document_fields: documentFields,
      formulas_schema: formulas,
    };

    const inputValues: Record<string, number> = Object.fromEntries(
      inputDocFields.map((d) => [
        d.field_key,
        toNumber(values.documentInputs[d.field_key]),
      ])
    );
    const document_values = { ...inputValues, ...calculated.documentResults };

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        template_id: templateId,
        invoice_number: generateInvoiceNumber(),
        transaction_date: values.transaction_date,
        grand_total: document_values["grand_total"] ?? null,
        document_values,
        document_snapshot,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      setSaveError(invoiceError?.message ?? "Gagal menyimpan transaksi");
      setSaving(false);
      return;
    }

    const itemsToInsert = calculated.computedRows.map((row, index) => ({
      invoice_id: invoice.id,
      row_order: index,
      item_values: row,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    setSaving(false);
    if (itemsError) {
      setSaveError(itemsError.message);
      return;
    }

    toast.success("Transaksi berhasil disimpan.");

    // Tanda bahwa transaksi sudah tersimpan, Form TETAP di Halaman Ini
    setIsSavedSuccess(true);
    setSavedInvoice({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      share_token: invoice.share_token ?? null,
      document_values,
    });
  }

  useEffect(() => {
    if (isSavedSuccess) {
      // requestAnimationFrame x2 memastikan browser sudah selesai satu
      // siklus paint penuh sebelum dialog print dibuka — mencegah race
      // condition serupa yang baru saja terjadi.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.print();
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSavedSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* BANNER SUKSES PENUH AKSI (Cetak, Bagikan, & Buat Baru) */}
      {isSavedSuccess && savedInvoice && (
        <div className="p-4 sm:p-5 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl space-y-4 shadow-xs animate-in fade-in slide-in-from-top-2">
          
          {/* Header Status Sukses */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200/60">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  Transaksi Berhasil Disimpan!
                </p>
                <p className="text-xs font-mono text-emerald-700">
                  No. Struk: {savedInvoice.invoice_number}
                </p>
              </div>
            </div>

            {/* Badge Status */}
            <span className="self-start sm:self-auto px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-300">
              Tersimpan di Riwayat
            </span>
          </div>

          {/* Akses Cepat Tombol Cetak & Bagikan */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tombol Cetak */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <Printer size={15} className="text-blue-600" />
                <span>Cetak</span>
              </button>

              {/* Tombol Bagikan Link / WA */}
              <ShareInvoiceButton
                invoiceId={savedInvoice.id}
                initialShareToken={savedInvoice.share_token}
              />
            </div>

            {/* Shortcut Buat Transaksi Baru Cepat */}
            <button
              type="button"
              onClick={handleResetForNewTransaction}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-200/80 hover:bg-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Input Transaksi Baru</span>
            </button>
          </div>

        </div>
      )}

      {/* Portal Komponen Printable Invoice untuk Dialog Print Browser */}
      {isSavedSuccess && savedInvoice && (
        <PrintableInvoice
          invoiceNumber={savedInvoice.invoice_number}
          transactionDate={watch("transaction_date")}
          documentTitle={documentTitle}
          notes={notes}
          footer={footer}
          columns={columns}
          documentFields={documentFields}
          items={calculated.computedRows}
          documentValues={savedInvoice.document_values}
        />
      )}

      {/* 1. Tanggal Transaksi Section */}
      <div className="space-y-1.5 max-w-xs">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Calendar size={14} className="text-blue-600" />
          <span>Tanggal & Waktu Transaksi</span>
        </label>
        <input
          type="datetime-local"
          {...register("transaction_date")}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-colors focus:outline-none cursor-pointer"
        />
      </div>

      {/* 2. Section Item Transaksi */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package size={16} className="text-blue-600" />
            <span>Daftar Item / Rincian</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {fields.length} Baris Item
          </span>
        </div>

        {/* Empty State jika tidak ada baris sama sekali */}
        {fields.length === 0 ? (
          <div className="p-8 bg-white border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
            <p className="text-xs text-slate-500">
              Belum ada baris item transaksi yang ditambahkan.
            </p>
            <button
              type="button"
              onClick={() => append(emptyRow())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Baris Pertama</span>
            </button>
          </div>
        ) : (
          /* Dynamic Item Rows */
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-slate-50/60 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Item #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Baris Ini"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Grid Form Input Per Kolom */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {columns.map((col) => {
                    const isFormula = col.data_type === "formula_output";
                    const rawVal = calculated.computedRows[index]?.[col.field_key];
                    const numVal = typeof rawVal === "number" ? rawVal : 0;

                    return isFormula ? (
                      /* Display Read-Only untuk Hasil Rumus Baris */
                      <div key={col.field_key} className="sm:col-span-3 space-y-1">
                        <span className="block text-[11px] font-medium text-slate-500">
                          {col.label} (Hasil)
                        </span>
                        <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold text-amber-900 font-mono text-right">
                          {col.data_type === "currency" || isFormula
                            ? formatCurrency(numVal)
                            : numVal.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      /* Input Biasa untuk Pengguna */
                      <div key={col.field_key} className="sm:col-span-3 space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700 truncate">
                          {col.label}
                        </label>
                        <input
                          {...register(`rows.${index}.${col.field_key}`)}
                          type={col.data_type === "text" ? "text" : "number"}
                          step={col.data_type === "number" ? "any" : "1"}
                          inputMode={col.data_type === "text" ? "text" : "decimal"}
                          placeholder={col.data_type === "text" ? "Nama item..." : "0"}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-colors focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => append(emptyRow())}
          className="w-full py-2.5 px-4 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 border-dashed rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Tambah Baris Item</span>
        </button>
      </div>

      {/* 3. Section Ringkasan Transaksi */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
          <Receipt size={16} className="text-blue-600" />
          <span>Ringkasan Transaksi</span>
        </h3>

        <div className="space-y-3">
          {/* Input Manual Ringkasan (Diskon, Uang Diterima, dll) */}
          {inputDocFields.map((d) => (
            <div
              key={d.field_key}
              className="flex items-center justify-between gap-4 text-xs sm:text-sm"
            >
              <label className="font-semibold text-slate-700">{d.label}</label>
              <div className="relative w-36 sm:w-44">
                <input
                  {...register(`documentInputs.${d.field_key}`)}
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-right transition-colors focus:outline-none"
                />
              </div>
            </div>
          ))}

          {/* Computed Results (Subtotal, Grand Total, Kembalian) */}
          {computedDocFields.map((d) => {
            const val = calculated.documentResults[d.field_key] ?? 0;
            const isGrandTotal =
              d.field_key.toLowerCase().includes("grand") ||
              d.field_key.toLowerCase().includes("total_bayar") ||
              d.label.toLowerCase().includes("grand total");

            return (
              <div
                key={d.field_key}
                className={`flex items-center justify-between gap-4 p-3 rounded-xl ${
                  isGrandTotal
                    ? "bg-amber-100/70 border border-amber-300 text-amber-950 font-extrabold text-base sm:text-lg shadow-xs"
                    : "bg-white border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Calculator
                    size={16}
                    className={isGrandTotal ? "text-amber-600" : "text-slate-400"}
                  />
                  <span>{d.label}</span>
                </div>
                <span className="font-mono">
                  {d.data_type === "currency"
                    ? formatCurrency(val)
                    : val.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Action Submit Bar (Navigasi Alur Selanjutnya) */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
        {isSavedSuccess ? (
          <>
            <button
              type="button"
              onClick={handleResetForNewTransaction}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <RotateCcw size={15} />
              <span>Buat Transaksi Lagi</span>
            </button>

            <Link
              href="/history"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <History size={16} />
              <span>Lihat Semua Riwayat</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/transactions"
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-60 shadow-sm"
            >
              {saving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save size={16} />
                  <span>Simpan Transaksi</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

    </form>
  );
}