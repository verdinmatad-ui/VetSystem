import Breadcrumb from "@/components/breadcrumb";
import AppointmentsReportClient from "./client";

export default function AppointmentsReportPage() {
  return (
    <div className="p-8 max-w-3xl">
      <Breadcrumb items={[
        { label: "Reports", href: "/reports" },
        { label: "Appointments Report" },
      ]} />
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-800">Appointments Report</h1>
      </div>
      <AppointmentsReportClient />
    </div>
  );
}