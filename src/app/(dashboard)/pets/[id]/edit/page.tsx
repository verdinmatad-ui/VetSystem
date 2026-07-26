"use client";

import { useState, useEffect } from "react";
import { updatePet, getPetById } from "@/app/actions/pets";
import { getOwners } from "@/app/actions/owners";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle, Upload } from "lucide-react";
import BackButton from "@/components/back-button";
import Link from "next/link";
import { FormError, FieldError } from "@/components/form-error";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/breadcrumb";
import type { ActionResponse } from "@/lib/validation";

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [response, setResponse] = useState<ActionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [pet, setPet] = useState<any>(null);
  const [owners, setOwners] = useState<any[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPetById(id), getOwners()]).then(([petData, ownersData]) => {
      setPet(petData);
      setOwners(ownersData);
      if (petData?.photoUrl) setPreview(petData.photoUrl);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    const formData = new FormData(e.currentTarget);
    const result = await updatePet(id, formData);
    
    if (result.success) {
      toast.success("Mascota actualizada correctamente");
      router.push(`/pets/${id}`);
    } else {
      setResponse(result);
      setLoading(false);
      toast.error(result.error);
    }
  }

  if (!pet) return <div className="p-8 text-sm text-zinc-400">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      {pet && (
        <Breadcrumb
          items={[
            { label: "Mascotas", href: "/pets" },
            { label: pet.name, href: `/pets/${id}` },
            { label: "Editar" },
          ]}
        />
      )}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Editar mascota</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {response && !response.success && (
            <FormError 
              error={response.error} 
              fieldErrors={response.fieldErrors}
            />
          )}

          {/* Photo upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-600">
              Foto (opcional)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <input
                name="photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
                className="text-sm text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 file:text-sm file:font-medium hover:file:bg-emerald-100 transition"
              />
            </div>
            <FieldError fieldName="photo" fieldErrors={response?.fieldErrors} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                id: "name",
                label: "Nombre de la mascota",
                type: "text",
                placeholder: "Luna",
                defaultValue: pet.name,
              },
              {
                id: "species",
                label: "Especie",
                type: "text",
                placeholder: "Gato",
                defaultValue: pet.species,
              },
              {
                id: "breed",
                label: "Raza",
                type: "text",
                placeholder: "Siames",
                defaultValue: pet.breed,
              },
              {
                id: "birthDate",
                label: "Fecha de nacimiento",
                type: "date",
                placeholder: "",
                defaultValue: new Date(pet.birthDate)
                  .toISOString()
                  .split("T")[0],
              },
            ].map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium text-zinc-600"
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <FieldError fieldName={field.id} fieldErrors={response?.fieldErrors} />
              </div>
            ))}

            <div className="space-y-1.5">
              <label
                htmlFor="gender"
                className="text-sm font-medium text-zinc-600"
              >
                Género
              </label>
              <select
                id="gender"
                name="gender"
                defaultValue={pet.gender}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                <option value="">Selecciona un género</option>
                <option value="male">Macho</option>
                <option value="female">Hembra</option>
              </select>
              <FieldError fieldName="gender" fieldErrors={response?.fieldErrors} />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ownerId"
                className="text-sm font-medium text-zinc-600"
              >
                Dueño
              </label>
              <select
                id="ownerId"
                name="ownerId"
                defaultValue={pet.ownerId}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
              <FieldError fieldName="ownerId" fieldErrors={response?.fieldErrors} />
            </div>
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
            <Link
              href={`/pets/${id}`}
              className="text-zinc-700 hover:text-zinc-900 text-sm font-medium px-5 py-2.5 rounded-xl border border-zinc-200 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

