import { getAppointmentById } from "@/app/actions/appointments";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Calendar,
  Clock,
  FileText,
  User,
  PawPrint,
} from "lucide-react";
import BackButton from "@/components/back-button";
import Breadcrumb from "@/components/breadcrumb";
import {
  CancelAppointmentButton,
  DeleteAppointmentButton,
  CompleteAppointmentButton, // ← agrega
} from "./action-buttons";
import { isCurrentUserAdmin } from "@/lib/auth-helpers";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  if (isNaN(id)) notFound();

  const appointment = await getAppointmentById(id);
  if (!appointment) notFound();

  const fields = [
    { label: "Mascota", value: appointment.pet.name, icon: PawPrint },
    { label: "Dueño", value: appointment.pet.owner.name, icon: User },
    {
      label: "Fecha",
      value: new Date(appointment.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: Calendar,
    },
    {
      label: "Hora",
      value: new Date(appointment.date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      icon: Clock,
    },
    { label: "Motivo", value: appointment.reason, icon: FileText },
    { label: "Registrado por", value: appointment.user.name, icon: User },
  ];
  const isAdmin = await isCurrentUserAdmin();

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb
        items={[
          { label: "Appointments", href: "/appointments" },
          {
            label: `${appointment.pet.name} - ${new Date(appointment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          },
        ]}
      />

      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">
          Detalle de la cita
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800">
                {appointment.pet.name}
              </p>
              <p className="text-xs text-zinc-400">
                {appointment.pet.species} · {appointment.pet.breed}
              </p>
            </div>
          </div>
          <span
            className={
              "text-xs font-medium px-3 py-1 rounded-full " +
              (appointment.status === "completed"
                ? "bg-green-50 text-green-600"
                : appointment.status === "cancelled"
                  ? "bg-red-50 text-red-500"
                  : "bg-yellow-50 text-yellow-600")
            }
          >
            {appointment.status}
          </span>
        </div>

        <div className="space-y-4">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">{field.label}</p>
                  <p className="text-sm font-medium text-zinc-700">
                    {field.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>


                {appointment.status === "pending" && (
          <div className="mt-6 pt-6 border-t border-zinc-100 flex gap-2">
            <CancelAppointmentButton id={appointment.id} />
            <CompleteAppointmentButton id={appointment.id} />
            <Link
              href={`/appointments/${appointment.id}/edit`}
              className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Link>
          </div>
        )}
        {appointment.status === "cancelled" && (
          <div className="mt-6 pt-6 border-t border-zinc-100">
            <DeleteAppointmentButton id={appointment.id} isAdmin={isAdmin} />
          </div>
        )}
        {appointment.status === "completed" && (
          <div className="mt-6 pt-6 border-t border-zinc-100">
            <Link
              href={`/pets/${appointment.petId}/medical/new?from=appointment&appointmentId=${appointment.id}`}
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              + Crear historial médico
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
