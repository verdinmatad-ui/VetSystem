import {
  getInventoryItemById,
  getItemMovements,
} from "@/app/actions/inventory";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Package, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import Breadcrumb from "@/components/breadcrumb";
import DeleteButton from "@/components/delete-button";

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  if (isNaN(id)) notFound();

  const item = await getInventoryItemById(id);
  if (!item) notFound();

  const movements = await getItemMovements(id);
  const isLow = item.quantity <= item.minStock;

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb
        items={[
          { label: "Inventory", href: "/inventory" },
          { label: item.name },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-semibold text-zinc-800">Detalle del artículo</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/inventory/${item.id}/movement`}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Package className="w-4 h-4" />
            Registrar movimiento
          </Link>
          <DeleteButton
            id={item.id}
            type="inventory"
            redirectTo="/inventory"
            confirmMessage="Are you sure you want to delete this item? All its movement history will be permanently deleted. This action cannot be undone."
          />
          <Link
            href={`/inventory/${item.id}/edit`}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800">{item.name}</p>
              <p className="text-xs text-zinc-400 capitalize">
                {item.category}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={
                "text-2xl font-bold " +
                (isLow ? "text-red-500" : "text-green-600")
              }
            >
              {item.quantity} {item.unit}
            </p>
            <p className="text-xs text-zinc-400">
              min. {item.minStock} {item.unit}
            </p>
          </div>
        </div>
        {isLow && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl">
            ⚠️ El stock está en o por debajo del mínimo
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-sm font-semibold text-zinc-700 mb-4">
          Historial de movimientos
        </p>
        {movements.length === 0 ? (
          <p className="text-sm text-zinc-400">Aún no hay movimientos registrados</p>
        ) : (
          <div className="space-y-3">
            {movements.map((mov) => (
              <div
                key={mov.id}
                className="flex items-center gap-3 border-b border-zinc-50 last:border-0 pb-3 last:pb-0"
              >
                <div
                  className={
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 " +
                    (mov.type === "in" ? "bg-green-50" : "bg-red-50")
                  }
                >
                  {mov.type === "in" ? (
                    <ArrowUpCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        "text-sm font-medium " +
                        (mov.type === "in" ? "text-green-600" : "text-red-500")
                      }
                    >
                      {mov.type === "in" ? "+" : "-"}
                      {mov.quantity} {item.unit}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(mov.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {mov.notes && (
                    <p className="text-xs text-zinc-400 mt-0.5">{mov.notes}</p>
                  )}
                  <p className="text-xs text-zinc-300 mt-0.5">
                    by {mov.user.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
