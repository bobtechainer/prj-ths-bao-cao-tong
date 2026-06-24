import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { RadialGauge } from "@/components/charts/RadialGauge";
import { Sparkline } from "@/components/charts/Sparkline";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

export interface HeroKpi {
  label: string;
  value: number;
  format?: (n: number) => string;
  suffix?: string;
  spark?: number[];
  icon?: ReactNode;
  /** Đánh dấu chỉ số cần để mắt (vd "Cần hỗ trợ" > 0) — nổi bằng nền cảnh báo nhẹ. */
  tone?: "attention";
}

export function ExecutiveHero({
  gaugeValue,
  gaugeLabel,
  gaugeSub,
  kpis,
  highlights,
}: {
  gaugeValue: number;
  gaugeLabel: string;
  gaugeSub?: string;
  kpis: HeroKpi[];
  highlights: string[];
}) {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-br from-brand-50 via-card to-card dark:from-brand-900/20"
        />
        <div className="relative grid gap-6 p-5 md:p-6 lg:grid-cols-[auto_1fr_18rem] lg:items-center">
          <div className="flex justify-center">
            <RadialGauge value={gaugeValue} label={gaugeLabel} sublabel={gaugeSub} />
          </div>

          <Stagger className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3" gap={0.07}>
            {kpis.map((k) => {
              const attn = k.tone === "attention";
              return (
                <StaggerItem key={k.label}>
                  <div
                    className={cn(
                      attn &&
                        "rounded-lg border border-warning-200 bg-warning-50/50 px-2.5 py-1.5 dark:border-warning-800 dark:bg-warning-900/10"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {k.icon}
                      {k.label}
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 text-2xl font-semibold tracking-tight tabular-nums",
                        attn && "text-warning-700 dark:text-warning-400"
                      )}
                    >
                      <CountUp value={k.value} format={k.format} />
                      {k.suffix && <span className="ml-0.5 text-base text-muted-foreground">{k.suffix}</span>}
                    </div>
                    {k.spark && k.spark.length > 1 && (
                      <div className="mt-1">
                        <Sparkline data={k.spark} id={`hero-${k.label}`} height={28} />
                      </div>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

          <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-900/10">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-brand-800 dark:text-brand-300">
              <Lightbulb className="size-4" />
              Đáng chú ý
            </div>
            <ul className="space-y-1.5">
              {highlights.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-500" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
