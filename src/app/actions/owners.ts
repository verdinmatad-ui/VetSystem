"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { fieldErrorResponse, successResponse } from "@/lib/validation";

function validateOwnerFields(fields: {
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}): Record<string, string> | null {
  const errors: Record<string, string> = {};

  if (!fields.name?.trim()) {
    errors.name = "El nombre es requerido";
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(fields.name)) {
    errors.name = "El nombre debe contener solo letras (máx 50 caracteres)";
  }

  if (!fields.phone?.trim()) {
    errors.phone = "El teléfono es requerido";
  } else if (!/^\d{10}$/.test(fields.phone)) {
    errors.phone = "El teléfono debe tener exactamente 10 dígitos";
  }

  if (!fields.email?.trim()) {
    errors.email = "El email es requerido";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Por favor ingresa un email válido";
  } else if (fields.email.length > 50) {
    errors.email = "El email debe tener máximo 50 caracteres";
  }

  if (!fields.zipCode?.trim()) {
    errors.zipCode = "El código postal es requerido";
  } else if (!/^\d{1,10}$/.test(fields.zipCode)) {
    errors.zipCode = "El código postal debe contener solo números (máx 10 dígitos)";
  }

  if (!fields.street?.trim()) {
    errors.street = "La calle es requerida";
  } else if (fields.street.length > 100) {
    errors.street = "La calle debe tener máximo 100 caracteres";
  }

  if (!fields.neighborhood?.trim()) {
    errors.neighborhood = "El barrio es requerido";
  } else if (fields.neighborhood.length > 100) {
    errors.neighborhood = "El barrio debe tener máximo 100 caracteres";
  }

  if (!fields.city?.trim()) {
    errors.city = "La ciudad es requerida";
  } else if (fields.city.length > 100) {
    errors.city = "La ciudad debe tener máximo 100 caracteres";
  }

  if (!fields.state?.trim()) {
    errors.state = "El estado es requerido";
  } else if (fields.state.length > 100) {
    errors.state = "El estado debe tener máximo 100 caracteres";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

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

  const fieldErrors: Record<string, string> = {};

  if (!gender) fieldErrors.gender = "El género es requerido";
  if (!street?.trim()) fieldErrors.street = "La calle es requerida";
  if (!number?.trim()) fieldErrors.number = "El número es requerido";
  if (!neighborhood?.trim()) fieldErrors.neighborhood = "El barrio es requerido";
  if (!city?.trim()) fieldErrors.city = "La ciudad es requerida";
  if (!state?.trim()) fieldErrors.state = "El estado es requerido";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa todos los campos requeridos", fieldErrors);
  }

  const fieldValidationErrors = validateOwnerFields({ name, phone, email, zipCode, street, neighborhood, city, state });
  if (fieldValidationErrors) {
    return fieldErrorResponse("Por favor corrige los errores del formulario", fieldValidationErrors);
  }

  const existing = await prisma.owner.findFirst({ where: { email } });
  if (existing) {
    return fieldErrorResponse("Este email ya está en uso", { email: "El email ya está registrado" });
  }

  await prisma.owner.create({
    data: { name, phone, email, gender: gender as any, street, number, neighborhood, city, state, zipCode },
  });

  revalidatePath("/owners");
  return successResponse();
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

  const fieldErrors: Record<string, string> = {};

  if (!gender) fieldErrors.gender = "El género es requerido";
  if (!street?.trim()) fieldErrors.street = "La calle es requerida";
  if (!number?.trim()) fieldErrors.number = "El número es requerido";
  if (!neighborhood?.trim()) fieldErrors.neighborhood = "El barrio es requerido";
  if (!city?.trim()) fieldErrors.city = "La ciudad es requerida";
  if (!state?.trim()) fieldErrors.state = "El estado es requerido";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa todos los campos requeridos", fieldErrors);
  }

  const fieldValidationErrors = validateOwnerFields({ name, phone, email, zipCode, street, neighborhood, city, state });
  if (fieldValidationErrors) {
    return fieldErrorResponse("Por favor corrige los errores del formulario", fieldValidationErrors);
  }

  const existing = await prisma.owner.findFirst({ where: { email, NOT: { id } } });
  if (existing) {
    return fieldErrorResponse("Este email ya está en uso", { email: "El email ya está registrado" });
  }

  await prisma.owner.update({
    where: { id },
    data: { name, phone, email, gender: gender as any, street, number, neighborhood, city, state, zipCode },
  });

  revalidatePath("/owners");
  revalidatePath(`/owners/${id}`);
  return successResponse();
}

export async function deleteOwner(id: number) {
  const session = await verifyAdmin();
  if (!session) return fieldErrorResponse("No autorizado");

  const pets = await prisma.pet.count({ where: { ownerId: id } });
  if (pets > 0) {
    return fieldErrorResponse("Este dueño tiene mascotas registradas. Por favor reasígnalas o elimínalas primero.");
  }
  await prisma.owner.delete({ where: { id } });
  revalidatePath("/owners");
  return successResponse();
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