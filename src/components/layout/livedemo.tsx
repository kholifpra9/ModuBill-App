'use client';

import { useState } from 'react';

export default function LiveDemo() {
  const [items, setItems] = useState([
    { id: 1, name: 'Kopi Susu Gula Aren', qty: 2, price: 18000 },
    { id: 2, name: 'Roti Bakar Cokelat', qty: 1, price: 15000 },
  ]);

  const [discount, setDiscount] = useState(5000);
  const [pay, setPay] = useState(60000);

  const updateQty = (id: number, qty: number) => {
    setItems(items.map(item => item.id === id ? { ...item, qty: Math.max(1, qty) } : item));
  };

  const updatePrice = (id: number, price: number) => {
    setItems(items.map(item => item.id === id ? { ...item, price: Math.max(0, price) } : item));
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const change = Math.max(0, pay - grandTotal);

  return (
    <section id="demo" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Simulasi Input Transaksi Live
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Ubah jumlah atau harga item di bawah. Semua rumus (Total, Subtotal, Kembalian) dihitung secara instan.
          </p>
        </div>

        <div className="flat-card p-6 md:p-8 bg-white">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block">Preview Struk Kasir</span>
              <h3 className="text-lg font-bold text-slate-900">Kopi Kawa ModuBill</h3>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-semibold">
              Kertas 58mm
            </span>
          </div>

          {/* Table Items */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="pb-3 min-w-[160px]">Nama Item</th>
                  <th className="pb-3 w-24">Qty</th>
                  <th className="pb-3 w-32">Harga (Rp)</th>
                  <th className="pb-3 text-right w-32">Total (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="py-3">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 0)}
                        className="flat-input w-20 text-center"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updatePrice(item.id, parseInt(e.target.value) || 0)}
                        className="flat-input w-28"
                      />
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-700">
                      {(item.qty * item.price).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary / Formula Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal (SUM)</span>
              <span className="font-semibold text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Diskon (Manual)</span>
              <div className="flex items-center gap-2">
                <span>Rp</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                  className="flat-input w-28 text-right"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-base">Grand Total</span>
              <span className="text-2xl font-black text-amber-600">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-slate-600">Bayar (Uang Diterima)</span>
              <div className="flex items-center gap-2">
                <span>Rp</span>
                <input
                  type="number"
                  value={pay}
                  onChange={(e) => setPay(parseInt(e.target.value) || 0)}
                  className="flat-input w-28 text-right"
                />
              </div>
            </div>

            <div className="flex justify-between text-sm font-semibold text-emerald-600 pt-1">
              <span>Kembalian</span>
              <span>Rp {change.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}