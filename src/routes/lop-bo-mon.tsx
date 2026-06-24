import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Home } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { diem } from "@/lib/format";
import { PageHeader } from "@/components/report/PageHeader";
import { Stagger, StaggerItem } from "@/components/motion";

export default function LopBoMon() {
  const t = repo.getTeaching();
  const homeroom = repo.getClass(t.homeroomClassId);
  const subjectClasses = t.subjectClassIds.map((id) => repo.getClass(id)).filter(Boolean);

  return (
    <div className="space-y-5">
      <PageHeader title={`Lớp bộ môn — ${t.subject}`} subtitle={`Các lớp bạn dạy môn ${t.subject}`} />

      {homeroom && (
        <Link
          to={`/app/lop/${homeroom.id}?tab=tong-hop`}
          className="group flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/40 p-4 shadow-sm transition-all hover:border-brand-300"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-600 text-primary-foreground">
            <Home className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-medium">Lớp {homeroom.name} · lớp chủ nhiệm</div>
            <div className="text-xs text-muted-foreground">Xem báo cáo đầy đủ bốn mặt học tập</div>
          </div>
          <ChevronRight className="size-4 text-brand-700" />
        </Link>
      )}

      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjectClasses.map((c) => {
          const r = repo.getClassReport(c!.id);
          return (
            <StaggerItem key={c!.id}>
              <Link
                to={`/app/lop/${c!.id}?subject=${encodeURIComponent(t.subject)}&tab=thi`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <BookOpen className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">Lớp {c!.name}</div>
                  <div className="truncate text-[13px] leading-relaxed text-muted-foreground">
                    <span className="tabular-nums">{c!.studentIds.length}</span> học sinh · môn {t.subject}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-semibold leading-none tabular-nums">{diem(r.thi.avg)}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">điểm thi</div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
