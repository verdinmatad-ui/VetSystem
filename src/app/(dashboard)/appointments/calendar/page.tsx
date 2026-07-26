import { getAllAppointments } from "@/app/actions/appointments";
import Breadcrumb from "@/components/breadcrumb";
import AppointmentCalendar from "./calendar-client";
import AppointmentTabs from "@/components/appointment-tabs";

export default async function CalendarPage() {
  const appointments = await getAllAppointments();

  const events = appointments.map((appt) => ({
    id: appt.id,
    title: appt.pet.name,
    start: new Date(appt.date),
    end: new Date(new Date(appt.date).getTime() + 30 * 60 * 1000),
    status: appt.status,
    reason: appt.reason,
  }));

  return (
    <div className="p-8">
      <Breadcrumb items={[
        { label: "Appointments", href: "/appointments" },
        { label: "Calendar" },
      ]} />
      <AppointmentTabs />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-800">Appointment Calendar</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <AppointmentCalendar events={events} />
      </div>
    </div>
  );
}