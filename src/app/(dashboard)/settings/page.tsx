"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { profileSchema, type ProfileInput } from "@/lib/schemas/profile";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema) });

  async function onSubmit(data: ProfileInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let logo_url: string | undefined;

    if (logoFile) {
      const path = `${user.id}/${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, logoFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from("logos").getPublicUrl(path);
        logo_url = publicUrl.publicUrl;
      }
    }

    await supabase
      .from("profiles")
      .update({ business_name: data.businessName, ...(logo_url && { logo_url }) })
      .eq("id", user.id);

    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Profil Bisnis</h1>
        <p className="text-sm text-gray-500 mb-4">
            Opsional — isi kalau kamu mau nama & logo bisnis muncul di template invoice/struk kamu.
        </p>

      <div>
        <label className="block text-sm mb-1">Nama Bisnis</label>
        <input {...register("businessName")} className="w-full border rounded p-2" />
        {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Logo Bisnis</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button disabled={isSubmitting} className="bg-black text-white rounded p-2 px-4">
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </button>

      {saved && <p className="text-green-600 text-sm">Tersimpan!</p>}
    </form>
  );
}