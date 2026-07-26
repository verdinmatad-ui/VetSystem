"use client";

import { useState } from "react";
import { createUser } from "@/app/actions/users";
import { useRouter } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import Breadcrumb from "@/components/breadcrumb";
import toast from "react-hot-toast";

export default function NewUserPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createUser(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Usuario creado correctamente");
    router.push("/admin/users");
  }

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb items={[
        { label: "Usuarios", href: "/admin/users" },
        { label: "Nuevo usuario" },
      ]} />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Nuevo usuario</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {[
            { id: "name", label: "Nombre completo", type: "text", placeholder: "María García" },
            { id: "email", label: "Correo", type: "email", placeholder: "maria@vetclinic.com" },
            { id: "password", label: "Contraseña", type: "password", placeholder: "Mín. 8 caracteres" },
          ].map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label htmlFor={field.id} className="text-sm font-medium text-zinc-600">{field.label}</label>
              <input id={field.id} name={field.id} type={field.type} placeholder={field.placeholder} required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
            </div>
          ))}

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium text-zinc-600">Rol</label>
            <select id="role" name="role" required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition">
              <option value="">Selecciona un rol</option>
              <option value="staff">Personal</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Crear usuario"}
            </button>
            <CancelButton />
          </div>
        </form>
      </div>
    </div>
  );
}