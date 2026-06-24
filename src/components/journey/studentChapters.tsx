import { FileText, ChevronRight } from "lucide-react";
import type { StudentJourney, StudentCycle, MissionStudentReportView } from "@/data/types";
import { diem, pct, duration } from "@/lib/format";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { TrendLine } from "@/components/charts/TrendLine";
import { ConvergencePanel } from "@/components/report/ConvergencePanel";
import { ChartCard } from "@/components/charts/chart-kit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ChapterDef } from "./types-journey";
import { Narrator } from "./Narrator";
import { CycleBand } from "./CycleBand";

const STATUS_LABEL: Record<MissionStudentReportView["status"], string> = {
  todo: "Chưa làm",
  inprogress: "Đang làm",
  submitted: "Đã nộp",
  graded: "Đã chấm",
};

function SummaryCell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function CycleSummary({ c }: { c: StudentCycle }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <SummaryCell label="Chuyên cần" value={pct(c.lop.attendanceRate)} hint={`${c.lop.sessions.length} buổi`} />
      <SummaryCell
        label="Bài về nhà"
        value={pct(c.nha.completionRate)}
        hint={`đúng hạn ${pct(c.nha.onTimeRate)}`}
      />
      <SummaryCell
        label="Bài thi chặng"
        value={c.exam ? diem(c.exam.score) : "—"}
        hint={c.exam ? `TB lớp ${diem(c.exam.classAvg)}` : "chưa có"}
      />
    </div>
  );
}

function CycleDetail({ c, nav }: { c: StudentCycle; nav: (path: string) => void }) {
  return (
    <div className="space-y-4">
      <ChartCard title="Trên lớp — chuyên cần & độ đúng quiz theo buổi">
        <Narrator line={c.lop.narration} />
        <div className="mt-3">
          <TrendLine
            data={c.lop.sessions.map((s) => ({
              term: s.session,
              "Chuyên cần %": Math.round(s.attendance * 100),
              "Đúng quiz %": Math.round(s.quizAccuracy * 100),
            }))}
            series={[
              { key: "Chuyên cần %", name: "Chuyên cần %" },
              { key: "Đúng quiz %", name: "Đúng quiz %" },
            ]}
            domain={[0, 100]}
          />
        </div>
      </ChartCard>

      <ChartCard title="Ở nhà — bài về nhà trong chặng" help="Bấm một dòng để xem bài làm chi tiết.">
        <Narrator line={c.nha.narration} />
        <div className="mt-3 max-h-[280px] overflow-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
              <TableRow>
                <TableHead>Nhiệm vụ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Điểm</TableHead>
                <TableHead className="text-right">Đúng</TableHead>
                <TableHead className="text-right">Thời gian</TableHead>
                <TableHead className="w-8" aria-hidden />
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.nha.missions.map((m) => (
                <TableRow
                  key={m.missionId}
                  onClick={() => nav(`/app/nhiem-vu/${m.missionId}/${m.studentId}`)}
                  className="group cursor-pointer transition-colors hover:bg-muted/60"
                >
                  <TableCell className="font-medium">{m.title ?? m.missionId}</TableCell>
                  <TableCell>
                    {STATUS_LABEL[m.status]}
                    {m.late ? " · trễ" : ""}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {m.totalScore == null ? "—" : diem(m.totalScore)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {m.correctCount}/{m.totalQuestions}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {m.durationSec ? duration(m.durationSec) : "—"}
                  </TableCell>
                  <TableCell className="pr-3 text-right">
                    <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>

      {c.exam && (
        <ChartCard
          title="Bài thi khép chặng"
          right={
            <button
              type="button"
              onClick={() => nav(`/app/bai-lam/${c.exam!.examId}/${c.exam!.submissionKey}`)}
              className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium shadow-sm hover:border-brand-300 hover:text-brand-700"
            >
              <FileText className="size-3.5" /> Đề & bài làm
            </button>
          }
        >
          <Narrator line={c.exam.narration} />
        </ChartCard>
      )}
    </div>
  );
}

/** Dựng các chương bản Học sinh từ StudentJourney. */
export function buildStudentChapters(
  j: StudentJourney,
  nav: (path: string) => void
): ChapterDef[] {
  const chapters: ChapterDef[] = [];

  // Mở đầu
  chapters.push({
    id: "mo-dau",
    title: "Mở đầu",
    status: "past",
    render: () => (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border bg-card p-5 shadow-sm">
          <ProgressRing value={j.overview.learningIndex.total} label="Học tập" />
          <ProgressRing value={j.overview.effortIndex.total} label="Nỗ lực" />
        </div>
        <Narrator line={j.overview.narration} variant="opener" />
      </div>
    ),
  });

  // Chuẩn bị
  const s = j.prep.surface;
  chapters.push({
    id: "chuan-bi",
    title: "Chuẩn bị",
    status: "past",
    render: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <SummaryCell
            label="Xem trước bài"
            value={pct(s.xemTruoc.total ? s.xemTruoc.count / s.xemTruoc.total : 0)}
            hint={`${s.xemTruoc.count}/${s.xemTruoc.total} buổi`}
          />
          <SummaryCell
            label="Bài chuẩn bị"
            value={pct(s.baiChuanBi.total ? s.baiChuanBi.count / s.baiChuanBi.total : 0)}
            hint={`${s.baiChuanBi.count}/${s.baiChuanBi.total} bài`}
          />
          <SummaryCell
            label="Đúng giờ"
            value={pct(s.dungGio.total ? s.dungGio.count / s.dungGio.total : 0)}
            hint={`${s.dungGio.count}/${s.dungGio.total} lượt`}
          />
        </div>
        <Narrator line={j.prep.narration} />
      </div>
    ),
  });

  // Các chặng
  for (const c of j.cycles) {
    chapters.push({
      id: `cycle-${c.id}`,
      title: c.label,
      status: c.status,
      render: () => (
        <CycleBand
          label={c.label}
          range={c.range}
          status={c.status}
          narration={c.exam ? c.exam.narration : c.lop.narration}
          summary={<CycleSummary c={c} />}
        >
          <CycleDetail c={c} nav={nav} />
        </CycleBand>
      ),
    });
  }

  // Hội tụ
  chapters.push({
    id: "hoi-tu",
    title: "Hội tụ",
    status: j.convergence.nextExam ? "upcoming" : "current",
    render: () => (
      <div className="space-y-4">
        <Narrator line={j.convergence.narration} />
        <ChartCard title="Chủ đề em nên ôn lại">
          <ConvergencePanel topics={j.convergence.topics} gentle />
        </ChartCard>
      </div>
    ),
  });

  return chapters;
}
