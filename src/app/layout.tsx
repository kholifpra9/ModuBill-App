import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ModuBill — Pembuat Struk & Invoice Fleksibel',
  description: 'Buat struk dan invoice dengan kolom dan rumus yang bisa dikustomisasi sendiri. Mudah, cepat, dan tanpa ribet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-700">
        {children}
      </body>
    </html>
  );
}