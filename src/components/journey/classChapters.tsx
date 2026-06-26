import { GraduationCap, HeartHandshake, Sigma, Users, ChevronRight } from "lucide-react";
import type { ClassCycle, ClassJourney } from "@/data/types";
import { diem, int, pct } from "@/lib/format";
import { Narrator } from "@/components/journey/Narrator";
import { CycleBand } from "@/components/journey/CycleBand";
import type { ChapterDef } from "@/components/journey/types-journey";
import { ExecutiveHero } from "@/components/report/ExecutiveHero";
import { IndexCard } from "@/components/report/IndexCard";
import { LEARNING_EXPLAIN, EFFORT_EXPLAIN } from "@/components/report/MetricExplainer";
import { BandDistribution } from "@/components/report/BandDistribution";
import { CodeCompare } from "@/components/report/CodeCompare";
import { TopMissedTable } from "@/components/report/TopMissedTable";
import { ConvergencePanel } from "@/components/report/ConvergencePanel";
import { RosterTable } from "@/components/report/RosterTable";
import { ChartCard } from "@/components/charts/chart-kit";
import { ScoreHistogram } from "@/components/charts/ScoreHistogram";
import { TopicMatrixBars } from "@/components/charts/TopicMatrixBars";
import { EffortScatter } from "@/components/charts/EffortScatter";
import { EngagementTimeline } from "@/components/charts/EngagementTimeline";
import { AttendanceDonut } from "@/components/charts/AttendanceDonut";

// ---- Helpers ----------------------------------------------------------------

