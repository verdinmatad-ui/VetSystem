"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";

export default function InventoryFilters({ q, category }: { q?: string; category?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const current = { q, category, ...updates };
    Object.entries(current).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    updateParams({ q: term || undefined });
  }, 300);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      <div className="flex items-center gap-2">
        {["medical", "operational"].map((c) => (
          <button key={c}
            onClick={() => updateParams({ category: category === c ? undefined : c })}
            className={
              "text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize " +
              (category === c
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100")
            }>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}