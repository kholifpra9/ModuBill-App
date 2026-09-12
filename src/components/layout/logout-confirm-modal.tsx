"use client";

import React from "react";
import { LogOut, AlertTriangle, X } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      
      {/* Container Modal (Flat UI Style) */}
      <div
        className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        {/* Tombol Close (Silang) */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
          aria-label="Tutup dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Content Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle size={24} />
          </div>

          <div className="space-y-1">
            <h3
              id="logout-modal-title"
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              Konfirmasi Keluar
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun ModuBill? Anda perlu masuk kembali untuk mengakses template dan transaksi.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <LogOut size={16} />
                <span>Ya, Keluar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LogoutConfirmModal;