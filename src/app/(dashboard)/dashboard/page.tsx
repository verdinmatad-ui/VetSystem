import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Calendar,
  PawPrint,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { getStockAlertsCount } from "@/app/actions/inventory";
import AlertToast from "./alert-toast";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const alertCount = await getStockAlertsCount();

  const [todayAppointments, totalPets, lowStockItems] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      include: { pet: true },
      orderBy: { date: "asc" },
    }),
    prisma.pet.count(),
    prisma.$queryRaw<
      { id: number; name: string; quantity: number; minStock: number }[]
    >`
      SELECT id, name, quantity, minStock FROM InventoryItem WHERE quantity <= minStock
    `,
  ]);

  const completed = todayAppointments.filter(
    (a) => a.status === "completed",
  ).length;
  const pending = todayAppointments.filter(
    (a) => a.status === "pending",
  ).length;

  console.log("Buscando desde:", today.toISOString());
  console.log("Buscando hasta:", tomorrow.toISOString());
  console.log("Citas encontradas:", todayAppointments.length);

  return (
    <div className="p-8">
      <AlertToast count={alertCount} />
      {/* Topbar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Panel</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {today.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-semibold">
            {session.user?.name?.charAt(0)}
          </div>
          <span className="text-sm text-zinc-600 font-medium">
            {session.user?.name}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Citas de hoy
            </p>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-800">
            {todayAppointments.length}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {completed} completed · {pending} pending
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Mascotas registradas
            </p>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-800">{totalPets}</p>
          <p className="text-xs text-zinc-400 mt-1">Total en el sistema</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Low Stock Alerts
            </p>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-500">
            {lowStockItems.length}
          </p>
          <p className="text-xs text-zinc-400 mt-1">Productos por debajo del mínimo</p>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-zinc-700 mb-4">
            Today's Appointments
          </p>
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No hay citas programadas para hoy
            </p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((appt) => (
                <div key={appt.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                    <PawPrint className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-700 truncate">
                      {appt.pet.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {appt.date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={
                      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium " +
                      (appt.status === "completed"
                        ? "bg-green-50 text-green-600"
                        : appt.status === "cancelled"
                          ? "bg-red-50 text-red-500"
                          : "bg-yellow-50 text-yellow-600")
                    }
                  >
                    {appt.status === "completed" && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {appt.status === "pending" && <Clock className="w-3 h-3" />}
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-zinc-700">
              Low Stock Alerts
            </p>
            <Link
              href="/inventory/alerts"
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Ver todo
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No hay alertas de stock por el momento
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-700 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Stock actual: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                    min. {item.minStock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
