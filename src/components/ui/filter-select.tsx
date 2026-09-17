"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Filter } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  options: FilterOption[];
  paramKey: string;
  placeholder?: string;
}

export function FilterSelect({
  options,
  paramKey,
  placeholder = "Semua Filter",
}: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentValue = searchParams.get(paramKey) ?? "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    
    // Setiap kali ganti filter, reset halaman ke 1
    params.set("page", "1");

    if (value) {
      params.set(paramKey, value);
    } else {
      params.delete(paramKey);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full sm:w-48">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Filter size={14} />
      </div>
      <select
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-8 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-colors focus:outline-none cursor-pointer appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}