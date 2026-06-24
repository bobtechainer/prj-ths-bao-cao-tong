import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { buildChain } from "@/lib/nav";

export function ScopeBreadcrumb() {
  const role = useUiStore((s) => s.role);
  const location = useLocation();
  if (!role) return null;
  const crumbs = buildChain(location.pathname, role);
  if (crumbs.length === 0) return null;

  return (
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
  );
}
