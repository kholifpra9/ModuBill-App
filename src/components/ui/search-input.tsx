"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  paramKey?: string;
  debounceMs?: number;
}

export function SearchInput({
  placeholder = "Cari data...",
  paramKey = "q",
  debounceMs = 400,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentValue = searchParams.get(paramKey) ?? "";

  function commitSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    
    // Setiap pencarian baru, reset halaman ke 1
    params.set("page", "1");
    if (term.trim()) {
      params.set(paramKey, term);
    } else {
      params.delete(paramKey);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleChange(term: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => commitSearch(term), debounceMs);
  }

  function handleClear() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    commitSearch("");
  }

  return (
    <div className="relative w-full sm:w-64">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        {isPending ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Search size={16} />}
      </div>
      <input
        type="text"
        defaultValue={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-colors focus:outline-none"
      />
      {currentValue && (
        <button type="button" onClick={handleClear} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
          <X size={14} />
        </button>
      )}
    </div>
  );
}