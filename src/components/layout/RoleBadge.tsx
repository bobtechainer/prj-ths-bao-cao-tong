import type { Role } from "@/data/types";
import { ROLE_LABEL } from "@/lib/nav";
import { cn } from "@/lib/utils";

const DOT: Record<Role, string> = {
  phong: "bg-brand-600",
  truong: "bg-warning-500",
  giaovien: "bg-success-600",
  hocsinh: "bg-blue-light-500",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT[role])} />
      {ROLE_LABEL[role]}
    </span>
  );
}
