"use client";

import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";

interface AppointmentFiltersProps {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function AppointmentFilters({ status, dateFrom, dateTo }: AppointmentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const current = { status, dateFrom, dateTo, ...updates };
    Object.entries(current).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  const hasFilters = status || dateFrom || dateTo;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center gap-3 flex-wrap">
      {/* Status filters */}
      <div className="flex items-center gap-2">
        {["pending", "completed", "cancelled"].map((s) => (
          <button key={s}
            onClick={() => updateParams({ status: status === s ? undefined : s })}
            className={
              "text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize " +
              (status === s
                ? s === "completed" ? "bg-green-50 border-green-200 text-green-700"
                  : s === "cancelled" ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-yellow-50 border-yellow-200 text-yellow-600"
                : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100")
            }>
            {s}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-zinc-200" />

      {/* Date range */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">Desde</span>
        <input type="date" defaultValue={dateFrom}
          onChange={(e) => updateParams({ dateFrom: e.target.value || undefined })}
          className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
        <span className="text-xs text-zinc-400">Hasta</span>
        <input type="date" defaultValue={dateTo}
          onChange={(e) => updateParams({ dateTo: e.target.value || undefined })}
          className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
      </div>

      {hasFilters && (
        <button onClick={() => router.replace(pathname)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors ml-auto">
          <X className="w-3 h-3" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}