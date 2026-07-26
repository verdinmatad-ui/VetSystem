"use client";

import { useState } from "react";
import { getAppointmentsReport } from "@/app/actions/reports";
import { FileDown, AlertCircle } from "lucide-react";
import { generateAppointmentsPDF } from "@/lib/pdf/appointments";

type AppliedFilters = { dateFrom: string; dateTo: string; status?: string };

export default function AppointmentsReportClient() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
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
    const filters: AppliedFilters = { dateFrom, dateTo, status: status || undefined };
    const data = await getAppointmentsReport(filters);
    setResults(data);
    setAppliedFilters(filters);
    setGenerated(true);
    setLoading(false);
  }

  // Agrupado por mascota, igual que en el PDF: el nombre solo aparece
  // en la primera cita de cada mascota.
  const sorted = [...results].sort((a, b) => {
    const petA = a.pet.name as string;
    const petB = b.pet.name as string;
    if (petA !== petB) return petA.localeCompare(petB);
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  let lastPet: string | null = null;
  const rows = sorted.map((appt) => {
    const showPet = appt.pet.name !== lastPet;
    lastPet = appt.pet.name;
    return { appt, showPet };
  });

  const statusColor = (st: string) =>
    st === "completed" ? "text-emerald-600" : st === "cancelled" ? "text-red-500" : "text-yellow-600";

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
            <label className="text-sm font-medium text-zinc-600">Estado (opcional)</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
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
            <button onClick={() => generateAppointmentsPDF(results, appliedFilters)}
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
            <p className="text-xs font-semibold text-zinc-800 uppercase tracking-wide mt-1">Reporte de citas</p>
            <p className="text-xs text-zinc-400 mt-1">
              Desde {appliedFilters.dateFrom} hasta {appliedFilters.dateTo}
              {appliedFilters.status ? `  •  Status: ${appliedFilters.status}` : ""}
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center italic py-6">No se encontraron citas para los filtros seleccionados</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Mascota</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Fecha</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Hora</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Dueño</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2 pr-3">Motivo</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ appt, showPet }) => (
                  <tr key={appt.id} className="border-b border-zinc-100 align-top">
                    <td className={`py-2 pr-3 whitespace-nowrap ${showPet ? "font-semibold text-zinc-800" : "text-zinc-400"}`}>
                      {showPet ? `${appt.pet.name} (${appt.pet.species})` : ""}
                    </td>
                    <td className="py-2 pr-3 text-zinc-600 whitespace-nowrap">
                      {new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-2 pr-3 text-zinc-600 whitespace-nowrap">
                      {new Date(appt.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2 pr-3 text-zinc-700">{appt.pet.owner.name}</td>
                    <td className="py-2 pr-3 text-zinc-700">{appt.reason}</td>
                    <td className={`py-2 font-medium ${statusColor(appt.status)}`}>{appt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="text-[11px] italic text-zinc-400 text-center mt-5 pt-3 border-t border-zinc-100">
            Generado {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
            {"  •  "}
            {rows.length} cita{rows.length !== 1 ? "s" : ""} en total
          </p>
        </div>
      )}
    </div>
  );
}