"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyAdmin } from "@/lib/auth-helpers";
import { fieldErrorResponse, successResponse } from "@/lib/validation";

export async function createInventoryItem(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const minStock = formData.get("minStock") as string;

  const fieldErrors: Record<string, string> = {};

  if (!name?.trim()) fieldErrors.name = "El nombre es requerido";
  else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]{2,100}$/.test(name)) {
    fieldErrors.name = "El nombre debe contener solo letras, números y guiones (2-100)";
  }

  if (!category) fieldErrors.category = "La categoría es requerida";

  if (!unit?.trim()) fieldErrors.unit = "La unidad es requerida";
  else if (!/^[a-zA-Z/]{1,30}$/.test(unit)) {
    fieldErrors.unit = "La unidad debe contener solo letras y barras diagonales";
  }

  if (!minStock?.trim()) fieldErrors.minStock = "El stock mínimo es requerido";
  else {
    const minStockNum = parseInt(minStock);
    if (isNaN(minStockNum) || minStockNum <= 0 || !Number.isInteger(minStockNum)) {
      fieldErrors.minStock = "El stock mínimo debe ser un número entero positivo";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa los campos correctamente", fieldErrors);
  }

  await prisma.inventoryItem.create({
    data: {
      name,
      category: category as any,
      unit,
      minStock: parseInt(minStock),
      quantity: 0,
    },
  });

  revalidatePath("/inventory");
  return successResponse();
}

export async function updateInventoryItem(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const minStock = formData.get("minStock") as string;

  const fieldErrors: Record<string, string> = {};

  if (!name?.trim()) fieldErrors.name = "El nombre es requerido";
  else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]{2,100}$/.test(name)) {
    fieldErrors.name = "El nombre debe contener solo letras, números y guiones (2-100)";
  }

  if (!category) fieldErrors.category = "La categoría es requerida";

  if (!unit?.trim()) fieldErrors.unit = "La unidad es requerida";
  else if (!/^[a-zA-Z/]{1,30}$/.test(unit)) {
    fieldErrors.unit = "La unidad debe contener solo letras y barras diagonales";
  }

  if (!minStock?.trim()) fieldErrors.minStock = "El stock mínimo es requerido";
  else {
    const minStockNum = parseInt(minStock);
    if (isNaN(minStockNum) || minStockNum <= 0 || !Number.isInteger(minStockNum)) {
      fieldErrors.minStock = "El stock mínimo debe ser un número entero positivo";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa los campos correctamente", fieldErrors);
  }

  await prisma.inventoryItem.update({
    where: { id },
    data: {
      name,
      category: category as any,
      unit,
      minStock: parseInt(minStock),
    },
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  return successResponse();
}

export async function createStockMovement(itemId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return fieldErrorResponse("No autorizado");

  const type = formData.get("type") as string;
  const quantity = formData.get("quantity") as string;
  const notes = formData.get("notes") as string;

  const fieldErrors: Record<string, string> = {};

  if (!type) fieldErrors.type = "El tipo de movimiento es requerido";
  if (!quantity?.trim()) fieldErrors.quantity = "La cantidad es requerida";
  else {
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
      fieldErrors.quantity = "La cantidad debe ser un número entero positivo";
    }
  }

  if (notes && notes.length > 255) {
    fieldErrors.notes = "Las notas no deben exceder 255 caracteres";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse("Por favor completa los campos correctamente", fieldErrors);
  }

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) return fieldErrorResponse("Artículo no encontrado");

  const quantityNum = parseInt(quantity);
  if (type === "out" && item.quantity - quantityNum < 0) {
    return fieldErrorResponse(
      `Stock insuficiente. El stock actual es ${item.quantity} ${item.unit}.`,
      { quantity: `No hay suficiente stock disponible` }
    );
  }

  await prisma.$transaction([
    prisma.inventoryMovement.create({
      data: {
        type: type as any,
        quantity: quantityNum,
        notes: notes || "",
        itemId,
        userId: parseInt(session.user.id as string),
      },
    }),
    prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantity: type === "in" ? item.quantity + quantityNum : item.quantity - quantityNum,
      },
    }),
  ]);

  revalidatePath(`/inventory/${itemId}`);
  revalidatePath("/inventory");
  return successResponse();
}

export async function getInventoryItems(filters?: { search?: string; category?: string }) {
  return prisma.inventoryItem.findMany({
    where: {
      ...(filters?.search ? { name: { contains: filters.search } } : {}),
      ...(filters?.category ? { category: filters.category as any } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getInventoryItemById(id: number) {
  if (!id || isNaN(id)) return null;
  return prisma.inventoryItem.findUnique({ where: { id } });
}

export async function getItemMovements(itemId: number) {
  return prisma.inventoryMovement.findMany({
    where: { itemId },
    orderBy: { date: "desc" },
    include: { user: { select: { name: true } } },
  });
}

export async function deleteInventoryItem(id: number) {
  const session = await verifyAdmin();
  if (!session) return { error: "Unauthorized" };

  await prisma.inventoryMovement.deleteMany({ where: { itemId: id } });
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/inventory");
  return { success: true };
}

export async function getStockAlerts() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const alerts = items
    .filter((item) => item.quantity <= item.minStock)
    .sort((a, b) => (a.quantity - a.minStock) - (b.quantity - b.minStock));

  return alerts;
}

export async function getStockAlertsCount() {
  const items = await prisma.inventoryItem.findMany();
  return items.filter((item) => item.quantity <= item.minStock).length;
}