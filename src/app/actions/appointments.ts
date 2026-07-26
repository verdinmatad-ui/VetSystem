"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyAdmin } from "@/lib/auth-helpers";
import { fieldErrorResponse, successResponse } from "@/lib/validation";

export async function createAppointment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return fieldErrorResponse("No autorizado");

  const petId = formData.get("petId") as string;
  const date = formData.get("date") as string;
  const reason = formData.get("reason") as string;

  const fieldErrors: Record<string, string> = {};

  if (!petId?.trim()) fieldErrors.petId = "Debes seleccionar una mascota";
  if (!date?.trim()) fieldErrors.date = "La fecha y hora son requeridas";
  if (!reason?.trim()) fieldErrors.reason = "El motivo es requerido";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse(
      "Por favor completa todos los campos requeridos",
      fieldErrors,
    );
  }

  const appointmentDate = new Date(date);

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (appointmentDate <= fiveMinutesAgo) {
    fieldErrors.date = "La fecha y hora deben ser en el futuro";
  }

  const windowStart = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
  const windowEnd = new Date(appointmentDate.getTime() + 30 * 60 * 1000);

  const duplicate = await prisma.appointment.findFirst({
    where: {
      status: { not: "cancelled" },
      date: {
        gte: windowStart,
        lt: windowEnd,
      },
    },
  });

  if (duplicate) {
    const time = new Date(duplicate.date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    fieldErrors.date = `Ya existe una cita a las ${time}. Deja al menos 30 minutos entre citas`;
    return fieldErrorResponse("Conflicto de horario", fieldErrors);
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
  return successResponse();
}

export async function updateAppointment(id: number, formData: FormData) {
  const date = formData.get("date") as string;
  const reason = formData.get("reason") as string;
  const petId = formData.get("petId") as string;

  const fieldErrors: Record<string, string> = {};

  if (!date?.trim()) fieldErrors.date = "La fecha y hora son requeridas";
  if (!reason?.trim()) fieldErrors.reason = "El motivo es requerido";

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrorResponse(
      "Por favor completa todos los campos requeridos",
      fieldErrors,
    );
  }

  const appointmentDate = new Date(date);

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (appointmentDate <= fiveMinutesAgo) {
    fieldErrors.date = "La fecha y hora deben ser en el futuro";
  }

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
    const time = new Date(duplicate.date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    fieldErrors.date = `Ya existe una cita a las ${time}. Deja al menos 30 minutos entre citas`;
    return fieldErrorResponse("Conflicto de horario", fieldErrors);
  }

  await prisma.appointment.update({
    where: { id },
    data: { date: appointmentDate, reason },
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  return successResponse();
}

export async function cancelAppointment(id: number) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) return fieldErrorResponse("Cita no encontrada");
  if (appointment.status === "completed") {
    return fieldErrorResponse("No puedes cancelar una cita completada");
  }
  if (appointment.status === "cancelled") {
    return fieldErrorResponse("La cita ya está cancelada");
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  return successResponse();
}

export async function deleteAppointment(id: number) {
  const session = await verifyAdmin();
  if (!session) return fieldErrorResponse("No autorizado");

  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) return fieldErrorResponse("Cita no encontrada");

  if (appointment.status !== "cancelled") {
    return fieldErrorResponse(
      "Solo las citas canceladas pueden ser eliminadas",
    );
  }

  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/appointments");
  return successResponse();
}

export async function completeAppointment(id: number) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) return fieldErrorResponse("Cita no encontrada");
  if (appointment.status === "cancelled") {
    return fieldErrorResponse("No puedes completar una cita cancelada");
  }
  if (appointment.status === "completed") {
    return fieldErrorResponse("La cita ya está completada");
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "completed" },
  });

  revalidatePath("/appointments/today");
  revalidatePath(`/appointments/${id}`);
  return successResponse();
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

export async function getAllAppointments(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) {
      where.date.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.date.lte = new Date(filters.dateTo + "T23:59:59");
    }
  }

  return prisma.appointment.findMany({
    where,
    include: {
      pet: { include: { owner: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getAppointmentById(id: number) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      pet: { include: { owner: true } },
      user: { select: { name: true } },
    },
  });
}
