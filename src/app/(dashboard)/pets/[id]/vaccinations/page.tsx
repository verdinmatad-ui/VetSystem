import { getPetById } from "@/app/actions/pets";
import { getVaccinations } from "@/app/actions/medical";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Syringe, Pencil } from "lucide-react";
import BackButton from "@/components/back-button";
import DeleteButton from "@/components/delete-button";
import SearchInput from "@/components/search-input";
import Breadcrumb from "@/components/breadcrumb";

export default async function VaccinationHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id: idParam } = await params;
  const { q } = await searchParams;
  const id = parseInt(idParam);
  if (isNaN(id)) notFound();

  const pet = await getPetById(id);
  if (!pet) notFound();

  const allVaccinations = await getVaccinations(id);
  const vaccinations = q
    ? allVaccinations.filter((v) =>
        v.vaccineName.toLowerCase().includes(q.toLowerCase()),
      )
    : allVaccinations;

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb
        items={[
          { label: "Pets", href: "/pets" },
          { label: pet.name, href: `/pets/${id}` },
          { label: "Historial de vacunación" },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-semibold text-zinc-800">
            Historial de vacunación
          </h1>
        </div>
        <Link
          href={`/pets/${id}/vaccinations/new`}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva vacunación
        </Link>
      </div>

      <div className="mb-6">
        <SearchInput placeholder="Buscar por nombre de vacuna..." defaultValue={q} />
      </div>

      {vaccinations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <Syringe className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">
            {q
              ? "No se encontraron vacunaciones que coincidan con la búsqueda"
              : "Aún no hay vacunaciones registradas"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {vaccinations.map((vac) => (
            <div key={vac.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-zinc-700">
                  {vac.vaccineName}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/pets/${id}/vaccinations/${vac.id}/edit`}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-600 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-50"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </Link>
                  <DeleteButton
                    id={vac.id}
                    type="vaccination"
                    petId={id}
                    redirectTo={`/pets/${id}/vaccinations`}
                    confirmMessage="Are you sure you want to delete this vaccination record?"
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                Aplicada: {new Date(vac.dateApplied).toLocaleDateString("en-US")}
              </p>
              {vac.nextDoseDate && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  Próxima dosis:{" "}
                  <span className="text-emerald-600 font-medium">
                    {new Date(vac.nextDoseDate).toLocaleDateString("en-US")}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
