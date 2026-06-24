import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronRight, MessageSquareText, Trophy, FileText } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { useUiStore } from "@/stores/uiStore";
import { diem, duration } from "@/lib/format";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { StudentRadar } from "@/components/charts/StudentRadar";
import { TrendLine } from "@/components/charts/TrendLine";
import { ConvergencePanel } from "@/components/report/ConvergencePanel";
import { ChartCard } from "@/components/charts/chart-kit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Reveal } from "@/components/motion";

function initials(name: string) {
  const p = name.trim().split(" ");
  return p[p.length - 1][0] ?? "?";
}

const STATUS: Record<string, { label: string; cls: string }> = {
  todo: { label: "Chưa làm", cls: "text-muted-foreground" },
  inprogress: { label: "Đang làm", cls: "text-warning-700" },
  submitted: { label: "Đã nộp", cls: "text-brand-700" },
  graded: { label: "Đã chấm", cls: "text-success" },
};

export default function HocSinh() {
  const { studentId = "" } = useParams();
  const navigate = useNavigate();
  const role = useUiStore((s) => s.role);
  const gentle = role === "hocsinh";
  const p = repo.getStudentProfile(studentId);
  const examId = repo.getClassReport(p.student.classId).thi.examId;

  const Trend = p.trend === "up" ? ArrowUpRight : p.trend === "down" ? ArrowDownRight : ArrowRight;
  const trendText = p.trend === "up" ? "Đang tiến bộ" : p.trend === "down" ? "Cần theo dõi thêm" : "Giữ nhịp ổn định";
  const trendTone = p.trend === "up" ? "text-success" : p.trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="space-y-5">
      <PageHeader
        title={gentle ? "Báo cáo học tập của em" : "Hồ sơ học sinh"}
        subtitle={`${p.student.name} · ${p.className}`}
        right={<ExportButton scope={{ kind: "hoc-sinh", id: studentId, title: `Báo cáo học sinh ${p.student.name}` }} />}
      />

      {/* Dossier hero */}
      <Reveal>
        <section className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-br from-brand-50 via-card to-card dark:from-brand-900/20" />
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand-600 text-2xl font-semibold text-primary-foreground shadow-sm">
                {initials(p.student.name)}
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">{p.student.name}</h1>
                <p className="text-sm text-muted-foreground">{p.className} · {p.schoolName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1 border-brand-200 bg-brand-50 text-brand-700">
                    <Trophy className="size-3.5" /> Hạng {p.rank}/{p.classSize}
                  </Badge>
                  <span className={`inline-flex items-center gap-1 text-sm font-medium ${trendTone}`}>
                    <Trend className="size-4" /> {trendText}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-8">
                <ProgressRing value={p.learningIndex.total} label="Học tập" />
                <ProgressRing value={p.effortIndex.total} label="Nỗ lực" />
              </div>
              <div className="w-full max-w-[20rem] space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground tabular-nums">Học tập {p.learningIndex.total}</span>{" "}
                  gộp {p.learningIndex.parts.map((x) => `${x.label.toLowerCase()} ${x.value}`).join(", ")}{" "}
                  (trọng số {p.learningIndex.parts.map((x) => Math.round(x.weight * 100)).join("–")}%)
                </div>
                <div>
                  <span className="font-medium text-foreground tabular-nums">Nỗ lực {p.effortIndex.total}</span>{" "}
                  gộp {p.effortIndex.parts.map((x) => `${x.label.toLowerCase()} ${x.value}`).join(", ")}{" "}
                  (trọng số {p.effortIndex.parts.map((x) => Math.round(x.weight * 100)).join("–")}%)
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard
            title={gentle ? "Điểm mạnh của em" : "Năng lực theo bốn mặt"}
            help={gentle ? undefined : "Bốn mặt năng lực dựng từ bài làm gần đây của em, để giáo viên tham khảo khi nhận xét — không thay điểm chính thức."}
          >
            <StudentRadar data={p.radar} />
          </ChartCard>
        </Reveal>
        <Reveal delay={0.05}>
          <ChartCard
            title="Điểm Địa lí qua các kì"
            help="Đường của em so với điểm trung bình lớp."
            right={
              <Link
                to={`/app/bai-lam/${examId}/s:${studentId}`}
                className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium shadow-sm hover:border-brand-300 hover:text-brand-700"
              >
                <FileText className="size-3.5" /> Đề & bài làm
              </Link>
            }
          >
            <TrendLine
              data={p.exams.map((e) => ({
                term: e.term.split(" · ")[0],
                "Điểm của em": e.score,
                "TB lớp": e.classAvg,
              }))}
              series={[
                { key: "Điểm của em", name: "Điểm của em" },
                { key: "TB lớp", name: "TB lớp" },
              ]}
              domain={[0, 10]}
            />
          </ChartCard>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard title={gentle ? "Em làm tốt ở" : "Chủ đề làm tốt"}>
            <div className="flex flex-wrap gap-2">
              {p.strongTopics.map((t) => (
                <span key={t} className="rounded-full border border-success-200 bg-success-50 px-3 py-1 text-sm text-success-700">
                  {t}
                </span>
              ))}
            </div>
          </ChartCard>
        </Reveal>
        <Reveal delay={0.05}>
          <ChartCard title={gentle ? "Chủ đề em nên ôn lại" : "Chủ đề cần hỗ trợ"}>
            <ConvergencePanel topics={p.weakTopics} gentle={gentle} />
          </ChartCard>
        </Reveal>
      </div>

      <Reveal>
        <ChartCard title="Bài về nhà gần đây" help="Bấm vào một nhiệm vụ để xem bài làm chi tiết của em.">
          <div className="max-h-[320px] overflow-auto rounded-lg border">
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
                {p.missions.map((m) => (
                  <TableRow
                    key={m.missionId}
                    onClick={() => navigate(`/app/nhiem-vu/${m.missionId}/${studentId}`)}
                    className="group cursor-pointer transition-colors hover:bg-muted/60"
                  >
                    <TableCell className="font-medium">{m.title}</TableCell>
                    <TableCell className={STATUS[m.status].cls}>{STATUS[m.status].label}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.totalScore == null ? "—" : diem(m.totalScore)}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.correctCount}/{m.totalQuestions}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.durationSec ? duration(m.durationSec) : "—"}</TableCell>
                    <TableCell className="pr-3 text-right">
                      <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ChartCard>
      </Reveal>

      <Reveal>
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:bg-brand-900/10">
          <div className="mb-1.5 flex items-center gap-2 font-medium text-brand-800 dark:text-brand-300">
            <MessageSquareText className="size-4" />
            {gentle ? "Lời nhắn cho em" : "Gợi ý cho giáo viên"}
          </div>
          <p className="text-sm text-foreground/90">{p.teacherDraftNote}</p>
        </div>
      </Reveal>
    </div>
  );
}
