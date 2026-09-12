"use client";

import React from "react";
import Link from "next/link";
import ModuBillLogo from "@/components/ui/modubilllogo";
import {
  Sparkles,
  Calculator,
  LayoutGrid,
  Printer,
  Store,
  Hotel,
  Users,
  CheckCircle2,
  ArrowRight,
  Receipt,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* =================================================================== */}
      {/* 1. HERO SECTION                                                     */}
      {/* =================================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <span>Format & Rumus Transaksi Bebas Atur Sendiri</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Bikin Struk & Invoice{" "}
                <span className="text-blue-600 underline decoration-amber-400 decoration-4 underline-offset-4">
                  Se-Modular
                </span>{" "}
                Bisnismu.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Bukan template kaku. Atur kolom tabel, tentukan rumus hitung otomatis (Diskon, Pajak, Kembalian), dan cetak transaksi dalam hitungan detik.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span>Mulai Buat Gratis</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center"
                >
                  Masuk ke Akun
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium pt-4">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" /> Tanpa Kartu Kredit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" /> Setup Fleksibel
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" /> Support Struk Thermal
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Demo Mockup (Flat UI) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm">
                
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <ModuBillLogo variant="icon" size={24} />
                    <span className="font-bold text-slate-800 text-sm">Kopi ModuBill</span>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    INV-20260912-01
                  </span>
                </div>

                {/* Table Mockup */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="grid grid-cols-12 font-semibold text-slate-500 pb-1 border-b border-slate-100">
                    <span className="col-span-6">Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-4 text-right">Total</span>
                  </div>
                  <div className="grid grid-cols-12 text-slate-700 py-1">
                    <span className="col-span-6 font-medium">Es Kopi Susu Aren</span>
                    <span className="col-span-2 text-center text-slate-500">2</span>
                    <span className="col-span-4 text-right font-mono">Rp 36.000</span>
                  </div>
                  <div className="grid grid-cols-12 text-slate-700 py-1">
                    <span className="col-span-6 font-medium">Croissant Butter</span>
                    <span className="col-span-2 text-center text-slate-500">1</span>
                    <span className="col-span-4 text-right font-mono">Rp 22.000</span>
                  </div>
                </div>

                {/* Summary Section Mockup */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono">Rp 58.000</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Diskon Member (10%)</span>
                    <span className="font-mono">-Rp 5.800</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="font-mono text-amber-600">Rp 52.200</span>
                  </div>
                </div>

                {/* Formula Floating Badge */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center gap-2.5 text-xs text-blue-800">
                  <Calculator size={18} className="text-blue-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Rumus Otomatis Aktif</span>
                    <span className="text-[11px] text-blue-600 font-mono">
                      (Subtotal - Diskon) = Grand Total
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. USE CASES SECTION (PRD §2 & §6.0)                                */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">
              Solusi Untuk Segala Kebutuhan
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dirancang Fleksibel untuk Berbagai Usaha & Kebutuhan Kasual
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Case 1: F&B / Warung */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 font-bold">
                  <Store size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Warung & Kafe Kecil
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Cetak struk kasir cepat dari smartphone. Atur kolom Qty, Harga, Diskon instan, hingga Kembalian tanpa ribet.
                </p>
              </div>
              <ul className="space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" /> Cetak Thermal 58mm / 80mm
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" /> Hitung Kembalian Otomatis
                </li>
              </ul>
            </div>

            {/* Case 2: Hotel / Penginapan */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 font-bold">
                  <Hotel size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Penginapan & Homestay
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Invoice formal orientasi A4. Tambahkan kolom khusus seperti No. Kamar, Jumlah Malam, dan Pajak Layanan.
                </p>
              </div>
              <ul className="space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" /> Layout Kertas Lebar (A4)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" /> Rumus Pajak & Service Charge
                </li>
              </ul>
            </div>

            {/* Case 3: Split Bill */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 font-bold">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Kasual & Split Bill
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Bagi tagihan makan bersama teman dengan adil. Bebas nama usaha formal, cukup catat siapa pesan apa dan bayar berapa.
                </p>
              </div>
              <ul className="space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" /> Tanpa Profil Bisnis Wajib
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" /> Pembagian Rincian Cepat
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. CORE FEATURES SECTION (PRD §3 & §6.4-6.6)                        */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 bg-slate-50/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">
              Fitur Utama
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Kendali Penuh Atas Struktur Dokumen Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <LayoutGrid size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Custom Column Builder
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tambah, hapus, dan urutkan kolom sesuai kebutuhan. Pilih tipe data angka, teks, mata uang, atau hasil hitungan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calculator size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Formula Engine Tanpa Coding
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Hubungkan antar kolom cukup dengan memilih menu dropdown. Rumus matematika (kali, bagi, SUM) terhitung secara otomatis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Printer size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Multi Format Orientasi
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dukungan format struk kertas kasir kecil (Thermal 58mm/80mm) hingga invoice profesional ukuran A4.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. PRE-FOOTER CTA SECTION (PRD §6.0)                                */}
      {/* =================================================================== */}
      <section className="py-16 md:py-20 bg-blue-600 text-white select-none">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/40 rounded-2xl mb-2">
            <Receipt size={36} className="text-amber-300" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Siap Membuat Struk & Invoice Pertama Anda?
          </h2>

          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Daftar sekarang dalam hitungan detik. Tanpa biaya tersembunyi, langsung nikmati kemudahan pembuatan dokumen transaksi modular.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              href="/register"
              className="px-8 py-4 text-base font-bold text-blue-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              Mulai Pakai ModuBill Gratis
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}