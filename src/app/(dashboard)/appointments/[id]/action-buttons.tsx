"use client";

import { useState } from "react";
import { cancelAppointment, deleteAppointment } from "@/app/actions/appointments";
import { useRouter } from "next/navigation";
import { XCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function CancelAppointmentButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar esta cita?")) return;
    setLoading(true);
    const result = await cancelAppointment(id);
    const error = "error" in result ? String(result.error) : undefined;
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    toast.success("Cita cancelada");
    router.refresh();
  }

  return (
    <button onClick={handleCancel} disabled={loading}
      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-500 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
      <XCircle className="w-4 h-4" />
      {loading ? "Cancelando..." : "Cancelar cita"}
    </button>
  );
}

export function DeleteAppointmentButton({ id, isAdmin }: { id: number; isAdmin: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return null;

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar esta cita? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    const result = await deleteAppointment(id);
    const error = "error" in result ? String(result.error) : undefined;
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    toast.success("Cita eliminada");
    router.push("/appointments");
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-500 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
      <Trash2 className="w-4 h-4" />
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}