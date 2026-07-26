"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyAdmin } from "@/lib/auth-helpers";
import { fieldErrorResponse, successResponse } from "@/lib/validation";

export async function createMedicalRecord(petId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return fieldErrorResponse("No autorizado");

  const diagnosis = formData.get("diagnosis") as string;
  const treatment = formData.get("treatment") as string;
  const notes = formData.get("notes") as string;
  const weight = formData.get("weight") as string;
  const date = formData.get("date") as string;

  const fieldErrors: Record<string, string> = {};

  if (!diagnosis?.trim()) fieldErrors.diagnosis = "El diagnóstico es requerido";
  if (!treatment?.trim()) fieldErrors.treatment = "El tratamiento es requerido";
  if (!weight?.trim()) fieldErrors.weight = "El peso es requerido";
  if (!date?.trim()) fieldErrors.date = "La fecha es requerida";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa los campos requeridos", fieldErrors);
  }

  if (new Date(date) > new Date()) {
    fieldErrors.date = "La fecha no puede ser en el futuro";
    return fieldErrorResponse("Fecha inválida", fieldErrors);
  }

  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0) {
    fieldErrors.weight = "El peso debe ser un número positivo";
  }
  if (!/^\d+(\.\d{1,2})?$/.test(weight)) {
    fieldErrors.weight = "El peso debe tener máximo 2 decimales";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor corrige los errores", fieldErrors);
  }

  await prisma.medicalRecord.create({
    data: {
      diagnosis,
      treatment,
      notes: notes || "",
      weight: weightNum,
      date: new Date(date),
      petId,
      userId: parseInt(session.user.id as string),
    },
  });

  revalidatePath(`/pets/${petId}/medical`);
  revalidatePath(`/pets/${petId}`);
  return successResponse();
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

  const fieldErrors: Record<string, string> = {};

  if (!diagnosis?.trim()) fieldErrors.diagnosis = "El diagnóstico es requerido";
  if (!treatment?.trim()) fieldErrors.treatment = "El tratamiento es requerido";
  if (!weight?.trim()) fieldErrors.weight = "El peso es requerido";
  if (!date?.trim()) fieldErrors.date = "La fecha es requerida";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa los campos requeridos", fieldErrors);
  }

  if (new Date(date) > new Date()) {
    fieldErrors.date = "La fecha no puede ser en el futuro";
    return fieldErrorResponse("Fecha inválida", fieldErrors);
  }

  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0) {
    fieldErrors.weight = "El peso debe ser un número positivo";
  }
  if (!/^\d+(\.\d{1,2})?$/.test(weight)) {
    fieldErrors.weight = "El peso debe tener máximo 2 decimales";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor corrige los errores", fieldErrors);
  }

  await prisma.medicalRecord.update({
    where: { id },
    data: {
      diagnosis,
      treatment,
      notes: notes || "",
      weight: weightNum,
      date: new Date(date),
    },
  });

  revalidatePath(`/pets/${petId}/medical`);
  revalidatePath(`/pets/${petId}`);
  return successResponse();
}

export async function deleteMedicalRecord(id: number, petId: number) {
  const session = await verifyAdmin();
  if (!session) return fieldErrorResponse("No autorizado");

  await prisma.medicalRecord.delete({ where: { id } });
  revalidatePath(`/pets/${petId}/medical`);
  revalidatePath(`/pets/${petId}`);
  return successResponse();
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

  const fieldErrors: Record<string, string> = {};

  if (!vaccineName?.trim()) fieldErrors.vaccineName = "El nombre de la vacuna es requerido";
  else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-]{1,50}$/.test(vaccineName)) {
    fieldErrors.vaccineName = "El nombre debe contener solo letras, números y guiones (máx 50)";
  }

  if (!dateApplied) fieldErrors.dateApplied = "La fecha aplicada es requerida";
  else if (new Date(dateApplied) > new Date()) {
    fieldErrors.dateApplied = "La fecha no puede ser en el futuro";
  }

  if (nextDoseDate && new Date(nextDoseDate) <= new Date(dateApplied)) {
    fieldErrors.nextDoseDate = "La próxima dosis debe ser después de la fecha aplicada";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor corrige los errores", fieldErrors);
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
  return successResponse();
}

export async function updateVaccination(
  id: number,
  petId: number,
  formData: FormData,
) {
  const vaccineName = formData.get("vaccineName") as string;
  const dateApplied = formData.get("dateApplied") as string;
  const nextDoseDate = formData.get("nextDoseDate") as string;

  const fieldErrors: Record<string, string> = {};

  if (!vaccineName?.trim()) fieldErrors.vaccineName = "El nombre de la vacuna es requerido";
  else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-]{1,50}$/.test(vaccineName)) {
    fieldErrors.vaccineName = "El nombre debe contener solo letras, números y guiones (máx 50)";
  }

  if (!dateApplied) fieldErrors.dateApplied = "La fecha aplicada es requerida";
  else if (new Date(dateApplied) > new Date()) {
    fieldErrors.dateApplied = "La fecha no puede ser en el futuro";
  }

  if (nextDoseDate && new Date(nextDoseDate) <= new Date(dateApplied)) {
    fieldErrors.nextDoseDate = "La próxima dosis debe ser después de la fecha aplicada";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor corrige los errores", fieldErrors);
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
  return successResponse();
}

export async function deleteVaccination(id: number, petId: number) {
  const session = await verifyAdmin();
  if (!session) return fieldErrorResponse("No autorizado");

  await prisma.vaccination.delete({ where: { id } });
  revalidatePath(`/pets/${petId}/vaccinations`);
  revalidatePath(`/pets/${petId}`);
  return successResponse();
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