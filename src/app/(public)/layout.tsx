import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Navbar Atas */}
      <Navbar />

      {/* Konten Halaman Publik (Landing Page / Login / Register) */}
      <main className="flex-1">{children}</main>

      {/* Footer Landing Page */}
      <Footer />
    </div>
  );
}