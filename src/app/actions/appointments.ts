"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createAppointment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const petId = formData.get("petId") as string;
  const date = formData.get("date") as string;
  const reason = formData.get("reason") as string;

  if (!petId || !date || !reason) {
    return { error: "All fields are required" };
  }

  const appointmentDate = new Date(date);
  const windowStart = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
  const windowEnd = new Date(appointmentDate.getTime() + 30 * 60 * 1000);

  const duplicate = await prisma.appointment.findFirst({
    where: {
      status: { not: "cancelled" },
      date: {
        gte: windowStart,
        lt: windowEnd,
      },
      ...(petId
        ? { NOT: { petId: parseInt(petId) === 0 ? -1 : undefined } }
        : {}),
    },
  });

  if (duplicate) {
    return {
      error: `There is already an appointment at ${new Date(duplicate.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}. Please leave at least 30 minutes between appointments.`,
    };
  }

  await prisma.appointment.create({
    data: {
      petId: parseInt(petId),
      userId: parseInt(session.user.id as string),
      date: appointmentDate,
      reason,
      status: "pending",
    },
  });

  revalidatePath("/appointments");
  return { success: true };
}

export async function updateAppointment(id: number, formData: FormData) {
  const date = formData.get("date") as string;
  const reason = formData.get("reason") as string;
  const petId = formData.get("petId") as string;

  if (!date || !reason) {
    return { error: "All fields are required" };
  }

  const appointmentDate = new Date(date);
  const windowStart = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
  const windowEnd = new Date(appointmentDate.getTime() + 30 * 60 * 1000);

  const duplicate = await prisma.appointment.findFirst({
    where: {
      status: { not: "cancelled" },
      date: {
        gte: windowStart,
        lt: windowEnd,
      },
      NOT: { id },
    },
  });

  if (duplicate) {
    return {
      error: `There is already an appointment at ${new Date(duplicate.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}. Please leave at least 30 minutes between appointments.`,
    };
  }

  await prisma.appointment.update({
    where: { id },
    data: { date: appointmentDate, reason },
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  return { success: true };
}

export async function cancelAppointment(id: number) {
  await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  return { success: true };
}

export async function getAppointments(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return prisma.appointment.findMany({
    where: {
      ...(filters?.status ? { status: filters.status as any } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            date: {
              ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
              ...(filters.dateTo
                ? { lte: new Date(filters.dateTo + "T23:59:59") }
                : {}),
            },
          }
        : {}),
    },
    include: {
      pet: { include: { owner: true } },
      user: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getAppointmentById(id: number) {
  if (!id || isNaN(id)) return null;
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      pet: { include: { owner: true } },
      user: { select: { name: true } },
    },
  });
}

export async function deleteAppointment(id: number) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) return { error: "Appointment not found" };

  if (appointment.status !== "cancelled") {
    return { error: "Only cancelled appointments can be deleted" };
  }

  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/appointments");
  return { success: true };
}

export async function completeAppointment(id: number) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) return { error: "Appointment not found" };
  if (appointment.status === "cancelled") {
    return { error: "Cannot complete a cancelled appointment" };
  }
  if (appointment.status === "completed") {
    return { error: "Appointment is already completed" };
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "completed" },
  });

  revalidatePath("/appointments/today");
  revalidatePath(`/appointments/${id}`);
  return { success: true };
}

export async function getTodayAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.appointment.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    include: {
      pet: { include: { owner: true } },
      user: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getAllAppointments() {
  return prisma.appointment.findMany({
    include: {
      pet: { include: { owner: true } },
    },
    orderBy: { date: "asc" },
  });
}
