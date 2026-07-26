"use client";

import { useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  reason: string;
}

export default function AppointmentCalendar({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();
  const [view, setView] = useState<"month" | "week">("month");
  const [date, setDate] = useState(new Date());

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const colors = {
      pending: { backgroundColor: "#FEF9C3", color: "#854D0E", border: "#FDE047" },
      completed: { backgroundColor: "#DCFCE7", color: "#166534", border: "#86EFAC" },
      cancelled: { backgroundColor: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" },
    };
    const style = colors[event.status as keyof typeof colors] || colors.pending;
    return {
      style: {
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "500",
        padding: "1px 6px",
      }
    };
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    router.push(`/appointments/${event.id}`);
  }, [router]);

  return (
    <div>
      {/* Custom toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(new Date())}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors">
            Hoy
          </button>
          <button onClick={() => {
            const d = new Date(date);
            view === "month" ? d.setMonth(d.getMonth() - 1) : d.setDate(d.getDate() - 7);
            setDate(d);
          }}
            className="text-xs px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors">
            ‹
          </button>
          <button onClick={() => {
            const d = new Date(date);
            view === "month" ? d.setMonth(d.getMonth() + 1) : d.setDate(d.getDate() + 7);
            setDate(d);
          }}
            className="text-xs px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors">
            ›
          </button>
          <span className="text-sm font-medium text-zinc-700 ml-2">
            {format(date, view === "month" ? "MMMM yyyy" : "'Week of' MMM d, yyyy")}
          </span>
        </div>

        {/* View toggle — top right */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          {(["month", "week"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={
                "text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-colors " +
                (view === v ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700")
              }>
              {v}
            </button>
          ))}
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        view={view}
        date={date}
        onView={() => {}}
        onNavigate={() => {}}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        toolbar={false}
        style={{ height: 600 }}
        popup
      />

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-end">
        {[
          { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
          { label: "Completada", color: "bg-green-100 text-green-700 border-green-300" },
          { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-300" },
        ].map((item) => (
          <span key={item.label} className={`text-xs font-medium px-2 py-0.5 rounded-full border ${item.color}`}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}