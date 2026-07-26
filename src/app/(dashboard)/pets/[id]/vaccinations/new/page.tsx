"use client";

import { useEffect, useState } from "react";
import { createVaccination } from "@/app/actions/medical";
import type { ActionResponse } from "@/lib/validation";
import { FormError, FieldError } from "@/components/form-error";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import { getPetById } from "@/app/actions/pets";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/breadcrumb";

export default function NewVaccinationPage() {
  const router = useRouter();
  const params = useParams();
  const petId = parseInt(params.id as string);
  const [response, setResponse] = useState<ActionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    getPetById(petId).then((p) => setPetName(p?.name || ""));
  }, [petId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    const formData = new FormData(e.currentTarget);
    const result = await createVaccination(petId, formData);
    if (!result.success) {
      setResponse(result);
      setLoading(false);
      return;
    }
    toast.success("Vacunación registrada correctamente");
    router.push(`/pets/${petId}/vaccinations`);
  }

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb
        items={[
          { label: "Pets", href: "/pets" },
          { label: petName || "...", href: `/pets/${petId}` },
          { label: "Historial de vacunación", href: `/pets/${petId}/vaccinations` },
          { label: "Nueva vacunación" },
        ]}
      />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Nueva vacunación</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {response && !response.success && (
            <FormError error={response.error} fieldErrors={response.fieldErrors} />
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="vaccineName"
              className="text-sm font-medium text-zinc-600"
            >
              Nombre de la vacuna
            </label>
            <input
              id="vaccineName"
              name="vaccineName"
              type="text"
              placeholder="Rabies"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <FieldError fieldName="vaccineName" fieldErrors={response?.fieldErrors} />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="dateApplied"
              className="text-sm font-medium text-zinc-600"
            >
              Fecha aplicada
            </label>
            <input
              id="dateApplied"
              name="dateApplied"
              type="date"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <FieldError fieldName="dateApplied" fieldErrors={response?.fieldErrors} />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="nextDoseDate"
              className="text-sm font-medium text-zinc-600"
            >
              Fecha de la próxima dosis{" "}
              <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <input
              id="nextDoseDate"
              name="nextDoseDate"
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <FieldError fieldName="nextDoseDate" fieldErrors={response?.fieldErrors} />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar vacunación"}
            </button>
            <CancelButton />
          </div>
        </form>
      </div>
    </div>
  );
}
