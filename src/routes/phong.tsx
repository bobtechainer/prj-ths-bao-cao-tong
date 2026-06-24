import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockRepository as repo } from "@/data/mockRepository";
import { SUBJECTS, type Subject } from "@/data/types";
import { mean, normalize } from "@/lib/metrics";
import { diem, int, pct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Building2, Users, GraduationCap, Sigma, ClipboardList, HeartHandshake, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/report/PageHeader";
import { ExecutiveHero } from "@/components/report/ExecutiveHero";
import { TroLySummary } from "@/components/report/TroLySummary";
import { ExportButton } from "@/components/report/ExportButton";
import type { NarratedLine } from "@/data/types";
import { ChartCard } from "@/components/charts/chart-kit";
import { ComparisonTable } from "@/components/report/ComparisonTable";
import { TrendLine } from "@/components/charts/TrendLine";
import { Reveal } from "@/components/motion";

export default function Phong() {
  const navigate = useNavigate();
  const o = repo.getPhongOverview();

  const subjAvg = useMemo(() => {
    const map: Record<string, Partial<Record<Subject, number>>> = {};
    for (const s of o.schools) {
      const rep = repo.getSchoolReport(s.id);
      const acc: Partial<Record<Subject, number>> = {};
      for (const sub of SUBJECTS) {
        const vals = rep.classBySubject.map((c) => c.scores[sub]).filter((v): v is number => v != null);
        if (vals.length) acc[sub] = mean(vals);
      }
      map[s.id] = acc;
    }
    return map;
  }, [o.schools]);

  const bestSchool = [...o.rows].sort((a, b) => b.examAvg - a.examAvg)[0];
  const needSchool = [...o.rows].sort((a, b) => b.needSupportPct - a.needSupportPct)[0];
  const highlights = [
    `${bestSchool.schoolName} dẫn đầu toàn Phòng (điểm thi TB ${diem(bestSchool.examAvg)}).`,
    `Trung bình toàn ngành, học sinh nộp được ${pct(o.kpis.completionRate)} số bài về nhà được giao.`,
    `${needSchool.schoolName} đang có tỉ lệ học sinh cần hỗ trợ cao nhất (${pct(needSchool.needSupportPct)}). Phòng nên ghé sớm xem các em vướng ở môn nào.`,
  ];

  const troLyLines: NarratedLine[] = [
    {
      text: `${bestSchool.schoolName} đang dẫn đầu toàn Phòng về kết quả thi.`,
      figures: [{ label: "Điểm thi TB", value: diem(bestSchool.examAvg) }],
    },
    {
      text: "Trung bình toàn ngành, học sinh đã nộp được phần lớn bài về nhà được giao.",
      figures: [{ label: "Tỉ lệ HT NV", value: pct(o.kpis.completionRate) }],
    },
    {
      text: `${needSchool.schoolName} có tỉ lệ học sinh cần hỗ trợ cao nhất — Phòng nên ghé sớm.`,
      figures: [{ label: "Cần hỗ trợ", value: pct(needSchool.needSupportPct) }],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan Phòng GD&ĐT Sơn Tây"
        subtitle="Toàn ngành · năm học 2025–2026"
        right={<ExportButton scope={{ kind: "phong", id: "phong", title: "Báo cáo toàn Phòng GD&ĐT Sơn Tây" }} />}
      />

      <ExecutiveHero
        gaugeValue={Math.round(normalize(o.kpis.examAvg, 10))}
        gaugeLabel="Điểm học tập"
        gaugeSub="toàn ngành · /100"
        kpis={[
          { label: "Số trường", value: o.kpis.numSchools, icon: <Building2 className="size-3.5" /> },
          { label: "Học sinh", value: o.kpis.numStudents, format: int, icon: <Users className="size-3.5" /> },
          { label: "Điểm thi TB", value: o.kpis.examAvg, format: (n) => diem(n), icon: <GraduationCap className="size-3.5" />, spark: o.trend.map((t) => t.examAvg) },
          { label: "Trung vị", value: o.kpis.examMedian, format: (n) => diem(n), icon: <Sigma className="size-3.5" /> },
          { label: "Hoàn thành NV", value: o.kpis.completionRate * 100, format: (n) => `${Math.round(n)}`, suffix: "%", icon: <ClipboardList className="size-3.5" /> },
          { label: "Cần hỗ trợ", value: o.kpis.needSupportPct * 100, format: (n) => `${Math.round(n)}`, suffix: "%", icon: <HeartHandshake className="size-3.5" />, tone: o.kpis.needSupportPct > 0 ? ("attention" as const) : undefined },
        ]}
        highlights={highlights}
      />

      <TroLySummary lines={troLyLines} />

      <Reveal>
        <ChartCard
          title="So sánh các trường theo môn"
          help="Bấm tiêu đề cột để sắp xếp. Bấm vào một hàng hoặc một ô để mở báo cáo trường."
        >
          <ComparisonTable
            rowHeader="Trường"
            rows={o.schools.map((s) => ({ id: s.id, label: s.shortName }))}
            cols={[...SUBJECTS]}
            value={(sid, sub) => subjAvg[sid]?.[sub as Subject]}
            onOpen={(sid) => navigate(`/app/truong/${sid}`)}
          />
        </ChartCard>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard
            title="Hoàn thành và cần hỗ trợ theo trường"
            help="Xếp theo tỉ lệ học sinh cần hỗ trợ, trường nhiều nhất lên đầu để Phòng ghé trước. Điểm thi đã có ở bảng so sánh phía trên. Bấm vào một dòng để mở báo cáo trường."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-2 py-2 text-left font-medium">Trường</th>
                    <th className="px-2 py-2 text-right font-medium">Hoàn thành NV</th>
                    <th className="px-2 py-2 text-right font-medium">Cần hỗ trợ</th>
                    <th className="w-8" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {[...o.rows]
                    .sort((a, b) => b.needSupportPct - a.needSupportPct)
                    .map((r, i) => (
                      <tr
                        key={r.schoolId}
                        onClick={() => navigate(`/app/truong/${r.schoolId}`)}
                        className={cn(
                          "group cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/60",
                          i === 0 && "border-l-2 border-l-warning-500"
                        )}
                      >
                        <td className="px-2 py-2 font-medium">{r.schoolName}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{pct(r.completion)}</td>
                        <td className="px-2 py-2 text-right">
                          <span className="inline-flex items-center justify-end gap-1.5 font-semibold tabular-nums">
                            {i === 0 && <span className="size-1.5 rounded-full bg-warning-500" />}
                            {pct(r.needSupportPct)}
                          </span>
                        </td>
                        <td className="px-1 text-right">
                          <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </Reveal>

        <Reveal delay={0.05}>
          <ChartCard title="Xu hướng điểm thi theo đợt" help="Diễn biến điểm thi trung bình toàn ngành qua các đợt trong năm.">
            <TrendLine
              data={o.trend as unknown as Record<string, number | string>[]}
              series={[{ key: "examAvg", name: "Điểm TB toàn Phòng" }]}
              domain={[6, 9]}
            />
          </ChartCard>
        </Reveal>
      </div>
    </div>
  );
}
