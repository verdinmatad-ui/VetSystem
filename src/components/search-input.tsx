"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function SearchInput({ placeholder, defaultValue }: { placeholder: string; defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <input
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
      />
    </div>
  );
}