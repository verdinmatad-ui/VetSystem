"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function createInventoryItem(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const minStock = formData.get("minStock") as string;

  if (!name || !category || !unit || !minStock) {
    return { error: "All fields are required" };
  }

  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]{2,100}$/.test(name)) {
  return { error: "Name must contain only letters, numbers, spaces and hyphens, 2-100 characters" };
}

  if (!/^[a-zA-Z/]{1,30}$/.test(unit)) {
    return { error: "Unit must contain only letters and slashes" };
  }

  const minStockNum = parseInt(minStock);
  if (isNaN(minStockNum) || minStockNum <= 0 || !Number.isInteger(minStockNum)) {
    return { error: "Minimum stock must be a positive integer greater than zero" };
  }

  await prisma.inventoryItem.create({
    data: {
      name,
      category: category as any,
      unit,
      minStock: minStockNum,
      quantity: 0,
    },
  });

  revalidatePath("/inventory");
  return { success: true };
}

export async function updateInventoryItem(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const minStock = formData.get("minStock") as string;

  if (!name || !category || !unit || !minStock) {
    return { error: "All fields are required" };
  }

  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]{2,100}$/.test(name)) {
  return { error: "Name must contain only letters, numbers, spaces and hyphens, 2-100 characters" };
}

  if (!/^[a-zA-Z/]{1,30}$/.test(unit)) {
    return { error: "Unit must contain only letters and slashes" };
  }

  const minStockNum = parseInt(minStock);
  if (isNaN(minStockNum) || minStockNum <= 0 || !Number.isInteger(minStockNum)) {
    return { error: "Minimum stock must be a positive integer greater than zero" };
  }

  await prisma.inventoryItem.update({
    where: { id },
    data: {
      name,
      category: category as any,
      unit,
      minStock: minStockNum,
    },
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  return { success: true };
}

export async function createStockMovement(itemId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const type = formData.get("type") as string;
  const quantity = formData.get("quantity") as string;
  const notes = formData.get("notes") as string;

  if (!type || !quantity) {
    return { error: "Type and quantity are required" };
  }

  const quantityNum = parseInt(quantity);
  if (isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
    return { error: "Quantity must be a positive integer greater than zero" };
  }

  if (notes && notes.length > 255) {
    return { error: "Notes must not exceed 255 characters" };
  }

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Item not found" };

  if (type === "out" && item.quantity - quantityNum < 0) {
    return { error: `Insufficient stock. Current stock is ${item.quantity} ${item.unit}.` };
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
  return { success: true };
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