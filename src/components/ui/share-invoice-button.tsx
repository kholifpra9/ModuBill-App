"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import {
  Share2,
  Copy,
  Check,
  X,
  AlertTriangle,
  Link2,
  ShieldOff,
} from "lucide-react";

export function ShareInvoiceButton({
  invoiceId,
  initialShareToken,
}: {
  invoiceId: string;
  initialShareToken: string | null;
}) {
  const supabase = createClient();
  const toast = useToast();

  const [shareToken, setShareToken] = useState<string | null>(initialShareToken);
  const [showModal, setShowModal] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Menyusun URL publik share invoice
  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invoice/share/${shareToken}`
    : "";

  async function handleOpenShare() {
    setShowModal(true);
    if (shareToken) return; // Sudah ada token, tidak perlu generate baru

    try {
      setLoading(true);
      const newToken = crypto.randomUUID();
      const { error } = await supabase
        .from("invoices")
        .update({ share_token: newToken })
        .eq("id", invoiceId);

      if (error) {
        toast.error(`Gagal membuat link: ${error.message}`);
        setShowModal(false);
        return;
      }

      setShareToken(newToken);
      toast.info("Link publik berhasil dibuat.");
    } catch (err) {
      toast.error("Terjadi kesalahan sistem saat membuat link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("invoices")
        .update({ share_token: null })
        .eq("id", invoiceId);

      if (error) {
        toast.error(`Gagal menonaktifkan link: ${error.message}`);
        return;
      }

      setShareToken(null);
      setShowRevokeConfirm(false);
      setShowModal(false);
      toast.success("Link publik berhasil dinonaktifkan.");
    } catch (err) {
      toast.error("Gagal menonaktifkan link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Gagal menyalin link.");
    }
  }

  return (
    <>
      {/* Tombol Utama Trigger Share (Flat Design) */}
      <button
        onClick={handleOpenShare}
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer select-none"
        title="Bagikan invoice ini via link publik atau QR Code"
      >
        <Share2 size={14} className="text-slate-500 group-hover:text-blue-600" />
        <span>Bagikan</span>
      </button>

      {/* Modal Utama Bagikan Invoice */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 select-none">
          <div
            className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in zoom-in-95 duration-200 text-left"
            role="dialog"
            aria-modal="true"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Link2 size={16} className="text-blue-600" />
                <span>Bagikan Invoice</span>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowRevokeConfirm(false);
                }}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content State: Loading / Generated */}
            {loading || !shareToken ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 font-medium">
                  Menyiapkan link publik...
                </p>
              </div>
            ) : showRevokeConfirm ? (
              /* Sub-View: Konfirmasi Revoke Link (Ganti confirm browser) */
              <div className="py-2 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mx-auto">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Nonaktifkan Link Publik?
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Siapapun yang memiliki link lama tidak akan bisa melihat dokumen ini lagi.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRevokeConfirm(false)}
                    disabled={loading}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleRevoke}
                    disabled={loading}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Ya, Nonaktifkan"}
                  </button>
                </div>
              </div>
            ) : (
              /* Main View: QR Code & Copy Link */
              <div className="space-y-4">
                {/* QR Code Card Frame */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <QRCodeSVG value={shareUrl} size={150} level="M" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Pindai QR Code untuk membuka invoice di HP
                  </p>
                </div>

                {/* Input URL & Copy Button */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Link Akses Publik
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      readOnly
                      value={shareUrl}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleCopy}
                      type="button"
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                        copied
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={14} />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Revoke Action Link */}
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => setShowRevokeConfirm(true)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShieldOff size={13} />
                    <span>Nonaktifkan link publik ini</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}