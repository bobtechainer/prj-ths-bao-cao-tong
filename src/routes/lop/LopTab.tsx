import type { ClassReport } from "@/data/types";
import { ChartCard } from "@/components/charts/chart-kit";
import { EngagementTimeline } from "@/components/charts/EngagementTimeline";
import { ItemAnalysisBar } from "@/components/charts/ItemAnalysisBar";
import { AttendanceDonut } from "@/components/charts/AttendanceDonut";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Reveal } from "@/components/motion";
import { duration } from "@/lib/format";

export function LopTab({ report }: { report: ClassReport }) {
  const s = report.lop;
  const att = s.attendance;
  return (
    <div className="space-y-5">
      <Reveal>
        <ChartCard
          title="Lượt tương tác trong buổi học"
          help="Số lượt tương tác của cả lớp (giơ tay, trả lời) ghi nhận mỗi 5 phút — đây là số đếm thô, cao lên thường là lúc làm câu hỏi nhanh hoặc trò chơi, không phải mức hiểu bài."
        >
          <EngagementTimeline data={s.engagement} />
        </ChartCard>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard title="Câu hỏi nhanh trên lớp" help="Tỉ lệ trả lời đúng từng câu; câu khó được xếp lên trên.">
            <ItemAnalysisBar items={s.quizzes.map((q) => ({ label: q.q, rate: q.accuracy }))} />
          </ChartCard>
        </Reveal>
        <Reveal delay={0.05}>
          <ChartCard title="Điểm danh buổi học">
            <AttendanceDonut data={att} />
            <div className="mt-2 grid grid-cols-4 gap-2 text-center text-sm">
              <div><div className="font-medium">{att.present}</div><div className="text-xs text-muted-foreground">Có mặt</div></div>
              <div><div className="font-medium">{att.late}</div><div className="text-xs text-muted-foreground">Đi muộn</div></div>
              <div><div className="font-medium">{att.leftEarly}</div><div className="text-xs text-muted-foreground">Về sớm</div></div>
              <div><div className="font-medium">{att.absent}</div><div className="text-xs text-muted-foreground">Vắng</div></div>
            </div>
          </ChartCard>
        </Reveal>
      </div>

      <Reveal>
        <ChartCard
          title="Bảng xếp hạng trò chơi"
          help="Mang tính khích lệ trong giờ học; thưởng cho tốc độ và sự tự tin, không thay cho mức hiểu bài."
        >
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Học sinh</TableHead>
                  <TableHead className="text-right">Điểm</TableHead>
                  <TableHead className="text-right">Đúng</TableHead>
                  <TableHead className="text-right">Sai</TableHead>
                  <TableHead className="text-right">Chuỗi đúng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.leaderboard.map((l) => (
                  <TableRow key={l.studentId}>
                    <TableCell className="font-medium">{l.rank}</TableCell>
                    <TableCell>{l.studentName}</TableCell>
                    <TableCell className="text-right tabular-nums">{l.score}</TableCell>
                    <TableCell className="text-right tabular-nums">{l.correct}</TableCell>
                    <TableCell className="text-right tabular-nums">{l.wrong}</TableCell>
                    <TableCell className="text-right tabular-nums">{l.streak}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ChartCard>
      </Reveal>
      <p className="text-xs text-muted-foreground">Buổi học ngày {s.date} · {s.durationMin} phút.</p>
    </div>
  );
}
