import Link from "next/link";
import { FileText, Package, Calendar } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";

const reports = [
  {
    href: "/reports/medical",
    icon: FileText,
    title: "Reporte de historial médico",
    description: "Genera un reporte de registros médicos para una mascota seleccionada, opcionalmente filtrado por rango de fechas.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    href: "/reports/inventory",
    icon: Package,
    title: "Reporte de movimientos de inventario",
    description: "Genera un reporte de movimientos de inventario filtrado por rango de fechas y categoría.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    href: "/reports/appointments",
    icon: Calendar,
    title: "Reporte de citas",
    description: "Genera un reporte de citas filtrado por rango de fechas y estado.",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function ReportsPage() {
  return (
    <div className="p-8">
      <Breadcrumb items={[{ label: "Reportes" }]} />
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-800">Reportes</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Selecciona un tipo de reporte para generar</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${report.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-800 mb-2">{report.title}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">{report.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}