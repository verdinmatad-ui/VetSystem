"use client";

import { useState, useEffect } from "react";
import {
  updateMedicalRecord,
  getMedicalRecordById,
} from "@/app/actions/medical";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import toast from "react-hot-toast";
import { getPetById } from "@/app/actions/pets";
import Breadcrumb from "@/components/breadcrumb";

export default function EditMedicalRecordPage() {
  const router = useRouter();
  const params = useParams();
  const petId = parseInt(params.id as string);
  const recordId = parseInt(params.recordId as string);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    getMedicalRecordById(recordId).then(setRecord);
    getPetById(petId).then((p) => setPetName(p?.name || ""));
  }, [recordId, petId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await updateMedicalRecord(recordId, petId, formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Registro médico actualizado correctamente");
    router.push(`/pets/${petId}/medical`);
  }

  if (!record)
    return <div className="p-8 text-sm text-zinc-400">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb
        items={[
          { label: "Pets", href: "/pets" },
          { label: petName || "...", href: `/pets/${petId}` },
          { label: "Historial médico", href: `/pets/${petId}/medical` },
          { label: "Editar registro" },
        ]}
      />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">
          Editar registro médico
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
                defaultValue={new Date(record.date).toISOString().slice(0, 16)}
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
                required
                defaultValue={String(record.weight)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
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
              required
              defaultValue={record.diagnosis}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
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
              required
              defaultValue={record.treatment}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
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
              defaultValue={record.notes || ""}
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
            <CancelButton />
          </div>
        </form>
      </div>
    </div>
  );
}
