import type { EventStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const DOT: Record<EventStatus, string> = {
  past: "bg-muted-foreground",
  current: "bg-brand-600 ring-4 ring-brand-100",
  upcoming: "bg-card border-2 border-dashed border-muted-foreground/50",
};

/** Trục thời gian dọc: mỗi mốc một chấm + nhãn; bấm cuộn tới chương tương ứng. */
export function TimelineRail({
  items,
  activeId,
}: {
  items: { id: string; label: string; status: EventStatus }[];
  activeId?: string;
}) {
  return (
    <nav aria-label="Trục thời gian" className="relative pl-4">
      <span aria-hidden className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
      <ul className="space-y-4">
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <li key={it.id} data-active={active} data-status={it.status} className="relative">
              <a
                href={`#${it.id}`}
                aria-current={active ? "location" : undefined}
                className="flex items-center gap-2.5 text-sm transition-colors hover:text-brand-700"
              >
                <span
                  data-status={it.status}
                  className={cn(
                    "relative z-10 size-3.5 shrink-0 rounded-full",
                    DOT[it.status]
                  )}
                />
                <span
                  className={cn(
                    "truncate",
                    active ? "font-semibold text-brand-700" : "text-muted-foreground"
                  )}
                >
                  {it.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
