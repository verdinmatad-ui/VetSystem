/**
 * Script MANUAL para crear la base de datos vacía en MySQL.
 *
 * Prisma NO crea la base de datos por ti: `prisma migrate deploy` /
 * `prisma migrate dev` asumen que la base ya existe y solo se encargan
 * de crear las TABLAS dentro de ella. Este script cubre ese paso previo:
 * lee `DATABASE_URL` desde `.env`, extrae host/puerto/usuario/contraseña/
 * nombre de base, y ejecuta un `CREATE DATABASE IF NOT EXISTS` usando el
 * cliente `mysql` de línea de comandos.
 *
 * Requiere tener el cliente `mysql` instalado y accesible en el PATH
 * (viene con la mayoría de instalaciones de MySQL/MariaDB).
 *
 * Uso:
 *   npm run db:create              # solo crea la base de datos
 *   npm run db:create -- --migrate # crea la base de datos y aplica las migraciones
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseDatabaseUrl(raw: string) {
  const url = new URL(raw);

  if (url.protocol !== "mysql:") {
    throw new Error(
      `DATABASE_URL debe usar el protocolo mysql://, se encontró "${url.protocol}"`
    );
  }

  const database = url.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_URL no incluye el nombre de la base de datos");
  }

  return {
    host: url.hostname,
    port: url.port || "3306",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
  };
}

function main() {
  loadEnvFile();

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('No se encontró DATABASE_URL. Crea un archivo ".env" en la raíz del proyecto (ver README).');
    process.exit(1);
  }

  const { host, port, user, password, database } = parseDatabaseUrl(rawUrl);

  console.log(`Creando base de datos "${database}" en ${host}:${port} (si no existe ya)...`);

  const passwordFlag = password ? `-p${password}` : "";
  const sql = `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;

  const command = [
    "mysql",
    `-h ${host}`,
    `-P ${port}`,
    `-u ${user}`,
    passwordFlag,
    `-e "${sql}"`,
  ]
    .filter(Boolean)
    .join(" ");

  try {
    execSync(command, { stdio: ["ignore", "pipe", "pipe"] });
  } catch (err: any) {
    console.error("No se pudo crear la base de datos.");
    console.error("Verifica que el cliente \"mysql\" esté instalado y en el PATH, y que el usuario/contraseña de DATABASE_URL tengan permiso para crear bases de datos.");
    console.error(err?.stderr?.toString?.() ?? err);
    process.exit(1);
  }

  console.log(`Base de datos "${database}" lista.`);

  if (process.argv.includes("--migrate")) {
    console.log("\nAplicando migraciones (prisma migrate deploy)...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("\nListo. Corre \"npm run dev\" para levantar el proyecto.");
  } else {
    console.log('\nAhora corre "npx prisma migrate deploy" para crear las tablas.');
  }
}

main();
