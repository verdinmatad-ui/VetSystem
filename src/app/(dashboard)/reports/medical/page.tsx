import { getPetsForReport } from "@/app/actions/reports";
import Breadcrumb from "@/components/breadcrumb";
import MedicalReportClient from "./client";

export default async function MedicalReportPage() {
  const pets = await getPetsForReport();

  return (
    <div className="p-8 max-w-3xl">
      <Breadcrumb items={[
        { label: "Reports", href: "/reports" },
        { label: "Medical History Report" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-800">Medical History Report</h1>
      </div>
      <MedicalReportClient pets={pets} />
    </div>
  );
}