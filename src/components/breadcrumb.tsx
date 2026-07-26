import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm mb-6 flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />}
            {isLast || !item.href ? (
              <span className={isLast ? "text-zinc-800 font-medium" : "text-zinc-400"}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}