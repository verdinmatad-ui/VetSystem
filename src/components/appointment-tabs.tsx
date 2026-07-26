"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, CalendarDays, Clock } from "lucide-react";

const tabs = [
  { label: "Lista", href: "/appointments", icon: List },
  { label: "Agenda de hoy", href: "/appointments/today", icon: Clock },
  { label: "Calendario", href: "/appointments/calendar", icon: CalendarDays },
];

export default function AppointmentTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl mb-6 w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors " +
              (isActive
                ? "bg-white text-zinc-800 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700")
            }
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}