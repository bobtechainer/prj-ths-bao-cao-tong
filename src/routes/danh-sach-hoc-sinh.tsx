import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ClassRosterRow } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";
import { useUiStore } from "@/stores/uiStore";
import { diem } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/report/PageHeader";
import { SearchableRoster } from "@/components/report/SearchableRoster";

export default function DanhSachHocSinh() {
  const account = useUiStore((s) => s.account);
  const navigate = useNavigate();

  const { rows, subtitle } = useMemo(() => {
    if (!account) return { rows: [] as ClassRosterRow[], subtitle: "" };
    if (account.role === "giaovien") {
      const r = repo.getClassReport(account.scopeId);
      return { rows: r.roster, subtitle: `Lớp chủ nhiệm ${r.klass.name}` };
    }
    // hiệu trưởng: gộp học sinh toàn trường
    const sr = repo.getSchoolReport(account.scopeId);
    const all = sr.classes.flatMap((c) => repo.getClassReport(c.id).roster);
    return { rows: all, subtitle: `${sr.school.name} · ${all.length} học sinh` };
  }, [account]);

  const total = rows.length;
  const needSupport = rows.filter((r) => r.needSupport).length;
  const examAvg = total ? rows.reduce((a, r) => a + r.exam, 0) / total : 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Học sinh" subtitle={subtitle} />
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-3">
          <div className="text-xs text-muted-foreground">Tổng học sinh</div>
          <div className="text-xl font-semibold tabular-nums">{total}</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-xs text-muted-foreground">Cần hỗ trợ</div>
          <div className={cn("text-xl font-semibold tabular-nums", needSupport > 0 && "text-destructive")}>{needSupport}</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-xs text-muted-foreground">Điểm thi TB</div>
          <div className="text-xl font-semibold tabular-nums">{diem(examAvg)}</div>
        </div>
      </div>
      <SearchableRoster rows={rows} onRowClick={(id) => navigate(`/app/hoc-sinh/${id}`)} />
    </div>
  );
}
