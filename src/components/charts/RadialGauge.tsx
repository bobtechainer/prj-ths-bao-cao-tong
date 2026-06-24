import { motion } from "framer-motion";
import { CountUp, useReduced } from "@/components/motion";

function color100(v: number): string {
  if (v >= 80) return "var(--colors-success-500)";
  if (v >= 65) return "var(--colors-brand-600)";
  if (v >= 50) return "var(--colors-warning-500)";
  return "var(--colors-error-500)";
}

/** Đồng hồ cung 270°, kim/giá trị chạy lên khi vào màn. */
export function RadialGauge({
  value,
  max = 100,
  size = 180,
  stroke = 14,
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const reduced = useReduced();
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const arc = 0.75; // 270°
  const trackLen = 100 * arc;
  const valueLen = trackLen * pct;
  const col = color100((value / max) * 100);

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${trackLen} 100`}
        />
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${valueLen} 100`}
          initial={{ strokeDashoffset: reduced ? 0 : valueLen }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: reduced ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-4xl font-semibold tracking-tight tabular-nums" style={{ color: col }}>
            <CountUp value={value} />
          </div>
          {label && <div className="mt-0.5 text-sm font-medium text-foreground">{label}</div>}
          {sublabel && <div className="text-xs text-muted-foreground">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
