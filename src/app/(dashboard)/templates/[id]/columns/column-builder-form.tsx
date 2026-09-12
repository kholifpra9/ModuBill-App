"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  templateColumnSchema,
  MAX_COLUMNS_PER_TEMPLATE,
  type TemplateColumn,
} from "@/lib/schemas/template";
import { z } from "zod";

import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  AlertCircle,
  Calculator,
  GripVertical,
} from "lucide-react";

const formSchema = z.object({
  columns: z.array(templateColumnSchema).max(MAX_COLUMNS_PER_TEMPLATE),
});
type FormValues = z.infer<typeof formSchema>;

export function ColumnBuilderForm({
  templateId,
  initialColumns,
}: {
  templateId: string;
  initialColumns: TemplateColumn[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Counter untuk generate field_key internal berikutnya
  const nextFieldNumber = useRef(
    initialColumns.reduce((max, col) => {
      const n = parseInt(col.field_key.replace("field_", ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n + 1);
    }, 1)
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { columns: initialColumns },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "columns",
  });

  const watchColumns = watch("columns");

  function handleAddColumn() {
    const fieldKey = `field_${nextFieldNumber.current}`;
    nextFieldNumber.current += 1;
    append({
      field_key: fieldKey,
      label: "",
      data_type: "number",
      is_calculated: false,
      display_order: fields.length,
    });
  }

  async function onSubmit(values: FormValues) {
    setSaveError(null);
    setSaving(true);

    const columns_schema = values.columns.map((col, index) => ({
      ...col,
      display_order: index,
      is_calculated: col.data_type === "formula_output",
    }));

    const parsed = z.array(templateColumnSchema).safeParse(columns_schema);
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? "Validasi gagal");
      setSaving(false);
      return;
    }

    // Cross-check ke document_fields
    const { data: template, error: fetchError } = await supabase
      .from("templates")
      .select("document_fields")
      .eq("id", templateId)
      .single();

    if (fetchError) {
      setSaveError("Gagal memeriksa data field ringkasan. Coba lagi.");
      setSaving(false);
      return;
    }

    const columnKeys = parsed.data.map((c) => c.field_key);
    const documentKeys = (template.document_fields ?? []).map(
      (f: { field_key: string }) => f.field_key
    );
    const overlap = columnKeys.filter((k) => documentKeys.includes(k));

    if (overlap.length > 0) {
      setSaveError(
        `Pengenal "${overlap[0]}" bentrok dengan field ringkasan. Silakan sesuaikan kembali.`
      );
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("templates")
      .update({ columns_schema: parsed.data })
      .eq("id", templateId);

    setSaving(false);
    if (error) {
      setSaveError(error.message);
      return;
    }

    router.push("/templates");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Help Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
        <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold">Informasi Kolom Tabel</p>
          <p className="text-blue-700 leading-relaxed">
            Kolom ini akan muncul berulang untuk setiap baris barang/item yang diinput di transaksi (misalnya: <span className="font-semibold">Nama Item, Qty, Harga, Total</span>).
          </p>
        </div>
      </div>

      {/* List Item Kolom */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
            <p className="text-xs text-slate-500">
              Belum ada kolom yang ditambahkan.
            </p>
            <button
              type="button"
              onClick={handleAddColumn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Kolom Pertama</span>
            </button>
          </div>
        ) : (
          fields.map((field, index) => {
            const isFormulaOutput = watchColumns?.[index]?.data_type === "formula_output";

            return (
              <div
                key={field.id}
                className={`p-4 border rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                  isFormulaOutput
                    ? "bg-amber-50/30 border-amber-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Drag Handle Indicator */}
                <div className="hidden sm:flex items-center text-slate-300 cursor-grab">
                  <GripVertical size={18} />
                </div>

                {/* Input Controls */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-12 gap-3">
                  
                  {/* Label Kolom */}
                  <div className="sm:col-span-7 space-y-1">
                    <input
                      {...register(`columns.${index}.label`)}
                      placeholder="Nama Kolom (misal: Qty / Jumlah)"
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
                        errors.columns?.[index]?.label
                          ? "border-red-300 focus:ring-red-500 bg-red-50/30"
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                      }`}
                    />
                    {errors.columns?.[index]?.label && (
                      <p className="text-xs text-red-600 font-medium">
                        {errors.columns[index]?.label?.message}
                      </p>
                    )}
                  </div>

                  {/* Jenis Data */}
                  <div className="sm:col-span-5 space-y-1">
                    <select
                      {...register(`columns.${index}.data_type`)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-colors focus:outline-none cursor-pointer"
                    >
                      <option value="text">Teks (misal: Nama Barang)</option>
                      <option value="number">Angka (misal: Qty / Jumlah)</option>
                      <option value="currency">Mata Uang (misal: Harga)</option>
                      <option value="percentage">Persentase (%)</option>
                      <option value="formula_output">
                        Hasil Rumus (Otomatis)
                      </option>
                    </select>

                    {/* Indicator Hasil Rumus */}
                    {isFormulaOutput && (
                      <p className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                        <Calculator size={12} />
                        <span>Nilai diisi otomatis lewat Rumus</span>
                      </p>
                    )}
                  </div>

                </div>

                {/* Operational Buttons (Reorder & Delete) */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => index > 0 && move(index, index - 1)}
                    disabled={index === 0}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Naikkan Posisi"
                  >
                    <ChevronUp size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => index < fields.length - 1 && move(index, index + 1)}
                    disabled={index === fields.length - 1}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Turunkan Posisi"
                  >
                    <ChevronDown size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Kolom"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Button Tambah Kolom Baru */}
      <button
        type="button"
        onClick={handleAddColumn}
        disabled={fields.length >= MAX_COLUMNS_PER_TEMPLATE}
        className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-300 border-dashed rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={16} />
        <span>
          Tambah Kolom{" "}
          {fields.length >= MAX_COLUMNS_PER_TEMPLATE && "(Batas Maksimal)"}
        </span>
      </button>

      {/* Save Error Alert */}
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Form Action Controls */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <Link
          href="/templates"
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
              <span>Simpan Kolom</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
}