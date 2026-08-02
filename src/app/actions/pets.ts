"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";
import { verifyAdmin } from "@/lib/auth-helpers";
import { fieldErrorResponse, successResponse } from "@/lib/validation";

export async function createPet(formData: FormData) {
  const name = formData.get("name") as string;
  const species = formData.get("species") as string;
  const breed = formData.get("breed") as string;
  const gender = formData.get("gender") as string;
  const birthDate = formData.get("birthDate") as string;
  const ownerId = formData.get("ownerId") as string;
  const photo = formData.get("photo") as File | null;

  const fieldErrors: Record<string, string> = {};

  // Validar campos requeridos
  if (!name?.trim()) fieldErrors.name = "El nombre de la mascota es requerido";
  if (!species?.trim()) fieldErrors.species = "La especie es requerida";
  if (!breed?.trim()) fieldErrors.breed = "La raza es requerida";
  if (!gender) fieldErrors.gender = "El género es requerido";
  if (!birthDate) fieldErrors.birthDate = "La fecha de nacimiento es requerida";
  if (!ownerId) fieldErrors.ownerId = "El dueño es requerido";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa todos los campos requeridos", fieldErrors);
  }

  // Validar formato
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) {
    fieldErrors.name = "El nombre solo debe contener letras";
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(species)) {
    fieldErrors.species = "La especie debe contener solo letras (máx 50 caracteres)";
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(breed)) {
    fieldErrors.breed = "La raza debe contener solo letras (máx 50 caracteres)";
  }

  if (new Date(birthDate) > new Date()) {
    fieldErrors.birthDate = "La fecha de nacimiento no puede ser en el futuro";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor corrige los errores del formulario", fieldErrors);
  }

  let photoUrl: string | undefined;

  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return fieldErrorResponse("Error con la foto", { photo: "Solo se permiten archivos de imagen" });
    }
    if (photo.size > 2 * 1024 * 1024) {
      return fieldErrorResponse("Error con la foto", { photo: "El tamaño debe ser menor a 2MB" });
    }
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${photo.name.replace(/\s/g, "_")}`;
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    await writeFile(filePath, buffer);
    photoUrl = `/uploads/${filename}`;
  }

  await prisma.pet.create({
    data: {
      name,
      species,
      breed,
      gender: gender as any,
      birthDate: new Date(birthDate),
      ownerId: parseInt(ownerId),
      photoUrl,
    },
  });

  revalidatePath("/pets");
  return successResponse();
}

export async function updatePet(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const species = formData.get("species") as string;
  const breed = formData.get("breed") as string;
  const gender = formData.get("gender") as string;
  const birthDate = formData.get("birthDate") as string;
  const ownerId = formData.get("ownerId") as string;
  const photo = formData.get("photo") as File | null;

  const fieldErrors: Record<string, string> = {};

  // Validar campos requeridos
  if (!name?.trim()) fieldErrors.name = "El nombre de la mascota es requerido";
  if (!species?.trim()) fieldErrors.species = "La especie es requerida";
  if (!breed?.trim()) fieldErrors.breed = "La raza es requerida";
  if (!gender) fieldErrors.gender = "El género es requerido";
  if (!birthDate) fieldErrors.birthDate = "La fecha de nacimiento es requerida";
  if (!ownerId) fieldErrors.ownerId = "El dueño es requerido";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa todos los campos requeridos", fieldErrors);
  }

  // Validar formato
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) {
    fieldErrors.name = "El nombre solo debe contener letras";
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(species)) {
    fieldErrors.species = "La especie debe contener solo letras (máx 50 caracteres)";
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(breed)) {
    fieldErrors.breed = "La raza debe contener solo letras (máx 50 caracteres)";
  }

  if (new Date(birthDate) > new Date()) {
    fieldErrors.birthDate = "La fecha de nacimiento no puede ser en el futuro";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor corrige los errores del formulario", fieldErrors);
  }

  let photoUrl: string | undefined;

  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return fieldErrorResponse("Error con la foto", { photo: "Solo se permiten archivos de imagen" });
    }
    if (photo.size > 2 * 1024 * 1024) {
      return fieldErrorResponse("Error con la foto", { photo: "El tamaño debe ser menor a 2MB" });
    }
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${photo.name.replace(/\s/g, "_")}`;
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    await writeFile(filePath, buffer);
    photoUrl = `/uploads/${filename}`;
  }

  await prisma.pet.update({
    where: { id },
    data: {
      name,
      species,
      breed,
      gender: gender as any,
      birthDate: new Date(birthDate),
      ownerId: parseInt(ownerId),
      ...(photoUrl && { photoUrl }),
    },
  });

  revalidatePath("/pets");
  revalidatePath(`/pets/${id}`);
  return successResponse();
}

export async function deletePet(id: number) {
  const session = await verifyAdmin();
  if (!session) return fieldErrorResponse("No autorizado");

  // Delete related records first
  await prisma.medicalRecord.deleteMany({ where: { petId: id } });
  await prisma.vaccination.deleteMany({ where: { petId: id } });
  await prisma.appointment.deleteMany({ where: { petId: id } });
  
  await prisma.pet.delete({ where: { id } });
  revalidatePath("/pets");
  return successResponse();
}

export async function getPets(search?: string) {
  return prisma.pet.findMany({
    where: search
      ? { OR: [{ name: { contains: search } }, { species: { contains: search } }] }
      : undefined,
    include: { owner: true },
    orderBy: { name: "asc" },
  });
}

export async function getPetById(id: number) {
  if (!id || isNaN(id)) return null;
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      owner: true,
      medicalRecords: { orderBy: { date: "desc" }, take: 3 },
      vaccinations: { orderBy: { dateApplied: "desc" }, take: 3 },
    },
  });
  if (!pet) return null;
  return {
    ...pet,
    medicalRecords: pet.medicalRecords.map((r) => ({
      ...r,
      weight: Number(r.weight),
    })),
  };
}