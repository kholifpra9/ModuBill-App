import Link from "next/link";
import ModuBillLogo from "@/components/ui/modubilllogo";
import { FileX2, ArrowLeft, HelpCircle } from "lucide-react";

export default function ShareNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 select-none selection:bg-blue-100 selection:text-blue-700">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xs">
        
        {/* Visual Badge Icon Not Found (Flat Design Accent) */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
          <FileX2 size={32} />
        </div>

        {/* Content Heading & Description */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Invoice Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            Tautan ini sudah tidak berlaku. Dokumen kemungkinan telah dihapus
            atau akses baginya dinonaktifkan oleh pembuatnya.
          </p>
        </div>

        {/* Informative Hint Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-left flex items-start gap-2.5 text-xs text-slate-600">
          <HelpCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-normal">
            Jika ini kesalahan, silakan hubungi pemilik usaha/transaksi untuk meminta tautan berbagi terbaru.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke ModuBill</span>
          </Link>
        </div>

        {/* Watermark Brand Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span>Daya cipta oleh</span>
          <ModuBillLogo variant="monochrome" size={15} />
        </div>

      </div>
    </div>
  );
}