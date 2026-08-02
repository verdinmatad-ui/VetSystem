import Breadcrumb from "@/components/breadcrumb";
import {
  getStatisticsSummary,
  getAppointmentsByStatus,
  getAppointmentsByMonth,
  getPetsBySpecies,
  getPetsByGender,
  getTopOwnersByPets,
  getInventoryMovementsByMonth,
  getLowStockByCategory,
  getTopDiagnoses,
  getVaccinationsByMonth,
} from "@/app/actions/statistics";
import StatisticsClient from "./client";

export default async function StatisticsPage() {
  const [
    summary,
    appointmentsByStatus,
    appointmentsByMonth,
    petsBySpecies,
    petsByGender,
    topOwners,
    inventoryByMonth,
    lowStockByCategory,
    topDiagnoses,
    vaccinationsByMonth,
  ] = await Promise.all([
    getStatisticsSummary(),
    getAppointmentsByStatus(),
    getAppointmentsByMonth(6),
    getPetsBySpecies(),
    getPetsByGender(),
    getTopOwnersByPets(5),
    getInventoryMovementsByMonth(6),
    getLowStockByCategory(),
    getTopDiagnoses(5),
    getVaccinationsByMonth(6),
  ]);

  return (
    <div className="p-8">
      <Breadcrumb items={[{ label: "Estadísticas" }]} />
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-800">Estadísticas</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Vista general del desempeño de la clínica
        </p>
      </div>

      <StatisticsClient
        summary={summary}
        appointmentsByStatus={appointmentsByStatus}
        appointmentsByMonth={appointmentsByMonth}
        petsBySpecies={petsBySpecies}
        petsByGender={petsByGender}
        topOwners={topOwners}
        inventoryByMonth={inventoryByMonth}
        lowStockByCategory={lowStockByCategory}
        topDiagnoses={topDiagnoses}
        vaccinationsByMonth={vaccinationsByMonth}
      />
    </div>
  );
}