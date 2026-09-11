export default function UseCases() {
  const cases = [
    {
      title: "Warung & Kafe Kecil",
      badge: "Kasir / F&B",
      desc: "Input transaksi cepat dari HP saat pembeli mengantre. Hitung otomatis subtotal, diskon, pajak, hingga uang kembalian.",
      tag: "Cetak Termal 58mm / 80mm",
    },
    {
      title: "Penginapan & Hotel Kecil",
      badge: "Sewa / Per Malam",
      desc: "Butuh format lebih formal? Tambahkan kolom nomor kamar, jumlah malam, dan biaya tambahan dengan orientasi kertas A4.",
      tag: "Format A4 / Letter",
    },
    {
      title: "Split Bill & Kasual",
      badge: "Penggunaan Pribadi",
      desc: "Catat pesanan rombongan atau patungan acara tanpa perlu nama usaha atau kop surat formal. Langsung isi dan bagikan.",
      tag: "Tanpa Ribet Setup",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Dirancang untuk Berbagai Kebutuhan
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Fleksibel untuk operasional harian UMKM maupun penggunaan kasual sehari-hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((item, idx) => (
            <div key={idx} className="flat-card p-6 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded mb-4">
                  {item.badge}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 text-xs font-medium text-slate-500">
                {item.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}