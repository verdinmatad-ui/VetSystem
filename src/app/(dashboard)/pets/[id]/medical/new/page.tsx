"use client";

import { useEffect, useState } from "react";
import { createMedicalRecord } from "@/app/actions/medical";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import toast from "react-hot-toast";
import { getPetById } from "@/app/actions/pets";
import Breadcrumb from "@/components/breadcrumb";

export default function NewMedicalRecordPage({
  searchParams,
}: {
  searchParams?: { from?: string; appointmentId?: string };
}) {
  const fromAppointment = searchParams?.from === "appointment";
  const router = useRouter();
  const params = useParams();
  const petId = parseInt(params.id as string);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    getPetById(petId).then((p) => setPetName(p?.name || ""));
  }, [petId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createMedicalRecord(petId, formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Registro médico guardado correctamente");
    router.push(`/pets/${petId}/medical`);
  }

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb
        items={[
          { label: "Pets", href: "/pets" },
          { label: petName || "...", href: `/pets/${petId}` },
          { label: "Historial médico", href: `/pets/${petId}/medical` },
          { label: "Nuevo registro" },
        ]}
      />
      {fromAppointment && (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-sm px-4 py-3 rounded-xl mb-4">
      Creando registro médico desde una cita completada
    </div>
  )}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">
          Nuevo registro médico
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="date"
                className="text-sm font-medium text-zinc-600"
              >
                Fecha
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="weight"
                className="text-sm font-medium text-zinc-600"
              >
                Peso (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                placeholder="3.8"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="diagnosis"
              className="text-sm font-medium text-zinc-600"
            >
              Diagnóstico
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              rows={3}
              placeholder="Enter diagnosis..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="treatment"
              className="text-sm font-medium text-zinc-600"
            >
              Tratamiento
            </label>
            <textarea
              id="treatment"
              name="treatment"
              rows={3}
              placeholder="Enter treatment..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-zinc-600"
            >
              Notas{" "}
              <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Additional notes..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar registro"}
            </button>
            <CancelButton />
          </div>
        </form>
      </div>
    </div>
  );
}
