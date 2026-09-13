"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/schemas/profile";
import { createClient } from "@/lib/supabase/client";
import {
  Building2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Image as ImageIcon,
  X,
  HelpCircle,
} from "lucide-react";

export function SettingsForm({
  initialProfile,
}: {
  initialProfile: { businessName: string; logoUrl: string };
}) {
  const supabase = createClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialProfile.logoUrl);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: initialProfile.businessName,
    },
  });

  // Handle Pratinjau Gambar saat Memilih File Baru
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Ukuran logo maksimal 2MB.");
        return;
      }
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  }

  function handleClearLogo() {
    setLogoFile(null);
    setPreviewUrl("");
  }

  async function onSubmit(data: ProfileInput) {
    setSaved(false);
    setErrorMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Sesi pengguna tidak valid.");
        return;
      }

      let logo_url: string | undefined = previewUrl;

      // Jika ada file baru yang diunggah
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const path = `${user.id}/logo-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(path, logoFile, { upsert: true });

        if (uploadError) {
          setErrorMessage(`Gagal mengunggah logo: ${uploadError.message}`);
          return;
        }

        const { data: publicUrl } = supabase.storage
          .from("logos")
          .getPublicUrl(path);

        logo_url = publicUrl.publicUrl;
      }

      // Update Data Profil ke Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          business_name: data.businessName,
          logo_url: logo_url || null,
        })
        .eq("id", user.id);

      if (updateError) {
        setErrorMessage(updateError.message);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message ?? "Terjadi kesalahan tidak terduga.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informasi Opsional Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
        <HelpCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold">Pengaturan Opsional</p>
          <p className="text-blue-700 leading-relaxed">
            Pengisian nama dan logo bisnis bersifat opsional. Jika diisi, informasi ini akan otomatis dicetak pada kepala struk atau invoice Anda.
          </p>
        </div>
      </div>

      {/* Field 1: Nama Bisnis */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Building2 size={14} className="text-blue-600" />
          <span>Nama Bisnis / Toko</span>
        </label>
        <input
          {...register("businessName")}
          type="text"
          placeholder="Contoh: Toko Kopi Modu, Resto Barokah, dll."
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-colors focus:outline-none"
        />
        {errors.businessName && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <AlertCircle size={12} />
            <span>{errors.businessName.message}</span>
          </p>
        )}
      </div>

      {/* Field 2: Logo Bisnis & Upload Drag/Drop Box */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ImageIcon size={14} className="text-blue-600" />
          <span>Logo Bisnis</span>
        </label>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
          {/* Box Preview Logo */}
          {previewUrl ? (
            <div className="relative w-20 h-20 rounded-xl border border-slate-200 bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden group shadow-xs">
              <img
                src={previewUrl}
                alt="Logo Bisnis"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={handleClearLogo}
                className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Hapus Pratinjau Logo"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-100 shrink-0 flex flex-col items-center justify-center text-slate-400">
              <ImageIcon size={24} />
              <span className="text-[10px] mt-1 font-medium">Tanpa Logo</span>
            </div>
          )}

          {/* Action Upload Controls */}
          <div className="space-y-1.5 flex-1">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs">
              <Upload size={14} className="text-slate-500" />
              <span>{previewUrl ? "Ganti Logo File" : "Pilih File Logo"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Format yang didukung: PNG, JPG, WEBP, atau SVG. Maksimal 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Error */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Alert Success */}
      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>Profil bisnis Anda berhasil diperbarui!</span>
        </div>
      )}

      {/* Bottom Action Submit Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
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
              <span>Simpan Profil</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}