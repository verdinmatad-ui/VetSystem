import { getOwners } from "@/app/actions/owners";
import Link from "next/link";
import { Plus, Search, Pencil } from "lucide-react";
import SearchInput from "@/components/search-input";

export default async function OwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const owners = await getOwners(q);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Dueños</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {owners.length} registrados
          </p>
        </div>
        <Link
          href="/owners/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo dueño
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          placeholder="Buscar por nombre o correo..."
          defaultValue={q}
        />
      </div>
      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {owners.length === 0 ? (
          <p className="text-sm text-zinc-400 p-6">No se encontraron dueños</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Nombre
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Correo
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Teléfono
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Dirección
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr
                  key={owner.id}
                  className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-zinc-700">
                    <Link
                      href={`/owners/${owner.id}`}
                      className="hover:text-emerald-600 transition-colors"
                    >
                      {owner.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">{owner.email}</td>
                  <td className="px-5 py-3 text-zinc-500">{owner.phone}</td>
                  <td className="px-5 py-3 text-zinc-500">
                    {owner.street} {owner.number}, {owner.neighborhood},{" "}
                    {owner.city}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/owners/${owner.id}/edit`}
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
