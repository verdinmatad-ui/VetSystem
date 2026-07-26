import Breadcrumb from "@/components/breadcrumb";
import InventoryReportClient from "./client";

export default function InventoryReportPage() {
  return (
    <div className="p-8 max-w-3xl">
      <Breadcrumb items={[
        { label: "Reports", href: "/reports" },
        { label: "Inventory Movements Report" },
      ]} />
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-800">Inventory Movements Report</h1>
      </div>
      <InventoryReportClient />
    </div>
  );
}