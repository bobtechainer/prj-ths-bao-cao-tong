import { CHART } from "./chart-kit";
import { pct } from "@/lib/format";

/** Thanh phân bố lựa chọn: đúng / sai phổ biến / sai khác. */
export function DistractorBar({
  correctRate,
  commonWrongRate,
}: {
  correctRate: number; // 0..1
  commonWrongRate: number; // 0..1
}) {
  const other = Math.max(0, 1 - correctRate - commonWrongRate);
  const seg = [
    { w: correctRate, color: CHART.success, label: "Đúng" },
    { w: commonWrongRate, color: CHART.error, label: "Sai phổ biến" },
    { w: other, color: "var(--colors-warning-300)", label: "Sai khác" },
  ];
  return (
    <div className="space-y-1">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {seg.map((s, i) =>
          s.w > 0 ? <div key={i} style={{ width: `${s.w * 100}%`, background: s.color }} title={`${s.label} ${pct(s.w)}`} /> : null
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ background: CHART.success }} /> Đúng {pct(correctRate)}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ background: CHART.error }} /> Sai phổ biến {pct(commonWrongRate)}
        </span>
      </div>
    </div>
  );
}
