import { getStockAlerts } from "@/app/actions/inventory";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";

export default async function StockAlertsPage() {
  const alerts = await getStockAlerts();

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb items={[
        { label: "Inventario", href: "/inventory" },
        { label: "Alertas de stock" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Alertas de stock</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{alerts.length} artículo{alerts.length !== 1 ? "s" : ""} requieren atención</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 font-medium">No hay artículos con stock bajo</p>
          <p className="text-xs text-zinc-400 mt-1">Todos los niveles de inventario están bien</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((item) => (
            <Link key={item.id} href={`/inventory/${item.id}`}
              className="block bg-white rounded-2xl shadow-sm p-5 border-l-4 border-red-400 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{item.name}</p>
                    <p className="text-xs text-zinc-400 capitalize">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-500">{item.quantity} {item.unit}</p>
                  <p className="text-xs text-zinc-400">min. {item.minStock} {item.unit}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}