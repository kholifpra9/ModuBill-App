"use client";

import React from "react";
import Link from "next/link";
import ModuBillLogo from "@/components/ui/modubilllogo";

interface FooterProps {
  /** Mode 'minimal' atau 'watermark' untuk struk/invoice cetak */
  variant?: "default" | "watermark";
}

export const Footer: React.FC<FooterProps> = ({ variant = "default" }) => {
  // Varian Watermark Monokrom khusus Invoice Cetak (PRD §4 & §5)
  if (variant === "watermark") {
    return (
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 select-none py-2 border-t border-slate-100">
        <span>Dibuat dengan</span>
        <ModuBillLogo variant="monochrome" size={14} />
      </div>
    );
  }

  // Footer Standar Landing Page (PRD §8)
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 py-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Deskripsi Ringkas */}
        <div className="flex items-center gap-3">
          <ModuBillLogo variant="full" size={24} />
          <span className="text-xs text-slate-500 border-l border-slate-300 pl-3">
            Aplikasi Pembuat Struk & Invoice Modular Praktis
          </span>
        </div>

        {/* Tautan Footer */}
        <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
          <Link href="/login" className="hover:text-blue-600 transition-colors">
            Masuk
          </Link>
          <Link href="/register" className="hover:text-blue-600 transition-colors">
            Daftar
          </Link>
          <span className="text-slate-400">
            © {new Date().getFullYear()} ModuBill.
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;