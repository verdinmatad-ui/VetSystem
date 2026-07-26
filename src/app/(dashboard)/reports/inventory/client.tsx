"use client";

import { Fragment, useState } from "react";
import { getInventoryMovementsReport } from "@/app/actions/reports";
import { FileDown, AlertCircle } from "lucide-react";
import { generateInventoryPDF } from "@/lib/pdf/inventory";

const CATEGORY_LABELS: Record<string, string> = {
  medical: "Medical",
  operational: "Operational",
};

type AppliedFilters = { dateFrom: string; dateTo: string; category?: string };

export default function InventoryReportClient() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  // Snapshot de los filtros usados en la última generación.
  // El preview lee de aquí, no del state en vivo de los inputs,
  // para que no se desincronice al cambiar un filtro sin regenerar.
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null);

  async function handleGenerate() {
    if (!dateFrom || !dateTo) { setError("La fecha inicial y final son obligatorias"); return; }
    setError("");
    setLoading(true);
    const filters: AppliedFilters = { dateFrom, dateTo, category: category || undefined };
    const data = await getInventoryMovementsReport(filters);
    setResults(data);
    setAppliedFilters(filters);
    setGenerated(true);
    setLoading(false);
  }

  // Agrupado por categoría, igual que en el PDF: la etiqueta solo aparece
  // en la primera fila de cada grupo.
  const sorted = [...results].sort((a, b) => {
    const catA = a.item.category as string;
    const catB = b.item.category as string;
    if (catA !== catB) return catA.localeCompare(catB);
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  let lastCategory: string | null = null;
  const rows = sorted.map((mov) => {
    const cat = mov.item.category as string;
    const showCategory = cat !== lastCategory;
    lastCategory = cat;
    return { mov, showCategory };
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Filtros</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-600">Desde <span className="text-red-400">*</span></label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-600">Hasta <span className="text-red-400">*</span></label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-600">Categoría (opcional)</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
              <option value="">Todas las categorías</option>
              <option value="medical">Médica</option>
              <option value="operational">Operacional</option>
            </select>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mt-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <button onClick={handleGenerate} disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            {loading ? "Generando..." : "Generar reporte"}
          </button>
          {generated && results.length > 0 && appliedFilters && (
            <button onClick={() => generateInventoryPDF(results, appliedFilters)}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <FileDown className="w-4 h-4" />
              Exportar a PDF
            </button>
          )}
        </div>
      </div>

      {generated && appliedFilters && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center mb-5 pb-4 border-b border-zinc-800">
            <p className="text-sm font-semibold text-emerald-600">VetSystem</p>
            <p className="text-xs font-semibold text-zinc-800 uppercase tracking-wide mt-1">Reporte de movimientos de inventario</p>
            <p className="text-xs text-zinc-400 mt-1">
              Desde {appliedFilters.dateFrom} hasta {appliedFilters.dateTo}
              {appliedFilters.category
                ? `  •  Category: ${CATEGORY_LABELS[appliedFilters.category] ?? appliedFilters.category}`
                : ""}
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center italic py-6">No se encontraron movimientos para los filtros seleccionados</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Categoría</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Artículo</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Fecha</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Tipo</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Cantidad</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2">Por</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ mov, showCategory }) => (
                  <Fragment key={mov.id}>
                    <tr className="border-b border-zinc-100 align-top">
                      <td className={`py-2 pr-3 whitespace-nowrap ${showCategory ? "font-semibold text-zinc-800" : "text-zinc-400"}`}>
                        {showCategory ? CATEGORY_LABELS[mov.item.category] ?? mov.item.category : ""}
                      </td>
                      <td className="py-2 pr-3 text-zinc-700">{mov.item.name}</td>
                      <td className="py-2 pr-3 text-zinc-600 whitespace-nowrap">
                        {new Date(mov.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-2 pr-3">
                        <span className={mov.type === "in" ? "text-emerald-600" : "text-red-500"}>
                          {mov.type === "in" ? "Entrada" : "Salida"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-zinc-700 whitespace-nowrap">{mov.quantity} {mov.item.unit}</td>
                      <td className="py-2 text-zinc-500">{mov.user.name}</td>
                    </tr>
                    {mov.notes && (
                      <tr className="border-b border-zinc-100">
                        <td></td>
                        <td colSpan={5} className="pb-2 text-xs italic text-zinc-400">Nota: {mov.notes}</td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}

          <p className="text-[11px] italic text-zinc-400 text-center mt-5 pt-3 border-t border-zinc-100">
            Generado {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
            {"  •  "}
            {rows.length} movimiento{rows.length !== 1 ? "s" : ""} en total
          </p>
        </div>
      )}
    </div>
  );
}