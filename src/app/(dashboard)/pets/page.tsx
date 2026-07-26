import { getPets } from "@/app/actions/pets";
import Link from "next/link";
import { Plus, Search, Pencil, PawPrint } from "lucide-react";
import SearchInput from "@/components/search-input";

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const pets = await getPets(q);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Mascotas</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{pets.length} registradas</p>
        </div>
        <Link
          href="/pets/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva mascota
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput placeholder="Buscar por nombre o especie..." defaultValue={q} />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {pets.length === 0 ? (
          <p className="text-sm text-zinc-400 p-6">No se encontraron mascotas</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Especie</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Raza</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Dueño</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/pets/${pet.id}`} className="flex items-center gap-2 font-medium text-zinc-700 hover:text-emerald-600 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                        <PawPrint className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      {pet.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">{pet.species}</td>
                  <td className="px-5 py-3 text-zinc-500">{pet.breed}</td>
                  <td className="px-5 py-3 text-zinc-500">{pet.owner.name}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/pets/${pet.id}/edit`}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-600 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}