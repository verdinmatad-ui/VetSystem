import { getPetById } from "@/app/actions/pets";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, PawPrint, User, Calendar, Venus, Mars } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import DeleteButton from "@/components/delete-button";
import BackButton from "@/components/back-button";

export default async function PetProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ via?: string }>;
}) {
  const { id: idParam } = await params;
  const { via } = await searchParams;

  const id = parseInt(idParam);
  if (isNaN(id)) notFound();

  const pet = await getPetById(id);
  if (!pet) notFound();

  const latestWeight = pet.medicalRecords[0]?.weight ?? null;

  const breadcrumbItems = via === "owner"
    ? [
        { label: "Owners", href: "/owners" },
        { label: pet.owner.name, href: `/owners/${pet.owner.id}` },
        { label: pet.name },
      ]
    : [
        { label: "Pets", href: "/pets" },
        { label: pet.name },
      ];

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-semibold text-zinc-800">Perfil de la mascota</h1>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton
            id={pet.id}
            type="pet"
            redirectTo="/pets"
            confirmMessage="Are you sure you want to delete this pet? This action cannot be undone."
          />
          <Link
            href={`/pets/${pet.id}/edit`}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden">
            {pet.photoUrl ? (
              <img
                src={pet.photoUrl}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <PawPrint className="w-8 h-8 text-emerald-500" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-800">{pet.name}</h2>
            <p className="text-sm text-zinc-400">
              {pet.species} · {pet.breed}
            </p>
            <p className="text-xs text-zinc-400 capitalize mt-0.5">
              {pet.gender}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "Fecha de nacimiento",
              value: pet.birthDate.toLocaleDateString("en-US"),
              icon: Calendar,
            },
            {
              label: "Género",
              value: pet.gender,
              icon: pet.gender === "male" ? Mars : Venus,
            },
            { label: "Dueño", value: pet.owner.name, icon: User },
            {
              label: "Peso actual",
              value: latestWeight
                ? `${latestWeight} kg`
                : "No weight registered yet",
              icon: PawPrint,
            },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">{field.label}</p>
                  <p className="text-sm font-medium text-zinc-700 capitalize">
                    {String(field.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medical & Vaccinations */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
              <p className="text-sm font-semibold text-zinc-700">
                Historial médico reciente
              </p>
            </div>
            <Link
              href={`/pets/${pet.id}/medical`}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          {pet.medicalRecords.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Todavía no hay registros médicos
            </p>
          ) : (
            <div className="space-y-3">
              {pet.medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="border-l-2 border-zinc-100 pl-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-zinc-400">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {String(record.weight)} kg
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 font-medium">
                    {record.diagnosis}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {record.treatment}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link
            href={`/pets/${pet.id}/medical/new`}
            className="flex items-center gap-1 mt-4 text-xs text-zinc-400 hover:text-emerald-600 transition-colors"
          >
            + Nuevo registro médico
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
              <p className="text-sm font-semibold text-zinc-700">
                Vacunas recientes
              </p>
            </div>
            <Link
              href={`/pets/${pet.id}/vaccinations`}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          {pet.vaccinations.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Todavía no hay vacunas registradas
            </p>
          ) : (
            <div className="space-y-3">
              {pet.vaccinations.map((vac) => (
                <div key={vac.id} className="border-l-2 border-zinc-100 pl-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-700">
                      {vac.vaccineName}
                    </p>
                    <span className="text-xs text-zinc-400">
                      {new Date(vac.dateApplied).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {vac.nextDoseDate && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Próxima dosis:{" "}
                      <span className="text-emerald-600 font-medium">
                        {new Date(vac.nextDoseDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <Link
            href={`/pets/${pet.id}/vaccinations/new`}
            className="flex items-center gap-1 mt-4 text-xs text-zinc-400 hover:text-emerald-600 transition-colors"
          >
            + Nueva vacunación
          </Link>
        </div>
      </div>
    </div>
  );
}
