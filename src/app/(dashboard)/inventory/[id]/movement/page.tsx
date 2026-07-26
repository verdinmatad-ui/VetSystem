"use client";

import { useState, useEffect } from "react";
import { createStockMovement, getInventoryItemById } from "@/app/actions/inventory";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import Breadcrumb from "@/components/breadcrumb";
import toast from "react-hot-toast";

export default function RegisterMovementPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = parseInt(params.id as string);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<any>(null);
  const [type, setType] = useState<"in" | "out">("in");

  useEffect(() => {
    getInventoryItemById(itemId).then(setItem);
  }, [itemId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createStockMovement(itemId, formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Movement registered successfully");
    router.push(`/inventory/${itemId}`);
  }

  if (!item) return <div className="p-8 text-sm text-zinc-400">Loading...</div>;

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb items={[
        { label: "Inventario", href: "/inventory" },
        { label: item.name, href: `/inventory/${itemId}` },
        { label: "Registrar movimiento" },
      ]} />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Registrar movimiento</h1>
      </div>

      {/* Current stock prominently displayed */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <p className="text-xs text-zinc-400 mb-1">Stock actual</p>
        <p className="text-3xl font-bold text-zinc-800">{item.quantity} <span className="text-base font-medium text-zinc-400">{item.unit}</span></p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-600">Tipo de movimiento</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setType("in")}
                className={
                  "flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors " +
                  (type === "in"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100")
                }>
                <ArrowUpCircle className="w-4 h-4" />
                Entrada
              </button>
              <button type="button" onClick={() => setType("out")}
                className={
                  "flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors " +
                  (type === "out"
                    ? "bg-red-50 border-red-300 text-red-600"
                    : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100")
                }>
                <ArrowDownCircle className="w-4 h-4" />
                Salida
              </button>
            </div>
            <input type="hidden" name="type" value={type} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="quantity" className="text-sm font-medium text-zinc-600">Cantidad</label>
            <input id="quantity" name="quantity" type="number" min="1" step="1" placeholder="10" required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-sm font-medium text-zinc-600">
              Notas <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <textarea id="notes" name="notes" rows={2} placeholder="Monthly restock, expired batch, etc."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar movimiento"}
            </button>
            <CancelButton href={`/inventory/${itemId}`} />
          </div>
        </form>
      </div>
    </div>
  );
}