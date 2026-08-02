"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Calendar,
  PawPrint,
  Users,
  AlertTriangle,
  Syringe,
  CalendarCheck,
} from "lucide-react";

// ---------- Tipos ----------

type Summary = {
  totalPets: number;
  totalOwners: number;
  totalAppointments: number;
  appointmentsThisMonth: number;
  lowStockCount: number;
  totalVaccinations: number;
};

type Props = {
  summary: Summary;
  appointmentsByStatus: { status: string; label: string; count: number }[];
  appointmentsByMonth: { month: string; total: number; completed: number; cancelled: number; pending: number }[];
  petsBySpecies: { species: string; count: number }[];
  petsByGender: { gender: string; label: string; count: number }[];
  topOwners: { id: number; name: string; count: number }[];
  inventoryByMonth: { month: string; in: number; out: number }[];
  lowStockByCategory: { category: string; label: string; count: number }[];
  topDiagnoses: { diagnosis: string; count: number }[];
  vaccinationsByMonth: { month: string; count: number }[];
};

// Paleta consistente con el resto del sistema (reports, dashboard)
const COLORS = {
  emerald: "#10b981",
  blue: "#3b82f6",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  red: "#ef4444",
  zinc: "#a1a1aa",
};

const PIE_COLORS = [COLORS.emerald, COLORS.blue, COLORS.amber, COLORS.purple, COLORS.red, COLORS.zinc];

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm font-semibold text-zinc-700">{title}</p>
      {subtitle && <p className="text-xs text-zinc-400 mt-0.5 mb-2">{subtitle}</p>}
      <div className={subtitle ? "mt-2" : "mt-4"}>{children}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="h-[250px] flex items-center justify-center">
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-zinc-800">{value}</p>
      <p className="text-xs text-zinc-400 mt-1">{hint}</p>
    </div>
  );
}

export default function StatisticsClient({
  summary,
  appointmentsByStatus,
  appointmentsByMonth,
  petsBySpecies,
  petsByGender,
  topOwners,
  inventoryByMonth,
  lowStockByCategory,
  topDiagnoses,
  vaccinationsByMonth,
}: Props) {
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-5 lg:grid-cols-6">
        <KpiCard label="Mascotas" value={summary.totalPets} hint="Total registradas"
          icon={PawPrint} color="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Dueños" value={summary.totalOwners} hint="Total registrados"
          icon={Users} color="bg-blue-50 text-blue-600" />
        <KpiCard label="Citas" value={summary.totalAppointments} hint="Histórico total"
          icon={Calendar} color="bg-purple-50 text-purple-600" />
        <KpiCard label="Citas del mes" value={summary.appointmentsThisMonth} hint="Mes en curso"
          icon={CalendarCheck} color="bg-indigo-50 text-indigo-600" />
        <KpiCard label="Stock bajo" value={summary.lowStockCount} hint="Productos por reponer"
          icon={AlertTriangle} color="bg-amber-50 text-amber-600" />
        <KpiCard label="Vacunas" value={summary.totalVaccinations} hint="Aplicadas en total"
          icon={Syringe} color="bg-red-50 text-red-600" />
      </div>

      {/* Citas */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <ChartCard title="Citas por mes" subtitle="Últimos 6 meses, por estado">
            {appointmentsByMonth.every((m) => m.total === 0) ? (
              <EmptyState label="No hay citas registradas en este periodo" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={appointmentsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e4e4e7" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="completed" name="Completadas" stackId="a" fill={COLORS.emerald} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" name="Pendientes" stackId="a" fill={COLORS.amber} />
                  <Bar dataKey="cancelled" name="Canceladas" stackId="a" fill={COLORS.red} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Citas por estado" subtitle="Distribución histórica">
          {appointmentsByStatus.length === 0 ? (
            <EmptyState label="No hay citas registradas" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={appointmentsByStatus} dataKey="count" nameKey="label" cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {appointmentsByStatus.map((entry, i) => (
                    <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e4e4e7" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Mascotas */}
      <div className="grid grid-cols-3 gap-5">
        <ChartCard title="Mascotas por especie">
          {petsBySpecies.length === 0 ? (
            <EmptyState label="No hay mascotas registradas" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={petsBySpecies} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="species" width={70} tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e4e4e7" }} />
                <Bar dataKey="count" name="Mascotas" fill={COLORS.emerald} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Mascotas por género">
          {petsByGender.length === 0 ? (
            <EmptyState label="No hay mascotas registradas" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={petsByGender} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {petsByGender.map((entry, i) => (
                    <Cell key={entry.gender} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e4e4e7" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Dueños con más mascotas" subtitle="Top 5">
          {topOwners.length === 0 ? (
            <EmptyState label="No hay dueños con mascotas registradas" />
          ) : (
            <div className="space-y-3 pt-1">
              {topOwners.map((owner, i) => (
                <div key={owner.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-semibold text-zinc-500 shrink-0">
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm text-zinc-700 truncate">{owner.name}</p>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                    {owner.count} mascota{owner.count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Inventario */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <ChartCard title="Movimientos de inventario" subtitle="Entradas vs. salidas, últimos 6 meses">
            {inventoryByMonth.every((m) => m.in === 0 && m.out === 0) ? (
              <EmptyState label="No hay movimientos registrados en este periodo" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={inventoryByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e4e4e7" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="in" name="Entradas" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="out" name="Salidas" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Stock bajo por categoría" subtitle="Productos en o por debajo del mínimo">
          {lowStockByCategory.every((c) => c.count === 0) ? (
            <EmptyState label="No hay alertas de stock" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={lowStockByCategory} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {lowStockByCategory.map((entry, i) => (
                    <Cell key={entry.category} fill={i === 0 ? COLORS.red : COLORS.amber} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e4e4e7" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Historial médico y vacunas */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <ChartCard title="Vacunas aplicadas por mes" subtitle="Últimos 6 meses">
            {vaccinationsByMonth.every((m) => m.count === 0) ? (
              <EmptyState label="No hay vacunas registradas en este periodo" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={vaccinationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e4e4e7" }} />
                  <Line type="monotone" dataKey="count" name="Vacunas" stroke={COLORS.purple} strokeWidth={2.5}
                    dot={{ r: 4, fill: COLORS.purple }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Diagnósticos más frecuentes" subtitle="Top 5 en historial médico">
          {topDiagnoses.length === 0 ? (
            <EmptyState label="No hay registros médicos" />
          ) : (
            <div className="space-y-3 pt-1">
              {topDiagnoses.map((d, i) => (
                <div key={d.diagnosis} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-semibold text-zinc-500 shrink-0">
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm text-zinc-700 truncate" title={d.diagnosis}>{d.diagnosis}</p>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full shrink-0">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}