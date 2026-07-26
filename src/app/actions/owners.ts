"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOwner(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const gender = formData.get("gender") as string;
  const street = formData.get("street") as string;
  const number = formData.get("number") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zipCode = formData.get("zipCode") as string;

  if (!name || !phone || !email || !gender || !street || !number || !neighborhood || !city || !state || !zipCode) {
    return { error: "All fields are required" };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) {
    return { error: "Name must contain only letters" };
  }

  if (!/^\d+$/.test(zipCode)) {
    return { error: "Zip code must contain only numbers" };
  }

  const existing = await prisma.owner.findFirst({ where: { email } });
  if (existing) {
    return { error: "This email is already in use" };
  }

  await prisma.owner.create({
    data: { name, phone, email, gender: gender as any, street, number, neighborhood, city, state, zipCode },
  });

  revalidatePath("/owners");
  return { success: true };
}

export async function updateOwner(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const gender = formData.get("gender") as string;
  const street = formData.get("street") as string;
  const number = formData.get("number") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zipCode = formData.get("zipCode") as string;

  if (!name || !phone || !email || !gender || !street || !number || !neighborhood || !city || !state || !zipCode) {
    return { error: "All fields are required" };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) {
    return { error: "Name must contain only letters" };
  }

  if (!/^\d+$/.test(zipCode)) {
    return { error: "Zip code must contain only numbers" };
  }

  await prisma.owner.update({
    where: { id },
    data: { name, phone, email, gender: gender as any, street, number, neighborhood, city, state, zipCode },
  });

  revalidatePath("/owners");
  return { success: true };
}

export async function deleteOwner(id: number) {
  const pets = await prisma.pet.count({ where: { ownerId: id } });
  if (pets > 0) {
    return { error: "This owner has registered pets. Please reassign or delete them first." };
  }
  await prisma.owner.delete({ where: { id } });
  revalidatePath("/owners");
  return { success: true };
}

export async function getOwners(search?: string) {
  return prisma.owner.findMany({
    where: search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getOwnerById(id: number) {
  if (!id || isNaN(id)) return null;
  return prisma.owner.findUnique({ where: { id } });
}