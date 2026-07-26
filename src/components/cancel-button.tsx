"use client";

import { useRouter } from "next/navigation";

export default function CancelButton({ href }: { href?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => href ? router.push(href) : router.back()}
      className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
    >
      Cancelar
    </button>
  );
}