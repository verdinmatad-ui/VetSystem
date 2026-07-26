"use client";

import { useState, useEffect } from "react";
import { createPet } from "@/app/actions/pets";
import { getOwners } from "@/app/actions/owners";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, Upload } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/breadcrumb";

export default function NewPetPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    getOwners().then(setOwners);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createPet(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Mascota registrada correctamente");
    router.push("/pets");
  }

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb
        items={[{ label: "Mascotas", href: "/pets" }, { label: "Nueva mascota" }]}
      />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Nueva mascota</h1>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {owners.length === 0 ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Porfavor registra un dueño antes de registrar una mascota.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: "name",
                  label: "Nombre de la mascota",
                  type: "text",
                  placeholder: "Luna",
                },
                {
                  id: "species",
                  label: "Especie",
                  type: "text",
                  placeholder: "Gato",
                },
                {
                  id: "breed",
                  label: "Raza",
                  type: "text",
                  placeholder: "Siames",
                },
                {
                  id: "birthDate",
                  label: "Fecha de nacimiento",
                  type: "date",
                  placeholder: "",
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
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
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
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                >
                  <option value="">Selecciona un género</option>
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                </select>
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
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                >
                  <option value="">Selecciona un dueño</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? "Guardando..." : "Guardar mascota"}
              </button>
              <CancelButton />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
