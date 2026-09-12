"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";

export function SetDefaultButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSetDefault() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Step 1: Unset default lama milik pengguna
      await supabase
        .from("templates")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true);

      // Step 2: Set template ini sebagai default baru
      const { error } = await supabase
        .from("templates")
        .update({ is_default: true })
        .eq("id", templateId);

      if (!error) {
        router.refresh();
      }
    } catch (err) {
      console.error("Gagal mengubah template default:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSetDefault}
      disabled={loading}
      title="Jadikan template default untuk transaksi baru"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
    >
      <Star size={14} className="text-amber-500" />
      <span>{loading ? "Proses..." : "Jadikan Default"}</span>
    </button>
  );
}