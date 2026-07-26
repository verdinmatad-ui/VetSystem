"use client";

import { useState, useEffect } from "react";
import { updateUser, getUserById, changeUserPassword, getCurrentUserId } from "@/app/actions/users";
import type { ActionResponse } from "@/lib/validation";
import { FormError, FieldError } from "@/components/form-error";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import Breadcrumb from "@/components/breadcrumb";
import toast from "react-hot-toast";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [response, setResponse] = useState<ActionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [passwordResponse, setPasswordResponse] = useState<ActionResponse | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    getUserById(id).then(setUser);
    getCurrentUserId().then(setCurrentUserId);
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    const formData = new FormData(e.currentTarget);
    const result = await updateUser(id, formData);
    if (!result.success) {
      setResponse(result);
      setLoading(false);
      return;
    }
    toast.success("Usuario actualizado correctamente");
    router.push("/admin/users");
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordResponse(null);
    const formData = new FormData(e.currentTarget);
    const result = await changeUserPassword(id, formData);
    if (!result.success) {
      setPasswordResponse(result);
      setPasswordLoading(false);
      return;
    }
    toast.success("Contraseña actualizada correctamente");
    setNewPassword("");
    setPasswordLoading(false);
  }

  if (!user) return <div className="p-8 text-sm text-zinc-400">Loading...</div>;

  const isSelf = currentUserId !== null && user.id === currentUserId;
  const isOtherAdmin = user.role === "admin" && !isSelf;

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb items={[
        { label: "Usuarios", href: "/admin/users" },
        { label: user.name, href: "/admin/users" },
        { label: "Editar" },
      ]} />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Editar usuario</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {response && !response.success && (
            <FormError error={response.error} fieldErrors={response.fieldErrors} />
          )}

          {[
            { id: "name", label: "Nombre completo", type: "text", placeholder: "María García", defaultValue: user.name },
            { id: "email", label: "Correo", type: "email", placeholder: "maria@vetclinic.com", defaultValue: user.email },
          ].map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label htmlFor={field.id} className="text-sm font-medium text-zinc-600">{field.label}</label>
              <input id={field.id} name={field.id} type={field.type} placeholder={field.placeholder}
                defaultValue={field.defaultValue} required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
              <FieldError fieldName={field.id} fieldErrors={response?.fieldErrors} />
            </div>
          ))}

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium text-zinc-600">Rol</label>
            <select id="role" name="role" defaultValue={user.role} required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <FieldError fieldName="role" fieldErrors={response?.fieldErrors} />
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

      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-1">Cambiar contraseña</h2>

        {isOtherAdmin ? (
          <p className="text-sm text-zinc-400 mt-2">
            No puedes cambiar la contraseña de otro administrador.
          </p>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
            {passwordResponse && !passwordResponse.success && (
              <FormError error={passwordResponse.error} fieldErrors={passwordResponse.fieldErrors} />
            )}

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-600">Nueva contraseña</label>
              <input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
              <FieldError fieldName="password" fieldErrors={passwordResponse?.fieldErrors} />
            </div>

            <button type="submit" disabled={passwordLoading}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-900 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <Save className="w-4 h-4" />
              {passwordLoading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}