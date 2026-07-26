import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function verifySession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

export async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id as string) },
  });

  if (user?.role !== "admin") return null;
  return session;
}

export async function isCurrentUserAdmin() {
  const session = await verifyAdmin();
  return !!session;
}