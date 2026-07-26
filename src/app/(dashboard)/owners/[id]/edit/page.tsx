"use client";

import { useState, useEffect } from "react";
import { updateOwner, getOwnerById } from "@/app/actions/owners";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/breadcrumb";

export default function EditOwnerPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState<any>(null);

  useEffect(() => {
    getOwnerById(id).then(setOwner);
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await updateOwner(id, formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Dueño actualizado correctamente");
    router.push("/owners");
  }

  if (!owner)
    return <div className="p-8 text-sm text-zinc-400">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      {owner && (
        <Breadcrumb
          items={[
            { label: "Dueños", href: "/owners" },
            { label: owner.name, href: `/owners/${id}` },
            { label: "Editar" },
          ]}
        />
      )}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Editar dueño</h1>
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
            {[
              {
                id: "name",
                label: "Nombre completo",
                type: "text",
                placeholder: "María García",
                defaultValue: owner.name,
              },
              {
                id: "phone",
                label: "Teléfono",
                type: "text",
                placeholder: "4491234567",
                defaultValue: owner.phone,
              },
              {
                id: "email",
                label: "Correo",
                type: "email",
                placeholder: "maria@email.com",
                defaultValue: owner.email,
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
              </div>
            ))}

            <div className="space-y-1.5">
              <label
                htmlFor="gender"
                className="text-sm font-medium text-zinc-600"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                defaultValue={owner.gender}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                <option value="">Selecciona un género</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <p className="text-sm font-medium text-zinc-600 pt-2">Dirección</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                id: "street",
                label: "Calle",
                placeholder: "Av. Insurgentes",
                defaultValue: owner.street,
              },
              {
                id: "number",
                label: "Número",
                placeholder: "245",
                defaultValue: owner.number,
              },
              {
                id: "neighborhood",
                label: "Colonia",
                placeholder: "Centro",
                defaultValue: owner.neighborhood,
              },
              {
                id: "city",
                label: "Ciudad",
                placeholder: "Aguascalientes",
                defaultValue: owner.city,
              },
              {
                id: "state",
                label: "Estado",
                placeholder: "Aguascalientes",
                defaultValue: owner.state,
              },
              {
                id: "zipCode",
                label: "Código postal",
                placeholder: "20000",
                defaultValue: owner.zipCode,
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
                  type="text"
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            ))}
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
