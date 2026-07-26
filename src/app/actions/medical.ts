"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function createMedicalRecord(petId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const diagnosis = formData.get("diagnosis") as string;
  const treatment = formData.get("treatment") as string;
  const notes = formData.get("notes") as string;
  const weight = formData.get("weight") as string;
  const date = formData.get("date") as string;

  if (!diagnosis || !treatment || !weight || !date) {
    return { error: "All required fields must be filled" };
  }

  await prisma.medicalRecord.create({
    data: {
      diagnosis,
      treatment,
      notes: notes || "",
      weight: parseFloat(weight),
      date: new Date(date),
      petId,
      userId: parseInt(session.user.id as string),
    },
  });

  revalidatePath(`/pets/${petId}/medical`);
  revalidatePath(`/pets/${petId}`);
  return { success: true };
}

export async function updateMedicalRecord(
  id: number,
  petId: number,
  formData: FormData,
) {
  const diagnosis = formData.get("diagnosis") as string;
  const treatment = formData.get("treatment") as string;
  const notes = formData.get("notes") as string;
  const weight = formData.get("weight") as string;
  const date = formData.get("date") as string;

  if (!diagnosis || !treatment || !weight || !date) {
    return { error: "All required fields must be filled" };
  }

  await prisma.medicalRecord.update({
    where: { id },
    data: {
      diagnosis,
      treatment,
      notes: notes || "",
      weight: parseFloat(weight),
      date: new Date(date),
    },
  });

  revalidatePath(`/pets/${petId}/medical`);
  revalidatePath(`/pets/${petId}`);
  return { success: true };
}

export async function deleteMedicalRecord(id: number, petId: number) {
  const session = await verifyAdmin();
  if (!session) return { error: "Unauthorized" };

  await prisma.medicalRecord.delete({ where: { id } });
  revalidatePath(`/pets/${petId}/medical`);
  revalidatePath(`/pets/${petId}`);
  return { success: true };
}

export async function getMedicalRecords(petId: number) {
  const records = await prisma.medicalRecord.findMany({
    where: { petId },
    orderBy: { date: "desc" },
    include: { user: { select: { name: true } } },
  });
  return records.map((r) => ({
    ...r,
    weight: Number(r.weight),
  }));
}

export async function getMedicalRecordById(id: number) {
  if (!id || isNaN(id)) return null;
  const record = await prisma.medicalRecord.findUnique({ where: { id } });
  if (!record) return null;
  return {
    ...record,
    weight: Number(record.weight),
  };
}

export async function createVaccination(petId: number, formData: FormData) {
  const vaccineName = formData.get("vaccineName") as string;
  const dateApplied = formData.get("dateApplied") as string;
  const nextDoseDate = formData.get("nextDoseDate") as string;

  if (!vaccineName || !dateApplied) {
    return { error: "Vaccine name and date applied are required" };
  }

  await prisma.vaccination.create({
    data: {
      vaccineName,
      dateApplied: new Date(dateApplied),
      nextDoseDate: nextDoseDate ? new Date(nextDoseDate) : null,
      petId,
    },
  });

  revalidatePath(`/pets/${petId}/vaccinations`);
  revalidatePath(`/pets/${petId}`);
  return { success: true };
}

export async function updateVaccination(
  id: number,
  petId: number,
  formData: FormData,
) {
  const vaccineName = formData.get("vaccineName") as string;
  const dateApplied = formData.get("dateApplied") as string;
  const nextDoseDate = formData.get("nextDoseDate") as string;

  if (!vaccineName || !dateApplied) {
    return { error: "Vaccine name and date applied are required" };
  }

  await prisma.vaccination.update({
    where: { id },
    data: {
      vaccineName,
      dateApplied: new Date(dateApplied),
      nextDoseDate: nextDoseDate ? new Date(nextDoseDate) : null,
    },
  });

  revalidatePath(`/pets/${petId}/vaccinations`);
  revalidatePath(`/pets/${petId}`);
  return { success: true };
}

export async function deleteVaccination(id: number, petId: number) {
  const session = await verifyAdmin();
  if (!session) return { error: "Unauthorized" };

  await prisma.vaccination.delete({ where: { id } });
  revalidatePath(`/pets/${petId}/vaccinations`);
  revalidatePath(`/pets/${petId}`);
  return { success: true };
}

export async function getVaccinations(petId: number) {
  return prisma.vaccination.findMany({
    where: { petId },
    orderBy: { dateApplied: "desc" },
  });
}

export async function getVaccinationById(id: number) {
  if (!id || isNaN(id)) return null;
  return prisma.vaccination.findUnique({ where: { id } });
}