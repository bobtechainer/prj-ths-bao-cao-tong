import { cn } from "@/lib/utils";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Màu ô theo điểm 0..10 (đỏ → cam → xanh), pha với nền thẻ để dễ đọc. */
export function heatScore(v: number, min = 4, max = 10): string {
  const p = clamp((v - min) / (max - min), 0, 1);
  const hue =
    p >= 0.6 ? "var(--colors-success-500)" : p >= 0.45 ? "var(--colors-brand-500)" : p >= 0.3 ? "var(--colors-warning-500)" : "var(--colors-error-500)";
  const strength = Math.round(30 + p * 50);
  return `color-mix(in srgb, ${hue} ${strength}%, var(--card))`;
}

export interface HeatmapRow {
  id: string;
  label: string;
}

export function Heatmap({
  rows,
  cols,
  value,
  colorFor = (v) => heatScore(v),
  format = (v) => (Number.isFinite(v) ? String(Math.round(v * 10) / 10) : "—"),
  onCell,
  rowHeader = "",
}: {
  rows: HeatmapRow[];
  cols: string[];
  value: (rowId: string, col: string) => number | undefined;
  colorFor?: (v: number) => string;
  format?: (v: number) => string;
  onCell?: (rowId: string, col: string) => void;
  rowHeader?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate" style={{ borderSpacing: 3 }}>
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-2 py-1 text-left text-xs font-medium text-muted-foreground">
              {rowHeader}
            </th>
            {cols.map((c) => (
              <th key={c} className="px-2 py-1 text-center text-xs font-medium text-muted-foreground whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th className="sticky left-0 z-10 bg-card px-2 py-1 text-left text-sm font-medium whitespace-nowrap">
                {r.label}
              </th>
              {cols.map((c) => {
                const v = value(r.id, c);
                const has = v != null && Number.isFinite(v);
                return (
                  <td key={c} className="p-0">
                    <button
                      type="button"
                      disabled={!onCell}
                      onClick={() => onCell?.(r.id, c)}
                      className={cn(
                        "grid h-10 w-full min-w-[52px] place-items-center rounded-md text-sm font-medium tabular-nums transition-transform",
                        onCell && "hover:scale-[1.06] hover:ring-2 hover:ring-ring/40 cursor-pointer"
                      )}
                      style={{ background: has ? colorFor(v as number) : "var(--muted)" }}
                    >
                      {has ? format(v as number) : "—"}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
