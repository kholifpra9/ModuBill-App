"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SoftDeleteButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus transaksi ini dari riwayat?")) return;

    setLoading(true);
    const { error } = await supabase
      .from("invoices")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", invoiceId);
    setLoading(false);

    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-xs text-red-500 border border-red-200 rounded px-2 py-1">
      Hapus
    </button>
  );
}