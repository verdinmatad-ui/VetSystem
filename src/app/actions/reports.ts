"use server";

import { prisma } from "@/lib/prisma";

export async function getMedicalHistoryReport(filters: {
  petId: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  return prisma.medicalRecord.findMany({
    where: {
      petId: filters.petId,
      ...(filters.dateFrom || filters.dateTo ? {
        date: {
          ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
          ...(filters.dateTo ? { lte: new Date(filters.dateTo + "T23:59:59") } : {}),
        }
      } : {}),
    },
    include: {
      pet: { include: { owner: true } },
      user: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getInventoryMovementsReport(filters: {
  dateFrom: string;
  dateTo: string;
  category?: string;
}) {
  return prisma.inventoryMovement.findMany({
    where: {
      date: {
        gte: new Date(filters.dateFrom),
        lte: new Date(filters.dateTo + "T23:59:59"),
      },
      ...(filters.category ? { item: { category: filters.category as any } } : {}),
    },
    include: {
      item: true,
      user: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getAppointmentsReport(filters: {
  dateFrom: string;
  dateTo: string;
  status?: string;
}) {
  return prisma.appointment.findMany({
    where: {
      date: {
        gte: new Date(filters.dateFrom),
        lte: new Date(filters.dateTo + "T23:59:59"),
      },
      ...(filters.status ? { status: filters.status as any } : {}),
    },
    include: {
      pet: { include: { owner: true } },
      user: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getPetsForReport() {
  return prisma.pet.findMany({
    select: { id: true, name: true, species: true },
    orderBy: { name: "asc" },
  });
}