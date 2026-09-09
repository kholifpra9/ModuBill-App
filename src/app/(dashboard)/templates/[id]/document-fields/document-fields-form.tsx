"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    documentFieldSchema,
    MAX_DOCUMENT_FIELDS_PER_TEMPLATE,
    type DocumentField,
} from "@/lib/schemas/template";
import { z } from "zod";

const formSchema = z.object({
    fields: z.array(documentFieldSchema).max(MAX_DOCUMENT_FIELDS_PER_TEMPLATE),
});
type FormValues = z.infer<typeof formSchema>;

// Slugify sederhana: "Uang Diterima" -> "uang_diterima"
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

    const { control, register, handleSubmit, watch, setValue, formState: { errors } } =
        useForm<FormValues>({ defaultValues: { fields: initialFields } });

    const { fields, append, remove } = useFieldArray({ control, name: "fields" });

    function handleAddField() {
        append({
            field_key: "",
            label: "",
            kind: "input",
            data_type: "currency",
        });
    }

    // Auto-generate field_key dari label, HANYA kalau field_key masih kosong
    // (field lama yang sudah punya field_key tidak akan berubah — tetap permanen).
    function handleLabelBlur(index: number) {
        const current = watch(`fields.${index}`);
        if (!current.field_key && current.label) {
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

        // Cek unik di dalam document_fields sendiri
        const documentKeys = parsed.data.map((f) => f.field_key);
        if (new Set(documentKeys).size !== documentKeys.length) {
            setSaveError("Ada field_key yang duplikat — coba ganti label yang mirip.");
            setSaving(false);
            return;
        }

        // Cross-check ke columns_schema
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
                `Field_key "${overlap[0]}" sudah dipakai di kolom tabel. Ganti label field ini.`
            );
            setSaving(false);
            return;
        }

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="border rounded p-3 flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                            <input
                                {...register(`fields.${index}.label`)}
                                onBlur={() => handleLabelBlur(index)}
                                placeholder="Nama field, misal: Diskon"
                                className="w-full border rounded p-2 text-sm"
                            />
                            {errors.fields?.[index]?.label && (
                                <p className="text-red-500 text-xs">{errors.fields[index]?.label?.message}</p>
                            )}

                            <div className="flex gap-2">
                                <select {...register(`fields.${index}.kind`)} className="flex-1 border rounded p-2 text-sm">
                                    <option value="input">Diisi manual (input)</option>
                                    <option value="computed">Hasil rumus (computed)</option>
                                </select>

                                <select {...register(`fields.${index}.data_type`)} className="flex-1 border rounded p-2 text-sm">
                                    <option value="currency">Currency</option>
                                    <option value="number">Number</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="text">Text</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-xs border border-red-200 text-red-500 rounded px-2 py-1"
                        >
                            Hapus
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={handleAddField}
                disabled={fields.length >= MAX_DOCUMENT_FIELDS_PER_TEMPLATE}
                className="text-sm border rounded px-3 py-2 w-full"
            >
                + Tambah Field {fields.length >= MAX_DOCUMENT_FIELDS_PER_TEMPLATE && "(maks tercapai)"}
            </button>

            {saveError && <p className="text-red-500 text-sm">{saveError}</p>}

            <button disabled={saving} className="bg-black text-white rounded p-2 px-4">
                {saving ? "Menyimpan..." : "Simpan Field"}
            </button>
        </form>
    );
}