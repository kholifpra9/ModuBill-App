"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createTemplateFormSchema, type CreateTemplateFormInput } from "@/lib/schemas/template";
import { createClient } from "@/lib/supabase/client";

export default function NewTemplatePage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateTemplateFormInput>({ resolver: zodResolver(createTemplateFormSchema) });

  async function onSubmit(data: CreateTemplateFormInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("templates").insert({
      user_id: user.id,
      name: data.name,
      document_title: data.document_title,
      orientation: data.orientation,
      notes: data.notes || null,
      footer: data.footer || null,
      // columns_schema, formulas_schema, document_fields tidak dikirim
      // — otomatis '[]'::jsonb sesuai default kolom di migrasi
      // is_default juga tidak dikirim — trigger set_first_template_as_default
      // otomatis handle kalau ini template pertama user
    });

    if (error) {
      setError("name", { message: error.message });
      return;
    }

    router.push("/templates");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Buat Template</h1>

      <div>
        <label className="block text-sm mb-1">Nama Template</label>
        <input {...register("name")} placeholder="misal: Struk Kasir Harian" className="w-full border rounded p-2" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Judul Dokumen</label>
        <input {...register("document_title")} placeholder="misal: Nota Pembayaran" className="w-full border rounded p-2" />
        {errors.document_title && <p className="text-red-500 text-sm">{errors.document_title.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Orientasi</label>
        <select {...register("orientation")} className="w-full border rounded p-2">
          <option value="">Pilih orientasi</option>
          <option value="portrait_58mm">Thermal 58mm (Portrait)</option>
          <option value="portrait_80mm">Thermal 80mm (Portrait)</option>
          <option value="landscape_a4">A4 (Landscape)</option>
          <option value="landscape_letter">Letter (Landscape)</option>
        </select>
        {errors.orientation && <p className="text-red-500 text-sm">{errors.orientation.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Catatan (opsional)</label>
        <textarea {...register("notes")} className="w-full border rounded p-2" rows={2} />
      </div>

      <div>
        <label className="block text-sm mb-1">Footer (opsional)</label>
        <textarea {...register("footer")} className="w-full border rounded p-2" rows={2} />
      </div>

      <button disabled={isSubmitting} className="bg-black text-white rounded p-2 px-4">
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}