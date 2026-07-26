import { getUsers } from "@/app/actions/users";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import UserDeleteButton from "./delete-button";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/dashboard");
  if ((session.user as any).role !== "admin") redirect("/dashboard");

  const currentUserId = Number(session.user.id);
  const users = await getUsers();

  return (
    <div className="p-8">
      <Breadcrumb items={[{ label: "Usuarios" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Gestión de usuarios</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <Link href="/admin/users/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo usuario
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Aún no hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Correo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Rol</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-zinc-700">{user.name}</td>
                  <td className="px-5 py-3 text-zinc-500">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={
                      "text-xs font-medium px-2 py-0.5 rounded-full " +
                      (user.role === "admin" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700")
                    }>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/users/${user.id}/edit`}
                        className="text-xs text-zinc-400 hover:text-emerald-600 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100">
                        Editar
                      </Link>
                      <UserDeleteButton id={user.id} currentUserId={currentUserId} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}