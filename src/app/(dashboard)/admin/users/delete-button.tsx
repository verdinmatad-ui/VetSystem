"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/app/actions/users";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function UserDeleteButton({ id, currentUserId }: { id: number; currentUserId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isOwnAccount = id === currentUserId;

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;
    setLoading(true);
    const result = await deleteUser(id);
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    toast.success("Usuario eliminado correctamente");
    router.refresh();
  }

  if (isOwnAccount) return null;

  return (
    <button onClick={handleDelete} disabled={loading}
      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-60">
      <Trash2 className="w-3.5 h-3.5" />
      {loading ? "..." : "Delete"}
    </button>
  );
}