import { Link } from "react-router-dom";
import { Building2, ChevronRight } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { diem, int, pct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/report/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

export default function CacTruong() {
  const o = repo.getPhongOverview();
  return (
    <div className="space-y-5">
      <PageHeader title="Các trường" subtitle="Phòng GD&ĐT Sơn Tây · năm học 2025–2026" />
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...o.rows].sort((a, b) => b.examAvg - a.examAvg).map((r, i) => (
          <StaggerItem key={r.schoolId}>
            <Link
              to={`/app/truong/${r.schoolId}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md",
                i === 0 ? "bg-brand-50/40 ring-1 ring-brand-200" : "bg-card"
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Building2 className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{r.schoolName}</div>
                <div className="text-[13px] leading-relaxed text-muted-foreground">
                  Hoàn thành <span className="tabular-nums">{pct(r.completion)}</span> · cần hỗ trợ{" "}
                  <span className="tabular-nums">{pct(r.needSupportPct)}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-lg font-semibold leading-none tabular-nums">{diem(r.examAvg)}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">điểm TB</div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal>
        <p className="text-sm text-muted-foreground">Toàn ngành có {int(o.kpis.numStudents)} học sinh.</p>
      </Reveal>
    </div>
  );
}
