import { Sparkles } from "lucide-react";
import type { NarratedLine } from "@/data/types";
import { cn } from "@/lib/utils";

/** Một câu Trợ lý offline: text + các figure (label/value) hiển thị ngay cạnh. */
export function Narrator({
  line,
  variant = "line",
}: {
  line: NarratedLine;
  variant?: "opener" | "line";
}) {
  const opener = variant === "opener";
  return (
    <div
      data-variant={variant}
      className={cn(
        "rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:bg-brand-900/10",
        opener && "p-5"
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-primary-foreground">
          <Sparkles className="size-3.5" />
        </span>
        <div className="min-w-0 space-y-2.5">
          <p
            className={cn(
              "leading-relaxed text-foreground/90",
              opener ? "text-base font-medium" : "text-sm"
            )}
          >
            {line.text}
          </p>
          {line.figures.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {line.figures.map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-baseline gap-1.5 rounded-lg border bg-card px-2.5 py-1 text-xs shadow-sm"
                >
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{f.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
