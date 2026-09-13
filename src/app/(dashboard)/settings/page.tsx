import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Pengaturan Profil Bisnis",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  // Ambil profil bisnis user saat ini
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile = {
    businessName: "",
    logoUrl: "",
  };

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, logo_url")
      .eq("id", user.id)
      .single();

    if (profile) {
      initialProfile = {
        businessName: profile.business_name ?? "",
        logoUrl: profile.logo_url ?? "",
      };
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Profil Bisnis
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Atur identitas bisnis Anda yang akan muncul pada bagian kover/kop dokumen transaksi.
        </p>
      </div>

      {/* Main Settings Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <SettingsForm initialProfile={initialProfile} />
      </div>
    </div>
  );
}