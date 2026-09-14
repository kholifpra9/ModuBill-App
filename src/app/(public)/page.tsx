"use client";

import React from "react";
import Link from "next/link";
import ModuBillLogo from "@/components/ui/modubilllogo";
import {
  Calculator,
  LayoutGrid,
  Printer,
  Store,
  Hotel,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* =================================================================== */}
      {/* 1. HERO SECTION                                                     */}
      {/* =================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Brief & Direct Heading */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">

              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                Bikin Struk & Invoice{" "}
                <span className="text-blue-600 underline decoration-amber-400 decoration-4 underline-offset-4">
                  Bebas Atur
                </span>{" "}
                Sendiri.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Bikin struk & invoice sesuai gaya usahamu. Tambah kolom sendiri, hitung otomatis (Diskon, Pajak, Kembalian), cetak dalam hitungan detik.
              </p>

              {/* Action Button Ringkas */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:-translate-y-0.5"
                >
                  <span>Coba Buat Struk Sekarang</span>
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Trust Badges Ringkas */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 font-medium pt-3">
                <span className="flex items-center gap-1.5 transition-transform hover:scale-105">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Gratis Digunakan
                </span>
                <span className="flex items-center gap-1.5 transition-transform hover:scale-105">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Bisa Cetak Thermal & A4
                </span>
                <span className="flex items-center gap-1.5 transition-transform hover:scale-105">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Cocok untuk HP & Laptop
                </span>
              </div>
            </div>

            {/* Right Column: Struk Mockup (Clean & Non-Interactive Demo) */}
            <div className="lg:col-span-6 relative">
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm select-none transition-all duration-300 hover:border-slate-300 hover:shadow-md">
                
                {/* Struk Header Mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <div className="flex items-center gap-2">
                    <ModuBillLogo variant="icon" size={24} />
                    <span className="font-bold text-slate-800 text-sm">Kedai Kopi ModuBill</span>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    #INV-001
                  </span>
                </div>

                {/* Table Mockup */}
                <div className="space-y-2 mb-3 text-xs">
                  <div className="grid grid-cols-12 font-semibold text-slate-500 pb-1 border-b border-slate-100">
                    <span className="col-span-6">Nama Barang</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-4 text-right">Total</span>
                  </div>
                  
                  <div className="grid grid-cols-12 text-slate-700 py-1 items-center">
                    <span className="col-span-6 font-medium truncate">Es Kopi Susu Aren</span>
                    <span className="col-span-2 text-center text-slate-500 font-mono">2x</span>
                    <span className="col-span-4 text-right font-mono font-medium">Rp 36.000</span>
                  </div>

                  <div className="grid grid-cols-12 text-slate-700 py-1 items-center">
                    <span className="col-span-6 font-medium truncate">Croissant Butter</span>
                    <span className="col-span-2 text-center text-slate-500 font-mono">1x</span>
                    <span className="col-span-4 text-right font-mono font-medium">Rp 22.000</span>
                  </div>
                </div>

                {/* Summary Section Mockup */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold">Rp 58.000</span>
                  </div>
                  
                  <div className="flex justify-between text-emerald-600 font-medium pt-0.5">
                    <span>Diskon (10%)</span>
                    <span className="font-mono">-Rp 5.800</span>
                  </div>

                  <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="font-mono text-amber-600 text-base">Rp 52.200</span>
                  </div>
                </div>

                {/* Formula Floating Indicator */}
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center gap-2.5 text-xs text-blue-800">
                  <Calculator size={16} className="text-blue-600 shrink-0" />
                  <div className="text-[11px]">
                    <span className="font-bold block">Rumus Hitung Otomatis Aktif</span>
                    <span className="text-blue-600 font-mono">
                      (Subtotal - Diskon 10%) = Grand Total
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. USE CASES SECTION (Interaktif saat Scroll / Hover Card)          */}
      {/* =================================================================== */}
      <section className="py-14 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              Cocok Untuk Berbagai Usaha
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bisa Digunakan untuk Apapun Kebutuhanmu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Case 1: F&B / Warung */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Store size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                  Warung, Toko & Kafe
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Cetak struk kasir cepat langsung dari HP. Hitung total belanjaan, diskon, hingga uang kembalian pembeli secara akurat.
                </p>
              </div>
              <ul className="space-y-1.5 border-t border-slate-200/80 pt-3 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" /> Support Struk Thermal (58mm/80mm)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" /> Hitung Kembalian Otomatis
                </li>
              </ul>
            </div>

            {/* Case 2: Hotel / Penginapan */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Hotel size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                  Penginapan & Jasa
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Bikin invoice resmi ukuran A4. Bebas tambah kolom No. Kamar, Lama Menginap, serta hitungan Pajak atau Service Charge.
                </p>
              </div>
              <ul className="space-y-1.5 border-t border-slate-200/80 pt-3 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" /> Format Cetak Kertas Lebar (A4)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" /> Rumus Hitung Pajak Otomatis
                </li>
              </ul>
            </div>

            {/* Case 3: Split Bill */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Users size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                  Patungan / Split Bill
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Bagi tagihan makan bareng teman dengan rapi. Tidak butuh nama toko formal, tinggal catat siapa pesan apa dan bayar berapa.
                </p>
              </div>
              <ul className="space-y-1.5 border-t border-slate-200/80 pt-3 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" /> Praktis Tanpa Nama Usaha
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" /> Rincian Tagihan Jelas & Transparan
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. CORE FEATURES SECTION (Interaktif saat Hover Card)               */}
      {/* =================================================================== */}
      <section className="py-14 md:py-20 bg-slate-50/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              Keunggulan ModuBill
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mudah Digunakan Tanpa Perlu Keahlian Khusus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2.5 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <LayoutGrid size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Kolom Tabel Bebas Diatur
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Tambah, hapus, dan ganti nama kolom tabel sesukamu. Mau kolom angka, nama item, atau harga tinggal pilih.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2.5 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <Calculator size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Hitungan Otomatis
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Tidak perlu kalkulator manual. Cukup tentukan rumus sederhana lewat pilihan dropdown, angka langsung terhitung sendiri.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2.5 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <Printer size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Siap Cetak Kertas Struk & A4
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Mendukung cetak ke printer kasir thermal ukuran 58mm/80mm maupun printer biasa ukuran A4/Letter.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. PRE-FOOTER CTA SECTION                                           */}
      {/* =================================================================== */}
      <section className="py-14 md:py-20 bg-blue-600 text-white select-none">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          
          <div className="inline-flex items-center justify-center p-3 bg-white backdrop-blur-sm border border-white/20 rounded-2xl mb-1 hover:scale-105 transition-transform">
            <ModuBillLogo variant="icon" size={36} />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Mulai Bikin Struk Pertama Anda Sekarang
          </h2>

          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Daftar gratis dalam hitungan detik dan nikmati kemudahan mencatat transaksi usaha Anda.
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              href="/register"
              className="px-8 py-3.5 text-sm sm:text-base font-bold text-blue-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-blue-600 hover:-translate-y-0.5"
            >
              Mulai Pakai ModuBill Gratis
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}