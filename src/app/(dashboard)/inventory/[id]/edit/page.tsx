"use client";

import { useState, useEffect } from "react";
import { updateInventoryItem, getInventoryItemById } from "@/app/actions/inventory";
import { useRouter, useParams } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import Breadcrumb from "@/components/breadcrumb";
import toast from "react-hot-toast";

export default function EditInventoryItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    getInventoryItemById(id).then(setItem);
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await updateInventoryItem(id, formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Artículo actualizado correctamente");
    router.push(`/inventory/${id}`);
  }

  if (!item) return <div className="p-8 text-sm text-zinc-400">Loading...</div>;

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb items={[
        { label: "Inventario", href: "/inventory" },
        { label: item.name, href: `/inventory/${id}` },
        { label: "Editar" },
      ]} />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Editar artículo</h1>
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
            <label htmlFor="name" className="text-sm font-medium text-zinc-600">Nombre del artículo</label>
            <input id="name" name="name" type="text" required defaultValue={item.name}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium text-zinc-600">Categoría</label>
              <select id="category" name="category" required defaultValue={item.category}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition">
                <option value="medical">Medical</option>
                <option value="operational">Operational</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="unit" className="text-sm font-medium text-zinc-600">Unidad</label>
              <input id="unit" name="unit" type="text" required defaultValue={item.unit}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="minStock" className="text-sm font-medium text-zinc-600">Stock mínimo</label>
            <input id="minStock" name="minStock" type="number" min="1" step="1" required defaultValue={item.minStock}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <CancelButton href={`/inventory/${id}`} />
          </div>
        </form>
      </div>
    </div>
  );
}