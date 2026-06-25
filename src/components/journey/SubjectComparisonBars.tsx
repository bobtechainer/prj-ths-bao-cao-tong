import { ChevronRight } from "lucide-react";
import { rateColor } from "@/components/charts/chart-kit";
import { cn } from "@/lib/utils";
import { diem } from "@/lib/format";

/** Chỉ cần subject + điểm; dùng chung cho overview học sinh (latestExamScore) lẫn lớp (examAvg). */
export interface ComparableSubject {
  subject: string;
  latestExamScore: number | null;
}

function bandLabel(score: number | null): string {
  if (score === null) return "";
  if (score >= 8) return "Tốt";
  if (score >= 6.5) return "Khá";
  if (score >= 5) return "TB";
  return "Yếu";
}

interface Props {
  entries: ComparableSubject[];
  onDrillSubject: (subject: string) => void;
}

/** Danh sách thanh ngang so sánh điểm giữa các môn. Màu = band, số = giá trị. */
export function SubjectComparisonBars({ entries, onDrillSubject }: Props) {
  return (
    <div className="space-y-1.5" role="list" aria-label="So sánh điểm các môn">
      {entries.map((entry, idx) => {
        const score = entry.latestExamScore;
        const barWidth = score !== null ? `${Math.round((score / 10) * 100)}%` : "0%";
        const color = score !== null ? rateColor(score / 10) : "var(--muted-foreground)";
        const isStrongest = idx === 0;
        const isWeakest = idx === entries.length - 1;

        return (
          <button
            key={entry.subject}
            type="button"
            role="listitem"
            data-subject={entry.subject}
            data-strongest={isStrongest ? "true" : undefined}
            data-weakest={isWeakest ? "true" : undefined}
            onClick={() => onDrillSubject(entry.subject)}
            aria-label={`${entry.subject}${score !== null ? ` — ${diem(score)} điểm` : " — chưa có điểm"}. Nhấn để xem chi tiết.`}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40",
              isStrongest && "border-success-200 bg-success-50/30",
              isWeakest && "border-warning-200 bg-warning-50/30"
            )}
          >
            {/* Subject name */}
            <span className="w-24 shrink-0 truncate text-sm font-medium">
              {entry.subject}
            </span>

            {/* Bar */}
            <div className="flex-1 overflow-hidden rounded-full bg-muted/50" style={{ height: "8px" }}>
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: barWidth, background: color }}
                aria-hidden
              />
            </div>

            {/* Score badge — color + number (not color-only) */}
            <span
              className="w-14 shrink-0 text-right tabular-nums text-sm font-semibold"
              style={{ color }}
            >
              {score !== null ? diem(score) : "—"}
            </span>

            {/* Band text label */}
            <span className="w-8 shrink-0 text-xs text-muted-foreground">
              {bandLabel(score)}
            </span>

            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground/50 transition-opacity group-hover:text-brand-600"
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
