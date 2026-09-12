"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ModuBillLogo from "@/components/ui/modubilllogo";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated = false }) => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo (PRD §4 & §7) */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity hover:opacity-90 cursor-pointer shrink-0"
          aria-label="ModuBill Beranda"
        >
          {/* Logo Otomatis Menyesuaikan Responsif Ukuran di HP vs Desktop */}
          <div className="hidden sm:block">
            <ModuBillLogo variant="full" size={32} />
          </div>
          <div className="sm:hidden">
            <ModuBillLogo variant="full" size={26} />
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <Link
              href="/templates"
              className="px-3.5 py-2 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Ke Dashboard
            </Link>
          ) : (
            <>
              {pathname !== "/login" && (
                <Link
                  href="/login"
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Masuk
                </Link>
              )}
              {pathname !== "/register" && (
                <Link
                  href="/register"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Mulai Gratis
                </Link>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;