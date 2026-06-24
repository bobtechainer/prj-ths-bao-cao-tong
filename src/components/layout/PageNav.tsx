import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { buildChain } from "@/lib/nav";

/** Breadcrumb nổi bật + nút "Quay lại cấp trên" ở đầu vùng nội dung. */
export function PageNav() {
  const role = useUiStore((s) => s.role);
  const location = useLocation();
  if (!role) return null;
  const crumbs = buildChain(location.pathname, role);
  if (crumbs.length <= 1) return null; // cấp gốc không cần

  const parent = [...crumbs].reverse().find((c) => c.to);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      {parent && (
        <Link
          to={parent.to!}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <ChevronLeft className="size-4" />
          Quay lại {parent.label}
        </Link>
      )}
      <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1 whitespace-nowrap">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />}
            {c.to ? (
              <Link to={c.to} className="text-muted-foreground transition-colors hover:text-brand-700">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
