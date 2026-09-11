export default function Features() {
  const features = [
    {
      title: "Desain Model Sendiri",
      desc: "Tentukan kolom apa saja yang perlu muncul di struk Anda. Maksimal hingga 20 kolom per model.",
    },
    {
      title: "Rumus Tanpa Koding",
      desc: "Hubungkan antar kolom cukup pilih dari dropdown. Tidak perlu menulis formula rumit.",
    },
    {
      title: "Input Cepat di Mobile",
      desc: "Form dirancang responsif dan ringan untuk pengisian cepat di kasir lewat smartphone atau tablet.",
    },
    {
      title: "Validasi Bebas Panik",
      desc: "Pesan petunjuk yang mudah dipahami orang awam tanpa istilah teknis database.",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Atur Templatmu, Pakai Berulang Kali
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Proses racik di awal, pemakaian harian super ringan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="flat-card p-5">
              <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-4 text-sm">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}