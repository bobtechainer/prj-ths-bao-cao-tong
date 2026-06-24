import { Link } from "react-router-dom";
import { School, ChevronRight } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { useUiStore } from "@/stores/uiStore";
import { mean } from "@/lib/metrics";
import { diem } from "@/lib/format";
import { PageHeader } from "@/components/report/PageHeader";
import { Stagger, StaggerItem } from "@/components/motion";

export default function CacLop() {
  const account = useUiStore((s) => s.account);
  const schoolId = account?.scopeId ?? "";
  const r = repo.getSchoolReport(schoolId);
  const bySubject = new Map(r.classBySubject.map((c) => [c.classId, c]));

  return (
    <div className="space-y-5">
      <PageHeader title="Các lớp" subtitle={`${r.school.name} · khối 12`} />
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {r.classes.map((c) => {
          const scores = bySubject.get(c.id)?.scores ?? {};
          const avg = mean(Object.values(scores).filter((v): v is number => v != null));
          return (
            <StaggerItem key={c.id}>
              <Link
                to={`/app/lop/${c.id}?tab=tong-hop`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <School className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">Lớp {c.name}</div>
                  <div className="truncate text-[13px] leading-relaxed text-muted-foreground">
                    <span className="tabular-nums">{c.studentIds.length}</span> học sinh · GVCN {c.homeroomTeacher}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-semibold leading-none tabular-nums">{diem(avg)}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">điểm TB</div>
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
