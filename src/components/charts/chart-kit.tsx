import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Icon "?" — hover/focus hiện giải thích ngắn. Dùng cho chỉ dẫn, không để chữ trôi nổi trên màn. */
export function HelpTip({ text, className }: { text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Giải thích"
          className={cn(
            "inline-grid size-4 place-items-center rounded-full text-muted-foreground/50 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            className
          )}
        >
          <HelpCircle className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

// Bảng màu biểu đồ (đọc từ token MobiFone qua biến CSS — SVG fill nhận var() trực tiếp).
export const CHART = {
  c1: "var(--chart-1)",
  c2: "var(--chart-2)",
  c3: "var(--chart-3)",
  c4: "var(--chart-4)",
  c5: "var(--chart-5)",
  brand: "var(--colors-brand-600)",
  brandSoft: "var(--colors-brand-300)",
  success: "var(--colors-success-600)",
  warning: "var(--colors-warning-500)",
  error: "var(--colors-error-500)",
  grid: "var(--colors-border-secondary, var(--border))",
  axis: "var(--colors-text-tertiary, #98A2B3)",
};

/** Màu theo dải điểm (tốt → yếu): xanh lá / xanh dương / xanh nhạt / cam / đỏ. */
export function bandColor(label: string): string {
  if (label.startsWith("9")) return CHART.success;
  if (label.startsWith("8")) return CHART.brand;
  if (label.startsWith("6")) return CHART.brandSoft;
  if (label.startsWith("5")) return CHART.warning;
  return CHART.error; // Dưới 5
}

/** Màu theo tỉ lệ đúng 0..1 (cao = tốt). */
export function rateColor(r: number): string {
  if (r >= 0.8) return CHART.success;
  if (r >= 0.65) return CHART.brand;
  if (r >= 0.5) return CHART.warning;
  return CHART.error;
}

/** Khung thẻ biểu đồ thống nhất: tiêu đề + mô tả + nội dung + chú thích ý nghĩa. */
export function ChartCard({
  title,
  description,
  help,
  right,
  className,
  children,
}: {
  title?: string;
  description?: string;
  /** Giải thích/chỉ dẫn — hiện trong icon "?" cạnh tiêu đề, không chiếm chỗ trên màn. */
  help?: string;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-chart-title={title}
      className={cn("rounded-xl border bg-card p-4 shadow-sm md:p-5", className)}
    >
      {(title || right) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {title && <h3 className="font-semibold leading-tight">{title}</h3>}
              {help && <HelpTip text={help} />}
            </div>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

/** Tooltip thống nhất cho mọi biểu đồ. */
export function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-lg">
      {label != null && <div className="mb-1 font-medium">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span>{p.name}:</span>
          <span className="font-medium text-foreground">
            {p.value}
            {unit ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export const AXIS_PROPS = {
  tick: { fontSize: 12, fill: CHART.axis },
  axisLine: false as const,
  tickLine: false as const,
};
