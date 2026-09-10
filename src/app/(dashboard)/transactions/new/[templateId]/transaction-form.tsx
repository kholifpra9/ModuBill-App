"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { evaluateExpression, sortFormulasByDependency } from "@/lib/math/engine";
import type { TemplateColumn, DocumentField, TemplateFormula } from "@/lib/schemas/template";
import { generateInvoiceNumber } from "@/lib/utils/invoice-number";

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

export function TransactionForm({
  templateId,
  columns,
  documentFields,
  formulas,
}: {
  templateId: string;
  columns: TemplateColumn[];
  documentFields: DocumentField[];
  formulas: TemplateFormula[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const lineFormulas = useMemo(() => formulas.filter((f) => f.scope === "line_item"), [formulas]);
  const documentFormulas = useMemo(() => formulas.filter((f) => f.scope === "document_level"), [formulas]);
  const inputDocFields = documentFields.filter((d) => d.kind === "input");
  const computedDocFields = documentFields.filter((d) => d.kind === "computed");

  const emptyRow = (): RowValues => Object.fromEntries(columns.map((c) => [c.field_key, ""]));

  const { control, register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      transaction_date: new Date().toISOString().slice(0, 16),
      rows: [emptyRow()],
      documentInputs: Object.fromEntries(inputDocFields.map((d) => [d.field_key, ""])),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "rows" });

  const watchedRows = watch("rows");
  const watchedDocInputs = watch("documentInputs");

  // ==== LIVE CALCULATION — dijalankan ulang tiap render saat user ngetik ====
  const calculated = useMemo(() => {
    const sortedLineFormulas = sortFormulasByDependency(lineFormulas);

    // 1. Hitung rumus line_item per baris (mis. field_3 = field_1 * field_2)
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
      // Gabung balik: field angka (dari scope) + field text (apa adanya)
      return { ...scope, ...rawTextValues };
    });

    // 2. Kumpulkan tiap kolom NUMERIK jadi array — dipakai SUM()/AVG() di document_level.
    // Kolom bertipe "text" sengaja di-skip di sini — nggak masuk akal diagregasi
    // secara matematis, dan nyimpennya sebagai number[] bakal salah tipe data.
    const columnArrays: Record<string, number[]> = {};
    for (const col of columns) {
      if (col.data_type === "text") continue;
      columnArrays[col.field_key] = computedRows.map((r) => {
        const v = r[col.field_key];
        return typeof v === "number" ? v : 0;
      });
    }

    // 3. Input dokumen (diskon, pajak, uang diterima, dst — diisi manual)
    const docInputScope: Record<string, number> = {};
    for (const d of inputDocFields) docInputScope[d.field_key] = toNumber(watchedDocInputs[d.field_key]);

    // 4. Jalankan rumus document_level sesuai urutan dependency
    const sortedDocFormulas = sortFormulasByDependency(documentFormulas);
    const scope: Record<string, number | number[]> = { ...columnArrays, ...docInputScope };
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
  }, [watchedRows, watchedDocInputs, columns, lineFormulas, documentFormulas, inputDocFields]);

  async function onSubmit(values: FormValues) {
    setSaveError(null);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const document_snapshot = { columns_schema: columns, document_fields: documentFields, formulas_schema: formulas };

    // Gabung field ringkasan: input (diskon, uang diterima) + computed (subtotal, grand_total, dst)
    const inputValues: Record<string, number> = Object.fromEntries(
      inputDocFields.map((d) => [d.field_key, toNumber(values.documentInputs[d.field_key])])
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
      setSaveError(invoiceError?.message ?? "Gagal menyimpan invoice");
      setSaving(false);
      return;
    }

    const itemsToInsert = calculated.computedRows.map((row, index) => ({
      invoice_id: invoice.id,
      row_order: index,
      item_values: row,
    }));

    const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);

    setSaving(false);
    if (itemsError) {
      setSaveError(itemsError.message);
      return;
    }

    router.push("/history");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm mb-1">Tanggal Transaksi</label>
        <input type="datetime-local" {...register("transaction_date")} className="border rounded p-2" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Item</p>
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded p-3 flex gap-3 items-end flex-wrap">
            {columns.map((col) =>
              col.data_type === "formula_output" ? (
                <div key={col.field_key} className="text-sm">
                  <p className="text-xs text-gray-400">{col.label}</p>
                  <p className="font-medium">{(calculated.computedRows[index]?.[col.field_key] ?? 0).toLocaleString()}</p>
                </div>
              ) : (
                <div key={col.field_key}>
                  <label className="block text-xs text-gray-400">{col.label}</label>
                  <input
                    {...register(`rows.${index}.${col.field_key}`)}
                    inputMode="decimal"
                    className="border rounded p-2 text-sm w-28"
                  />
                </div>
              )
            )}
            <button type="button" onClick={() => remove(index)} className="text-xs text-red-500 ml-auto">
              Hapus
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append(emptyRow())} className="text-sm border rounded px-3 py-2">
          + Add Row
        </button>
      </div>

      <div className="border rounded p-4 space-y-2 bg-gray-50">
        <p className="text-sm font-medium">Ringkasan</p>
        {inputDocFields.map((d) => (
          <div key={d.field_key} className="flex justify-between items-center">
            <label className="text-sm">{d.label}</label>
            <input
              {...register(`documentInputs.${d.field_key}`)}
              inputMode="decimal"
              className="border rounded p-1 text-sm w-32 text-right"
            />
          </div>
        ))}
        {computedDocFields.map((d) => (
          <div key={d.field_key} className="flex justify-between items-center text-sm">
            <span>{d.label}</span>
            <span className="font-medium">{(calculated.documentResults[d.field_key] ?? 0).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {saveError && <p className="text-red-500 text-sm">{saveError}</p>}

      <button disabled={saving} className="bg-black text-white rounded p-2 px-4">
        {saving ? "Menyimpan..." : "Simpan Transaksi"}
      </button>
    </form>
  );
}