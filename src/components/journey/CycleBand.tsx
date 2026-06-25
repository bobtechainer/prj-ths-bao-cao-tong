import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { EventStatus, NarratedLine } from "@/data/types";
import { cn } from "@/lib/utils";
import { Narrator } from "./Narrator";

const STATUS_BADGE: Record<EventStatus, { label: string; cls: string }> = {
  past: { label: "Đã qua", cls: "border-muted-foreground/30 text-muted-foreground" },
  current: { label: "Đang diễn ra", cls: "border-brand-300 bg-brand-50 text-brand-700" },
  upcoming: { label: "Sắp tới", cls: "border-warning-200 bg-warning-50 text-warning-700" },
};

function fmtRange(from: string, to: string): string {
  const d = (iso: string) => {
    const [y, m, day] = iso.split("-");
    return `${day}/${m}/${y}`;
  };
  return `${d(from)} – ${d(to)}`;
}

/** Vỏ generic cho một giai đoạn: dải gọn (label/range/status + Narrator + summary) + nút bung children chi tiết. */
export function CycleBand({
  label,
  range,
  status,
  narration,
  summary,
  children,
}: {
  label: string;
  range: { from: string; to: string };
  status: EventStatus;
  narration: NarratedLine;
  summary: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const badge = STATUS_BADGE[status];
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold tracking-tight">{label}</h3>
          <p className="text-xs text-muted-foreground tabular-nums">{fmtRange(range.from, range.to)}</p>
        </div>
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", badge.cls)}>
          {badge.label}
        </span>
      </div>

      <div className="mt-3">
        <Narrator line={narration} />
      </div>

      <div className="mt-3">{summary}</div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        {open ? "Thu gọn" : "Xem chi tiết"}
      </button>

      {open && <div className="mt-4 space-y-4 border-t pt-4">{children}</div>}
    </div>
  );
}
