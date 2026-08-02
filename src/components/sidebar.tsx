"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, PawPrint, Calendar, Package, BarChart2, TrendingUp, LogOut, Users, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";
import { getStockAlertsCount } from "@/app/actions/inventory";

const navItems = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Dueños", href: "/owners", icon: Users },
  { label: "Mascotas", href: "/pets", icon: PawPrint },
  { label: "Citas", href: "/appointments", icon: Calendar },
  { label: "Inventario", href: "/inventory", icon: Package },
  { label: "Estadísticas", href: "/statistics", icon: TrendingUp },
  { label: "Reportes", href: "/reports", icon: BarChart2 },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    getStockAlertsCount().then(setAlertCount);
  }, [pathname]);

  return (
    <aside className="w-56 bg-white shadow-md flex flex-col py-5 px-3 gap-1 shrink-0">
      <div className="flex items-center gap-2 px-3 mb-6">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <PawPrint className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight">VetSystem</span>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/appointments"
          ? pathname.startsWith("/appointments")
          : item.href === "/inventory"
          ? pathname.startsWith("/inventory")
          : pathname.startsWith(item.href);

        return (
          <Link key={item.href} href={item.href}
            className={
              "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors " +
              (isActive ? "bg-emerald-50 text-emerald-700 font-medium" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700")
            }>
            <div className="relative">
              <Icon className="w-4 h-4" />
              {item.href === "/inventory" && alertCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </div>
            {item.label}
          </Link>
        );
      })}

      {role === "admin" && (
        <>
          <div className="my-2 border-t border-zinc-100" />
          <Link href="/admin/users"
            className={
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors " +
              (pathname.startsWith("/admin") ? "bg-emerald-50 text-emerald-700 font-medium" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700")
            }>
            <ShieldCheck className="w-4 h-4" />
            Administración
          </Link>
        </>
      )}

      <div className="mt-auto">
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}