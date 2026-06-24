import { useParams, useNavigate } from "react-router-dom";
import { Users, CalendarCheck, ClipboardList, HeartHandshake, GraduationCap, Sigma } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { SUBJECTS, type Subject, type NarratedLine } from "@/data/types";
import { mean, normalize } from "@/lib/metrics";
import { diem, int, pct } from "@/lib/format";
import { useUiStore } from "@/stores/uiStore";
import { PageHeader } from "@/components/report/PageHeader";
import { ExecutiveHero } from "@/components/report/ExecutiveHero";
import { TroLySummary } from "@/components/report/TroLySummary";
import { ExportButton } from "@/components/report/ExportButton";
import { ConvergencePanel } from "@/components/report/ConvergencePanel";
import { ChartCard } from "@/components/charts/chart-kit";
import { ComparisonTable } from "@/components/report/ComparisonTable";
import { TrendLine } from "@/components/charts/TrendLine";
import { Reveal } from "@/components/motion";

export default function Truong() {
  const { schoolId = "" } = useParams();
  const navigate = useNavigate();
  const setFilter = useUiStore((s) => s.setFilter);
  const r = repo.getSchoolReport(schoolId);
  const byClass = new Map(r.classBySubject.map((c) => [c.classId, c]));

  const openClass = (classId: string, subject?: Subject) => {
    if (subject) setFilter("mon", subject);
    navigate(`/app/lop/${classId}?tab=tong-hop`);
  };

  const classAvgs = r.classBySubject.map((c) => ({
    name: c.className,
    avg: mean(Object.values(c.scores).filter((v): v is number => v != null)),
  }));
  const best = classAvgs.reduce((a, b) => (b.avg > a.avg ? b : a), classAvgs[0]);
  const weakNames = r.weakTopics.filter((t) => t.confirmed).slice(0, 2).map((t) => t.topic);
  const highlights = [
    `Lớp ${best.name} có kết quả học tập tốt nhất khối (trung bình ${diem(best.avg)}).`,
    weakNames.length
      ? `Có ${weakNames.length} chủ đề học sinh sai nhiều ở cả trên lớp, ở nhà lẫn bài thi — giáo viên bộ môn nên chữa kỹ lại: ${weakNames.join(", ")}.`
      : "Chưa có chủ đề nào học sinh sai nhiều ở cả ba mặt (trên lớp, ở nhà, bài thi).",
    `Toàn trường đã nộp được ${pct(r.kpis.completionRate)} số bài về nhà được giao.`,
  ];

  const troLyLines: NarratedLine[] = [
    {
      text: `Lớp ${best.name} đang có kết quả học tập tốt nhất trường.`,
      figures: [{ label: "Điểm TB lớp đầu", value: diem(best.avg) }],
    },
    {
      text: weakNames.length
        ? `Có chủ đề học sinh sai nhiều ở cả ba mặt — giáo viên bộ môn nên chữa kỹ lại: ${weakNames.join(", ")}.`
        : "Chưa có chủ đề nào học sinh sai nhiều ở cả ba mặt (trên lớp, ở nhà, bài thi).",
      figures: [{ label: "Chủ đề cần chú ý", value: String(weakNames.length) }],
    },
    {
      text: "Toàn trường đã nộp được phần lớn bài về nhà được giao.",
      figures: [{ label: "Tỉ lệ HT NV", value: pct(r.kpis.completionRate) }],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={r.school.name}
        subtitle="Báo cáo toàn trường · năm học 2025–2026"
        right={<ExportButton scope={{ kind: "truong", id: schoolId, title: `Báo cáo trường ${r.school.name}` }} />}
      />

      <ExecutiveHero
        gaugeValue={Math.round(normalize(r.kpis.examAvg, 10))}
        gaugeLabel="Điểm học tập"
        gaugeSub="trên thang 100"
        kpis={[
          { label: "Học sinh", value: r.kpis.numStudents, format: int, icon: <Users className="size-3.5" /> },
          { label: "Chuyên cần", value: r.kpis.attendanceRate * 100, format: (n) => `${Math.round(n)}`, suffix: "%", icon: <CalendarCheck className="size-3.5" /> },
          { label: "Hoàn thành NV", value: r.kpis.completionRate * 100, format: (n) => `${Math.round(n)}`, suffix: "%", icon: <ClipboardList className="size-3.5" /> },
          { label: "Điểm thi TB", value: r.kpis.examAvg, format: (n) => diem(n), icon: <GraduationCap className="size-3.5" />, spark: r.trend.map((t) => t.examAvg) },
          { label: "Trung vị", value: r.kpis.examMedian, format: (n) => diem(n), icon: <Sigma className="size-3.5" /> },
          { label: "Cần hỗ trợ", value: r.kpis.needSupportPct * 100, format: (n) => `${Math.round(n)}`, suffix: "%", icon: <HeartHandshake className="size-3.5" />, tone: r.kpis.needSupportPct > 0 ? ("attention" as const) : undefined },
        ]}
        highlights={highlights}
      />

      <TroLySummary lines={troLyLines} />

      <Reveal>
        <ChartCard
          title="Điểm trung bình theo lớp và môn"
          help="Bấm tiêu đề cột để sắp xếp. Bấm vào một hàng hoặc một ô để mở báo cáo lớp."
        >
          <ComparisonTable
            rowHeader="Lớp"
            rows={r.classes.map((c) => ({ id: c.id, label: c.name }))}
            cols={[...SUBJECTS]}
            value={(cid, sub) => byClass.get(cid)?.scores[sub as Subject]}
            onOpen={(cid, sub) => openClass(cid, sub as Subject)}
          />
        </ChartCard>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard
            title="Chủ đề cần chú ý toàn trường"
            description="Chủ đề học sinh còn sai nhiều, đối chiếu giữa học trên lớp, bài ở nhà và bài thi."
          >
            <ConvergencePanel topics={r.weakTopics} />
          </ChartCard>
        </Reveal>
        <Reveal delay={0.05}>
          <ChartCard title="Xu hướng theo đợt" help="Diễn biến điểm thi và tỉ lệ hoàn thành nhiệm vụ qua các đợt trong năm.">
            <TrendLine
              data={r.trend.map((t) => ({ term: t.term, examAvg: t.examAvg, completion: Math.round(t.completion * 100) }))}
              series={[
                { key: "examAvg", name: "Điểm thi TB" },
                { key: "completion", name: "Hoàn thành NV (%)" },
              ]}
            />
          </ChartCard>
        </Reveal>
      </div>
    </div>
  );
}
