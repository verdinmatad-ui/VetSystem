"use client";

import { useState, useEffect } from "react";
import {
  updateAppointment,
  getAppointmentById,
} from "@/app/actions/appointments";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import Breadcrumb from "@/components/breadcrumb";
import toast from "react-hot-toast";

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    getAppointmentById(id).then(setAppointment);
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("petId", String(appointment.petId));
    const result = await updateAppointment(id, formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Cita actualizada correctamente");
    router.push(`/appointments/${id}`);
  }

  if (!appointment)
    return <div className="p-8 text-sm text-zinc-400">Loading...</div>;

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb
        items={[
          { label: "Appointments", href: "/appointments" },
          {
            label: `${appointment.pet.name} - ${new Date(appointment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, href: `/appointments/${id}` },
          { label: "Editar" },
        ]}
      />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">
          Editar cita
        </h1>
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
            <label className="text-sm font-medium text-zinc-600">Mascota</label>
            <div className="px-4 py-2.5 rounded-xl border border-zinc-100 bg-zinc-50 text-sm text-zinc-500">
              {appointment.pet.name} - {appointment.pet.species}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="date" className="text-sm font-medium text-zinc-600">
              Fecha y hora
            </label>
            <input
              id="date"
              name="date"
              type="datetime-local"
              required
              defaultValue={new Date(appointment.date)
                .toISOString()
                .slice(0, 16)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="reason"
              className="text-sm font-medium text-zinc-600"
            >
              Motivo
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              required
              defaultValue={appointment.reason}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <CancelButton href={`/appointments/${id}`} />
          </div>
        </form>
      </div>
    </div>
  );
}
