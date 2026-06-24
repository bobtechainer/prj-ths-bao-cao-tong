import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Building2, BarChart3, School, Users, Home, BookOpen, User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useUiStore } from "@/stores/uiStore";
import { sidebarSections, type IconKey } from "@/lib/sidebarNav";
import { cn } from "@/lib/utils";

const ICON: Record<IconKey, typeof Home> = {
  overview: LayoutDashboard,
  schools: Building2,
  compare: BarChart3,
  classes: School,
  students: Users,
  homeroom: Home,
  subjects: BookOpen,
  me: User,
};

function Brand() {
  return (
    <div className="flex h-16 items-center gap-2.5 border-b px-4">
      <img src="/logomark.svg" alt="Trường học số" className="size-8" />
      <span className="text-sm font-semibold leading-tight">Trường học số</span>
    </div>
  );
}

function NavBody({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const account = useUiStore((s) => s.account);
  if (!account) return null;
  const sections = sidebarSections(account);

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {sections.map((s) => {
        const Icon = ICON[s.icon];
        const isActive = s.active(location.pathname);
        return (
          <Link
            key={s.label}
            to={s.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-brand-50 text-brand-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
        <Brand />
        <NavBody />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={(o) => !o && onMobileClose()}>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SheetTitle className="sr-only">Điều hướng</SheetTitle>
          <Brand />
          <NavBody onNavigate={onMobileClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
