"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastMethods {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

interface ToastContextType {
  toast: ToastMethods;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  info: 4000,
  error: 5000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATIONS[type]);
    },
    [removeToast]
  );

  const toastHelpers = useMemo<ToastMethods>(
    () => ({
      success: (message: string) => addToast("success", message),
      error: (message: string) => addToast("error", message),
      info: (message: string) => addToast("info", message),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: toastHelpers }}>
      {children}

      {/* Container Toast Fixed - Posisi Mobile dinaikkan (bottom-20) agar tidak menutupi navigasi */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-20 right-4 sm:bottom-5 sm:right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastMethods {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam <ToastProvider>");
  }
  return context.toast;
}

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  const typeConfigs = {
    success: {
      borderColor: "var(--color-success, #10B981)",
      icon: <CheckCircle2 className="w-5 h-5 shrink-0 text-[#10B981]" />,
    },
    error: {
      borderColor: "var(--color-danger, #EF4444)",
      icon: <AlertCircle className="w-5 h-5 shrink-0 text-[#EF4444]" />,
    },
    info: {
      borderColor: "var(--color-primary, #2563EB)",
      icon: <Info className="w-5 h-5 shrink-0 text-[#2563EB]" />,
    },
  };

  const config = typeConfigs[item.type];

  return (
    <div
      style={{
        borderLeftColor: config.borderColor,
        backgroundColor: "var(--color-surface, #F8FAFC)",
        color: "var(--color-text-primary, #0F172A)",
      }}
      className="pointer-events-auto flex items-start justify-between gap-3 p-3.5 border border-[var(--color-border,#E2E8F0)] border-l-4 rounded-lg animate-in fade-in slide-in-from-bottom-3 duration-200 select-none shadow-sm sm:shadow-none"
    >
      <div className="flex items-start gap-2.5">
        {config.icon}
        <p className="text-xs sm:text-sm font-medium leading-snug pt-0.5">
          {item.message}
        </p>
      </div>

      <button
        onClick={onClose}
        type="button"
        className="p-1 -mr-1 -mt-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}