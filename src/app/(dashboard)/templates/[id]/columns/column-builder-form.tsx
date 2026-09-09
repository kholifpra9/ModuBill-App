"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  templateColumnSchema,
  MAX_COLUMNS_PER_TEMPLATE,
  type TemplateColumn,
} from "@/lib/schemas/template";
import { z } from "zod";

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

  // Counter buat generate field_key berikutnya — dimulai dari field_key
  // tertinggi yang sudah ada, supaya tidak tabrakan meski ada kolom yang dihapus.
  const nextFieldNumber = useRef(
    initialColumns.reduce((max, col) => {
      const n = parseInt(col.field_key.replace("field_", ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n + 1);
    }, 1)
  );

  const { control, register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { columns: initialColumns },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "columns",
  });

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

    // Normalisasi: display_order = index saat ini, is_calculated derive dari data_type
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded p-3 flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <input
                {...register(`columns.${index}.label`)}
                placeholder="Nama kolom, misal: Jumlah"
                className="w-full border rounded p-2 text-sm"
              />
              {errors.columns?.[index]?.label && (
                <p className="text-red-500 text-xs">{errors.columns[index]?.label?.message}</p>
              )}

              <select
                {...register(`columns.${index}.data_type`)}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
                <option value="formula_output">Formula Output (hasil rumus)</option>
              </select>

              <p className="text-xs text-gray-400">Key: {field.field_key}</p>
            </div>

            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => index > 0 && move(index, index - 1)} className="text-xs border rounded px-2 py-1">▲</button>
              <button type="button" onClick={() => index < fields.length - 1 && move(index, index + 1)} className="text-xs border rounded px-2 py-1">▼</button>
              <button type="button" onClick={() => remove(index)} className="text-xs border border-red-200 text-red-500 rounded px-2 py-1">Hapus</button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddColumn}
        disabled={fields.length >= MAX_COLUMNS_PER_TEMPLATE}
        className="text-sm border rounded px-3 py-2 w-full"
      >
        + Tambah Kolom {fields.length >= MAX_COLUMNS_PER_TEMPLATE && "(maks tercapai)"}
      </button>

      {saveError && <p className="text-red-500 text-sm">{saveError}</p>}

      <button disabled={saving} className="bg-black text-white rounded p-2 px-4">
        {saving ? "Menyimpan..." : "Simpan Kolom"}
      </button>
    </form>
  );
}