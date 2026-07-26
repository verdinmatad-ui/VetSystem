"use client";

import { useState } from "react";
import { createInventoryItem } from "@/app/actions/inventory";
import { useRouter } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import BackButton from "@/components/back-button";
import CancelButton from "@/components/cancel-button";
import Breadcrumb from "@/components/breadcrumb";
import toast from "react-hot-toast";

export default function NewInventoryItemPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createInventoryItem(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Item registered successfully");
    router.push("/inventory");
  }

  return (
    <div className="p-8 max-w-xl">
      <Breadcrumb items={[
        { label: "Inventario", href: "/inventory" },
        { label: "Nuevo artículo" },
      ]} />
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold text-zinc-800">Nuevo artículo de inventario</h1>
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
            <input id="name" name="name" type="text" placeholder="Amoxicillin 500mg" required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium text-zinc-600">Categoría</label>
              <select id="category" name="category" required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition">
                <option value="">Selecciona una categoría</option>
                <option value="medical">Medical</option>
                <option value="operational">Operational</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="unit" className="text-sm font-medium text-zinc-600">Unidad</label>
              <input id="unit" name="unit" type="text" placeholder="mg, ml, pieces" required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="minStock" className="text-sm font-medium text-zinc-600">Stock mínimo</label>
            <input id="minStock" name="minStock" type="number" min="1" step="1" placeholder="10" required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar artículo"}
            </button>
            <CancelButton />
          </div>
        </form>
      </div>
    </div>
  );
}