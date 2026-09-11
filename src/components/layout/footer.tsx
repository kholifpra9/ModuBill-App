export default function Footer() {
  return (
    <footer className="bg-slate-50 py-10 border-t border-slate-200 text-center text-sm text-slate-500">
      <div className="max-w-6xl mx-auto px-4">
        <p className="mb-2 font-semibold text-slate-700">ModuBill</p>
        <p>© {new Date().getFullYear()} ModuBill. Aplikasi Web Struk & Invoice Fleksibel.</p>
      </div>
    </footer>
  );
}