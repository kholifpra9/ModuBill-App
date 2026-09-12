"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createTemplateFormSchema,
  type CreateTemplateFormInput,
} from "@/lib/schemas/template";
import { createClient } from "@/lib/supabase/client";

import {
  ArrowLeft,
  FileCode2,
  Printer,
  FileText,
  Save,
  AlertCircle,
} from "lucide-react";

export default function NewTemplatePage() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateTemplateFormInput>({
    resolver: zodResolver(createTemplateFormSchema),
    defaultValues: {
      name: "",
      document_title: "",
      orientation: "portrait_58mm", // Default ke Thermal 58mm yang paling umum
      notes: "",
      footer: "",
    },
  });

  // Watch nilai orientation untuk highlighting active state pada pilihan Radio Card
  const selectedOrientation = watch("orientation");

  // Opsi pilihan orientasi kertas (PRD §6.3)
  const orientationOptions = [
    {
      value: "portrait_58mm",
      label: "Thermal 58mm",
      subtitle: "Struk kasir kecil memanjang",
      icon: Printer,
    },
    {
      value: "portrait_80mm",
      label: "Thermal 80mm",
      subtitle: "Struk kasir standar/sedang",
      icon: Printer,
    },
    {
      value: "landscape_a4",
      label: "A4 Landscape",
      subtitle: "Invoice/Nota formal lebar",
      icon: FileText,
    },
    {
      value: "landscape_letter",
      label: "Letter Landscape",
      subtitle: "Format kertas kantor standar",
      icon: FileText,
    },
  ];

  async function onSubmit(data: CreateTemplateFormInput) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("name", {
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        });
        return;
      }

      const { error } = await supabase.from("templates").insert({
        user_id: user.id,
        name: data.name,
        document_title: data.document_title,
        orientation: data.orientation,
        notes: data.notes || null,
        footer: data.footer || null,
        // columns_schema, formulas_schema, document_fields otomatis '[]'::jsonb di Postgres
        // Trigger set_first_template_as_default akan menangani is_default jika ini template pertama
      });

      if (error) {
        setError("name", { message: error.message });
        return;
      }

      router.push("/templates");
      router.refresh();
    } catch (err) {
      console.error("Gagal membuat template:", err);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header & Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/templates"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          title="Kembali ke Daftar Template"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Buat Template Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tentukan informasi dasar dan orientasi kertas sebelum mengatur kolom & rumus.
          </p>
        </div>
      </div>

      {/* Main Form Container (Flat Card UI) */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
      >
        
        {/* Section 1: Identitas Template */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileCode2 size={16} className="text-blue-600" />
            <span>Info Utama Dokumen</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Template (Internal) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Nama Template <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="misal: Struk Kasir Harian"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500 bg-red-50/30"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                }`}
              />
              <p className="text-[11px] text-slate-400">
                Nama pengenal internal (hanya terlihat oleh Anda).
              </p>
              {errors.name && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Judul Dokumen (Publik/Kop) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Judul Dokumen <span className="text-red-500">*</span>
              </label>
              <input
                {...register("document_title")}
                type="text"
                placeholder="misal: NOTA PEMBAYARAN"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
                  errors.document_title
                    ? "border-red-300 focus:ring-red-500 bg-red-50/30"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                }`}
              />
              <p className="text-[11px] text-slate-400">
                Judul yang dicetak di bagian paling atas struk/invoice.
              </p>
              {errors.document_title && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.document_title.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Pilihan Orientasi Kertas (PRD §6.3 Visual Card Selection) */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-700">
            Orientasi & Ukuran Kertas <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {orientationOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOrientation === option.value;

              return (
                <div
                  key={option.value}
                  onClick={() => setValue("orientation", option.value as any, { shouldValidate: true })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isSelected
                      ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {option.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.orientation && (
            <p className="text-xs text-red-600 font-medium">
              {errors.orientation.message}
            </p>
          )}
        </div>

        {/* Section 3: Catatan & Footer Opsional */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
            Teks Tambahan (Opsional)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Catatan Dokumen */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Catatan Dokumen
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="misal: Barang yang sudah dibeli tidak dapat ditukar/dikembalikan."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-colors focus:outline-none resize-none"
              />
            </div>

            {/* Footer Dokumen */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Footer Dokumen
              </label>
              <textarea
                {...register("footer")}
                rows={3}
                placeholder="misal: Terima kasih atas kunjungan Anda! Sampai jumpa kembali."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-colors focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Global Error Banner (Jika ada) */}
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{errors.root.message}</span>
          </div>
        )}

        {/* Form Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/templates"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-60 shadow-sm"
          >
            {isSubmitting ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Template</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}