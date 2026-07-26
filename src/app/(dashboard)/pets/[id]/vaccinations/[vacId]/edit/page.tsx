"use client";

import { useState, useEffect } from "react";
import { updateVaccination, getVaccinationById } from "@/app/actions/medical";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import { getPetById } from "@/app/actions/pets";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/breadcrumb";

export default function EditVaccinationPage() {
  const router = useRouter();
  const params = useParams();
  const petId = parseInt(params.id as string);
  const vacId = parseInt(params.vacId as string);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [vaccination, setVaccination] = useState<any>(null);
  const [petName, setPetName] = useState("");
  

  useEffect(() => {
    getPetById(petId).then((p) => setPetName(p?.name || ""));
    getVaccinationById(vacId).then(setVaccination);
  }, [vacId, petId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await updateVaccination(vacId, petId, formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Vacunación actualizada correctamente");
    router.push(`/pets/${petId}/vaccinations`);
  }

  if (!vaccination) return <div className="p-8 text-sm text-zinc-400">Loading...</div>;

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb items={[
  { label: "Pets", href: "/pets" },
  { label: petName || "...", href: `/pets/${petId}` },
  { label: "Historial de vacunación", href: `/pets/${petId}/vaccinations` },
  { label: "Editar vacunación" },
]} />
<div className="flex items-center gap-3 mb-6">
  <BackButton />
  <h1 className="text-xl font-semibold text-zinc-800">Editar vacunación</h1>
</div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="vaccineName" className="text-sm font-medium text-zinc-600">Nombre de la vacuna</label>
            <input id="vaccineName" name="vaccineName" type="text" required
              defaultValue={vaccination.vaccineName}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dateApplied" className="text-sm font-medium text-zinc-600">Fecha aplicada</label>
            <input id="dateApplied" name="dateApplied" type="date" required
              defaultValue={new Date(vaccination.dateApplied).toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nextDoseDate" className="text-sm font-medium text-zinc-600">
              Fecha de la próxima dosis <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <input id="nextDoseDate" name="nextDoseDate" type="date"
              defaultValue={vaccination.nextDoseDate ? new Date(vaccination.nextDoseDate).toISOString().split("T")[0] : ""}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <CancelButton />
          </div>
        </form>
      </div>
    </div>
  );
}