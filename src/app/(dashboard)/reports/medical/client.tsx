"use client";

import { Fragment, useState } from "react";
import { getMedicalHistoryReport } from "@/app/actions/reports";
import { FileDown, AlertCircle } from "lucide-react";
import { generateMedicalPDF } from "@/lib/pdf/medical";
import BackButton from "@/components/back-button";

type AppliedFilters = { dateFrom?: string; dateTo?: string };

export default function MedicalReportClient({ pets }: { pets: any[] }) {
  const [petId, setPetId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  // Snapshot de filtros y mascota usados en la última generación.
  // El preview lee de aquí, no del state en vivo, para que no se
  // desincronice si el usuario cambia de mascota/fechas sin regenerar.
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null);
  const [appliedPet, setAppliedPet] = useState<any>(null);

  async function handleGenerate() {
    if (!petId) { setError("Selecciona una mascota"); return; }
    setError("");
    setLoading(true);
    const filters: AppliedFilters = { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined };
    const data = await getMedicalHistoryReport({
      petId: parseInt(petId),
      ...filters,
    });
    setResults(data);
    setAppliedFilters(filters);
    setAppliedPet(pets.find((p) => p.id === parseInt(petId)));
    setGenerated(true);
    setLoading(false);
  }

  // Ordenado por fecha descendente para el preview, igual que en el PDF
  const sorted = [...results].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Filtros</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-600">Mascota <span className="text-red-400">*</span></label>
            <select value={petId} onChange={(e) => setPetId(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
              <option value="">Selecciona una mascota</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>{pet.name} — {pet.species}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-600">Desde (opcional)</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-600">Hasta (opcional)</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
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
            <button onClick={() => generateMedicalPDF(results, appliedPet, appliedFilters)}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <FileDown className="w-4 h-4" />
              Exportar a PDF
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {generated && appliedFilters && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center mb-5 pb-4 border-b border-zinc-800">
            <p className="text-sm font-semibold text-emerald-600">VetSystem</p>
            <p className="text-xs font-semibold text-zinc-800 uppercase tracking-wide mt-1">Reporte de historial médico</p>
            <p className="text-xs text-zinc-400 mt-1">
              {appliedPet?.name} ({appliedPet?.species})
              {appliedFilters.dateFrom
                ? `  •  From ${appliedFilters.dateFrom}${appliedFilters.dateTo ? ` to ${appliedFilters.dateTo}` : ""}`
                : ""}
            </p>
          </div>

          {sorted.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center italic py-6">No se encontraron registros médicos para los filtros seleccionados</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Fecha</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Diagnóstico</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Tratamiento</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Peso</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((record) => (
                  <Fragment key={record.id}>
                    <tr className="border-b border-zinc-100 align-top">
                      <td className="py-2 pr-3 text-zinc-600 whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="py-2 pr-3 text-zinc-700">{record.diagnosis}</td>
                      <td className="py-2 pr-3 text-zinc-700">{record.treatment}</td>
                      <td className="py-2 pr-3 text-zinc-700 whitespace-nowrap">{String(record.weight)} kg</td>
                      <td className="py-2 text-zinc-500">{record.user.name}</td>
                    </tr>
                    {record.notes && (
                      <tr className="border-b border-zinc-100">
                        <td></td>
                        <td colSpan={4} className="pb-2 text-xs italic text-zinc-400">Nota: {record.notes}</td>
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
            {sorted.length} registro{sorted.length !== 1 ? "s" : ""} en total
          </p>
        </div>
      )}
    </div>
  );
}