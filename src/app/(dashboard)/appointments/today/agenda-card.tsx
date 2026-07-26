"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, PawPrint, User } from "lucide-react";
import { completeAppointment, cancelAppointment } from "@/app/actions/appointments";
import toast from "react-hot-toast";

export default function AgendaCard({ appointment }: { appointment: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"complete" | "cancel" | null>(null);
  const [status, setStatus] = useState(appointment.status);

  async function handleComplete() {
    if (!confirm("¿Marcar esta cita como completada?")) return;
    setLoading("complete");
    const result = await completeAppointment(appointment.id);
    const error = "error" in result ? String(result.error) : undefined;
    if (error) {
      toast.error(error);
      setLoading(null);
      return;
    }
    toast.success("Cita marcada como completada");
    setStatus("completed");
    setLoading(null);
    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar esta cita?")) return;
    setLoading("cancel");
    const result = await cancelAppointment(appointment.id);
    const error = "error" in result ? String(result.error) : undefined;
    if (error) {
      toast.error(error);
      setLoading(null);
      return;
    }
    toast.success("Cita cancelada");
    setStatus("cancelled");
    setLoading(null);
    router.refresh();
  }

  return (
    <div className={
      "bg-white rounded-2xl shadow-sm p-5 border-l-4 " +
      (status === "completed" ? "border-green-400" :
       status === "cancelled" ? "border-red-400" :
       "border-yellow-400")
    }>
      <div className="flex items-start justify-between gap-4">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          <Link href={`/appointments/${appointment.id}`}
            className="flex items-center gap-2 mb-1 hover:text-emerald-600 transition-colors">
            <PawPrint className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-sm font-semibold text-zinc-800 truncate">{appointment.pet.name}</span>
            <span className="text-xs text-zinc-400">· {appointment.pet.species}</span>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-xs text-zinc-500">{appointment.pet.owner.name}</span>
          </div>
          <p className="text-xs text-zinc-500">{appointment.reason}</p>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-700">
              {new Date(appointment.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <span className={
            "text-xs font-medium px-2 py-0.5 rounded-full " +
            (status === "completed" ? "bg-green-50 text-green-600" :
             status === "cancelled" ? "bg-red-50 text-red-500" :
             "bg-yellow-50 text-yellow-600")
          }>
            {status}
          </span>

          {status === "pending" && (
            <div className="flex items-center gap-2">
              <button onClick={handleComplete} disabled={loading !== null}
                className="flex items-center gap-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-600 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {loading === "complete" ? "..." : "Completar"}
              </button>
              <button onClick={handleCancel} disabled={loading !== null}
                className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-500 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                <XCircle className="w-3.5 h-3.5" />
                {loading === "cancel" ? "..." : "Cancelar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}