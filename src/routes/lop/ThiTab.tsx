import { Link, useNavigate } from "react-router-dom";
import type { ClassReport } from "@/data/types";
import { Users, GraduationCap, Sigma, FileText } from "lucide-react";
import { ChartCard } from "@/components/charts/chart-kit";
import { BandDistribution } from "@/components/report/BandDistribution";
import { ScoreHistogram } from "@/components/charts/ScoreHistogram";
import { CodeCompare } from "@/components/report/CodeCompare";
import { TopicMatrixBars } from "@/components/charts/TopicMatrixBars";
import { TopMissedTable } from "@/components/report/TopMissedTable";
import { InsightCallout } from "@/components/report/InsightCallout";
import { KpiCard } from "@/components/report/KpiCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { diem } from "@/lib/format";

export function ThiTab({ report }: { report: ClassReport }) {
  const thi = report.thi;
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="size-4" />
          {thi.title} · {thi.term}
        </div>
        <Link
          to={`/app/de-thi/${thi.examId}`}
          className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium shadow-sm hover:border-brand-300 hover:text-brand-700"
        >
          <FileText className="size-4" /> Xem đề thi
        </Link>
      </div>

      <Stagger className="grid grid-cols-3 gap-3">
        <StaggerItem><KpiCard label="Số học sinh" value={thi.numStudents} icon={<Users className="size-4" />} /></StaggerItem>
        <StaggerItem><KpiCard label="Điểm trung bình" value={thi.avg} format={(n) => diem(n)} hint="trên thang 10" /></StaggerItem>
        <StaggerItem><KpiCard label="Trung vị" value={thi.median} format={(n) => diem(n)} icon={<Sigma className="size-4" />} /></StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard title="Phân bố điểm theo nhóm" help="Số học sinh ở mỗi nhóm điểm.">
            <BandDistribution bands={thi.bands} />
          </ChartCard>
        </Reveal>
        <Reveal delay={0.05}>
          <ChartCard title="Phân bố điểm chi tiết" help="Chia nhỏ theo bước 0,5 điểm để thấy rõ các mốc.">
            <ScoreHistogram data={thi.histogram} />
          </ChartCard>
        </Reveal>
      </div>

      {thi.codes.length > 1 && (
        <Reveal>
          <ChartCard title="So sánh giữa các mã đề" help="Đối chiếu xem hai mã đề có tương đương về độ khó không. Số học sinh mỗi mã đề khác nhau nên chỉ xem là tham khảo.">
            <CodeCompare codes={thi.codes} />
          </ChartCard>
        </Reveal>
      )}

      <Reveal>
        <Tabs defaultValue={thi.codes[0].examCode}>
          <TabsList>
            {thi.codes.map((c) => (
              <TabsTrigger key={c.examCode} value={c.examCode}>
                {c.examCode}
              </TabsTrigger>
            ))}
          </TabsList>
          {thi.codes.map((c) => {
            const detail = thi.studentDetail
              .map((s, gi) => ({ s, gi }))
              .filter((x) => x.s.examCode === c.examCode);
            return (
              <TabsContent key={c.examCode} value={c.examCode} className="space-y-5 pt-3">
                <InsightCallout lines={c.insights} />

                <ChartCard
                  title="Tỉ lệ làm đúng theo chủ đề"
                  help="Theo ma trận đề. Số câu hiển thị cạnh tên chủ đề — chủ đề ít câu thì số liệu kém ổn định, nên trừ hao khi đọc."
                >
                  <TopicMatrixBars topics={c.topics} />
                </ChartCard>

                <ChartCard title="Câu sai nhiều nhất" help="Có kèm đáp án sai hay bị chọn, để thấy các em hay nhầm chỗ nào; nên chữa mấy câu này trước.">
                  <TopMissedTable questions={c.topMissed} />
                </ChartCard>

                <ChartCard title={`Chi tiết học sinh — ${c.examCode}`} help="Bấm vào một học sinh để xem bài làm chi tiết của em.">
                  <div className="max-h-[460px] overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card">
                        <TableRow>
                          <TableHead>Học sinh</TableHead>
                          <TableHead className="text-right">Điểm</TableHead>
                          <TableHead className="text-right">Số câu đúng</TableHead>
                          <TableHead>Chủ đề làm tốt</TableHead>
                          <TableHead>Chủ đề cần hỗ trợ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.map(({ s, gi }) => (
                          <TableRow
                            key={gi}
                            onClick={() => navigate(`/app/bai-lam/${thi.examId}/c${gi}`)}
                            className="cursor-pointer hover:bg-muted"
                          >
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="text-right tabular-nums">{diem(s.score)}</TableCell>
                            <TableCell className="text-right tabular-nums">{s.correct}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{s.strong}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{s.weak}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ChartCard>
              </TabsContent>
            );
          })}
        </Tabs>
      </Reveal>
    </div>
  );
}
