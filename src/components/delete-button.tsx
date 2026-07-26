"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteOwner } from "@/app/actions/owners";
import { deletePet } from "@/app/actions/pets";
import { deleteMedicalRecord, deleteVaccination } from "@/app/actions/medical";
import toast from "react-hot-toast";
import { deleteInventoryItem } from "@/app/actions/inventory";

interface DeleteButtonProps {
  id: number;
  type: "owner" | "pet" | "medical" | "vaccination" | "inventory";
  redirectTo: string;
  confirmMessage: string;
  petId?: number;
}

export default function DeleteButton({ id, type, redirectTo, confirmMessage, petId }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);

    let result;
    if (type === "owner") result = await deleteOwner(id);
    else if (type === "pet") result = await deletePet(id);
    else if (type === "medical") result = await deleteMedicalRecord(id, petId!);
    else if (type === "inventory") result = await deleteInventoryItem(id);
    else result = await deleteVaccination(id, petId!);

    const error = "error" in result ? String(result.error) : undefined;
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    toast.success("Eliminado correctamente");
    router.push(redirectTo);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}