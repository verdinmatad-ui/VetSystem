import { getPetById } from "@/app/actions/pets";
import { getMedicalRecords } from "@/app/actions/medical";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Pencil } from "lucide-react";
import BackButton from "@/components/back-button";
import DeleteButton from "@/components/delete-button";
import MedicalFilters from "./filters";
import Breadcrumb from "@/components/breadcrumb";
import { isCurrentUserAdmin } from "@/lib/auth-helpers";

export default async function MedicalHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    q?: string;
    order?: string;
    weightOrder?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const { id: idParam } = await params;
  const { q, order, weightOrder, dateFrom, dateTo } = await searchParams;
  const id = parseInt(idParam);
  if (isNaN(id)) notFound();

  const pet = await getPetById(id);
  if (!pet) notFound();

  let records = await getMedicalRecords(id);

  // Filter by search query
  if (q) {
    records = records.filter(
      (r) =>
        r.diagnosis.toLowerCase().includes(q.toLowerCase()) ||
        r.treatment.toLowerCase().includes(q.toLowerCase()),
    );
  }

  // Filter by date range
  if (dateFrom) {
    records = records.filter((r) => new Date(r.date) >= new Date(dateFrom));
  }
  if (dateTo) {
    records = records.filter(
      (r) => new Date(r.date) <= new Date(dateTo + "T23:59:59"),
    );
  }

  // Sort
  if (weightOrder === "asc") {
    records = [...records].sort((a, b) => Number(a.weight) - Number(b.weight));
  } else if (weightOrder === "desc") {
    records = [...records].sort((a, b) => Number(b.weight) - Number(a.weight));
  } else if (order === "asc") {
    records = [...records].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  } else {
    records = [...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }
  const isAdmin = await isCurrentUserAdmin();

  return (
    <div className="p-8 max-w-2xl">
      <Breadcrumb
        items={[
          { label: "Mascotas", href: "/pets" },
          { label: pet.name, href: `/pets/${id}` },
          { label: "Historial médico" },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-semibold text-zinc-800">
            Historial médico
          </h1>
        </div>
        <Link
          href={`/pets/${id}/medical/new`}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo registro
        </Link>
      </div>

      <MedicalFilters
        q={q}
        order={order}
        weightOrder={weightOrder}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">
            {q || dateFrom || dateTo
              ? "No hay registros que coincidan con los filtros"
              : "Aún no hay registros médicos"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-400">
                  {new Date(record.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {String(record.weight)} kg
                  </span>
                  <span className="text-xs text-zinc-400">
                    by {record.user.name}
                  </span>
                  <Link
                    href={`/pets/${id}/medical/${record.id}/edit`}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-600 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-50"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </Link>
                  <DeleteButton
                    id={record.id}
                    type="medical"
                    petId={id}
                    redirectTo={`/pets/${id}/medical`}
                    confirmMessage="¿Estás seguro de que deseas eliminar este registro médico?"
                    isAdmin={isAdmin}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-zinc-400">Diagnóstico</p>
                  <p className="text-sm text-zinc-700">{record.diagnosis}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Tratamiento</p>
                  <p className="text-sm text-zinc-700">{record.treatment}</p>
                </div>
                {record.notes && (
                  <div>
                    <p className="text-xs text-zinc-400">Notas</p>
                    <p className="text-sm text-zinc-700">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
