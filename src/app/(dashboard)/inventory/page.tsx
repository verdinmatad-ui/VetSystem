import Link from "next/link";
import { Plus, Package } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import InventoryFilters from "./filters";
import { AlertTriangle } from "lucide-react";
import { getInventoryItems, getStockAlertsCount } from "@/app/actions/inventory";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const [items, alertCount] = await Promise.all([
    getInventoryItems({ search: q, category }),
    getStockAlertsCount(),
  ]);

  return (
    <div className="p-8">
            <Breadcrumb items={[{ label: "Inventario" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Inventario</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{items.length} artículos</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/inventory/alerts"
            className="relative flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            <AlertTriangle className="w-4 h-4" />
            Alertas
            {alertCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </Link>
          <Link href="/inventory/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo artículo
          </Link>
        </div>
      </div>

      <InventoryFilters q={q} category={category} />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">
              {q || category
                ? "No se encontraron artículos que coincidan con la búsqueda"
                : "Aún no hay artículos de inventario registrados"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Nombre
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Categoría
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Stock
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Unidad
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Stock mínimo
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = item.quantity <= item.minStock;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/inventory/${item.id}`}
                        className="font-medium text-zinc-700 hover:text-emerald-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-500 capitalize">
                      {item.category}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          "font-semibold " +
                          (isLow ? "text-red-500" : "text-green-600")
                        }
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{item.unit}</td>
                    <td className="px-5 py-3 text-zinc-500">{item.minStock}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
