import { useState } from "react";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function color(v: number) {
  if (v >= 8) return "var(--colors-success-500)";
  if (v >= 7) return "var(--colors-brand-500)";
  if (v >= 6) return "var(--colors-warning-500)";
  return "var(--colors-error-500)";
}

export interface ComparisonRow {
  id: string;
  label: string;
}

/** Bảng so sánh: mỗi ô = số + thanh; sắp xếp theo cột; hàng/ô bấm mở, có affordance rõ. */
export function ComparisonTable({
  rowHeader,
  rows,
  cols,
  value,
  onOpen,
  format = (v) => (Number.isFinite(v) ? String(Math.round(v * 10) / 10).replace(".", ",") : "—"),
}: {
  rowHeader: string;
  rows: ComparisonRow[];
  cols: string[];
  value: (rowId: string, col: string) => number | undefined;
  onOpen?: (rowId: string, col?: string) => void;
  format?: (v: number) => string;
}) {
  const avg = (id: string) => {
    const vals = cols.map((c) => value(id, c)).filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };
  const [sortCol, setSortCol] = useState<string>("__avg");
  const [dir, setDir] = useState<1 | -1>(-1);

  const sorted = [...rows].sort((a, b) => {
    const av = sortCol === "__avg" ? avg(a.id) : value(a.id, sortCol) ?? -1;
    const bv = sortCol === "__avg" ? avg(b.id) : value(b.id, sortCol) ?? -1;
    return (av - bv) * dir;
  });
  const toggle = (c: string) => (sortCol === c ? setDir((d) => (d * -1) as 1 | -1) : (setSortCol(c), setDir(-1)));

  const Th = ({ col, label }: { col: string; label: string }) => (
    <th className="px-2 py-2 text-right">
      <button onClick={() => toggle(col)} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        {label}
        <ArrowUpDown className={cn("size-3", sortCol === col ? "text-foreground" : "text-muted-foreground/40")} />
      </button>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">{rowHeader}</th>
              {cols.map((c) => (
                <Th key={c} col={c} label={c} />
              ))}
              <Th col="__avg" label="TB" />
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.id}
                onClick={() => onOpen?.(r.id)}
                className={cn("group border-b last:border-0", onOpen && "cursor-pointer hover:bg-muted")}
              >
                <td className="px-2 py-2 font-medium whitespace-nowrap">{r.label}</td>
                {cols.map((c) => {
                  const v = value(r.id, c);
                  return (
                    <td
                      key={c}
                      onClick={(e) => {
                        if (onOpen) {
                          e.stopPropagation();
                          onOpen(r.id, c);
                        }
                      }}
                      className="px-2 py-2"
                    >
                      {v == null ? (
                        <span className="block text-right text-muted-foreground">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:block">
                            <div className="h-full rounded-full" style={{ width: `${(v / 10) * 100}%`, background: color(v) }} />
                          </div>
                          <span className={cn("tabular-nums text-foreground", v >= 8 && "font-semibold")}>{format(v)}</span>
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-right font-semibold tabular-nums">{format(avg(r.id))}</td>
                <td className="px-1 text-right">
                  {onOpen && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
                      Mở <ChevronRight className="size-3.5" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Thang điểm 10 ·</span>
        <Legend c="var(--colors-error-500)" t="dưới 6" />
        <Legend c="var(--colors-warning-500)" t="6–7" />
        <Legend c="var(--colors-brand-500)" t="7–8" />
        <Legend c="var(--colors-success-500)" t="từ 8" />
        <span>· bấm vào hàng hoặc ô để mở chi tiết.</span>
      </div>
    </div>
  );
}

function Legend({ c, t }: { c: string; t: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="size-2 rounded-full" style={{ background: c }} />
      {t}
    </span>
  );
}
