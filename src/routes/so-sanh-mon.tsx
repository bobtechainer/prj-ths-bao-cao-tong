import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockRepository as repo } from "@/data/mockRepository";
import { SUBJECTS, type Subject } from "@/data/types";
import { useUiStore } from "@/stores/uiStore";
import { mean } from "@/lib/metrics";
import { PageHeader } from "@/components/report/PageHeader";
import { ChartCard } from "@/components/charts/chart-kit";
import { ComparisonTable } from "@/components/report/ComparisonTable";
import { Reveal } from "@/components/motion";

export default function SoSanhMon() {
  const account = useUiStore((s) => s.account);
  const navigate = useNavigate();

  const model = useMemo(() => {
    if (account?.role === "phong") {
      const o = repo.getPhongOverview();
      const map: Record<string, Partial<Record<Subject, number>>> = {};
      for (const s of o.schools) {
        const acc: Partial<Record<Subject, number>> = {};
        for (const sub of SUBJECTS) {
          const vals = repo.getSchoolReport(s.id).classBySubject.map((c) => c.scores[sub]).filter((v): v is number => v != null);
          if (vals.length) acc[sub] = mean(vals);
        }
        map[s.id] = acc;
      }
      return {
        subtitle: "So sánh điểm trung bình giữa các trường theo môn",
        rowHeader: "Trường",
        rows: o.schools.map((s) => ({ id: s.id, label: s.shortName })),
        value: (id: string, col: string) => map[id]?.[col as Subject],
        open: (id: string) => navigate(`/app/truong/${id}`),
      };
    }
    const schoolId = account?.scopeId ?? "";
    const r = repo.getSchoolReport(schoolId);
    const byClass = new Map(r.classBySubject.map((c) => [c.classId, c]));
    return {
      subtitle: `${r.school.name} · so sánh các lớp theo môn`,
      rowHeader: "Lớp",
      rows: r.classes.map((c) => ({ id: c.id, label: c.name })),
      value: (id: string, col: string) => byClass.get(id)?.scores[col as Subject],
      open: (id: string) => navigate(`/app/lop/${id}?tab=tong-hop`),
    };
  }, [account, navigate]);

  return (
    <div className="space-y-5">
      <PageHeader title="So sánh theo môn" subtitle={model.subtitle} />
      <Reveal>
        <ChartCard title="Bảng so sánh" help="Bấm tiêu đề cột để sắp xếp. Bấm vào một hàng hoặc một ô để mở chi tiết.">
          <ComparisonTable
            rowHeader={model.rowHeader}
            rows={model.rows}
            cols={[...SUBJECTS]}
            value={model.value}
            onOpen={(id) => model.open(id)}
          />
        </ChartCard>
      </Reveal>
    </div>
  );
}
