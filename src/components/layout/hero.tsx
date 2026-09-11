'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="py-16 md:py-24 bg-slate-50/50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100 rounded-md">
          Aplikasi Struk & Invoice Custom
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
          Buat Struk & Invoice dengan Kolom dan Rumus Sendiri
        </h1>
        
        <p className="text-base md:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
          Bukan template kaku. Atur sendiri kolom data, cara menghitung total, diskon, hingga pajak sesuai kebutuhan bisnis Anda.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center"
          >
            Mulai Buat Struk Gratis
          </Link>
          <a
            href="#demo"
            className="px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-center"
          >
            Coba Live Demo
          </a>
        </div>
      </div>
    </section>
  );
}