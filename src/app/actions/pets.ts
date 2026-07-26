"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

export async function createPet(formData: FormData) {
  const name = formData.get("name") as string;
  const species = formData.get("species") as string;
  const breed = formData.get("breed") as string;
  const gender = formData.get("gender") as string;
  const birthDate = formData.get("birthDate") as string;
  const ownerId = formData.get("ownerId") as string;
  const photo = formData.get("photo") as File | null;

  if (!name || !species || !breed || !gender || !birthDate || !ownerId) {
    return { error: "All fields are required" };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) {
    return { error: "Pet name must contain only letters" };
  }

  let photoUrl: string | undefined;

  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return { error: "Only image files are allowed" };
    }
    if (photo.size > 2 * 1024 * 1024) {
      return { error: "File size must not exceed 2MB" };
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
  return { success: true };
}

export async function updatePet(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const species = formData.get("species") as string;
  const breed = formData.get("breed") as string;
  const gender = formData.get("gender") as string;
  const birthDate = formData.get("birthDate") as string;
  const ownerId = formData.get("ownerId") as string;
  const photo = formData.get("photo") as File | null;

  if (!name || !species || !breed || !gender || !birthDate || !ownerId) {
    return { error: "All fields are required" };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) {
    return { error: "Pet name must contain only letters" };
  }

  let photoUrl: string | undefined;

  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return { error: "Only image files are allowed" };
    }
    if (photo.size > 2 * 1024 * 1024) {
      return { error: "File size must not exceed 2MB" };
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
  return { success: true };
}

export async function deletePet(id: number) {
  // Delete related records first
  await prisma.medicalRecord.deleteMany({ where: { petId: id } });
  await prisma.vaccination.deleteMany({ where: { petId: id } });
  await prisma.appointment.deleteMany({ where: { petId: id } });
  
  await prisma.pet.delete({ where: { id } });
  revalidatePath("/pets");
  return { success: true };
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
  return prisma.pet.findUnique({
    where: { id },
    include: {
      owner: true,
      medicalRecords: { orderBy: { date: "desc" }, take: 3 },
      vaccinations: { orderBy: { dateApplied: "desc" }, take: 3 },
    },
  });
}