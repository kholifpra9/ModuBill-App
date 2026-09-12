"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ModuBillLogo from "@/components/ui/modubilllogo";
import LogoutConfirmModal from "@/components/layout/logout-confirm-modal";
import { createClient } from "@/lib/supabase/client";

import {
  FileCode2,
  Receipt,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Navigasi Utama Dashboard (PRD §4 & §7)
  const navItems = [
    { name: "Template", href: "/templates", icon: FileCode2 },
    { name: "Transaksi", href: "/transactions", icon: Receipt },
    { name: "Riwayat", href: "/history", icon: History },
    { name: "Pengaturan", href: "/settings", icon: Settings },
  ];

  // Handler Konfirmasi Logout Supabase
  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      
      setIsLogoutModalOpen(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. DESKTOP SIDEBAR (md:flex)                                  */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`hidden md:flex flex-col justify-between h-screen bg-slate-50 border-r border-slate-200 sticky top-0 transition-all duration-300 select-none ${
          isCollapsed ? "w-20 p-3" : "w-64 p-4"
        }`}
      >
        <div>
          {/* Header & Logo Toggle */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <Link href="/templates" className="flex items-center overflow-hidden cursor-pointer">
              <ModuBillLogo
                variant={isCollapsed ? "icon" : "full"}
                size={28}
              />
            </Link>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer focus:outline-none"
              title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigasi Utama */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-100/70 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`shrink-0 ${
                      isActive ? "text-blue-600" : "text-slate-500"
                    }`}
                    size={20}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Action (Desktop) */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            title={isCollapsed ? "Keluar" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer focus:outline-none"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MOBILE BOTTOM NAVIGATION (Tampil Hanya di Mobile < 768px)   */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around select-none shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "text-blue-600 font-bold bg-blue-50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-500"} />
              <span className="text-[10px] mt-1 tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* Tombol Logout Tambahan di Mobile Bar */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-red-500 hover:text-red-700 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="text-[10px] mt-1 tracking-tight">Keluar</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MODAL KONFIRMASI LOGOUT                                    */}
      {/* ------------------------------------------------------------- */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isLoading={isLoggingOut}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Sidebar;