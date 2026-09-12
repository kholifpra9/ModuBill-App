"use client";

import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  documentFieldSchema,
  MAX_DOCUMENT_FIELDS_PER_TEMPLATE,
  type DocumentField,
} from "@/lib/schemas/template";
import { z } from "zod";

import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Calculator,
  PenTool,
  HelpCircle,
} from "lucide-react";

const formSchema = z.object({
  fields: z.array(documentFieldSchema).max(MAX_DOCUMENT_FIELDS_PER_TEMPLATE),
});
type FormValues = z.infer<typeof formSchema>;

// Helper Slugify: "Uang Diterima" -> "uang_diterima"
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function DocumentFieldsForm({
  templateId,
  initialFields,
}: {
  templateId: string;
  initialFields: DocumentField[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { fields: initialFields } });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const watchFields = watch("fields");

  function handleAddField() {
    append({
      field_key: "",
      label: "",
      kind: "input",
      data_type: "currency",
    });
  }

  // Auto-generate field_key dari label HANYA jika field_key masih kosong
  function handleLabelBlur(index: number) {
    const current = watchFields?.[index];
    if (current && !current.field_key && current.label) {
      setValue(`fields.${index}.field_key`, slugify(current.label));
    }
  }

  async function onSubmit(values: FormValues) {
    setSaveError(null);
    setSaving(true);

    const parsed = z.array(documentFieldSchema).safeParse(values.fields);
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? "Validasi gagal");
      setSaving(false);
      return;
    }

    // 1. Cek keunikan field_key di dalam document_fields sendiri
    const documentKeys = parsed.data.map((f) => f.field_key);
    if (new Set(documentKeys).size !== documentKeys.length) {
      setSaveError(
        "Terdapat nama field yang menghasilkan pengenal duplikat. Coba bedakan nama labelnya."
      );
      setSaving(false);
      return;
    }

    // 2. Cross-check ke columns_schema untuk mencegah konflik nama variabel (PRD §3)
    const { data: template, error: fetchError } = await supabase
      .from("templates")
      .select("columns_schema")
      .eq("id", templateId)
      .single();

    if (fetchError) {
      setSaveError("Gagal memeriksa data kolom tabel. Coba lagi.");
      setSaving(false);
      return;
    }

    const columnKeys = (template.columns_schema ?? []).map(
      (c: { field_key: string }) => c.field_key
    );
    const overlap = documentKeys.filter((k) => columnKeys.includes(k));

    if (overlap.length > 0) {
      setSaveError(
        `Pengenal "${overlap[0]}" sudah digunakan pada kolom tabel. Silakan gunakan nama label lain.`
      );
      setSaving(false);
      return;
    }

    // 3. Simpan perubahan ke Supabase
    const { error } = await supabase
      .from("templates")
      .update({ document_fields: parsed.data })
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
      
      {/* Banner Penjelasan Layar */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
        <HelpCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold">Apa itu Field Ringkasan?</p>
          <p className="text-blue-700 leading-relaxed">
            Ini adalah bagian di bawah tabel transaksi yang muncul satu kali (misalnya: <span className="font-semibold">Subtotal, Diskon Member, Pajak PB1, Grand Total, Uang Diterima, Kembalian</span>).
          </p>
        </div>
      </div>

      {/* List Item Field Ringkasan */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
            <p className="text-xs text-slate-500">
              Belum ada field ringkasan yang ditambahkan.
            </p>
            <button
              type="button"
              onClick={handleAddField}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Field Pertama</span>
            </button>
          </div>
        ) : (
          fields.map((field, index) => {
            const currentKind = watchFields?.[index]?.kind;
            const isComputed = currentKind === "computed";

            return (
              <div
                key={field.id}
                className={`p-4 border rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                  isComputed
                    ? "bg-amber-50/40 border-amber-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Input Fields Grid */}
                <div className="flex-1 w-full space-y-2">
                  
                  {/* Row 1: Label Name */}
                  <div className="space-y-1">
                    <input
                      {...register(`fields.${index}.label`)}
                      onBlur={() => handleLabelBlur(index)}
                      placeholder="Nama field (misal: Diskon / Grand Total)"
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
                        errors.fields?.[index]?.label
                          ? "border-red-300 focus:ring-red-500 bg-red-50/30"
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                      }`}
                    />
                    {errors.fields?.[index]?.label && (
                      <p className="text-xs text-red-600 font-medium">
                        {errors.fields[index]?.label?.message}
                      </p>
                    )}
                  </div>

                  {/* Row 2: Select Mode & Data Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Jenis Pengisian (Input vs Computed) */}
                    <div className="space-y-1">
                      <select
                        {...register(`fields.${index}.kind`)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer focus:outline-none"
                      >
                        <option value="input">Diisi Manual Saat Transaksi</option>
                        <option value="computed">Hasil Hitungan Rumus (Otomatis)</option>
                      </select>
                    </div>

                    {/* Format Angka/Data */}
                    <div className="space-y-1">
                      <select
                        {...register(`fields.${index}.data_type`)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer focus:outline-none"
                      >
                        <option value="currency">Mata Uang (Rp / Currency)</option>
                        <option value="number">Angka Polos (Number)</option>
                        <option value="percentage">Persentase (%)</option>
                        <option value="text">Teks Keterangan (Text)</option>
                      </select>
                    </div>
                  </div>

                  {/* Operational Status Subtitle */}
                  <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                    {isComputed ? (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <Calculator size={12} />
                        Nilai akan dihitung otomatis oleh Rumus Dokumen
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <PenTool size={12} className="text-slate-400" />
                        Pengguna memasukkan nilai secara manual saat transaksi
                      </span>
                    )}
                  </div>

                </div>

                {/* Tombol Hapus */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center shrink-0"
                  title="Hapus Field Ringkasan"
                >
                  <Trash2 size={18} />
                </button>

              </div>
            );
          })
        )}
      </div>

      {/* Button Tambah Field */}
      <button
        type="button"
        onClick={handleAddField}
        disabled={fields.length >= MAX_DOCUMENT_FIELDS_PER_TEMPLATE}
        className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-300 border-dashed rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={16} />
        <span>
          Tambah Field Ringkasan{" "}
          {fields.length >= MAX_DOCUMENT_FIELDS_PER_TEMPLATE && "(Maksimal Tercapai)"}
        </span>
      </button>

      {/* Error Banner */}
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Form Action Buttons */}
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
              <span>Simpan Field</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
}