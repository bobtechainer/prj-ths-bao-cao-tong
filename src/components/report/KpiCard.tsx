import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/motion";
import { Sparkline } from "@/components/charts/Sparkline";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  format = (n) => String(Math.round(n)),
  suffix,
  hint,
  icon,
  spark,
  trend,
  className,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  suffix?: string;
  hint?: string;
  icon?: ReactNode;
  spark?: number[];
  trend?: { dir: "up" | "down" | "flat"; text: string };
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-1 flex items-end gap-1">
        <span className="text-2xl font-semibold tracking-tight md:text-3xl">
          <CountUp value={value} format={format} />
        </span>
        {suffix && <span className="mb-1 text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {(hint || trend) && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                trend.dir === "up" && "text-success",
                trend.dir === "down" && "text-destructive",
                trend.dir === "flat" && "text-muted-foreground"
              )}
            >
              {trend.dir === "up" && <ArrowUpRight className="size-3.5" />}
              {trend.dir === "down" && <ArrowDownRight className="size-3.5" />}
              {trend.text}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
      {spark && spark.length > 1 && (
        <div className="mt-2">
          <Sparkline data={spark} id={`spark-${label}`} />
        </div>
      )}
    </div>
  );
}
