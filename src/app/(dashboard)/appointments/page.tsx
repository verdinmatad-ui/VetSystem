import { getAllAppointments } from "@/app/actions/appointments";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import AppointmentFilters from "./filters";
import Breadcrumb from "@/components/breadcrumb";
import AppointmentTabs from "@/components/appointment-tabs";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const { status, dateFrom, dateTo } = await searchParams;
  const appointments = await getAllAppointments({ status, dateFrom, dateTo });
  return (
    <div className="p-8">
      <Breadcrumb items={[{ label: "Citas" }]} />
      <AppointmentTabs />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Citas</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {appointments.length} encontradas
          </p>
        </div>
        <Link
          href="/appointments/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      <AppointmentFilters status={status} dateFrom={dateFrom} dateTo={dateTo} />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">
              {status || dateFrom || dateTo
                ? "No hay citas que coincidan con los filtros"
                : "Aún no hay citas registradas"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Mascota
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Fecha y hora
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Motivo
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Dueño
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr
                  key={appt.id}
                  className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/appointments/${appt.id}`}
                      className="font-medium text-zinc-700 hover:text-emerald-600 transition-colors"
                    >
                      {appt.pet.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">
                    {new Date(appt.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" · "}
                    {new Date(appt.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 max-w-xs truncate">
                    {appt.reason}
                  </td>
                  <td className="px-5 py-3 text-zinc-500">
                    {appt.pet.owner.name}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        "text-xs font-medium px-2 py-0.5 rounded-full " +
                        (appt.status === "completed"
                          ? "bg-green-50 text-green-600"
                          : appt.status === "cancelled"
                            ? "bg-red-50 text-red-500"
                            : "bg-yellow-50 text-yellow-600")
                      }
                    >
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
