"use client";

import { useState, useEffect } from "react";
import { createAppointment } from "@/app/actions/appointments";
import { getPets } from "@/app/actions/pets";
import { useRouter } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import Breadcrumb from "@/components/breadcrumb";
import toast from "react-hot-toast";

export default function NewAppointmentPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    getPets().then(setPets);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createAppointment(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Cita agendada correctamente");
    router.push("/appointments");
  }

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb items={[
        { label: "Appointments", href: "/appointments" },
        { label: "Nueva cita" },
      ]} />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Nueva cita</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        {pets.length === 0 ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Registra una mascota antes de agendar una cita
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="petId" className="text-sm font-medium text-zinc-600">Mascota</label>
              <select id="petId" name="petId" required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition">
                <option value="">Selecciona una mascota</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {pet.species} ({pet.owner.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="date" className="text-sm font-medium text-zinc-600">Fecha y hora</label>
              <input id="date" name="date" type="datetime-local" required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reason" className="text-sm font-medium text-zinc-600">Motivo</label>
              <textarea id="reason" name="reason" rows={3} placeholder="Motivo de la visita..." required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                <Save className="w-4 h-4" />
                {loading ? "Guardando..." : "Agendar cita"}
              </button>
              <CancelButton />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}