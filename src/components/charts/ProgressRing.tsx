import { motion } from "framer-motion";
import { CountUp, useReduced } from "@/components/motion";
import { cn } from "@/lib/utils";

function color100(v: number): string {
  if (v >= 80) return "var(--colors-success-500)";
  if (v >= 65) return "var(--colors-brand-600)";
  if (v >= 50) return "var(--colors-warning-500)";
  return "var(--colors-error-500)";
}

/** Vòng tròn tiến độ 0–100 với số ở giữa. */
export function ProgressRing({
  value,
  size = 120,
  stroke = 12,
  label,
  suffix = "",
  colorOverride,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  suffix?: string;
  colorOverride?: string;
  className?: string;
}) {
  const reduced = useReduced();
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const pct = Math.max(0, Math.min(1, value / 100));
  const len = 100 * pct;
  const col = colorOverride ?? color100(value);

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${len} 100`}
          initial={{ strokeDashoffset: reduced ? 0 : len }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: col }}>
            <CountUp value={value} />
            {suffix}
          </div>
          {label && <div className="text-xs text-muted-foreground">{label}</div>}
        </div>
      </div>
    </div>
  );
}
