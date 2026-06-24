import { useNavigate } from "react-router-dom";
import { Users, GraduationCap, Sigma, ClipboardList, HeartHandshake, CalendarCheck } from "lucide-react";
import type { ClassReport } from "@/data/types";
import { mean } from "@/lib/metrics";
import { diem, int, pct } from "@/lib/format";
import { ExecutiveHero } from "@/components/report/ExecutiveHero";
import { IndexCard } from "@/components/report/IndexCard";
import { LEARNING_EXPLAIN, EFFORT_EXPLAIN } from "@/components/report/MetricExplainer";
import { BandDistribution } from "@/components/report/BandDistribution";
import { ConvergencePanel } from "@/components/report/ConvergencePanel";
import { RosterTable } from "@/components/report/RosterTable";
import { EffortScatter } from "@/components/charts/EffortScatter";
import { ChartCard } from "@/components/charts/chart-kit";
import { Reveal } from "@/components/motion";

export function TongHopTab({ report }: { report: ClassReport }) {
  const navigate = useNavigate();
  const learning = report.learningIndex;

  const completion = mean(report.nha.missions.map((m) => m.completionRate));
  const needSupport = report.roster.filter((r) => r.needSupport).length;
  const top = [...report.roster].sort((a, b) => b.learning - a.learning)[0];
  const weakNames = report.weakTopics.filter((t) => t.confirmed).slice(0, 2).map((t) => t.topic);
  const chuyenCan = report.effortIndex.parts.find((p) => p.label === "Chuyên cần")?.value ?? 0;
  const highlights = [
    top ? `${top.name} đang dẫn đầu lớp (chỉ số học tập ${top.learning}).` : "",
    weakNames.length
      ? `Có ${weakNames.length} chủ đề học sinh sai nhiều ở cả trên lớp, ở nhà lẫn bài thi, nên chữa lại cho cả lớp: ${weakNames.join(", ")}.`
      : "Chưa có chủ đề nào lặp lại ở nhiều mặt (trên lớp, ở nhà, bài thi), tạm thời chưa có chỗ nào phải ôn gấp.",
    `Cả lớp đã nộp được ${pct(completion)} số bài về nhà được giao.`,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <ExecutiveHero
        gaugeValue={learning.total}
        gaugeLabel="Chỉ số học tập"
        gaugeSub="trên thang 100"
        kpis={[
          { label: "Sĩ số", value: report.students.length, format: int, icon: <Users className="size-3.5" /> },
          { label: "Điểm thi TB", value: report.thi.avg, format: (n) => diem(n), icon: <GraduationCap className="size-3.5" /> },
          { label: "Trung vị", value: report.thi.median, format: (n) => diem(n), icon: <Sigma className="size-3.5" /> },
          { label: "Chuyên cần", value: chuyenCan, format: (n) => `${Math.round(n)}`, suffix: "%", icon: <CalendarCheck className="size-3.5" /> },
          { label: "Hoàn thành NV", value: completion * 100, format: (n) => `${Math.round(n)}`, suffix: "%", icon: <ClipboardList className="size-3.5" /> },
          { label: "Cần hỗ trợ", value: needSupport, suffix: "em", icon: <HeartHandshake className="size-3.5" />, tone: needSupport > 0 ? ("attention" as const) : undefined },
        ]}
        highlights={highlights}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Reveal>
          <IndexCard
            title="Chỉ số học tập"
            subtitle="Gộp điểm thi, bài về nhà và câu hỏi trên lớp thành một con số để nhìn nhanh"
            breakdown={learning}
            explain={LEARNING_EXPLAIN}
          />
        </Reveal>
        <Reveal delay={0.05}>
          <IndexCard
            title="Chỉ số nỗ lực"
            subtitle="Đo mức chăm: đi học đều, làm hết bài và nộp đúng hạn"
            breakdown={report.effortIndex}
            explain={EFFORT_EXPLAIN}
          />
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard title="Phân bố điểm thi của lớp" help="Số học sinh theo từng nhóm điểm.">
            <BandDistribution bands={report.bands} />
          </ChartCard>
        </Reveal>
        <Reveal delay={0.05}>
          <ChartCard
            title="Chủ đề cần chú ý"
            help="Chủ đề học sinh còn yếu ở từ hai mặt trở lên (trên lớp, ở nhà, bài thi). Yếu ở nhiều mặt thì đáng tin hơn một mặt đơn lẻ."
          >
            <ConvergencePanel topics={report.weakTopics} />
          </ChartCard>
        </Reveal>
      </div>

      <Reveal>
        <ChartCard
          title="Nỗ lực và kết quả của lớp"
          help="Mỗi chấm là một học sinh: trục ngang là mức nỗ lực, trục dọc là kết quả học tập. Đường chéo là mốc cân bằng. Dùng để nhìn chung cả lớp, không dùng để chấm điểm từng em."
        >
          <EffortScatter data={report.effortVsResult.map((p) => ({ name: p.name, effort: p.effort, result: p.result }))} />
        </ChartCard>
      </Reveal>

      <Reveal>
        <ChartCard title="Danh sách học sinh" help="Bấm vào một học sinh để xem hồ sơ chi tiết.">
          <RosterTable rows={report.roster} onRowClick={(id) => navigate(`/app/hoc-sinh/${id}`)} />
        </ChartCard>
      </Reveal>
    </div>
  );
}
