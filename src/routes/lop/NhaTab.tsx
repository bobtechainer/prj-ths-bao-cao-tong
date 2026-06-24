import type { ClassReport, MissionStudentReportView } from "@/data/types";
import { mean } from "@/lib/metrics";
import { diem, duration } from "@/lib/format";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, CheckCircle2, Clock, FileText } from "lucide-react";
import { ChartCard } from "@/components/charts/chart-kit";
import { CompletionStacked } from "@/components/charts/CompletionStacked";
import { ScoreHistogram } from "@/components/charts/ScoreHistogram";
import { ItemAnalysisBar } from "@/components/charts/ItemAnalysisBar";
import { KpiCard } from "@/components/report/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

const STATUS: Record<MissionStudentReportView["status"], { label: string; cls: string }> = {
  todo: { label: "Chưa làm", cls: "text-muted-foreground" },
  inprogress: { label: "Đang làm", cls: "text-warning-700" },
  submitted: { label: "Đã nộp", cls: "text-brand-700" },
  graded: { label: "Đã chấm", cls: "text-success" },
};

export function NhaTab({ report }: { report: ClassReport }) {
  const { missions, items, students } = report.nha;
  const navigate = useNavigate();
  const missionId = missions[0].missionId;
  const completion = mean(missions.map((m) => m.completionRate));
  const avgScore = mean(missions.map((m) => m.avgScore));
  const late = students.filter((s) => s.late).length;

  return (
    <div className="space-y-5">
      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem><KpiCard label="Nhiệm vụ đã giao" value={missions.length} icon={<ClipboardList className="size-4" />} /></StaggerItem>
        <StaggerItem><KpiCard label="Tỉ lệ hoàn thành" value={completion * 100} format={(n) => `${Math.round(n)}%`} icon={<CheckCircle2 className="size-4" />} /></StaggerItem>
        <StaggerItem><KpiCard label="Điểm trung bình" value={avgScore} format={(n) => diem(n)} /></StaggerItem>
        <StaggerItem><KpiCard label="Nộp muộn" value={late} suffix="lượt" icon={<Clock className="size-4" />} /></StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard title="Tình hình hoàn thành theo nhiệm vụ" help="Số học sinh đã nộp/đã chấm so với chưa làm, từng nhiệm vụ.">
            <CompletionStacked data={missions.map((m) => ({ title: m.title, completed: m.completed, notDone: m.notDone }))} />
          </ChartCard>
        </Reveal>
        <Reveal delay={0.05}>
          <ChartCard
            title={`Phân bố điểm — ${missions[0].title}`}
            help="Điểm bài về nhà có thể cao hơn thực lực do làm lại nhiều lần hoặc có trợ giúp ở nhà, nên xem cùng kết quả thi."
          >
            <ScoreHistogram data={missions[0].scoreDistribution} height={220} />
          </ChartCard>
        </Reveal>
      </div>

      <Reveal>
        <ChartCard title="Tỉ lệ làm đúng theo chủ đề" help="Tổng hợp các câu trong nhiệm vụ; chủ đề khó được xếp lên trên.">
          <ItemAnalysisBar items={items.map((i) => ({ label: i.topic, rate: i.correctRate }))} />
        </ChartCard>
      </Reveal>

      <Reveal>
        <ChartCard
          title={`Chi tiết bài làm — ${missions[0].title}`}
          help="Bấm vào một học sinh để xem bài làm chi tiết."
          right={
            <Link
              to={`/app/nhiem-vu/${missionId}`}
              className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium shadow-sm hover:border-brand-300 hover:text-brand-700"
            >
              <FileText className="size-3.5" /> Xem nhiệm vụ
            </Link>
          }
        >
          <div className="max-h-[420px] overflow-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Điểm</TableHead>
                  <TableHead className="text-right">Đúng</TableHead>
                  <TableHead className="text-right">Số lần</TableHead>
                  <TableHead className="text-right">Thời gian</TableHead>
                  <TableHead className="text-right">Đúng hạn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow
                    key={s.studentId}
                    onClick={() => navigate(`/app/nhiem-vu/${missionId}/${s.studentId}`)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell className="font-medium">{s.studentName}</TableCell>
                    <TableCell className={STATUS[s.status].cls}>{STATUS[s.status].label}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.totalScore == null ? "—" : diem(s.totalScore)}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.correctCount}/{s.totalQuestions}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.attempts}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.durationSec ? duration(s.durationSec) : "—"}</TableCell>
                    <TableCell className="text-right">
                      {s.status === "todo" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : s.late ? (
                        <Badge variant="outline" className="border-warning-200 bg-warning-50 text-warning-700">Muộn</Badge>
                      ) : (
                        <span className="text-xs text-success">Đúng hạn</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ChartCard>
      </Reveal>
    </div>
  );
}
