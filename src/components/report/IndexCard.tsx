import type { IndexBreakdown } from "@/data/types";
import { CountUp } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { rateColor } from "@/components/charts/chart-kit";
import { MetricExplainer, type MetricExplain } from "./MetricExplainer";
import { cn } from "@/lib/utils";

function toneClass(total: number) {
  if (total >= 80) return "text-success";
  if (total >= 65) return "text-brand-700";
  if (total >= 50) return "text-warning-700";
  return "text-destructive";
}

export function IndexCard({
  title,
  subtitle,
  breakdown,
  explain,
}: {
  title: string;
  subtitle?: string;
  breakdown: IndexBreakdown;
  explain?: MetricExplain;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="mt-2 flex items-end gap-2">
        <span className={cn("text-4xl font-semibold tracking-tight", toneClass(breakdown.total))}>
          <CountUp value={breakdown.total} />
        </span>
        <span className="mb-1.5 text-sm text-muted-foreground">/ 100</span>
        {breakdown.partial && (
          <Badge variant="outline" className="mb-1.5 ml-auto">Một phần</Badge>
        )}
      </div>

      <div className="mt-4 space-y-2.5">
        {breakdown.parts.map((p) => (
          <div key={p.label}>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{p.label} · {Math.round(p.weight * 100)}%</span>
              <span className="font-medium tabular-nums">{p.value}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${p.value}%`, background: rateColor(p.value / 100) }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Gộp {breakdown.parts.length} nguồn: </span>
        {breakdown.parts.map((p, i) => (
          <span key={p.label} className="tabular-nums">
            {i > 0 && ", "}
            {p.label.toLowerCase()} {p.value}
          </span>
        ))}
        <span className="tabular-nums"> → </span>
        <span className="font-semibold text-foreground tabular-nums">{breakdown.total}</span>
      </div>

      {explain && <MetricExplainer explain={explain} />}
    </div>
  );
}
