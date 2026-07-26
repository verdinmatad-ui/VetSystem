"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/auth-helpers";
import { fieldErrorResponse, successResponse } from "@/lib/validation";

export async function getUsers() {
  const session = await verifyAdmin();
  if (!session) return [];
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: "asc" },
  });
}

export async function createUser(formData: FormData) {
  const session = await verifyAdmin();
  if (!session) return fieldErrorResponse("No autorizado");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const fieldErrors: Record<string, string> = {};

  if (!name?.trim()) fieldErrors.name = "El nombre es requerido";
  else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/.test(name)) {
    fieldErrors.name = "El nombre debe contener solo letras (2-100 caracteres)";
  }

  if (!email?.trim()) fieldErrors.email = "El email es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Por favor ingresa un email válido";
  }

  if (!password) fieldErrors.password = "La contraseña es requerida";
  else if (password.length < 8 || password.length > 30) {
    fieldErrors.password = "La contraseña debe tener 8-30 caracteres";
  }

  if (!role) fieldErrors.role = "El rol es requerido";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa todos los campos", fieldErrors);
  }

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    return fieldErrorResponse("Este email ya está registrado", { email: "El email ya está en uso" });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, password: hashed, role: role as any },
  });

  revalidatePath("/admin/users");
  return successResponse();
}

export async function updateUser(id: number, formData: FormData) {
  const session = await verifyAdmin();
  if (!session) return fieldErrorResponse("No autorizado");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  const fieldErrors: Record<string, string> = {};

  if (!name?.trim()) fieldErrors.name = "El nombre es requerido";
  else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/.test(name)) {
    fieldErrors.name = "El nombre debe contener solo letras (2-100 caracteres)";
  }

  if (!email?.trim()) fieldErrors.email = "El email es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Por favor ingresa un email válido";
  }

  if (!role) fieldErrors.role = "El rol es requerido";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa todos los campos", fieldErrors);
  }

  const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
  if (existing) {
    return fieldErrorResponse("Este email ya está registrado", { email: "El email ya está en uso" });
  }

  await prisma.user.update({
    where: { id },
    data: { name, email, role: role as any },
  });

  revalidatePath("/admin/users");
  return successResponse();
}

export async function deleteUser(id: number) {
  const session = await verifyAdmin();
  if (!session) return fieldErrorResponse("No autorizado");

  const currentUserId = parseInt(session.user?.id as string);
  if (id === currentUserId) {
    return fieldErrorResponse("No puedes eliminar tu propia cuenta");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return successResponse();
}

export async function getUserById(id: number) {
  const session = await verifyAdmin();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function changeUserPassword(id: number, formData: FormData) {
  const session = await verifyAdmin();
  if (!session) return { error: "Unauthorized" };

  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) return { error: "User not found" };

  const currentUserId = parseInt(session.user?.id as string);
  const isTargetSelf = targetUser.id === currentUserId;

  if (targetUser.role === "admin" && !isTargetSelf) {
    return { error: "You cannot change another administrator's password" };
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashed },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getCurrentUserId() {
  const session = await verifyAdmin();
  if (!session) return null;
  return parseInt(session.user?.id as string);
}