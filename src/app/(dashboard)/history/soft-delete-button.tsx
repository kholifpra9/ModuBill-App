"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, AlertTriangle, X } from "lucide-react";

export function SoftDeleteButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const { error } = await supabase
        .from("invoices")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", invoiceId);

      if (error) {
        setErrorMessage(`Gagal menghapus: ${error.message}`);
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Gagal soft delete invoice:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
        title="Hapus transaksi dari riwayat"
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
      >
        <Trash2 size={16} />
      </button>

      {/* Modal Konfirmasi Soft Delete */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div
            className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200 text-left"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => {
                setIsModalOpen(false);
                setErrorMessage(null);
              }}
              disabled={loading}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Hapus Transaksi?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Transaksi ini akan dihapus dari daftar riwayat Anda.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMessage(null);
                }}
                disabled={loading}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}