"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus template ini? Tindakan tidak bisa dibatalkan.")) return;

    setLoading(true);
    const { error } = await supabase.from("templates").delete().eq("id", templateId);
    setLoading(false);

    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-500 hover:text-red-700 border border-red-200 rounded px-3 py-1"
    >
      Hapus
    </button>
  );
}