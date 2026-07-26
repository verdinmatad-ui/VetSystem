"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, ArrowUpDown, X } from "lucide-react";

interface MedicalFiltersProps {
  q?: string;
  order?: string;
  weightOrder?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function MedicalFilters({
  q,
  order,
  weightOrder,
  dateFrom,
  dateTo,
}: MedicalFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const current = { q, order, weightOrder, dateFrom, dateTo, ...updates };
    Object.entries(current).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    updateParams({ q: term || undefined });
  }, 300);

  function clearFilters() {
    router.replace(pathname);
  }

  const hasFilters = q || order || weightOrder || dateFrom || dateTo;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por diagnóstico o tratamiento..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Date range */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-400">Desde</p>
          <input
            type="date"
            defaultValue={dateFrom}
            onChange={(e) =>
              updateParams({ dateFrom: e.target.value || undefined })
            }
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-400">Hasta</p>
          <input
            type="date"
            defaultValue={dateTo}
            onChange={(e) =>
              updateParams({ dateTo: e.target.value || undefined })
            }
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Date order */}
        <button
          onClick={() =>
            updateParams({
              order: order === "asc" ? undefined : "asc",
              weightOrder: undefined,
            })
          }
          className={
            "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors " +
            (order === "asc"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100")
          }
        >
          <ArrowUpDown className="w-3 h-3" />
          {order === "asc" ? "Más antiguo primero" : "Más nuevo primero"}
        </button>

        {/* Weight order */}
        <button
          onClick={() =>
            updateParams({
              weightOrder:
                weightOrder === "asc"
                  ? "desc"
                  : weightOrder === "desc"
                    ? undefined
                    : "asc",
              order: undefined,
            })
          }
          className={
            "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors " +
            (weightOrder
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100")
          }
        >
          <ArrowUpDown className="w-3 h-3" />
          {weightOrder === "asc"
            ? "Peso: menor a mayor"
            : weightOrder === "desc"
              ? "Peso: mayor a menor"
              : "Ordenar por peso"}
        </button>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
