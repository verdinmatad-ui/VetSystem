# VetSystem

Sistema web de gestión para clínicas veterinarias: dueños, mascotas, historiales médicos, vacunación, citas, inventario, estadísticas, reportes y administración de usuarios con acceso por rol (admin/staff).

## Arquitectura general

VetSystem es un monolito construido con **Next.js 16 (App Router)** y **React 19**, en TypeScript. No existe un servidor Express o NestJS por separado: la lógica de negocio vive en **Server Actions** dentro de `src/app/actions/`, que Next.js expone como endpoints internos y que se invocan directo desde los componentes de React. **Prisma ORM** conecta esas Server Actions con una base de datos **MySQL**. La autenticación se maneja con **NextAuth v5** (Credentials, sesión JWT), cuya única ruta HTTP tradicional es `src/app/api/auth/`. El resto del sistema —dueños, mascotas, historial médico, vacunación, citas, inventario, estadísticas y reportes— no expone endpoints REST propios.

![Arquitectura general de VetSystem](./docs/architecture.png)

## Documentación por etapa

Este README cubre la visión general, el stack y la instalación del proyecto completo. Cada etapa tiene su propio README con más detalle:

| Etapa | Ubicación |
|---|---|
| Base de datos (modelo, diagrama ER, scripts) | [`prisma/README.md`](./prisma/README.md) |
| Backend (Server Actions, CRUD, consultas, funcionalidad avanzada) | [`src/app/actions/README.md`](./src/app/actions/README.md) |
| Frontend (rutas, componentes, capturas, ejecución) | [`src/app/README.md`](./src/app/README.md) |
| Pruebas de API (Postman) | [`postman/README.md`](./postman/README.md) |

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Prisma](https://www.prisma.io) ORM sobre **MySQL**
- [NextAuth v5](https://authjs.dev) (Credentials) para autenticación
- Tailwind CSS 4 + shadcn/ui
- [Recharts](https://recharts.org) para las gráficas del módulo de estadísticas
- `@react-pdf/renderer` para la exportación de reportes a PDF

## Requisitos previos

- **Node.js 20 o superior**
- **npm** (el repo trae `package-lock.json`)
- **MySQL** corriendo localmente o accesible por red (v8 recomendado), con una base de datos vacía creada de antemano
- Git

## 1. Clonar e instalar dependencias

```bash
git clone https://github.com/verdinmatad-ui/VetSystem.git
cd VetSystem
npm install
```

## 2. Configurar variables de entorno

Crea variables de entorno en la raíz del proyecto:

```bash
touch .env
```

Con este contenido, ajustando usuario/contraseña/host/nombre de tu base de datos MySQL:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/vetsystem"
AUTH_SECRET="genera-un-valor-aleatorio-largo-aqui"
```

- `DATABASE_URL`: cadena de conexión de Prisma hacia tu MySQL. La base de datos (`vetsystem` en el ejemplo) debe existir antes de correr las migraciones; Prisma no la crea sola.
- `AUTH_SECRET`: lo requiere NextAuth v5 para firmar las sesiones. Genera uno rápido con:
  ```bash
  npx auth secret
  # o, alternativamente:
  openssl rand -base64 32
  ```

## 3. Preparar la base de datos

Prisma no crea la base de datos por ti, solo las tablas dentro de ella. Si aún no existe una base de datos vacía con el nombre que pusiste en `DATABASE_URL`, créala con:

```bash
npm run db:create
```

Lee `DATABASE_URL` desde tu `.env` y ejecuta un `CREATE DATABASE IF NOT EXISTS` usando el cliente `mysql` (debe estar instalado y en el PATH). Si prefieres crear la base de datos y aplicar las migraciones en un solo paso:

```bash
npm run db:create -- --migrate
```

Si ya tienes la base de datos creada (por ejemplo, la creaste a mano o con otra herramienta), sáltate este paso y aplica directamente las migraciones existentes (crea todas las tablas: usuarios, dueños, mascotas, historiales, vacunas, citas, inventario, movimientos):

```bash
npx prisma migrate deploy
```

> Si estás en desarrollo y prefieres poder generar nuevas migraciones sobre la marcha, usa `npx prisma migrate dev` en su lugar.

## 4. Primer arranque y acceso

El sistema **no trae ningún usuario por defecto en la base de datos**, pero no hace falta crearlo a mano. Cada vez que corres:

```bash
npm start
```

se ejecuta primero `prisma/ensure-admin.ts`, un script automático e idempotente que revisa si existe al menos un usuario con rol `admin`; si no hay ninguno, crea uno por defecto:

- Email: `admin@vetclinic.com`
- Password: `Admin123`

(configurable con las variables de entorno `DEFAULT_ADMIN_NAME`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD` si quieren usar otras credenciales). Si ya existe un admin, el script no hace nada: es seguro correrlo en cada arranque.

> ⚠️ **Importante:** este script **solo se dispara con `npm start`** (producción), no con `npm run dev`. Si van a desarrollar con `npm run dev` y la base está vacía, corran una vez manualmente:
> ```bash
> npx ts-node prisma/ensure-admin.ts
> ```
> para tener con qué iniciar sesión.

> ⚠️ **El seed anterior (`prisma/seed.ts`) ya no existe en el repo**, pero `package.json` todavía lo referencia en el bloque `"prisma": { "seed": "..." }`.

## 5. Correr el proyecto

**Modo desarrollo** (recarga en caliente, recomendado mientras programan):
```bash
npm run dev
```

**Modo producción** (para probarlo tal como se vería en la demo):
```bash
npm run build
npm start
```

En ambos casos, abre [http://localhost:3000](http://localhost:3000). Redirige automáticamente a `/login`.

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor en modo desarrollo (NO corre `ensure-admin` automáticamente) |
| `npm run build` | Compila la app para producción |
| `npm start` | Corre `ensure-admin.ts` y luego levanta la build de producción (requiere `npm run build` antes) |
| `npm run lint` | Corre ESLint |
| `npm run db:create` | Crea la base de datos vacía en MySQL a partir de `DATABASE_URL` (agrega `-- --migrate` para aplicar migraciones justo después) |
| `npm run db:reset` | Borra TODOS los datos (usuarios incluidos) pidiendo confirmación escrita; no crea ningún usuario. Usar `npm run db:reset -- --force` para saltarse la confirmación |
| `npx prisma migrate dev` | Crea/aplica migraciones en desarrollo |
| `npx prisma migrate deploy` | Aplica migraciones existentes sin generar nuevas |
| `npx prisma studio` | Interfaz visual para ver/editar la base de datos directamente |
| ~~`npx prisma db seed`~~ | ⚠️ Roto: apunta a un archivo que ya no existe |

## Dejar la base de datos limpia (para la demo)

Usa el script propio del proyecto, no `npx prisma migrate reset` (ese además está roto ahora mismo por el seed faltante):

```bash
npm run db:reset
```

Va a pedir que escribas `RESET` para confirmar (o usa `npm run db:reset -- --force` para saltarte la confirmación). Esto borra todo: usuarios, dueños, mascotas, citas, historiales, vacunas e inventario, y no deja ningún usuario. Para volver a tener acceso, simplemente corre:

```bash
npm start
```

y `ensure-admin.ts` va a recrear el administrador por defecto (`admin@vetclinic.com` / `Admin123`) automáticamente.

## Notas

- Las fotos de mascota que se suban se guardan en `public/uploads/` (el directorio ya existe en el repo; su contenido no se versiona, salvo un `.gitkeep`).
- `src/middleware.ts` protege todas las rutas: sin sesión redirige a `/login`, y las rutas bajo `/admin` están restringidas a usuarios con rol `admin`.
- **Arquitectura del backend:** este proyecto es un monolito Next.js. Toda la lógica de negocio (CRUD, validaciones, consultas con relaciones) vive en Server Actions dentro de `src/app/actions/` en lugar de endpoints REST independientes. La única ruta HTTP tradicional es `src/app/api/auth/`, que expone el flujo de NextAuth. Por eso el CRUD no se prueba con Postman/Bruno como en un backend REST clásico; el detalle está en [`src/app/actions/README.md`](./src/app/actions/README.md) y en [`postman/README.md`](./postman/README.md).
- El módulo de **Estadísticas** (`/statistics`) centraliza gráficas (citas, mascotas, inventario, vacunas, diagnósticos) construidas con Recharts a partir de agregaciones en `src/app/actions/statistics.ts`.
