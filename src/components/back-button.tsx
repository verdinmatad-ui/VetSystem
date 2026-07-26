"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => href ? router.push(href) : router.back()}
      className="text-zinc-400 hover:text-zinc-600 transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}