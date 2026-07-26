/**
 * Script AUTOMÁTICO que corre en cada `npm start`.
 *
 * Este script NO borra nada. Solo revisa si existe al menos un usuario
 * con rol "admin" en la base de datos. Si no existe ninguno, crea un
 * administrador por defecto. Si ya hay al menos uno, no hace nada.
 *
 * Es seguro correrlo cada vez que arranca el servidor (es idempotente).
 *
 * Credenciales del admin por defecto configurables por variables de entorno:
 *   DEFAULT_ADMIN_NAME     (default: "Administrador")
 *   DEFAULT_ADMIN_EMAIL    (default: "admin@vetclinic.com")
 *   DEFAULT_ADMIN_PASSWORD (default: "Admin123")
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "Administrador";
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@vetclinic.com";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "Admin123";

async function main() {
  const adminCount = await prisma.user.count({ where: { role: "admin" } });

  if (adminCount > 0) {
    console.log(`✅ Ya existe${adminCount > 1 ? "n" : ""} ${adminCount} administrador${adminCount > 1 ? "es" : ""}. No se crea ninguno nuevo.`);
    return;
  }

  console.log("No hay ningún administrador en la base de datos.");

  const existing = await prisma.user.findUnique({ where: { email: DEFAULT_ADMIN_EMAIL } });
  if (existing) {
    // Ya existe un usuario con ese correo pero con otro rol: lo promovemos a admin
    // en vez de fallar por email duplicado.
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin" },
    });
    console.log(`Usuario existente (${DEFAULT_ADMIN_EMAIL}) promovido a administrador.`);
    return;
  }

  const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  await prisma.user.create({
    data: {
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    },
  });

  console.log(`Administrador por defecto creado: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
  console.log("Cambia esta contraseña después de iniciar sesión.");
}

main()
  .catch((err) => {
    console.error("Error asegurando el administrador por defecto:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());