function CycleSummary({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      {items.map((it) => (
        <div key={it.label} className="rounded-lg border bg-card px-2 py-2">
          <div className="text-base font-semibold tabular-nums">{it.value}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function PrepRow({ label, count, total }: { label: string; count: number; total: number }) {
  const ratio = total > 0 ? count / total : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-muted">
        <div className="h-full rounded-md bg-brand-500" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <span className="w-24 shrink-0 text-right text-sm tabular-nums">
        <span className="font-medium">{count}</span>
        <span className="text-muted-foreground">/{total}</span>
      </span>
    </div>
  );
}

// ---- Cycle chapter ----------------------------------------------------------

function buildCycleChapter(c: ClassCycle): ChapterDef {
  const exam = c.exam;
  const thi = exam?.report ?? null;
  const att = c.lop.session.attendance;

  const sumItems = [
    { label: "Có mặt", value: int(att.present) },
    { label: "Hoàn thành NV", value: pct(c.nha.completionRate) },
    { label: thi ? "Điểm TB kì thi" : "Kì thi", value: thi ? diem(thi.avg) : "—" },
  ];

  return {
    id: `cycle-${c.id}`,
    title: c.label,
    status: c.status,
    render: () => (
      <CycleBand
        label={c.label}
        range={c.range}
        status={c.status}
        narration={c.lop.narration}
        summary={<CycleSummary items={sumItems} />}
      >
        <div className="space-y-5">
          {/* Trên lớp */}
          <Narrator line={c.lop.narration} variant="line" />
          <ChartCard
            title="Lượt tương tác trong buổi học"
            help="Số lượt tương tác của cả lớp ghi nhận mỗi 5 phút — số đếm thô, cao lên thường là lúc làm câu hỏi nhanh, không phải mức hiểu bài."
          >
            <EngagementTimeline data={c.lop.session.engagement} />
          </ChartCard>
          <ChartCard title="Điểm danh buổi học">
            <AttendanceDonut data={att} />
            <div className="mt-2 grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <div className="font-medium tabular-nums">{att.present}</div>
                <div className="text-xs text-muted-foreground">Có mặt</div>
              </div>
              <div>
                <div className="font-medium tabular-nums">{att.late}</div>
                <div className="text-xs text-muted-foreground">Đi muộn</div>
              </div>
              <div>
                <div className="font-medium tabular-nums">{att.leftEarly}</div>
                <div className="text-xs text-muted-foreground">Về sớm</div>
              </div>
              <div>
                <div className="font-medium tabular-nums">{att.absent}</div>
                <div className="text-xs text-muted-foreground">Vắng</div>
              </div>
            </div>
          </ChartCard>

          {/* Ở nhà */}
          <Narrator line={c.nha.narration} variant="line" />
          <ChartCard
            title="Tỉ lệ làm đúng theo chủ đề (bài về nhà)"
            help="Tổng hợp các câu trong nhiệm vụ của giai đoạn; chủ đề khó xếp lên trên."
          >
            <TopicMatrixBars
              topics={c.nha.report.items.map((i) => ({
                topic: i.topic,
                numQuestions: i.numAnswered,
                accuracy: i.correctRate,
              }))}
            />
          </ChartCard>

          {/* Kỳ thi */}
          {thi && exam && (
            <>
              <Narrator line={exam.narration} variant="line" />
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Phân bố điểm theo nhóm" help="Số học sinh ở mỗi nhóm điểm.">
                  <BandDistribution bands={thi.bands} />
                </ChartCard>
                <ChartCard title="Phân bố điểm chi tiết" help="Chia nhỏ theo bước 0,5 điểm để thấy rõ các mốc.">
                  <ScoreHistogram data={thi.histogram} />
                </ChartCard>
              </div>
              {thi.codes.length > 1 && (
                <ChartCard
                  title="So sánh giữa các mã đề"
                  help="Đối chiếu xem hai mã đề có tương đương về độ khó không. Số học sinh mỗi mã đề khác nhau nên chỉ xem là tham khảo."
                >
                  <CodeCompare codes={thi.codes} />
                </ChartCard>
              )}
              <ChartCard
                title="Câu sai nhiều nhất"
                help="Kèm đáp án sai hay bị chọn, để thấy các em hay nhầm chỗ nào; nên chữa mấy câu này trước."
              >
                <TopMissedTable questions={thi.codes[0].topMissed} />
              </ChartCard>
            </>
          )}
        </div>
      </CycleBand>
    ),
  };
}

// ---- Main export ------------------------------------------------------------

/** Dựng các chương bản Lớp từ ClassJourney. */
export function buildClassChapters(j: ClassJourney, nav: (to: string) => void): ChapterDef[] {
  const { overview, prep, convergence } = j;

  const moDau: ChapterDef = {
    id: "mo-dau",
    title: "Mở đầu",
    status: "current",
    render: () => (
      <div className="space-y-5">
        <Narrator line={overview.narration} variant="opener" />
        <ExecutiveHero
          gaugeValue={overview.learningIndex.total}
          gaugeLabel="Chỉ số học tập"
          gaugeSub="trên thang 100"
          kpis={[
            { label: "Sĩ số", value: overview.numStudents, format: int, icon: <Users className="size-3.5" /> },
            {
              label: "Điểm thi TB",
              value: overview.examAvg,
              format: (n) => diem(n),
              icon: <GraduationCap className="size-3.5" />,
            },
            {
              label: "Nỗ lực",
              value: overview.effortIndex.total,
              format: (n) => `${Math.round(n)}`,
              icon: <Sigma className="size-3.5" />,
            },
            {
              label: "Cần hỗ trợ",
              value: overview.needSupport,
              suffix: "em",
              icon: <HeartHandshake className="size-3.5" />,
              tone: overview.needSupport > 0 ? ("attention" as const) : undefined,
            },
          ]}
          highlights={overview.narration.figures.map((f) => `${f.label}: ${f.value}`)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <IndexCard
            title="Chỉ số học tập"
            subtitle="Gộp điểm thi, bài về nhà và câu hỏi trên lớp thành một con số để nhìn nhanh"
            breakdown={overview.learningIndex}
            explain={LEARNING_EXPLAIN}
          />
          <IndexCard
            title="Chỉ số nỗ lực"
            subtitle="Đo mức chăm: đi học đều, làm hết bài và nộp đúng hạn"
            breakdown={overview.effortIndex}
            explain={EFFORT_EXPLAIN}
          />
        </div>
      </div>
    ),
  };

  const chuanBi: ChapterDef = {
    id: "chuan-bi",
    title: "Chuẩn bị",
    status: "past",
    render: () => (
      <div className="space-y-5">
        <Narrator line={prep.narration} variant="line" />
        <ChartCard
          title="Mức chuẩn bị trước giờ học của cả lớp"
          help="Đếm thô số lượt: xem trước bài, làm bài chuẩn bị, vào lớp đúng giờ — chia cho tổng lượt được giao."
        >
          <div className="space-y-3">
            <PrepRow label="Xem trước bài" count={prep.surface.xemTruoc.count} total={prep.surface.xemTruoc.total} />
            <PrepRow
              label="Làm bài chuẩn bị"
              count={prep.surface.baiChuanBi.count}
              total={prep.surface.baiChuanBi.total}
            />
            <PrepRow label="Vào lớp đúng giờ" count={prep.surface.dungGio.count} total={prep.surface.dungGio.total} />
          </div>
        </ChartCard>
      </div>
    ),
  };

  const cycleChapters = j.cycles.map(buildCycleChapter);

  const hoiTu: ChapterDef = {
    id: "hoi-tu",
    title: "Tổng kết",
    status: "current",
    render: () => (
      <div className="space-y-5">
        <Narrator line={convergence.narration} variant="line" />
        <ChartCard
          title="Chủ đề cần chú ý"
          help="Chủ đề học sinh còn yếu ở từ hai mặt trở lên (trên lớp, ở nhà, bài thi). Yếu ở nhiều mặt thì đáng tin hơn một mặt đơn lẻ."
        >
          <ConvergencePanel topics={convergence.topics} />
        </ChartCard>
        <ChartCard
          title="Nỗ lực và kết quả của lớp"
          help="Mỗi chấm là một học sinh: trục ngang là mức nỗ lực, trục dọc là kết quả học tập. Đường chéo là mốc cân bằng."
        >
          <EffortScatter
            data={j.roster.map((r) => ({ name: r.name, effort: r.effort, result: r.learning }))}
          />
        </ChartCard>
        <ChartCard
          title="Danh sách học sinh"
          help="Bấm vào một học sinh để mở hành trình học tập của em (giữ nguyên Kỳ và Môn đang chọn)."
        >
          <p className="mb-2 text-sm text-muted-foreground">Cần hỗ trợ: {convergence.needSupport.length}</p>
          <RosterTable
            rows={j.roster}
            onRowClick={(id) =>
              nav(
                `/app/hoc-sinh/${id}?ky=${j.slice.term}&mon=${encodeURIComponent(j.slice.subject)}`
              )
            }
          />
        </ChartCard>
        {convergence.nextExam && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChevronRight className="size-4 text-brand-600" />
            Mốc kế tiếp: {convergence.nextExam.title} · {convergence.nextExam.date}.
          </p>
        )}
      </div>
    ),
  };

  return [moDau, chuanBi, ...cycleChapters, hoiTu];
}
