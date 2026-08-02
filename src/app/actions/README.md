# Backend (Server Actions)

VetSystem es un monolito **Next.js 16 (App Router)**. No hay un servidor Express/NestJS aparte: toda la lógica de negocio vive en **Server Actions** (`"use server"`), funciones de servidor que Next.js expone como endpoints internos y que se invocan directo desde los componentes de React, sin pasar por `fetch` manual.

> La única ruta HTTP tradicional del proyecto es `src/app/api/auth/`, que expone el flujo de NextAuth (login). Por eso las pruebas de API con Postman/Bruno no aplican de la misma forma que en un backend REST clásico; ver [`postman/README.md`](../../../postman/README.md).

## Ejecución

Se instala y corre junto con el resto del proyecto (ver README raíz):

```bash
npm install
npx prisma migrate deploy
npm run dev
```

No requiere ningún paso adicional: los Server Actions se compilan y sirven automáticamente con `npm run dev` / `npm run build && npm start`.

## Librerías usadas en esta capa

| Librería | Uso |
|---|---|
| `@prisma/client` / `prisma` | ORM y acceso a MySQL |
| `next-auth` (v5) | Autenticación por credenciales, sesión JWT |
| `bcryptjs` | Hash y verificación de contraseñas |
| `next/cache` (`revalidatePath`) | Invalidar el caché de rutas tras cada mutación |
| `@react-pdf/renderer` | Generación de PDFs de reportes |

## Estructura

```
src/app/actions/
├── appointments.ts   # Citas
├── inventory.ts      # Inventario y movimientos de stock
├── medical.ts        # Historial médico y vacunas
├── owners.ts         # Dueños
├── pets.ts           # Mascotas
├── reports.ts        # Reportes filtrados (para exportar a PDF)
├── statistics.ts      # Agregaciones para el módulo de Estadísticas
└── users.ts           # Usuarios del sistema (solo admin)
```

## CRUD por entidad

Todas las entidades principales tienen su ciclo completo Crear / Leer / Actualizar / Eliminar:

| Entidad | Crear | Leer | Actualizar | Eliminar |
|---|---|---|---|---|
| Dueños | `createOwner` | `getOwners`, `getOwnerById` | `updateOwner` | `deleteOwner` |
| Mascotas | `createPet` | `getPets`, `getPetById` | `updatePet` | `deletePet` |
| Citas | `createAppointment` | `getTodayAppointments`, `getAllAppointments`, `getAppointmentById` | `updateAppointment`, `completeAppointment`, `cancelAppointment` | `deleteAppointment` |
| Historial médico | `createMedicalRecord` | `getMedicalRecords`, `getMedicalRecordById` | `updateMedicalRecord` | `deleteMedicalRecord` |
| Vacunas | `createVaccination` | `getVaccinations`, `getVaccinationById` | `updateVaccination` | `deleteVaccination` |
| Inventario | `createInventoryItem` | `getInventoryItems`, `getInventoryItemById` | `updateInventoryItem` | `deleteInventoryItem` |
| Movimientos de stock | `createStockMovement` | `getItemMovements`, `getStockAlerts` | *(no se editan, se registran nuevos)* | *(no aplica)* |
| Usuarios | `createUser` | `getUsers`, `getUserById` | `updateUser`, `changeUserPassword` | `deleteUser` |

Cada `create`/`update` valida campos requeridos en servidor y devuelve errores de campo estructurados (`fieldErrorResponse`) antes de tocar la base de datos.

## Consultas que reflejan relaciones entre tablas

Mínimo dos, con su objetivo:

1. **`getAllAppointments` (`appointments.ts`)**: trae citas incluyendo `pet` y, dentro de `pet`, su `owner` (`include: { pet: { include: { owner: true } } }`). Objetivo: mostrar en una sola pantalla la cita, de qué mascota es y a qué dueño localizar, sin hacer consultas separadas.
2. **`getTopOwnersByPets` (`statistics.ts`)**: cuenta, por cada `Owner`, cuántos `Pet` tiene relacionados (`_count: { select: { pets: true } }`, ordenado por ese conteo). Objetivo: identificar a los dueños con más mascotas registradas para el panel de estadísticas.
3. **`getMedicalRecords` (`medical.ts`)**: trae los registros médicos de una mascota incluyendo el `user` (veterinario/staff) que los creó. Objetivo: saber quién hizo cada diagnóstico, no solo qué se diagnosticó.
4. **`getLowStockByCategory` (`statistics.ts`)**: consulta cruda (`$queryRaw`) que compara `quantity` contra `minStock` en `InventoryItem` y agrupa el resultado por `category`. Objetivo: distinguir si el riesgo de desabasto está más en insumos médicos o en operacionales.

## Nota sobre pruebas de API (Postman/Bruno)

Como el CRUD se ejecuta vía Server Actions y no vía endpoints REST propios, no existe una colección Postman equivalente a "un endpoint por operación". Las operaciones se prueban:

- Funcionalmente, desde la interfaz (formularios de cada módulo).
- A nivel de red, inspeccionando las peticiones `POST` que Next.js genera automáticamente hacia la ruta de la página con el header `Next-Action` (visibles en la pestaña Network del navegador).
- La única ruta que sí es un endpoint HTTP convencional y se puede probar en Postman es `POST /api/auth/callback/credentials` (login), parte de NextAuth.

El detalle completo de las pruebas que sí se hicieron con Postman está en [`postman/README.md`](../../../postman/README.md).
