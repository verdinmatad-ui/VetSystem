import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-50 gap-4">
      <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
        <SearchX className="w-8 h-8 text-zinc-400" />
      </div>
      <h1 className="text-xl font-semibold text-zinc-700">Record not found</h1>
      <p className="text-sm text-zinc-400">The record you are looking for does not exist or was deleted</p>
      <Link
        href="/dashboard"
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}