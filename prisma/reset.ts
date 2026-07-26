/**
 * Script MANUAL de reseteo de base de datos.
 *
 * Esto borra TODOS los datos (usuarios, dueños, mascotas, citas,
 * historiales médicos, vacunas e inventario) y deja la base de datos
 * completamente vacía. No crea ningún usuario.
 *
 * Para volver a tener un administrador, simplemente arranca la app con
 * `npm start`: el script prisma/ensure-admin.ts detecta que no hay
 * ningún admin y crea uno por defecto automáticamente.
 *
 * NO se ejecuta automáticamente en `npm start` ni en el build.
 * Solo corre cuando tú lo invocas a propósito:
 *
 *   npm run db:reset
 *
 * Por seguridad, pide confirmación escrita antes de borrar nada,
 * a menos que se pase la bandera --force.
 */

import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim() === "RESET");
    });
  });
}

async function wipeDatabase() {

  await prisma.medicalRecord.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const force = process.argv.includes("--force");

  console.log("  Este script BORRARÁ TODOS los datos de la base de datos.");
  console.log("   (usuarios, dueños, mascotas, citas, historiales, vacunas e inventario)");
  console.log("   La base quedará completamente vacía, sin ningún usuario.\n");

  if (!force) {
    const confirmed = await confirm('Escribe "RESET" para continuar, o cualquier otra cosa para cancelar: ');
    if (!confirmed) {
      console.log(" Operación cancelada. No se modificó nada.");
      process.exit(0);
    }
  }

  console.log("\n Borrando datos...");
  await wipeDatabase();
  console.log(" Base de datos limpiada. No queda ningún usuario.");
  console.log("   Ejecuta \"npm start\" para que se cree el administrador por defecto automáticamente.");
}

main()
  .catch((err) => {
    console.error(" Error durante el reseteo:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());