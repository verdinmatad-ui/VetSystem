"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";

export default function AlertToast({ count }: { count: number }) {
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    if (count > 0 && !shown.current) {
      shown.current = true;
      toast.custom(
        (t) => (
          <div
            className={`bg-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 border border-red-100 ${t.visible ? "animate-enter" : "animate-leave"}`}
            onClick={() => {
              router.push("/inventory/alerts");
              toast.dismiss(t.id);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">
                {count} item{count !== 1 ? "s" : ""} {count !== 1 ? "are" : "is"} low on stock
              </p>
              <p className="text-xs text-emerald-600">View alerts →</p>
            </div>
          </div>
        ),
        { duration: 5000, position: "bottom-right" }
      );
    }
  }, [count, router]);

  return null;
}