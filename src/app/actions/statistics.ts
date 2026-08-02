"use server";

import { prisma } from "@/lib/prisma";

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** Devuelve los últimos `count` meses (incluyendo el actual) como { key, label, start, end } */

function lastMonths(count: number) {
  const months: { key: string; label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: `${MONTH_LABELS[start.getMonth()]} ${String(start.getFullYear()).slice(2)}`,
      start,
      end,
    });
  }
  return months;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ---------- Citas ----------

export async function getAppointmentsByStatus() {
  const grouped = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const labels: Record<string, string> = {
    pending: "Pendiente",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  return grouped.map((g) => ({
    status: g.status,
    label: labels[g.status] ?? g.status,
    count: g._count._all,
  }));
}

export async function getAppointmentsByMonth(monthsBack = 6) {
  const months = lastMonths(monthsBack);
  const from = months[0].start;

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: from } },
    select: { date: true, status: true },
  });

  return months.map((m) => {
    const inMonth = appointments.filter((a) => monthKey(a.date) === m.key);
    return {
      month: m.label,
      total: inMonth.length,
      completed: inMonth.filter((a) => a.status === "completed").length,
      cancelled: inMonth.filter((a) => a.status === "cancelled").length,
      pending: inMonth.filter((a) => a.status === "pending").length,
    };
  });
}

// ---------- Mascotas ----------

export async function getPetsBySpecies() {
  const grouped = await prisma.pet.groupBy({
    by: ["species"],
    _count: { _all: true },
    orderBy: { _count: { species: "desc" } },
  });

  return grouped.map((g) => ({ species: g.species, count: g._count._all }));
}

export async function getPetsByGender() {
  const grouped = await prisma.pet.groupBy({
    by: ["gender"],
    _count: { _all: true },
  });

  const labels: Record<string, string> = { male: "Macho", female: "Hembra" };

  return grouped.map((g) => ({
    gender: g.gender,
    label: labels[g.gender] ?? g.gender,
    count: g._count._all,
  }));
}

export async function getTopOwnersByPets(limit = 5) {
  const owners = await prisma.owner.findMany({
    select: { id: true, name: true, _count: { select: { pets: true } } },
    orderBy: { pets: { _count: "desc" } },
    take: limit,
  });

  return owners
    .filter((o) => o._count.pets > 0)
    .map((o) => ({ id: o.id, name: o.name, count: o._count.pets }));
}

// ---------- Inventario ----------

export async function getInventoryMovementsByMonth(monthsBack = 6) {
  const months = lastMonths(monthsBack);
  const from = months[0].start;

  const movements = await prisma.inventoryMovement.findMany({
    where: { date: { gte: from } },
    select: { date: true, type: true, quantity: true },
  });

  return months.map((m) => {
    const inMonth = movements.filter((mv) => monthKey(mv.date) === m.key);
    return {
      month: m.label,
      in: inMonth.filter((mv) => mv.type === "in").reduce((s, mv) => s + mv.quantity, 0),
      out: inMonth.filter((mv) => mv.type === "out").reduce((s, mv) => s + mv.quantity, 0),
    };
  });
}

export async function getLowStockByCategory() {
  const lowStockItems = await prisma.$queryRaw<
    { id: number; category: "medical" | "operational" }[]
  >`SELECT id, category FROM InventoryItem WHERE quantity <= minStock`;

  const counts: Record<string, number> = { medical: 0, operational: 0 };
  for (const item of lowStockItems) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }

  const labels: Record<string, string> = { medical: "Médico", operational: "Operacional" };

  return Object.entries(counts).map(([category, count]) => ({
    category,
    label: labels[category] ?? category,
    count,
  }));
}

// ---------- Historial médico y vacunas ----------

export async function getTopDiagnoses(limit = 5) {
  const grouped = await prisma.medicalRecord.groupBy({
    by: ["diagnosis"],
    _count: { _all: true },
    orderBy: { _count: { diagnosis: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({ diagnosis: g.diagnosis, count: g._count._all }));
}

export async function getVaccinationsByMonth(monthsBack = 6) {
  const months = lastMonths(monthsBack);
  const from = months[0].start;

  const vaccinations = await prisma.vaccination.findMany({
    where: { dateApplied: { gte: from } },
    select: { dateApplied: true },
  });

  return months.map((m) => ({
    month: m.label,
    count: vaccinations.filter((v) => monthKey(v.dateApplied) === m.key).length,
  }));
}

// ---------- Resumen general (tarjetas KPI) ----------

export async function getStatisticsSummary() {
  const [
    totalPets,
    totalOwners,
    totalAppointments,
    appointmentsThisMonth,
    lowStockCount,
    totalVaccinations,
  ] = await Promise.all([
    prisma.pet.count(),
    prisma.owner.count(),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(*) as count FROM InventoryItem WHERE quantity <= minStock`.then(
      (r) => Number(r[0]?.count ?? 0)
    ),
    prisma.vaccination.count(),
  ]);

  return {
    totalPets,
    totalOwners,
    totalAppointments,
    appointmentsThisMonth,
    lowStockCount,
    totalVaccinations,
  };
}