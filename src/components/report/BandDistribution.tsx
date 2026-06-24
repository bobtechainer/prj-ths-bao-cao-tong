import type { BandRow } from "@/data/types";
import { bandColor } from "@/components/charts/chart-kit";
import { pct } from "@/lib/format";

export function BandDistribution({ bands }: { bands: BandRow[] }) {
  const max = Math.max(1, ...bands.map((b) => b.count));
  return (
    <div className="space-y-2.5">
      {bands.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-sm text-muted-foreground">{b.label}</span>
          <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted">
            <div
              className="h-full rounded-md transition-all"
              style={{ width: `${(b.count / max) * 100}%`, background: bandColor(b.label) }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-sm tabular-nums">
            <span className="font-medium">{b.count}</span>{" "}
            <span className="text-muted-foreground">· {pct(b.ratio)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
