import { getTodayAppointments } from "@/app/actions/appointments";
import { Calendar } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import AgendaCard from "./agenda-card";
import AppointmentTabs from "@/components/appointment-tabs";

export default async function TodayAgendaPage() {
  const appointments = await getTodayAppointments();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="p-8 max-w-3xl">
      <Breadcrumb items={[
        { label: "Appointments", href: "/appointments" },
        { label: "Daily Agenda" },
      ]} />
      <AppointmentTabs />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Daily Agenda</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{today}</p>
        </div>
        <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-xl">
          {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} today
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">No appointments scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <AgendaCard key={appt.id} appointment={appt} />
          ))}
        </div>
      )}
    </div>
  );
}