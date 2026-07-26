import { getOwnerById } from "@/app/actions/owners";
import { getPets } from "@/app/actions/pets";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  User,
  Phone,
  Mail,
  MapPin,
  PawPrint,
} from "lucide-react";
import BackButton from "@/components/back-button";
import DeleteButton from "@/components/delete-button";
import Breadcrumb from "@/components/breadcrumb";

export default async function OwnerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  if (isNaN(id)) notFound();

  const owner = await getOwnerById(id);
  if (!owner) notFound();

  const pets = await getPets();
  const ownerPets = pets.filter((p) => p.ownerId === id);

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb
        items={[{ label: "Owners", href: "/owners" }, { label: owner.name }]}
      />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-semibold text-zinc-800">Perfil del dueño</h1>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton
            id={owner.id}
            type="owner"
            redirectTo="/owners"
            confirmMessage="Are you sure you want to delete this owner? This action cannot be undone."
          />
          <Link
            href={`/owners/${owner.id}/edit`}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <User className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-800">
              {owner.name}
            </h2>
            <p className="text-sm text-zinc-400 capitalize">
              {owner.gender} · {ownerPets.length} mascota registrada
              {ownerPets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
              <Phone className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Teléfono</p>
              <p className="text-sm font-medium text-zinc-700">{owner.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Correo</p>
              <p className="text-sm font-medium text-zinc-700">{owner.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Dirección</p>
              <p className="text-sm font-medium text-zinc-700">
                {owner.street} {owner.number}, {owner.neighborhood},{" "}
                {owner.city}, {owner.state}, CP {owner.zipCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-sm font-semibold text-zinc-700 mb-4">
          Mascotas registradas
        </p>
        {ownerPets.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No hay mascotas registradas para este dueño
          </p>
        ) : (
          <div className="space-y-3">
            {ownerPets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}?via=owner`}
                className="flex items-center gap-3 hover:bg-zinc-50 rounded-xl p-2 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  {pet.photoUrl ? (
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="w-9 h-9 rounded-xl object-cover"
                    />
                  ) : (
                    <PawPrint className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-700">
                    {pet.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {pet.species} · {pet.breed}
                  </p>
                </div>
                <ArrowLeft className="w-4 h-4 text-zinc-300 rotate-180" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
